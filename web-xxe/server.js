
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


const xml2js = require('xml2js');
app.post('/parse', (req,res)=>{
  const xml = req.body.xml || '<root/>';
  // Vulnerable parser (simulation): we just echo back but hint XXE
  const parser = new xml2js.Parser({explicitCharkey:true, explicitChildren:true});
  parser.parseString(xml, (err, result)=>{
    if(err) return res.status(400).json({ok:false});
    res.json({ok:true, parsed: result});
  });
});


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });
app.get('/',(req,res)=>{ res.send('<html><body style="background:#000;color:#0f0;font-family:monospace"><h1>XXE Peek</h1><p>Explota la vulnerabilidad y visita /flag para registrar progreso.</p></body></html>'); });
app.listen(PORT, ()=>console.log('XXE Peek listening on '+PORT));
