
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const PORT = 3000;
const SLUG = "sqli";
const THEME = {"bg": "#1a0b0b", "fg": "#ffe7e7", "accent": "#fb7185"};

function hexFromSeed(seed, slug, bytes=8){
  // Deterministic: HMAC(seed, slug) -> hex length 2*bytes
  const h = crypto.createHmac('sha256', String(seed||''));
  h.update(String(slug));
  return h.digest('hex').slice(0, bytes*2);
}

function makeFlag(){ 
  const seed = process.env.SEED;
  const hx = seed ? hexFromSeed(seed, SLUG, 8) : crypto.randomBytes(8).toString('hex');
  return `HTB{c0l1nr00t-${SLUG}-${hx}}`; 
}

const FLAG = process.env.FLAG || makeFlag();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

function page(title, inner){
  return `<!doctype html>` + `<html><head><title>${title}</title>
<style>
:root{--bg:{theme['bg']};--fg:{theme['fg']};--accent:{theme['accent']};--muted:{theme.get('muted','#9aa4b2')}}
*{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--fg);font-family:system-ui,sans-serif}
.container{max-width:960px;margin:0 auto;padding:18px}
h1,h2,h3{margin:.2rem 0}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;margin-top:12px}
a,button{color:var(--fg)}
a.btn,button{display:inline-block;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(0,0,0,.12));border:1px solid rgba(255,255,255,.16);padding:8px 12px;border-radius:10px;text-decoration:none}
.note{color:var(--muted)}
hr{border:none;border-top:1px dashed rgba(255,255,255,.1);margin:12px 0}
</style></head>
<body><div class="container">
<h1 style="color:var(--accent)">${title}</h1>
${{inner}}
</div></body></html>`;
}

function flagHtml(flag){
  const inner = `<div class="card"><h2>/flag</h2><p>${flag}</p>
  <img src="http://lab/score/beacon?slug=${SLUG}&token=${encodeURIComponent(flag)}" width="1" height="1"/></div>`;
  return page('SQLi Login', inner);
}

app.get('/health', (req,res)=>res.json({ok:true, slug:SLUG}));


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
db.serialize(()=>{
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, secret TEXT)");
  db.run("INSERT INTO users(username,password,secret) VALUES ('admin','admin','(demo) HTB{c0l1nr00t-sqli-xxxxxx}')");
  db.run("INSERT INTO users(username,password,secret) VALUES ('guest','guest','nope')");
});
let loggedIn = false;
app.get('/login',(req,res)=>{
  const inner = `<div class="card"><form method="POST" action="/login">
  <input name="username" placeholder="user"><input name="password" placeholder="pass" type="password">
  <button>Login</button></form></div>`;
  res.send(page('SQLi Login', inner));
});
app.post('/login', (req,res)=>{
  const {username, password} = req.body;
  const q = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  db.get(q, (err,row)=>{
    if(row){ loggedIn=true; res.redirect('/admin'); }
    else res.status(401).send(page('SQLi Login', `<div class="card">Login failed</div>`));
  });
});
app.get('/admin',(req,res)=>{
  if(!loggedIn) return res.status(403).send(page('SQLi Login', `<div class="card">Login requerido</div>`));
  db.all("SELECT id, username, secret FROM users", (e,rows)=>{
    const inner = `<div class="card"><h2>Panel</h2><pre>${JSON.stringify(rows,null,2)}</pre></div>`;
    res.send(page('SQLi Login', inner));
  });
});


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });

app.get('/',(req,res)=>{
  const inner = `<div class="card"><p>Explota la vulnerabilidad y visita <code>/flag</code> para registrar progreso.</p>
  <p class="note">Tema: SQLi Login. Subdominio esperado: <code>${SLUG}.lab</code></p></div>`;
  res.send(page('SQLi Login', inner));
});

app.listen(PORT, ()=>console.log('SQLi Login listening on '+PORT));
