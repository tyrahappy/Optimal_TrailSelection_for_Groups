const { calculateGroupSatisfaction } = require('./utils/groupSatisfaction');

/**
 * Build objective vector used for Pareto comparison (larger is better)
 * Creates a 6-dimensional objective vector for multi-objective optimization
 * @param {Object} trail - Trail object to evaluate
 * @param {Array} group - Group member preferences
 * @returns {Array} - 6-dimensional objective vector [satisfaction, fairness, accessibility, distance, time, consensus]
 */
function getObjectives(trail, group) {
  const g = calculateGroupSatisfaction(trail, group);
  const access = { Easy: 1.0, Moderate: 0.7, Hard: 0.4 }[trail.difficulty] || 0.5;
  const dist   = 1 - (trail.distance_km / 50);          // assume 50km worst case
  const time   = 1 - (trail.estimated_time_hours / 12); // assume 12h worst case
  return [g.avg_satisfaction, g.fairness_score, access, dist, time, g.consensus_degree];
}

/**
 * Check if solution A dominates solution B in Pareto sense
 * A dominates B if A >= B on all objectives and A > B on at least one
 * @param {Array} a - Objective vector of solution A
 * @param {Array} b - Objective vector of solution B
 * @returns {boolean} - True if A dominates B
 */
function dominates(a, b) {
  let strict = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return false;
    if (a[i] > b[i]) strict = true;
  }
  return strict;
}

/**
 * Phase 1: Find Pareto frontier (non-dominated solutions)
 * Identifies all trails that are not dominated by any other trail
 * @param {Array} trails - All available trails
 * @param {Array} group - Group member preferences
 * @returns {Array} - Array of Pareto optimal trails
 */
function findParetoFrontier(trails, group) {
  const objs = trails.map(t => ({ trail: t, obj: getObjectives(t, group) }));
  const frontier = [];
  for (const x of objs) {
    let dom = false;
    for (const y of objs) {
      if (x === y) continue;
      if (dominates(y.obj, x.obj)) { dom = true; break; }
    }
    if (!dom) frontier.push(x.trail);
  }
  return frontier;
}

/**
 * Phase 2: Weighted scoring on Pareto set (match methodology weights)
 * Applies methodology weights to Pareto optimal trails for final selection
 * @param {Array} paretoSet - Pareto optimal trails
 * @param {Array} group - Group member preferences
 * @param {number} k - Number of trails to select
 * @param {Object} w - Weight configuration {avg, min, cons}
 * @returns {Array} - Top-k trails from weighted Pareto set
 */
function weightedSelection(paretoSet, group, k = 5, w = { avg:0.4, min:0.3, cons:0.3 }) {
  if (paretoSet.length <= k) return paretoSet;

  const scored = paretoSet.map(trail => {
    const g = calculateGroupSatisfaction(trail, group);
    const score = w.avg * g.avg_satisfaction + w.min * g.fairness_score + w.cons * (g.consensus_degree * 100);
    return { trail, score };
  });

  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0, k).map(s => s.trail);
}

/**
 * Convenience wrapper: full Pareto Weighted Scoring pipeline
 * Combines Pareto frontier identification and weighted selection
 * @param {Array} trails - All available trails
 * @param {Array} group - Group member preferences
 * @param {number} k - Number of trails to select
 * @param {Object} weights - Weight configuration for scoring
 * @returns {Array} - Final selected trails using Pareto Weighted Scoring
 */
function selectParetoK(trails, group, k = 5, weights) {
  const pareto = findParetoFrontier(trails, group);
  return weightedSelection(pareto, group, k, weights);
}

module.exports = { getObjectives, findParetoFrontier, weightedSelection, selectParetoK };