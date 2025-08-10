
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


app.get('/guestbook', (req,res)=>{
  const msg = req.query.msg || 'Escribe tu mensaje con ?msg=';
  // Intencionalmente vulnerable: refleja sin sanitizar en contexto HTML
  res.send(`<html><body style="background:#000;color:#0f0;font-family:monospace"><h2>Guestbook</h2><div>Mensaje: ${msg}</div></body></html>`);
});


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });
app.get('/',(req,res)=>{ res.send('<html><body style="background:#000;color:#0f0;font-family:monospace"><h1>XSS Guestbook</h1><p>Explota la vulnerabilidad y visita /flag para registrar progreso.</p></body></html>'); });
app.listen(PORT, ()=>console.log('XSS Guestbook listening on '+PORT));
