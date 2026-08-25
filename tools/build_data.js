// Parse the Google Sheet CSV snapshots into tools/blades.json
//  - sheet_raw.csv : 主資料表（beyblade_x_database 分頁）
//  - parts_raw.csv : 零件圖鑑分頁（固鎖／軸心／輔助的階級，gid=1809991430）
// 固鎖階級／軸心階級已從主表移到「零件圖鑑」分頁，故在此以零件名稱回填。
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

// 讀「零件圖鑑」：欄位＝名稱 / 分類 / 圖片 / 階級，建立「零件名稱 → 階級」對照表。
// 檔案不存在時回傳空表（改由主表原欄位當備援），不讓建置失敗。
function loadPartTiers() {
  const p = path.join(HERE, 'parts_raw.csv');
  const map = {};
  if (!fs.existsSync(p)) { console.warn('parts_raw.csv 不存在，改用主表原欄位階級'); return map; }
  const rows = parseCSV(fs.readFileSync(p, 'utf8'));
  if (!rows.length) return map;
  const head = rows[0].map(h => (h || '').trim());
  let idxTier = head.findIndex(h => h.includes('階級') || /tier/i.test(h));
  if (idxTier < 0) idxTier = 3;          // 預設第 4 欄為階級
  const idxName = 0;                      // 第 1 欄為零件名稱
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const name = (r[idxName] || '').trim();
    const tier = (r[idxTier] || '').trim();
    if (name && tier) map[name] = tier;
  }
  return map;
}

const partTier = loadPartTiers();
const raw = fs.readFileSync(path.join(HERE, 'sheet_raw.csv'), 'utf8');
const rows = parseCSV(raw);
const out = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1]) continue;
  if ((r[2] || '').trim() !== 'blade') continue;   // only real blades
  const ratchet = (r[6] || '').trim();
  const bit     = (r[8] || '').trim();
  out.push({
    id:          (r[0]  || '').trim(),
    name:        (r[1]  || '').trim(),
    type:        (r[3]  || '').trim(),   // attack/defense/stamina/balance/special
    tier:        (r[4]  || '').trim() || '-',
    buy:         (r[5]  || '').trim(),
    ratchet,
    // 優先取「零件圖鑑」的階級，退回主表第 8 欄（H）
    ratchetTier: partTier[ratchet] || (r[7] || '').trim(),
    bit,
    // 優先取「零件圖鑑」的階級，退回主表第 10 欄（J）
    bitTier:     partTier[bit] || (r[9] || '').trim(),
    source:      (r[11] || '').trim(),
    img:         (r[12] || '').trim(),
    combo:       (r[13] || '').trim(),
  });
}
fs.writeFileSync(path.join(HERE, 'blades.json'), JSON.stringify(out));
console.log('blades:', out.length, '| partTiers:', Object.keys(partTier).length);
