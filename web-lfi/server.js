
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const PORT = 3000;
const SLUG = "lfi";
const THEME = {"bg": "#0b1a14", "fg": "#e8fff6", "accent": "#34d399"};

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
  return page('LFI Classic', inner);
}

app.get('/health', (req,res)=>res.json({ok:true, slug:SLUG}));


const path = require('path'), fs = require('fs');
app.get('/view', (req,res)=>{
  let f = (req.query.file || 'readme.txt').toString();
  f = decodeURIComponent(f);
  if(!f.endsWith('.txt')) return res.status(400).send(page('LFI Classic', `<div class="card">Solo .txt</div>`));
  const base = '/app/data';
  const p = path.normalize(path.join(base, f));
  if(!p.startsWith(base)) return res.status(403).send(page('LFI Classic', `<div class="card">Bloqueado</div>`));
  try{
    const data = fs.readFileSync(p,'utf8');
    res.type('text/html').send(page('LFI Classic', `<div class="card"><h2>Contenido</h2><pre>${data.replace(/</g,'&lt;')}</pre></div>`));
  }catch(e){ res.status(404).send(page('LFI Classic', `<div class="card">No encontrado</div>`)); }
});
const dir='/app/data'; if(!fs.existsSync(dir)) fs.mkdirSync(dir);
if(!fs.existsSync(dir+'/readme.txt')) fs.writeFileSync(dir+'/readme.txt','Hint: ..%252f..%252fsecret.txt');
if(!fs.existsSync(dir+'/secret.txt')) fs.writeFileSync(dir+'/secret.txt','(demo) la flag real está en /flag');


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });

app.get('/',(req,res)=>{
  const inner = `<div class="card"><p>Explota la vulnerabilidad y visita <code>/flag</code> para registrar progreso.</p>
  <p class="note">Tema: LFI Classic. Subdominio esperado: <code>${SLUG}.lab</code></p></div>`;
  res.send(page('LFI Classic', inner));
});

app.listen(PORT, ()=>console.log('LFI Classic listening on '+PORT));
