/**
 * Convert value to float, handling null/empty values and comma formatting
 * @param {*} v - Value to convert
 * @returns {number|null} - Parsed float or null if invalid
 */
const toFloat = v => v == null || v === '' ? null : parseFloat(String(v).replace(/,/g,''));

/**
 * Convert value to integer, handling null/empty values and comma formatting
 * @param {*} v - Value to convert
 * @returns {number|null} - Parsed integer or null if invalid
 */
const toInt   = v => v == null || v === '' ? null : parseInt(String(v).replace(/,/g,''), 10);

/**
 * Convert value to array, handling various input formats
 * @param {*} v - Value to convert (string, array, or null)
 * @returns {Array} - Array of trimmed strings, filtered for empty values
 */
const toList  = v => Array.isArray(v) ? v : String(v||'').split(',').map(s=>s.trim()).filter(Boolean);

/**
 * Normalize a single trail object from raw data
 * Standardizes difficulty levels, trail types, and data types
 * @param {Object} raw - Raw trail data object
 * @returns {Object} - Normalized trail object with consistent data types
 */
function normalizeTrail(raw) {
  // Normalize difficulty levels (case-insensitive matching)
  const diff = String(raw.difficulty||'').trim();
  const difficulty =
    /easy/i.test(diff) ? 'Easy' : /moderate/i.test(diff) ? 'Moderate' :
    /hard/i.test(diff) ? 'Hard' : (diff || 'Moderate');

  // Normalize trail types (case-insensitive matching)
  const tt = String(raw.trail_type||'').trim();
  const trail_type =
    /loop/i.test(tt) ? 'Loop' :
    /(out\s*&?\s*back|out and back)/i.test(tt) ? 'Out & Back' :
    /(point[-\s]*to[-\s]*point|p2p)/i.test(tt) ? 'Point-to-Point' : (tt || 'Loop');

  // Return normalized trail object
  return {
    trail_id: raw.trail_id,
    trail_name: raw.trail_name,
    park_name: raw.park_name,
    location: raw.location,
    difficulty,
    distance_km: toFloat(raw.distance_km),
    estimated_time_hours: toFloat(raw.estimated_time_hours),
    elevation_gain_m: toInt(raw.elevation_gain_m),
    rating: toFloat(raw.rating),
    scenery_types: toList(raw.scenery_types),
    facilities: toList(raw.facilities),
    trail_type,
    description: raw.description,
    alltrails_url: raw.alltrails_url
  };
}

/**
 * Normalize an array of trail objects
 * @param {Array} arr - Array of raw trail objects
 * @returns {Array} - Array of normalized trail objects
 */
const normalizeTrails = arr => arr.map(normalizeTrail);

module.exports = { normalizeTrail, normalizeTrails };