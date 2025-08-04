const toFloat = v => v == null || v === '' ? null : parseFloat(String(v).replace(/,/g,''));
const toInt   = v => v == null || v === '' ? null : parseInt(String(v).replace(/,/g,''), 10);
const toList  = v => Array.isArray(v) ? v : String(v||'').split(',').map(s=>s.trim()).filter(Boolean);

function normalizeTrail(raw) {
  const diff = String(raw.difficulty||'').trim();
  const difficulty =
    /easy/i.test(diff) ? 'Easy' : /moderate/i.test(diff) ? 'Moderate' :
    /hard/i.test(diff) ? 'Hard' : (diff || 'Moderate');

  const tt = String(raw.trail_type||'').trim();
  const trail_type =
    /loop/i.test(tt) ? 'Loop' :
    /(out\s*&?\s*back|out and back)/i.test(tt) ? 'Out & Back' :
    /(point[-\s]*to[-\s]*point|p2p)/i.test(tt) ? 'Point-to-Point' : (tt || 'Loop');

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

const normalizeTrails = arr => arr.map(normalizeTrail);
module.exports = { normalizeTrail, normalizeTrails };