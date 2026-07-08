// Inject tools/blades.json into tools/template.html -> ../index.html
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const ROOT = path.join(HERE, '..');

const SNAPSHOT_DATE = process.env.SNAPSHOT_DATE ||
  new Date().toISOString().slice(0, 10);

const tpl = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
const blades = fs.readFileSync(path.join(HERE, 'blades.json'), 'utf8');

const html = tpl
  .replace('__BLADES_JSON__', blades)
  .replace('__SNAPSHOT_DATE__', SNAPSHOT_DATE);

const left = (html.match(/__[A-Z_]+__/g) || []);
if (left.length) { console.error('Unfilled placeholders:', left); process.exit(1); }

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('index.html written (' + fs.statSync(path.join(ROOT, 'index.html')).size + ' bytes), snapshot', SNAPSHOT_DATE);
