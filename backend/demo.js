// backend/demo.js – unified demo for Greedy (methodology-based) and Pareto
/* eslint-disable no-console */

const fs   = require('fs');
const path = require('path');

const { normalizeTrails } = require('./utils/normalize');
const {
  greedyMinMaxRegret,
  calculateRegret,
  calculateDiversity,
} = require('./greedyMinMaxRegret');
const { selectParetoK } = require('./paretoWeightedScoring');
const { individualUtility } = require('./utils/groupSatisfaction');

// ---------------------------------------------------------------------------
// CLI flag: --method greedy | pareto | both (default both)
// ---------------------------------------------------------------------------
const methodFlag = (() => {
  const i = process.argv.indexOf('--method');
  return i > -1 ? (process.argv[i + 1] || 'both') : 'both';
})();

// ---------------------------------------------------------------------------
// Load & normalise full trail dataset
// ---------------------------------------------------------------------------
const rawPath = path.join(__dirname, 'csv', 'van_wa_200_sorted.json');
const rawJson = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const trails  = normalizeTrails(Array.isArray(rawJson) ? rawJson : rawJson.trails || rawJson.items);

// ---------------------------------------------------------------------------
// Scenario definitions – already in methodology format (weights sum to 1)
// ---------------------------------------------------------------------------
const scenarios = [
  /* Diverse fitness & preferences */
  {
    name: 'Scenario 1 — Diverse Fitness & Preferences',
    groupDescription: 'Wide spread of distance and difficulty tolerances.',
    members: [
      {
        max_distance: 16,
        max_elevation: 900,
        max_time: 8,
        acceptable_difficulties: ['Easy', 'Moderate', 'Hard'],
        preferred_trail_types: ['Loop', 'Out & Back'],
        preferred_distance: 10,
        difficulty_weight: 0.25,
        distance_weight:   0.25,
        time_weight:       0.15,
        elevation_weight:  0.20,
        trail_type_weight: 0.15
      },
      {
        max_distance: 8,
        max_elevation: 400,
        max_time: 4,
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_trail_types: ['Loop'],
        preferred_distance: 6,
        difficulty_weight: 0.20,
        distance_weight:   0.30,
        time_weight:       0.20,
        elevation_weight:  0.15,
        trail_type_weight: 0.15
      },
      {
        max_distance: 20,
        max_elevation: 1200,
        max_time: 10,
        acceptable_difficulties: ['Moderate', 'Hard'],
        preferred_trail_types: ['Out & Back', 'Point-to-Point'],
        preferred_distance: 14,
        difficulty_weight: 0.30,
        distance_weight:   0.15,
        time_weight:       0.10,
        elevation_weight:  0.30,
        trail_type_weight: 0.15
      }
    ]
  },

  /* Lake lovers */
  {
    name: 'Scenario 2 — Lake Lovers (Similar Preferences)',
    groupDescription: 'All members love easy lake loops, shorter distances.',
    members: [
      {
        max_distance: 8,
        max_elevation: 300,
        max_time: 4,
        acceptable_difficulties: ['Easy'],
        preferred_trail_types: ['Loop'],
        preferred_distance: 5,
        difficulty_weight: 0.10,
        distance_weight:   0.30,
        time_weight:       0.25,
        elevation_weight:  0.15,
        trail_type_weight: 0.20
      },
      {
        max_distance: 8,
        max_elevation: 400,
        max_time: 4,
        acceptable_difficulties: ['Easy'],
        preferred_trail_types: ['Loop'],
        preferred_distance: 6,
        difficulty_weight: 0.15,
        distance_weight:   0.30,
        time_weight:       0.25,
        elevation_weight:  0.10,
        trail_type_weight: 0.20
      },
      {
        max_distance: 10,
        max_elevation: 500,
        max_time: 5,
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_trail_types: ['Loop'],
        preferred_distance: 7,
        difficulty_weight: 0.15,
        distance_weight:   0.30,
        time_weight:       0.20,
        elevation_weight:  0.15,
        trail_type_weight: 0.20
      }
    ]
  },

  /* Mixed quick vs scenic */
  {
    name: 'Scenario 3 — Mixed: Fast-Paced vs Scenic Strollers',
    groupDescription: 'One member prioritises speed, another scenery, third balanced.',
    members: [
      {
        max_distance: 12,
        max_elevation: 600,
        max_time: 4,
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_trail_types: ['Loop', 'Out & Back'],
        preferred_distance: 8,
        difficulty_weight: 0.10,
        distance_weight:   0.40,
        time_weight:       0.25,
        elevation_weight:  0.10,
        trail_type_weight: 0.15
      },
      {
        max_distance: 18,
        max_elevation: 1000,
        max_time: 9,
        acceptable_difficulties: ['Moderate', 'Hard'],
        preferred_trail_types: ['Point-to-Point', 'Out & Back'],
        preferred_distance: 14,
        difficulty_weight: 0.30,
        distance_weight:   0.10,
        time_weight:       0.10,
        elevation_weight:  0.30,
        trail_type_weight: 0.20
      },
      {
        max_distance: 14,
        max_elevation: 700,
        max_time: 6,
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_trail_types: ['Loop'],
        preferred_distance: 10,
        difficulty_weight: 0.20,
        distance_weight:   0.20,
        time_weight:       0.20,
        elevation_weight:  0.20,
        trail_type_weight: 0.20
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// Helper: compute metrics (methodology-aware)
// ---------------------------------------------------------------------------
function computeMetrics(selected, group) {
  const m = {
    totalTrails: selected.length,
    averageRating: 0,
    averageDistance: 0,
    averageTime: 0,
    averageElevation: 0,
    groupMatchPercentages: [],
    diversityScore: 0,
    regretScore: 0
  };
  if (!selected.length) return m;

  m.averageRating   = selected.reduce((s, t) => s + (t.rating || 0), 0) / selected.length;
  m.averageDistance = selected.reduce((s, t) => s + (t.distance_km || 0), 0) / selected.length;
  m.averageTime     = selected.reduce((s, t) => s + (t.estimated_time_hours || 0), 0) / selected.length;
  m.averageElevation= selected.reduce((s, t) => s + (t.elevation_gain_m || 0), 0) / selected.length;

  m.groupMatchPercentages = group.map(member =>
    Math.round(selected.reduce((sum, tr) => sum + individualUtility(member, tr), 0) / selected.length)
  );

  m.diversityScore = calculateDiversity(selected);
  m.regretScore    = calculateRegret(selected, selected, group);
  return m;
}

// ---------------------------------------------------------------------------
const k = 5;
const greedyOptions = { considerDiversity: true, diversityWeight: 0.3, regretWeight: 0.7 };

scenarios.forEach((sc, idx) => {
  console.log('\n' + '='.repeat(90));
  console.log(`${idx + 1}. ${sc.name}\n   ${sc.groupDescription}`);

  const group = sc.members;

  if (methodFlag === 'greedy' || methodFlag === 'both') {
    const gSel = greedyMinMaxRegret(trails, group, k, greedyOptions);
    const gMet = computeMetrics(gSel, group);
    console.log('\n› Greedy MinMax Regret');
    gSel.forEach((t, i) =>
      console.log(`  ${i + 1}. ${t.trail_name} — ${t.difficulty}, ${t.distance_km} km, ★${t.rating}`)
    );
    console.log(`  Diversity ${(gMet.diversityScore * 100).toFixed(0)}% | Regret ${gMet.regretScore.toFixed(2)}`);
  }

  if (methodFlag === 'pareto' || methodFlag === 'both') {
    const selectedPareto = selectParetoK(trails, group, k);
    const m = computeMetrics(selectedPareto, group);

    console.log('\n› Pareto + Weighted Scoring');
    selectedPareto.forEach((t, i) =>
      console.log(`  ${i + 1}. ${t.trail_name} — ${t.difficulty}, ${t.distance_km} km, ★${t.rating}`)
    );
    console.log(`  Diversity: ${(m.diversityScore * 100).toFixed(0)}%   Regret: ${m.regretScore.toFixed(2)}`);
  }
});

console.log('\nDone. Use --method greedy | pareto | both\n');