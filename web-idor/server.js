
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


const users = { 1: {id:1, name:'admin', secret:'HTB{c0l1nr00t-idor-e5}'}, 2:{id:2, name:'guest', secret:'nope'}};
app.get('/api/users/:id', (req,res)=>{
  const id = req.params.id;
  res.json(users[id]||{});
});


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });
app.get('/',(req,res)=>{ res.send('<html><body style="background:#000;color:#0f0;font-family:monospace"><h1>IDOR Profile</h1><p>Explota la vulnerabilidad y visita /flag para registrar progreso.</p></body></html>'); });
app.listen(PORT, ()=>console.log('IDOR Profile listening on '+PORT));
