
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

const defaultData = { completed: [], total: 10, stats: { perChallenge: {}, achievements: [] }, leaderboard: [] };
const defaultChallenges = [
  {name:'XSS Guestbook', slug:'xss', subdomain:'xss.lab', track:'Web', difficulty:'Easy', hints:['Prueba un parámetro visible','Busca contexto HTML','Cierra etiquetas y ejecuta'], timebox:1800},
  {name:'LFI Classic', slug:'lfi', subdomain:'lfi.lab', track:'Web', difficulty:'Easy', hints:['files=..','Doble encoding','Extensión permitida'], timebox:1800},
  {name:'SQLi Login', slug:'sqli', subdomain:'sqli.lab', track:'Web', difficulty:'Medium', hints:['Login vulnerable','OR 1=1','Inyección de UNION'], timebox:2700},
  {name:'XXE Peek', slug:'xxe', subdomain:'xxe.lab', track:'Web', difficulty:'Medium', hints:['DTD externa','file://','XXE básica'], timebox:2700},
  {name:'IDOR Profile', slug:'idor', subdomain:'idor.lab', track:'Web', difficulty:'Easy', hints:['/api/users/1','Campos ocultos','Sin auth'], timebox:1800},
  {name:'CSRF Action', slug:'csrf', subdomain:'csrf.lab', track:'Web', difficulty:'Easy', hints:['Form auto-submit','CORS laxo','Referrer'], timebox:1800},
  {name:'SSRF Filter', slug:'ssrf', subdomain:'ssrf.lab', track:'Web', difficulty:'Medium', hints:['Allowlist débil','127.0.0.1','Esquemas'], timebox:2700},
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
function saveChallenges(d) { fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(d, null, 2)); }

const flags = {"xss": "HTB{c0l1nr00t-xss-a1}", "lfi": "HTB{c0l1nr00t-lfi-b2}", "sqli": "HTB{c0l1nr00t-sqli-c3}", "xxe": "HTB{c0l1nr00t-xxe-d4}", "idor": "HTB{c0l1nr00t-idor-e5}", "csrf": "HTB{c0l1nr00t-csrf-f6}", "ssrf": "HTB{c0l1nr00t-ssrf-g7}", "upload": "HTB{c0l1nr00t-upload-h8}", "bover": "HTB{c0l1nr00t-bover-1337}", "crackme": "HTB{c0l1nr00t-crackme-909}"};
const flagList = Object.values(flags);

app.get('/score/state', (req,res)=>{
  const state = loadProgress();
  res.json(state);
});

app.get('/score/list', (req,res)=>{
  res.json(loadChallenges());
});

app.get('/theme', (req,res)=>{ res.json({theme:THEME}) });

app.get('/score/beacon', (req,res)=>{
  const token = req.query.token || '';
  const state = loadProgress();
  if(flagList.includes(token) && !state.completed.includes(token)) {
    state.completed.push(token);
    const slug = Object.entries(flags).find(([k,v])=>v===token)?.[0];
    const now = Date.now();
    state.stats.perChallenge[slug] = state.stats.perChallenge[slug] || {};
    if(!state.stats.perChallenge[slug].firstAt) state.stats.perChallenge[slug].firstAt = now;
    state.stats.perChallenge[slug].lastAt = now;
    // basic achievements
    if(state.completed.length===1 && !state.stats.achievements.includes('First Blood')) state.stats.achievements.push('First Blood');
    if(state.completed.length===8 && !state.stats.achievements.includes('All Web')) state.stats.achievements.push('All Web');
    if(state.completed.length===10 && !state.stats.achievements.includes('All Reversing')) state.stats.achievements.push('All Reversing');
    saveProgress(state);
  }
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==','base64');
  res.set('Content-Type','image/gif');
  res.send(gif);
});

app.post('/score/submit', (req,res)=>{
  const { flag } = req.body || {}
  if(!flag) return res.status(400).json({ok:false, error:'Missing flag'});
  const state = loadProgress();
  if(flagList.includes(flag)) {
    if(!state.completed.includes(flag)) state.completed.push(flag);
    saveProgress(state);
    return res.json({ok:true, msg:'Flag accepted'});
  }
  res.status(400).json({ok:false, error:'Invalid flag'});
});

app.get('/score/leaderboard', (req,res)=>{
  if(!ENABLE_LEADERBOARD) return res.json([]);
  res.json(loadProgress().leaderboard || []);
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
  saveChallenges(chals);
  res.json({ok:true});
});

app.post('/admin/seed/reset', requireAdmin, (req,res)=>{
  // This is a placeholder to "regenerate" datasets in services.
  res.json({ok:true, msg:'Seed reset requested to services (mock).'});
});

app.get('/bover', (req,res)=>{
  res.send(`
  <html><head><title>BoF 31337</title><style>body{background:#000;color:#0f0;font-family:monospace}</style></head>
  <body><h1>BoF @ 31337</h1>
  <p>Conecta al puerto <b>31337</b> en el host y logra controlar el flujo para imprimir la flag.</p>
  <p>Flag se imprimirá desde el contenedor del servicio bover si explotas correctamente.</p>
  </body></html>`);
});

app.listen(PORT, ()=>console.log('Scoreboard listening on '+PORT));
