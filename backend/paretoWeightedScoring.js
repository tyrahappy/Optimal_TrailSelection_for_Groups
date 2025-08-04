const { calculateGroupSatisfaction } = require('./utils/groupSatisfaction');

/** Build objective vector used for Pareto comparison (larger is better) */
function getObjectives(trail, group) {
  const g = calculateGroupSatisfaction(trail, group);
  const access = { Easy: 1.0, Moderate: 0.7, Hard: 0.4 }[trail.difficulty] || 0.5;
  const dist   = 1 - (trail.distance_km / 50);          // assume 50km worst case
  const time   = 1 - (trail.estimated_time_hours / 12); // assume 12h worst case
  return [g.avg_satisfaction, g.fairness_score, access, dist, time, g.consensus_degree];
}

/** a dominates b if >= on all and > on at least one */
function dominates(a, b) {
  let strict = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return false;
    if (a[i] > b[i]) strict = true;
  }
  return strict;
}

/** Phase 1: Pareto frontier */
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

/** Phase 2: weighted scoring on Pareto set (match methodology weights) */
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

/** Convenience wrapper: full pipeline */
function selectParetoK(trails, group, k = 5, weights) {
  const pareto = findParetoFrontier(trails, group);
  return weightedSelection(pareto, group, k, weights);
}

module.exports = { getObjectives, findParetoFrontier, weightedSelection, selectParetoK };