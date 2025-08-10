const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'supersecretadmin';
const ENABLE_LEADERBOARD = (process.env.ENABLE_LEADERBOARD || 'true') === 'true';
const THEME = process.env.THEME || 'default';

const DATA_DIR = path.join(__dirname, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const CHALLENGES_FILE = path.join(DATA_DIR, 'challenges.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const defaultData = { completed: [], tokens: {}, total: 10, stats: { perChallenge: {}, achievements: [] }, leaderboard: [] };
const defaultChallenges = [
  {name:'XSS Guestbook', slug:'xss', subdomain:'xss.lab', track:'Web', difficulty:'Easy', hints:['Reflejado y almacenado','Cierra etiquetas','Evita el filtro básico'], timebox:1800},
  {name:'LFI Classic', slug:'lfi', subdomain:'lfi.lab', track:'Web', difficulty:'Easy', hints:['..%252f traversal','Extensión obligatoria','Directorio data/'], timebox:1800},
  {name:'SQLi Login', slug:'sqli', subdomain:'sqli.lab', track:'Web', difficulty:'Medium', hints:['OR 1=1','UNION SELECT','Bypass de login'], timebox:2700},
  {name:'XXE Peek', slug:'xxe', subdomain:'xxe.lab', track:'Web', difficulty:'Medium', hints:['<!ENTITY xxe SYSTEM>','file:///app/secret.txt','Usa &xxe;'], timebox:2700},
  {name:'IDOR Profile', slug:'idor', subdomain:'idor.lab', track:'Web', difficulty:'Easy', hints:['/api/invoices/1','Sin auth','Objeto sensible'], timebox:1800},
  {name:'CSRF Action', slug:'csrf', subdomain:'csrf.lab', track:'Web', difficulty:'Easy', hints:['Form auto-submit','Cambiar email','Sin token CSRF'], timebox:1800},
  {name:'SSRF Filter', slug:'ssrf', subdomain:'ssrf.lab', track:'Web', difficulty:'Medium', hints:['Allowlist por inicio','Usa @ o case','Metadata mock interna'], timebox:2700},
  {name:'Upload Trick', slug:'upload', subdomain:'upload.lab', track:'Web', difficulty:'Medium', hints:['Doble extensión','MIME vs extensión','Mayúsculas'], timebox:2700},
  {name:'BoF 31337', slug:'bover', subdomain:'bover.lab', track:'Reversing', difficulty:'Hard', hints:['Sin canarios','EIP/RIP control','Imprime flag'], timebox:3600},
  {name:'Crackme 909', slug:'crackme', subdomain:'crackme.lab', track:'Reversing', difficulty:'Easy', hints:['Clave hardcode','Checksum simple','Comparación'], timebox:1800}
];

function ensureFile(file, fallback) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
}

ensureFile(PROGRESS_FILE, defaultData);
ensureFile(CHALLENGES_FILE, defaultChallenges);

function loadProgress() { return JSON.parse(fs.readFileSync(PROGRESS_FILE)); }
function saveProgress(d) { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(d, null, 2)); }
function loadChallenges() { return JSON.parse(fs.readFileSync(CHALLENGES_FILE)); }

function isValidTokenForSlug(token, slug){
  const re1 = new RegExp('^HTB\\{c0l1nr00t-' + slug + '-[a-f0-9]{8,}\\}$');
  const re2 = /^HTB\{c0l1nr00t-[a-f0-9]{8,}\}$/;
  return re1.test(token) || re2.test(token);
}

app.get('/score/state', (req,res)=>{
  const state = loadProgress();
  res.json(state);
});

app.get('/score/list', (req,res)=>{
  res.json(loadChallenges());
});

app.get('/theme', (req,res)=>{ res.json({theme:THEME}) });

app.get('/score/beacon', (req,res)=>{
  const token = (req.query.token || '').toString();
  const slug = (req.query.slug || '').toString();
  const state = loadProgress();
  if(slug && token && isValidTokenForSlug(token, slug)){
    if(!state.completed.includes(slug)){
      state.completed.push(slug);
      state.tokens[slug] = token;
      const now = Date.now();
      state.stats.perChallenge[slug] = state.stats.perChallenge[slug] || {};
      if(!state.stats.perChallenge[slug].firstAt) state.stats.perChallenge[slug].firstAt = now;
      state.stats.perChallenge[slug].lastAt = now;
      if(state.completed.length===1 && !state.stats.achievements.includes('First Blood')) state.stats.achievements.push('First Blood');
      const webDone = state.completed.filter(s=>['xss','lfi','sqli','xxe','idor','csrf','ssrf','upload'].includes(s)).length;
      if(webDone===8 && !state.stats.achievements.includes('All Web')) state.stats.achievements.push('All Web');
      const revDone = state.completed.filter(s=>['bover','crackme'].includes(s)).length;
      if(revDone===2 && !state.stats.achievements.includes('All Reversing')) state.stats.achievements.push('All Reversing');
      saveProgress(state);
    }
  }
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==','base64');
  res.set('Content-Type','image/gif');
  res.send(gif);
});

app.post('/score/submit', (req,res)=>{
  const { flag, slug } = req.body || {}
  if(!flag || !slug) return res.status(400).json({ok:false, error:'Missing flag or slug'});
  const state = loadProgress();
  if(isValidTokenForSlug(flag, slug)){
    if(!state.completed.includes(slug)) state.completed.push(slug);
    state.tokens[slug] = flag;
    saveProgress(state);
    return res.json({ok:true, msg:'Flag accepted'});
  }
  res.status(400).json({ok:false, error:'Invalid flag'});
});

function requireAdmin(req,res,next){
  if((req.headers['x-admin-token']||'')!==ADMIN_TOKEN) return res.status(403).json({ok:false});
  next();
}

app.post('/admin/challenges', requireAdmin, (req,res)=>{
  const chals = loadChallenges();
  const item = req.body;
  const idx = chals.findIndex(c=>c.slug===item.slug);
  if(idx>=0) chals[idx]=item; else chals.push(item);
  fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(chals, null, 2));
  res.json({ok:true});
});

app.post('/admin/seed/reset', requireAdmin, (req,res)=>{
  res.json({ok:true, msg:'Seed reset requested to services (mock).'});
});

app.get('/bover', (req,res)=>{
  res.send(`
  <html><head><title>BoF 31337</title><style>body{background:#0b1220;color:#e6e8eb;font-family:system-ui, sans-serif}</style></head>
  <body><h1>BoF @ 31337</h1>
  <p>Conecta al puerto <b>31337</b> en el host y logra controlar el flujo para imprimir la flag.</p>
  <p>Flag se imprimirá desde el contenedor del servicio bover si explotas correctamente.</p>
  </body></html>`);
});

app.listen(PORT, ()=>console.log('Scoreboard listening on '+PORT));