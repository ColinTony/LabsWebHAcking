
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const FLAG = process.env.FLAG || 'FLAG_MISSING';
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

function flagHtml(flag){
  return `<html><head><style>body{background:#000;color:#0f0;font-family:monospace}</style></head><body>
  <h1>/flag</h1><p>${flag}</p>
  <img src="http://lab/score/beacon?token=${encodeURIComponent(flag)}" width="1" height="1"/>
  </body></html>`;
}


const http = require('http');
app.get('/fetch', (req,res)=>{
  const url = (req.query.url||'').toString();
  if(!/^http:\/\/(lab|xss\.lab|lfi\.lab)/.test(url)) return res.status(400).send('Bloqueado por allowlist débil');
  http.get(url, r=>{
    let data=''; r.on('data',c=>data+=c); r.on('end',()=>res.status(200).send(data.slice(0,500)));
  }).on('error', ()=>res.status(500).send('Error'));
});


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });
app.get('/',(req,res)=>{ res.send('<html><body style="background:#000;color:#0f0;font-family:monospace"><h1>SSRF Filter</h1><p>Explota la vulnerabilidad y visita /flag para registrar progreso.</p></body></html>'); });
app.listen(PORT, ()=>console.log('SSRF Filter listening on '+PORT));
