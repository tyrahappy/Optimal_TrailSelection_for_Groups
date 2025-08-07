/**
 * Calculate Gaussian preference score for distance matching
 * Uses Gaussian function to model preference satisfaction with tolerance
 * @param {number} actual - Actual trail distance
 * @param {number} preferred - Preferred distance
 * @param {number} tolerance - Tolerance parameter (default: 0.3)
 * @returns {number} - Preference score between 0 and 1
 */
function gaussianPreference(actual, preferred, tolerance = 0.3) {
  if (preferred === 0) return actual === 0 ? 1.0 : 0.0;
  const d = Math.abs(actual - preferred) / preferred;
  return Math.exp(-(d ** 2) / (2 * tolerance ** 2));
}

/**
 * Calculate scenery overlap score using Jaccard similarity
 * Measures how well trail scenery matches member preferences
 * @param {Array} trailScenery - Trail scenery types
 * @param {Array} preferredScenery - Member's preferred scenery types
 * @returns {number} - Jaccard similarity score between 0 and 1
 */
function sceneryMatchScore(trailScenery, preferredScenery) {
  const A = new Set(trailScenery.map(s => s.toLowerCase()));
  const B = new Set(preferredScenery.map(s => s.toLowerCase()));
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : inter / union;        // Jaccard ∈ [0,1]
}

/**
 * Calculate individual utility score for a member-trail combination
 * Combines 5 criteria: difficulty, distance, time, elevation, and scenery preferences
 * @param {Object} member - Group member with preferences and constraints
 * @param {Object} trail - Trail object with properties
 * @returns {number} - Individual utility score (0-100)
 */
function individualUtility(member, trail) {
  let u = 0;

  // Difficulty satisfaction (binary: acceptable or not)
  const diffScore = member.acceptable_difficulties.includes(trail.difficulty) ? 100 : 0;
  u += member.difficulty_weight * diffScore;

  // Distance satisfaction (Gaussian preference)
  const distScore = gaussianPreference(trail.distance_km, member.preferred_distance);
  u += member.distance_weight * distScore * 100;

  // Time satisfaction (linear penalty for exceeding max time)
  const timeScore = trail.estimated_time_hours <= member.max_time
    ? 100 - (50 * (trail.estimated_time_hours / member.max_time))
    : 0;
  u += member.time_weight * timeScore;

  // Elevation satisfaction (linear penalty for exceeding max elevation)
  const elevScore = trail.elevation_gain_m <= member.max_elevation
    ? 100 - (30 * (trail.elevation_gain_m / member.max_elevation))
    : 0;
  u += member.elevation_weight * elevScore;

  // Scenery satisfaction (Jaccard similarity)
  if (member.preferred_scenery_types && member.preferred_scenery_types.length) {
    const scenScore = sceneryMatchScore(trail.scenery_types, member.preferred_scenery_types) * 100;
    u += member.scenery_weight * scenScore;
  }

  return Math.min(100, u);
}

/**
 * Calculate comprehensive group satisfaction metrics for a trail
 * Combines individual utilities to compute group-level satisfaction indicators
 * @param {Object} trail - Trail object to evaluate
 * @param {Array} group - Array of group members with preferences
 * @returns {Object} - Group satisfaction metrics including total score, averages, and consensus
 */
function calculateGroupSatisfaction(trail, group) {
  const scores = group.map(m => individualUtility(m, trail));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const std = Math.sqrt(scores.reduce((s, x) => s + (x - avg) ** 2, 0) / scores.length);
  const consensus = Math.max(0, 1 - (std / 30)); // 0–1

  return {
    total_score: 0.4 * avg + 0.3 * min + 0.3 * consensus * 100,
    avg_satisfaction: avg,
    fairness_score: min,
    consensus_degree: consensus,
    controversy_level: std
  };
}

module.exports = { gaussianPreference, individualUtility, calculateGroupSatisfaction };