// backend/test_pareto.js  — quick CLI check for Pareto+Weighted pipeline
/* eslint-disable no-console */

const fs   = require('fs');
const path = require('path');

const { normalizeTrails }   = require('./utils/normalize');
const { selectParetoK }     = require('./paretoWeightedScoring');
const { individualUtility } = require('./utils/groupSatisfaction');

// -------------------------------------------------------------
// 1. Load & normalise trail JSON (array or NDJSON fallback)
// -------------------------------------------------------------
function loadTrails() {
  const filePath = path.join(__dirname, 'csv', 'van_wa_200_sorted.json');
  const raw      = fs.readFileSync(filePath, 'utf8').trim();

  try { // standard JSON array
    const json = JSON.parse(raw);
    const arr  = Array.isArray(json) ? json : (json.trails || json.items || []);
    if (!Array.isArray(arr)) throw new Error('JSON root is not an array');
    return normalizeTrails(arr);
  } catch (_) {
    // NDJSON fallback
    const arr = raw.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
    return normalizeTrails(arr);
  }
}

// -------------------------------------------------------------
// 2. Toy group (methodology schema, including scenery prefs)
// -------------------------------------------------------------
const group = [
  {
    acceptable_difficulties: ['Easy', 'Moderate'],
    preferred_trail_types:   ['Loop', 'Out & Back'],

    preferred_distance: 8,      // km
    max_time:           4,      // h
    max_elevation:      600,    // m

    preferred_scenery_types: ['mountain', 'lake', 'forest'],

    // weights must sum to 1.0
    distance_weight:   0.20,
    time_weight:       0.20,
    elevation_weight:  0.15,
    difficulty_weight: 0.15,
    scenery_weight:    0.30
  }
];

// -------------------------------------------------------------
// 3. Run selector & basic sanity output
// -------------------------------------------------------------
const trails = loadTrails();
const k      = 5;
const top5   = selectParetoK(trails, group, k);

console.log(`\nTop ${k} trails from Pareto + Weighted scoring:`);
console.table(top5.map(t => ({ id: t.trail_id, name: t.trail_name, diff: t.difficulty, dist_km: t.distance_km })));

// Extra: show each member's avg utility for the chosen set
const avgUtil = top5.reduce((sum, tr) => sum + individualUtility(group[0], tr), 0) / k;
console.log(`\nAverage utility for member 0 on selected set: ${avgUtil.toFixed(1)}/100`);
