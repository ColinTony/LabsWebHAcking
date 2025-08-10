
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const PORT = 3000;
const SLUG = "csrf";
const THEME = {"bg": "#0b1a19", "fg": "#e7fffb", "accent": "#2dd4bf"};

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
  return page('CSRF Action', inner);
}

app.get('/health', (req,res)=>res.json({ok:true, slug:SLUG}));


let profile = {email:'user@lab.local'};
app.get('/profile',(req,res)=>{
  const inner = `<div class="card"><h2>Perfil</h2><div>Email: <b id=email>${profile.email}</b></div>
  <form method="POST" action="/profile/email"><input name=email placeholder="nuevo email"><button>Cambiar</button></form>
  <p class="note">Cámbialo desde un formulario externo sin token.</p></div>`;
  res.send(page('CSRF Action', inner));
});
app.post('/profile/email',(req,res)=>{
  profile.email = (req.body.email||'').toString();
  res.redirect('/profile');
});


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });

app.get('/',(req,res)=>{
  const inner = `<div class="card"><p>Explota la vulnerabilidad y visita <code>/flag</code> para registrar progreso.</p>
  <p class="note">Tema: CSRF Action. Subdominio esperado: <code>${SLUG}.lab</code></p></div>`;
  res.send(page('CSRF Action', inner));
});

app.listen(PORT, ()=>console.log('CSRF Action listening on '+PORT));
