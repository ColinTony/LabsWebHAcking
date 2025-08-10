
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


const fs = require('fs');
const path = require('path');
app.get('/view', (req,res)=>{
  let f = req.query.file || 'index.txt';
  // Filtro laxo: solo permite .txt, pero vulnerable a doble encoding
  f = decodeURIComponent(f);
  if(!f.endsWith('.txt')) return res.status(400).send('Solo .txt');
  try{
    const p = path.join('/app', f);
    const data = fs.readFileSync(p,'utf8');
    res.type('text/plain').send(data);
  }catch(e){ res.status(404).send('No encontrado'); }
});
// Semilla de archivos de ejemplo
const samplePath = '/app/index.txt';
if(!fs.existsSync(samplePath)) fs.writeFileSync(samplePath, 'Hint: prueba %252e%252e%252f etc/passwd.txt?');


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });
app.get('/',(req,res)=>{ res.send('<html><body style="background:#000;color:#0f0;font-family:monospace"><h1>LFI Classic</h1><p>Explota la vulnerabilidad y visita /flag para registrar progreso.</p></body></html>'); });
app.listen(PORT, ()=>console.log('LFI Classic listening on '+PORT));
