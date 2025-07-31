const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const {
  greedyMinMaxRegret,
  calculateRecommendationMetrics,
  calculateMemberUtility
} = require('./greedyMinMaxRegret');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Global variable to store trails data
let trailsData = [];

// Load trails data from CSV
const loadTrailsData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, 'csv', 'van_wa_200_sorted.csv'))
      .pipe(csv())
      .on('data', (data) => {
        // Convert string values to appropriate types
        const trail = {
          ...data,
          distance_km: parseFloat(data.distance_km),
          estimated_time_hours: parseFloat(data.estimated_time_hours),
          elevation_gain_m: parseInt(data.elevation_gain_m),
          rating: parseFloat(data.rating),
          scenery_types: data.scenery_types.split(', ').map(type => type.trim())
        };
        results.push(trail);
      })
      .on('end', () => {
        trailsData = results;
        console.log(`Loaded ${results.length} trails from CSV`);
        resolve(results);
      })
      .on('error', reject);
  });
};

// Initialize data on server start
loadTrailsData().catch(console.error);

// Utility function to calculate group match percentage for a trail
const calculateGroupMatch = (trail, groupPreferences) => {
  const matchCount = groupPreferences.reduce((sum, member) => {
    const memberMatch = member.preferences.some(pref =>
      trail.scenery_types.some(scenery => 
        scenery.toLowerCase().includes(pref.toLowerCase())
      )
    );
    return sum + (memberMatch ? 1 : 0);
  }, 0);
  
  return (matchCount / groupPreferences.length) * 100;
};

// Routes

// Get all trails
app.get('/api/trails', (req, res) => {
  res.json(trailsData);
});

// Get filtered trails
app.get('/api/trails/filter', (req, res) => {
  const {
    difficulty,
    maxDistance,
    maxTime,
    maxElevation,
    trailType,
    sceneryTypes,
    minRating,
    searchTerm
  } = req.query;
  
  let filteredTrails = trailsData.filter(trail => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!trail.trail_name.toLowerCase().includes(searchLower) &&
          !trail.location.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Difficulty filter
    if (difficulty && trail.difficulty !== difficulty) {
      return false;
    }
    
    // Distance filter
    if (maxDistance && trail.distance_km > parseFloat(maxDistance)) {
      return false;
    }
    
    // Time filter
    if (maxTime && trail.estimated_time_hours > parseFloat(maxTime)) {
      return false;
    }
    
    // Elevation filter
    if (maxElevation && trail.elevation_gain_m > parseInt(maxElevation)) {
      return false;
    }
    
    // Trail type filter
    if (trailType && trail.trail_type !== trailType) {
      return false;
    }
    
    // Scenery types filter
    if (sceneryTypes) {
      const selectedTypes = sceneryTypes.split(',');
      const hasMatchingScenery = selectedTypes.some(selectedType =>
        trail.scenery_types.some(trailType => trailType.includes(selectedType))
      );
      if (!hasMatchingScenery) {
        return false;
      }
    }
    
    // Rating filter
    if (minRating && trail.rating < parseFloat(minRating)) {
      return false;
    }
    
    return true;
  });
  
  res.json(filteredTrails);
});

// Get recommended trails using greedy minmax regret algorithm
app.post('/api/trails/recommend', (req, res) => {
  try {
    const { groupPreferences, filters = {}, k = 5 } = req.body;
    
    if (!groupPreferences || !Array.isArray(groupPreferences)) {
      return res.status(400).json({ error: 'Group preferences are required' });
    }
    
    // Apply filters to get candidate trails
    let candidateTrails = trailsData.filter(trail => {
      // Apply all filters
      if (filters.difficulty && trail.difficulty !== filters.difficulty) {
        return false;
      }
      
      if (filters.maxDistance && trail.distance_km > parseFloat(filters.maxDistance)) {
        return false;
      }
      
      if (filters.maxTime && trail.estimated_time_hours > parseFloat(filters.maxTime)) {
        return false;
      }
      
      if (filters.maxElevation && trail.elevation_gain_m > parseInt(filters.maxElevation)) {
        return false;
      }
      
      if (filters.trailType && trail.trail_type !== filters.trailType) {
        return false;
      }
      
      if (filters.sceneryTypes && filters.sceneryTypes.length > 0) {
        const hasMatchingScenery = filters.sceneryTypes.some(selectedType =>
          trail.scenery_types.some(trailType => trailType.includes(selectedType))
        );
        if (!hasMatchingScenery) {
          return false;
        }
      }
      
      if (filters.minRating && trail.rating < parseFloat(filters.minRating)) {
        return false;
      }
      
      return true;
    });
    
    // Run enhanced greedy minmax regret algorithm
    const algorithmOptions = {
      considerDiversity: true,
      diversityWeight: 0.3,
      regretWeight: 0.7
    };
    
    const recommendedTrails = greedyMinMaxRegret(candidateTrails, groupPreferences, k, algorithmOptions);
    
    // Calculate comprehensive metrics
    const metrics = calculateRecommendationMetrics(recommendedTrails, groupPreferences);
    
    // Add individual trail metrics
    const recommendationsWithMetrics = recommendedTrails.map(trail => {
      const groupMatch = calculateGroupMatch(trail, groupPreferences);
      const memberUtility = groupPreferences.map(member => 
        calculateMemberUtility(trail, member)
      );
      
      return {
        ...trail,
        groupMatchPercentage: Math.round(groupMatch),
        memberUtilities: memberUtility,
        averageMemberUtility: memberUtility.reduce((a, b) => a + b, 0) / memberUtility.length
      };
    });
    
    res.json({
      recommendations: recommendationsWithMetrics,
      metrics: metrics,
      totalCandidates: candidateTrails.length,
      algorithm: 'Enhanced Greedy MinMax Regret',
      algorithmOptions: algorithmOptions
    });
    
  } catch (error) {
    console.error('Error in recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all unique scenery types
app.get('/api/scenery-types', (req, res) => {
  const allTypes = new Set();
  trailsData.forEach(trail => {
    trail.scenery_types.forEach(type => allTypes.add(type));
  });
  res.json(Array.from(allTypes).sort());
});

// Get trail statistics
app.get('/api/trails/stats', (req, res) => {
  const stats = {
    totalTrails: trailsData.length,
    difficulties: {},
    trailTypes: {},
    averageRating: 0,
    averageDistance: 0,
    averageTime: 0,
    averageElevation: 0
  };
  
  let totalRating = 0;
  let totalDistance = 0;
  let totalTime = 0;
  let totalElevation = 0;
  
  trailsData.forEach(trail => {
    // Count difficulties
    stats.difficulties[trail.difficulty] = (stats.difficulties[trail.difficulty] || 0) + 1;
    
    // Count trail types
    stats.trailTypes[trail.trail_type] = (stats.trailTypes[trail.trail_type] || 0) + 1;
    
    // Sum for averages
    totalRating += trail.rating;
    totalDistance += trail.distance_km;
    totalTime += trail.estimated_time_hours;
    totalElevation += trail.elevation_gain_m;
  });
  
  stats.averageRating = totalRating / trailsData.length;
  stats.averageDistance = totalDistance / trailsData.length;
  stats.averageTime = totalTime / trailsData.length;
  stats.averageElevation = totalElevation / trailsData.length;
  
  res.json(stats);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    trailsLoaded: trailsData.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Trails loaded: ${trailsData.length}`);
}); 