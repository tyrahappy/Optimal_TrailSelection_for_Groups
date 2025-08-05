// backend/test_pareto.js
const fs = require('fs');
const path = require('path');

const { normalizeTrails } = require('./utils/normalize');
const { selectParetoK } = require('./paretoWeightedScoring');

// ---- Load and parse trails from backend/csv/van_wa_200_sorted.json ----
function loadTrails() {
  const filePath = path.join(__dirname, 'csv', 'van_wa_200_sorted.json');
  const raw = fs.readFileSync(filePath, 'utf8').trim();

  // Try standard JSON first (expecting an array)
  try {
    const json = JSON.parse(raw);
    const arr = Array.isArray(json) ? json : (json.trails || json.items || []);
    if (!Array.isArray(arr)) throw new Error('JSON root is not an array');
    return normalizeTrails(arr);
  } catch (_) {
    // Fallback: NDJSON (one JSON object per line)
    const arr = raw.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
    return normalizeTrails(arr);
  }
}

// ---- Example group in methodology format (adjust as needed) ----
const group = [
  {
    acceptable_difficulties: ['Easy', 'Moderate'],
  
    preferred_distance: 8,     // km
    max_time: 4,               // hours
    max_elevation: 600,        // meters
    distance_weight: 0.25,
    time_weight: 0.25,
    elevation_weight: 0.25,
    difficulty_weight: 0.25
  }
];

const trails = loadTrails();
const k = 5;

const results = selectParetoK(trails, group, k);
console.log(`Selected ${results.length} trails (Pareto + weighted):`);
console.log(JSON.stringify(results, null, 2));