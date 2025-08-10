
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const FLAG = 'HTB{c0l1nr00t-crackme-909}';
app.use(bodyParser.json());
app.use(express.static('public'));
app.post('/check', (req,res)=>{
  const key = (req.body.key||'').toString().trim();
  // Very basic check: sum of char codes == 1337 and length 5
  let sum=0; for(const ch of key) sum+=ch.charCodeAt(0);
  if(key.length===5 && sum===1337) return res.json({ok:true, flag:FLAG});
  res.status(400).json({ok:false});
});
app.get('/flag', (req,res)=>{
  res.send(`<html><body style="background:#000;color:#0f0;font-family:monospace"><h1>/flag</h1><p>${FLAG}</p><img src="http://lab/score/beacon?token=${encodeURIComponent(FLAG)}"/></body></html>`);
});
app.listen(PORT, ()=>console.log('Crackme server on '+PORT));
