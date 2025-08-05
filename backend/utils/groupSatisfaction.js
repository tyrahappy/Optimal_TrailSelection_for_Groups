function gaussianPreference(actual, preferred, tolerance = 0.3) {
  if (preferred === 0) return actual === 0 ? 1.0 : 0.0;
  const d = Math.abs(actual - preferred) / preferred;
  return Math.exp(-(d ** 2) / (2 * tolerance ** 2));
}

function individualUtility(member, trail) {
  let u = 0;

  const diffScore = member.acceptable_difficulties.includes(trail.difficulty) ? 100 : 0;
  u += member.difficulty_weight * diffScore;

  const distScore = gaussianPreference(trail.distance_km, member.preferred_distance);
  u += member.distance_weight * distScore * 100;

  const timeScore = trail.estimated_time_hours <= member.max_time
    ? 100 - (50 * (trail.estimated_time_hours / member.max_time))
    : 0;
  u += member.time_weight * timeScore;

  const elevScore = trail.elevation_gain_m <= member.max_elevation
    ? 100 - (30 * (trail.elevation_gain_m / member.max_elevation))
    : 0;
  u += member.elevation_weight * elevScore;

  // Removed trail type scoring as it's not part of our evaluation criteria

  return Math.min(100, u);
}

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