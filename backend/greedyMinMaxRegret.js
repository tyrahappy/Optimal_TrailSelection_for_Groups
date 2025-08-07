const { 
  individualUtility, 
  calculateGroupSatisfaction 
} = require('./utils/groupSatisfaction');

/**
 * Calculate regret for a trail selection
 * @param {Array} selectedTrails - Currently selected trails
 * @param {Array} allTrails - All available trails
 * @param {Array} groupMembers - Group member preferences
 * @returns {number} - Maximum regret across all group members
 */
const calculateRegret = (selectedTrails, allTrails, groupMembers) => {
  let maxRegret = 0;
  
  groupMembers.forEach(member => {
    // Calculate utility of selected trails for this member
    const selectedUtility = selectedTrails.reduce((sum, trail) => {
      return sum + individualUtility(member, trail);
    }, 0);
    
    // Find the best possible utility for this member (top k trails)
    const memberUtilities = allTrails.map(trail => ({
      trail,
      utility: individualUtility(member, trail)
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
 * Calculate diversity score for a set of trails (optional feature)
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
  return (scenerySimilarity * 0.4 + 
          difficultySimilarity * 0.2 + 
          distanceSimilarity * 0.2 + 
          locationSimilarity * 0.2);
};

/**
 * Greedy MinMax Regret Algorithm with optional diversity consideration
 * @param {Array} trails - Available trails
 * @param {Array} groupMembers - Group member preferences
 * @param {number} k - Number of trails to select
 * @param {Object} options - Algorithm options
 * @returns {Array} - Selected trails
 */
const greedyMinMaxRegret = (trails, groupMembers, k = 5, options = {}) => {
  const {
    considerDiversity = false,  
    diversityWeight = 0.3,
    regretWeight = 0.7
  } = options;
  
  const selectedTrails = [];
  const availableTrails = [...trails];
  
  for (let i = 0; i < k && availableTrails.length > 0; i++) {
    let bestTrail = null;
    let bestScore = considerDiversity ? -Infinity : Infinity;
    
    // Try each available trail
    for (let j = 0; j < availableTrails.length; j++) {
      const candidateTrail = availableTrails[j];
      const candidateSelection = [...selectedTrails, candidateTrail];
      
      // Calculate regret score
      const regretScore = calculateRegret(candidateSelection, trails, groupMembers);
      
      if (considerDiversity) {
        // Use combined score approach
        const normalizedRegret = 1 - (regretScore / (groupMembers.length * k * 100));
        const diversityScore = calculateDiversity(candidateSelection);
        const combinedScore = (regretWeight * normalizedRegret) + (diversityWeight * diversityScore);
        
        if (combinedScore > bestScore) {
          bestScore = combinedScore;
          bestTrail = candidateTrail;
        }
      } else {
        // Use pure regret minimization
        if (regretScore < bestScore) {
          bestScore = regretScore;
          bestTrail = candidateTrail;
        }
      }
    }
    
    if (bestTrail) {
      selectedTrails.push(bestTrail);
      const index = availableTrails.findIndex(t => t.trail_id === bestTrail.trail_id);
      if (index > -1) {
        availableTrails.splice(index, 1);
      }
    }
  }
  
  return selectedTrails;
};

module.exports = {
  calculateRegret,
  calculateDiversity,
  calculateTrailSimilarity,
  greedyMinMaxRegret
};