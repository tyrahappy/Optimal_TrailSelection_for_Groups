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

const { calculateGroupSatisfaction } = require('./utils/groupSatisfaction');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Get recommended trails using greedy minmax regret algorithm with complete methodology
app.post('/api/trails/recommend', (req, res) => {
  try {
    const { groupPreferences, filters = {}, k = 5 } = req.body;
    
    if (!groupPreferences || !Array.isArray(groupPreferences)) {
      return res.status(400).json({ error: 'Group preferences are required' });
    }
    
    // Convert simple preferences to complete methodology format
    const groupMembers = groupPreferences.map(member => {
      // Extract preferences from the simple format
      const preferences = member.preferences || [];
      
      // Convert to complete methodology format
      return {
        name: member.name,
        // Hard constraints (default values if not specified)
        max_distance: 20, // Default 20km
        max_elevation: 1000, // Default 1000m
        max_time: 8, // Default 8 hours
        acceptable_difficulties: ['Easy', 'Moderate', 'Hard'], // Default all difficulties
        preferred_trail_types: ['Loop', 'Out & Back'], // Default all types
        
        // Preference weights (normalized to sum to 1.0)
        difficulty_weight: 0.2,
        distance_weight: 0.2,
        time_weight: 0.2,
        elevation_weight: 0.2,
        trail_type_weight: 0.2,
        
        // Extract specific preferences
        preferred_distance: extractPreferredDistance(preferences),
        preferred_elevation: extractPreferredElevation(preferences),
        preferred_time: extractPreferredTime(preferences),
        preferred_difficulty: extractPreferredDifficulty(preferences),
        preferred_scenery: extractPreferredScenery(preferences)
      };
    });
    
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
    
    // Run enhanced greedy minmax regret algorithm with complete methodology
    const algorithmOptions = {
      considerDiversity: true,
      diversityWeight: 0.3,
      regretWeight: 0.7
    };
    
    const recommendedTrails = greedyMinMaxRegret(candidateTrails, groupMembers, k, algorithmOptions);
    
    // Calculate comprehensive metrics using complete methodology
    const metrics = calculateRecommendationMetrics(recommendedTrails, groupMembers);
    
    // Add individual trail metrics
    const recommendationsWithMetrics = recommendedTrails.map(trail => {
      const groupSatisfaction = calculateGroupSatisfaction(trail, groupMembers);
      const memberUtilities = groupMembers.map(member => 
        calculateMemberUtility(trail, member)
      );
      
      return {
        ...trail,
        groupMatchPercentage: Math.round(groupSatisfaction.total_score),
        memberUtilities: memberUtilities,
        averageMemberUtility: memberUtilities.reduce((a, b) => a + b, 0) / memberUtilities.length,
        groupSatisfaction: groupSatisfaction
      };
    });
    
    res.json({
      recommendations: recommendationsWithMetrics,
      metrics: metrics,
      totalCandidates: candidateTrails.length,
      algorithm: 'Enhanced Greedy MinMax Regret with Complete Methodology',
      algorithmOptions: algorithmOptions
    });
    
  } catch (error) {
    console.error('Error in recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions to extract preferences from simple format
function extractPreferredDistance(preferences) {
  const distancePrefs = preferences.filter(p => ['short', 'medium', 'long'].includes(p));
  if (distancePrefs.includes('short')) return 3;
  if (distancePrefs.includes('medium')) return 7.5;
  if (distancePrefs.includes('long')) return 15;
  return 7.5; // Default medium
}

function extractPreferredElevation(preferences) {
  const elevationPrefs = preferences.filter(p => ['low', 'medium', 'high'].includes(p));
  if (elevationPrefs.includes('low')) return 100;
  if (elevationPrefs.includes('medium')) return 350;
  if (elevationPrefs.includes('high')) return 700;
  return 350; // Default medium
}

function extractPreferredTime(preferences) {
  const timePrefs = preferences.filter(p => ['quick', 'moderate', 'long'].includes(p));
  if (timePrefs.includes('quick')) return 1.5;
  if (timePrefs.includes('moderate')) return 3;
  if (timePrefs.includes('long')) return 6;
  return 3; // Default moderate
}

function extractPreferredDifficulty(preferences) {
  const difficultyPrefs = preferences.filter(p => ['easy', 'moderate', 'hard'].includes(p));
  if (difficultyPrefs.length > 0) {
    return difficultyPrefs.map(d => d.charAt(0).toUpperCase() + d.slice(1));
  }
  return ['Easy', 'Moderate']; // Default
}

function extractPreferredScenery(preferences) {
  return preferences.filter(p => 
    ['mountain', 'lake', 'forest', 'ocean', 'waterfall', 'alpine', 'beach', 'canyon', 'glacier', 'river'].includes(p)
  );
}

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