// Parse the Google Sheet CSV snapshot (tools/sheet_raw.csv) into tools/blades.json
const fs = require('fs');
const path = require('path');
const HERE = __dirname;

function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (c === '\r') { /* skip */ }
      else cur += c;
    }
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const raw = fs.readFileSync(path.join(HERE, 'sheet_raw.csv'), 'utf8');
const rows = parseCSV(raw);
const out = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1]) continue;
  if ((r[2] || '').trim() !== 'blade') continue;   // only real blades
  out.push({
    id:          (r[0]  || '').trim(),
    name:        (r[1]  || '').trim(),
    type:        (r[3]  || '').trim(),   // attack/defense/stamina/balance/special
    tier:        (r[4]  || '').trim() || '-',
    buy:         (r[5]  || '').trim(),
    ratchet:     (r[6]  || '').trim(),
    ratchetTier: (r[7]  || '').trim(),
    bit:         (r[8]  || '').trim(),
    bitTier:     (r[9]  || '').trim(),
    source:      (r[11] || '').trim(),
    img:         (r[12] || '').trim(),
    combo:       (r[13] || '').trim(),
  });
}
fs.writeFileSync(path.join(HERE, 'blades.json'), JSON.stringify(out));
console.log('blades:', out.length);
