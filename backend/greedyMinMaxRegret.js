const { individualUtility } = require('./utils/groupSatisfaction');
// Enhanced Greedy MinMax Regret Algorithm for Trail Selection

/**
 * Wrapper: methodology utility returns 0-100 → scale to 0-1 for greedy code.
 */
const calculateMemberUtility = (trail, member) =>
  individualUtility(member, trail) / 100;

/**
 * Calculate regret for a trail selection
 * @param {Array} selectedTrails - Currently selected trails
 * @param {Array} allTrails - All available trails
 * @param {Array} groupPreferences - Group member preferences
 * @returns {number} - Maximum regret across all group members
 */
const calculateRegret = (selectedTrails, allTrails, groupPreferences) => {
  let maxRegret = 0;
  
  // For each group member, calculate their regret
  groupPreferences.forEach(member => {
    // Calculate utility of selected trails for this member
    const selectedUtility = selectedTrails.reduce((sum, trail) => {
      return sum + calculateMemberUtility(trail, member);
    }, 0);
    
    // Find the best possible utility for this member (top k trails)
    const memberUtilities = allTrails.map(trail => ({
      trail,
      utility: calculateMemberUtility(trail, member)
    })).sort((a, b) => b.utility - a.utility);
    
    const bestUtility = memberUtilities
      .slice(0, selectedTrails.length)
      .reduce((sum, item) => sum + item.utility, 0);
    
    const memberRegret = bestUtility - selectedUtility;
    maxRegret = Math.max(maxRegret, memberRegret);
  });
  
  return maxRegret;
};

/**
 * Calculate diversity score for a set of trails
 * @param {Array} trails - Array of trail objects
 * @returns {number} - Diversity score (0-1)
 */
const calculateDiversity = (trails) => {
  if (trails.length <= 1) return 1.0;
  
  let totalSimilarity = 0;
  let comparisons = 0;
  
  for (let i = 0; i < trails.length; i++) {
    for (let j = i + 1; j < trails.length; j++) {
      const similarity = calculateTrailSimilarity(trails[i], trails[j]);
      totalSimilarity += similarity;
      comparisons++;
    }
  }
  
  return 1 - (totalSimilarity / comparisons);
};

/**
 * Calculate similarity between two trails
 * @param {Object} trail1 - First trail
 * @param {Object} trail2 - Second trail
 * @returns {number} - Similarity score (0-1)
 */
const calculateTrailSimilarity = (trail1, trail2) => {
  let similarity = 0;
  
  // Scenery type similarity (Jaccard index)
  const scenery1 = new Set(trail1.scenery_types);
  const scenery2 = new Set(trail2.scenery_types);
  const intersection = new Set([...scenery1].filter(x => scenery2.has(x)));
  const union = new Set([...scenery1, ...scenery2]);
  const scenerySimilarity = intersection.size / union.size;
  
  // Difficulty similarity
  const difficultySimilarity = trail1.difficulty === trail2.difficulty ? 1 : 0;
  
  // Distance similarity (normalized)
  const maxDistance = Math.max(trail1.distance_km, trail2.distance_km);
  const distanceSimilarity = 1 - Math.abs(trail1.distance_km - trail2.distance_km) / maxDistance;
  
  // Location similarity
  const locationSimilarity = trail1.location === trail2.location ? 1 : 0;
  
  // Weighted average
  similarity = (scenerySimilarity * 0.4 + 
                difficultySimilarity * 0.2 + 
                distanceSimilarity * 0.2 + 
                locationSimilarity * 0.2);
  
  return similarity;
};

/**
 * Enhanced Greedy MinMax Regret Algorithm
 * @param {Array} trails - Available trails
 * @param {Array} groupPreferences - Group member preferences
 * @param {number} k - Number of trails to select
 * @param {Object} options - Algorithm options
 * @returns {Array} - Selected trails
 */
const greedyMinMaxRegret = (trails, groupPreferences, k = 5, options = {}) => {
  const {
    considerDiversity = true,
    diversityWeight = 0.3,
    regretWeight = 0.7
  } = options;
  
  const selectedTrails = [];
  const availableTrails = [...trails];
  
  for (let i = 0; i < k && availableTrails.length > 0; i++) {
    let bestTrail = null;
    let bestScore = -Infinity;
    
    // Try each available trail
    for (let j = 0; j < availableTrails.length; j++) {
      const candidateTrail = availableTrails[j];
      const candidateSelection = [...selectedTrails, candidateTrail];
      
      // Calculate regret score
      const regretScore = calculateRegret(candidateSelection, trails, groupPreferences);
      const normalizedRegret = 1 - (regretScore / (groupPreferences.length * k)); // Normalize to 0-1
      
      // Calculate diversity score
      const diversityScore = considerDiversity ? calculateDiversity(candidateSelection) : 0;
      
      // Combined score
      const combinedScore = (regretWeight * normalizedRegret) + 
                           (diversityWeight * diversityScore);
      
      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestTrail = candidateTrail;
      }
    }
    
    if (bestTrail) {
      selectedTrails.push(bestTrail);
      // Remove selected trail from available trails
      const index = availableTrails.findIndex(t => t.trail_id === bestTrail.trail_id);
      if (index > -1) {
        availableTrails.splice(index, 1);
      }
    }
  }
  
  return selectedTrails;
};

/**
 * Calculate comprehensive metrics for trail recommendations
 * @param {Array} selectedTrails - Selected trails
 * @param {Array} groupPreferences - Group preferences
 * @returns {Object} - Metrics object
 */
const calculateRecommendationMetrics = (selectedTrails, groupPreferences) => {
  const metrics = {
    totalTrails: selectedTrails.length,
    averageRating: 0,
    averageDistance: 0,
    averageTime: 0,
    averageElevation: 0,
    groupMatchPercentages: [],
    diversityScore: 0,
    regretScore: 0,
    difficultyDistribution: {},
    sceneryTypeDistribution: {}
  };
  
  if (selectedTrails.length === 0) return metrics;
  
  // Calculate basic statistics
  metrics.averageRating = selectedTrails.reduce((sum, t) => sum + t.rating, 0) / selectedTrails.length;
  metrics.averageDistance = selectedTrails.reduce((sum, t) => sum + t.distance_km, 0) / selectedTrails.length;
  metrics.averageTime = selectedTrails.reduce((sum, t) => sum + t.estimated_time_hours, 0) / selectedTrails.length;
  metrics.averageElevation = selectedTrails.reduce((sum, t) => sum + t.elevation_gain_m, 0) / selectedTrails.length;
  
  // Calculate group match percentages
  metrics.groupMatchPercentages = groupPreferences.map(member => {
    const matchingTrails = selectedTrails.filter(trail =>
      member.preferences.some(pref =>
        trail.scenery_types.some(scenery => 
          scenery.toLowerCase().includes(pref.toLowerCase())
        )
      )
    );
    return Math.round((matchingTrails.length / selectedTrails.length) * 100);
  });
  
  // Calculate diversity and regret
  metrics.diversityScore = calculateDiversity(selectedTrails);
  metrics.regretScore = calculateRegret(selectedTrails, selectedTrails, groupPreferences);
  
  // Calculate distributions
  selectedTrails.forEach(trail => {
    metrics.difficultyDistribution[trail.difficulty] = 
      (metrics.difficultyDistribution[trail.difficulty] || 0) + 1;
    
    trail.scenery_types.forEach(type => {
      metrics.sceneryTypeDistribution[type] = 
        (metrics.sceneryTypeDistribution[type] || 0) + 1;
    });
  });
  
  return metrics;
};

module.exports = {
  calculateMemberUtility,
  calculateRegret,
  calculateDiversity,
  calculateTrailSimilarity,
  greedyMinMaxRegret,
  calculateRecommendationMetrics
}; 