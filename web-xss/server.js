const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const app = express();
const PORT = 3000;
const SLUG = 'xss';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'xss-admin-token';

function hexFromSeed(seed, slug, bytes=8){
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

function page(title, inner){
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
  <style>body{background:#0f0b1a;color:#f3e8ff;font-family:system-ui,sans-serif;margin:0}.wrap{max-width:900px;margin:0 auto;padding:18px}.card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px;margin-top:12px}</style>
  </head><body><div class="wrap"><h1>${title}</h1>${inner}</div></body></html>`;
}

function beacon(flag){
  return `<img src="http://lab/score/beacon?slug=${SLUG}&token=${encodeURIComponent(flag)}" width="1" height="1" />`;
}

// ---- Surfaces ----
// A) Reflected JS-string
function jsEsc(s){ return String(s).replace(/[<>&]/g, c=>({ '<':'&lt;','>':'&gt;','&':'&amp;' }[c])); }
app.get('/search', (req,res)=>{
  const q = req.query.q || '';
  const inner = `<div class="card"><form><input name="q" value="${q}" placeholder="Buscar"><button>Buscar</button></form><div id="out"></div></div>
  <script>
  var term = "${jsEsc(q)}"; if(term.indexOf('alert')>-1) term=term.replace(/alert/g,'a[le]rt');
  document.getElementById('out').innerText='Resultados para: '+term;
  </script>`;
  res.send(page('XSS — Search', inner));
});

// B) Stored guestbook (weak sanitizer)
const entries = [];
function sanitize(html){
  return String(html).replace(/<script/gi,'&lt;script').replace(/on\w+=/g,'').replace(/javascript:/g,'#');
}
app.get('/guestbook', (req,res)=>{
  const list = entries.map(e=>`<li>${e}</li>`).join('');
  const inner = `<div class="card"><form method="POST" action="guestbook"><input name="msg" placeholder="Mensaje"><button>Publicar</button></form><ul>${list}</ul></div>`;
  res.send(page('XSS — Guestbook', inner));
});
app.post('/guestbook', (req,res)=>{ entries.push(sanitize(req.body.msg||'')); res.redirect('guestbook'); });

// C) Markdown preview (protocol filter case-sensitive)
app.get('/preview', (req,res)=>{
  const md = req.query.md || '[link](javascript:alert(1))';
  const html = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(m,t,h)=>{
    if(h.startsWith('javascript:')) h='#'; return `<a href="${h}">${t}</a>`;
  });
  res.send(page('XSS — Markdown', `<div class="card">${html}</div>`));
});

// ---- Flag guarded by admin cookie ----
app.get('/flag', (req,res)=>{
  if(req.cookies.is_admin==='1'){
    res.send(page('XSS — Flag', `<div class="card"><b>${FLAG}</b>${beacon(FLAG)}</div>`));
  }else{
    res.status(403).send(page('XSS — Flag', `<div class="card">Solo para admin.</div>`));
  }
});

// ---- Collab channel (same-origin exfil) ----
const inbox = new Map(); // id -> data array
app.post('/collab', (req,res)=>{
  const id = String(req.query.id||'default');
  const data = String(req.body.data||'');
  const arr = inbox.get(id)||[]; arr.push({ t: Date.now(), data }); inbox.set(id, arr);
  res.json({ok:true});
});
app.get('/collab', (req,res)=>{
  const id = String(req.query.id||'default');
  res.json(inbox.get(id)||[]);
});

// ---- Admin queue + report intake ----
const queue = [];
app.post('/report', (req,res)=>{
  let url = String(req.body.url||'');
  if(!/^\//.test(url)) return res.status(400).send('Solo rutas locales, ej: /guestbook');
  const id = crypto.randomBytes(4).toString('hex');
  queue.push({url, id});
  const tip = `Usa un payload que haga: fetch('/flag').then(r=>r.text()).then(f=>fetch('/collab?id=${id}',{method:'POST',headers: {'Content-Type':'application/json'},body:JSON.stringify({data:f})}))`;
  res.send(page('XSS — Report', `<div class="card">Ticket recibido. id=<code>${id}</code>. Tip: ${tip}</div>`));
});

app.get('/admin/next', (req,res)=>{
  if((req.headers['x-admin-token']||'')!==ADMIN_TOKEN) return res.status(403).json({ok:false});
  const item = queue.shift();
  res.json(item||{});
});

// Home
app.get('/', (req,res)=>{
  res.send(page('XSS Pro — Admin Bot',
    `<div class="card"><p>Superficies: <code>/search</code>, <code>/guestbook</code>, <code>/preview</code>.</p>
     <p>Objetivo: lograr XSS que, cuando el <b>admin-bot</b> visite tu URL, robe la flag (solo visible para admin) y la mande a <code>/collab?id=TU_ID</code>.</p>
     <form method="POST" action="report"><input name="url" placeholder="/guestbook" style="width:260px"><button>Reportar a admin</button></form>
     <p>Lee tu bandeja: <code>GET /collab?id=TU_ID</code></p></div>`));
});

app.listen(PORT, ()=>console.log('web-xss listening on '+PORT));
