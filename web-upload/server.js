
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


const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: '/app/uploads' });
app.post('/upload', upload.single('file'), (req,res)=>{
  const name = req.file?.originalname || 'file';
  if(!name.match(/\.(php|jsp|asp)/i) && !name.match(/\.php\..+/i)) return res.status(400).send('Solo scripts... espera ¿qué?');
  res.send('Ejecutando (simulado): echo ' + name);
});


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });
app.get('/',(req,res)=>{ res.send('<html><body style="background:#000;color:#0f0;font-family:monospace"><h1>Upload Trick</h1><p>Explota la vulnerabilidad y visita /flag para registrar progreso.</p></body></html>'); });
app.listen(PORT, ()=>console.log('Upload Trick listening on '+PORT));
