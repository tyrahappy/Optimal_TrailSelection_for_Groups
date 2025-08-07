const { individualUtility } = require('./utils/groupSatisfaction');

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
    const selectedUtility = selectedTrails.reduce((sum, trail) => {
      return sum + individualUtility(member, trail);
    }, 0);
    
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
 * Pure MinMax Regret Algorithm
 * Focuses solely on minimizing maximum regret across all group members
 * @param {Array} trails - Available trails
 * @param {Array} groupMembers - Group member preferences
 * @param {number} k - Number of trails to select
 * @param {Object} options - Algorithm options
 * @returns {Object|Array} - Results with trails and regret info, or just trails if returnOnlyTrails=true
 */
const greedyMinMaxRegret = (trails, groupMembers, k = 5, options = {}) => {
  const { returnOnlyTrails = false } = options;
  
  const selectedTrails = [];
  const availableTrails = [...trails];
  
  for (let i = 0; i < k && availableTrails.length > 0; i++) {
    let bestTrail = null;
    let bestRegret = Infinity;
    
    for (let j = 0; j < availableTrails.length; j++) {
      const candidateTrail = availableTrails[j];
      const candidateSelection = [...selectedTrails, candidateTrail];
      const regretScore = calculateRegret(candidateSelection, trails, groupMembers);
      
      if (regretScore < bestRegret) {
        bestRegret = regretScore;
        bestTrail = candidateTrail;
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
  
  // Return only trails for backward compatibility
  if (returnOnlyTrails) {
    return selectedTrails;
  }
  
  // Calculate final maximum regret
  const finalMaxRegret = calculateRegret(selectedTrails, trails, groupMembers);
  
  // Return comprehensive results
  return {
    selectedTrails,
    maxRegret: Math.round(finalMaxRegret),
    algorithm: 'Greedy MinMax Regret',
    objective: 'Minimize Maximum Regret'
  };
};

module.exports = {
  calculateRegret,
  greedyMinMaxRegret
};