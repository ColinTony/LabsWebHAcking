
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


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
db.serialize(()=>{
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, secret TEXT)");
  db.run("INSERT INTO users(username,password,secret) VALUES ('admin','admin','HTB{c0l1nr00t-sqli-c3}')");
  db.run("INSERT INTO users(username,password,secret) VALUES ('guest','guest','nope')");
});
app.post('/login', (req,res)=>{
  const {username, password} = req.body;
  // Vulnerable: interpolación directa
  const q = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  db.get(q, (err,row)=>{
    if(row) res.json({ok:true, secret: row.secret});
    else res.status(401).json({ok:false});
  });
});


app.get('/flag',(req,res)=>{ res.send(flagHtml(FLAG)); });
app.get('/',(req,res)=>{ res.send('<html><body style="background:#000;color:#0f0;font-family:monospace"><h1>SQLi Login</h1><p>Explota la vulnerabilidad y visita /flag para registrar progreso.</p></body></html>'); });
app.listen(PORT, ()=>console.log('SQLi Login listening on '+PORT));
