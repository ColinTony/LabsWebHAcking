import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Simple IDOR: returns any user profile by id without auth
const USERS = {
  "1": { id: 1, name: "alice", role: "user" },
  "2": { id: 2, name: "bob", role: "user" },
  "1337": { id: 1337, name: "root", role: "admin", note: "flag{c0l1nr00t_idor}" }
};

app.get('/api/profile', (req,res)=>{
  const id = (req.query.user || '').toString();
  const profile = USERS[id];
  if(!profile) return res.status(404).json({error:'not found'});
  return res.json(profile);
});

// LFI-like: reads files relative to /app/public but allows ../ traversal
const PUB = path.join(process.cwd(), 'public');
const SECRET = path.join(process.cwd(), 'secret'); // contains hard flag

app.get('/api/view', (req,res)=>{
  let f = (req.query.file || '').toString();
  // intentionally weak normalization
  const p = path.join(PUB, f);
  try{
    const data = fs.readFileSync(p, 'utf8');
    res.type('text/plain').send(data);
  }catch(e){
    // try also from SECRET to make traversal more interesting
    try{
      const p2 = path.join(SECRET, f);
      const data2 = fs.readFileSync(p2, 'utf8');
      res.type('text/plain').send(data2);
    }catch(err){
      res.status(404).send('not found');
    }
  }
});

app.get('/', (_,res)=> res.send('<h1>vuln.lab</h1><p>Explora /api/profile?user=... y /api/view?file=...</p>'));
app.listen(4000, ()=> console.log('vulnapi on :4000'));
