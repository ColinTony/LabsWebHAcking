
// ===== Dashboard logic (cards, filters, progress) =====
function urlForChallenge(c) {
  if (c.slug === 'bover') return '/bover';
  if (c.slug === 'crackme') return '/crackme/';
  return '/' + c.slug + '/';
}

function htmlCard(c) {
  const url = urlForChallenge(c);
  return `<div class="card">
    <h3>${c.name}</h3>
    <div class="meta"><b>Track:</b> ${c.track} · <b>Dificultad:</b> ${c.difficulty}</div>
    <div class="meta"><b>Acceso:</b> <code>${url}</code></div>
    <div class="actions">
      <a href="${url}" target="_blank" rel="noopener">Ir al reto</a>
      <button onclick="exportWriteup('${c.slug}')">Exportar writeup</button>
    </div>
  </div>`;
}

async function refresh() {
  const state = await fetch('/score/state').then(r=>r.json()).catch(()=>({completed:[],stats:{achievements:[]}}));
  const chals = await fetch('/score/list').then(r=>r.json()).catch(()=>[]);
  const doneSlugs = state.completed || [];
  const total = chals.length || 1;
  const pct = Math.round((doneSlugs.length/total)*100);
  const bar = document.getElementById('bar'); if (bar) bar.style.width = pct + '%';
  const percent = document.getElementById('percent'); if (percent) percent.textContent = pct+'%';
  const tf = document.getElementById('trackFilter')?.value || '';
  const df = document.getElementById('diffFilter')?.value || '';
  const filtered = chals.filter(c=>(!tf||c.track==tf)&&(!df||c.difficulty==df));
  const cards = document.getElementById('cards'); if (cards) cards.innerHTML = filtered.map(c=>htmlCard(c)).join('');
  const ach = document.getElementById('achList'); if (ach) ach.innerHTML = (state.stats?.achievements||[]).map(a=>`<li>${a}</li>`).join('');
}

async function exportWriteup(slug) {
  const chals = await fetch('/score/list').then(r=>r.json());
  const c = chals.find(x=>x.slug===slug);
  const tpl = `# Writeup — ${c?.name||slug}
Autor: c0l1nr00t
Track: ${c?.track||''} | Dificultad: ${c?.difficulty||''}

## Objetivo
[Describe el objetivo del reto.]

## Vector de ataque
[Describe el vector.]

## PoC
[Incluye payload/requests.]

## Mitigación
[Medidas recomendadas.]

## Lecciones
[Qué aprendiste.]

`;
  const blob = new Blob([tpl],{type:'text/markdown'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = slug + "-writeup.md";
  a.click();
}

document.getElementById('trackFilter')?.addEventListener('change', refresh);
document.getElementById('diffFilter')?.addEventListener('change', refresh);
document.getElementById('dailyBtn')?.addEventListener('click', ()=>addTerm('c0l1nr00t: Daily armada (mock).'));
document.getElementById('weeklyBtn')?.addEventListener('click', ()=>addTerm('c0l1nr00t: Weekly armada (mock).'));
document.getElementById('resetRoutine')?.addEventListener('click', ()=>addTerm('c0l1nr00t: Rutina reiniciada (mock).'));

// ===== c0l1nr00t terminal (50 lines, no repeat, final disconnect) =====
const ROASTS = [
  "Tu payload no falló: tú lo soltaste sin pensar.",
  "Cada segundo que culpas al reto es un segundo menos de progreso.",
  "Escribe menos excusas y más requests.",
  "La consola no te odia; solo refleja tu falta de método.",
  "Si no capturas tráfico, solo capturas frustración.",
  "Tanta prisa para abrir el navegador y cero prisa para leer la respuesta.",
  "No es magia: es repetir hasta entender por qué falló.",
  "Tu fuzzing parece una llovizna: no moja nada.",
  "Deja de buscar ‘payload perfecto’ y empieza a iterar uno mediocre con disciplina.",
  "Tus notas vacías explican tus hallazgos vacíos.",
  "No es difícil: es exacto. Tú decides si respetarlo.",
  "Si no sabes qué cambió, no hiciste un experimento.",
  "El error 500 te mira esperando que lo mires tú también.",
  "Tus manos teclean rápido; tu cabeza valida lento.",
  "Breakpoints, logs y paciencia: el triángulo que te da miedo.",
  "Menos ‘quizás’ y más reproducciones deterministas.",
  "Estás probando variaciones aleatorias como si fuera ciencia.",
  "La flag no se esconde: tú te escondes de leer.",
  "Te atoras en el input porque nunca modelaste el backend.",
  "Los mismos datos, los mismos errores: cambia una cosa por vez.",
  "Quieres 0days y aún te vence un filtro regex.",
  "Lee el código como si te jugara el sueldo, no el ego.",
  "Tu recon es un colador: por ahí se fue la pista.",
  "Si no controlas el estado, el estado te controla.",
  "Respeta el protocolo y dejará de humillarte.",
  "Tu diccionario es enorme, tu hipótesis es diminuta.",
  "Te crees creativo por probar 50 combinaciones sin hipótesis.",
  "Cada request debe tener un porqué, no un ‘a ver qué pasa’.",
  "No pierdes contra el reto: pierdes contra tus atajos mentales.",
  "Tu error favorito es ignorar los errores.",
  "Si no versionas tus intentos, versionas tus fracasos.",
  "Tu ‘casi’ no compila, tu ‘luego’ no ejecuta.",
  "El servidor no es terco; es consistente. El terco eres tú.",
  "Menos pestañas, más trazas.",
  "La herramienta no es lenta; tu enfoque sí.",
  "Quien mide, mejora; quien adivina, se frustra.",
  "Repite el caso base hasta que puedas romperlo con una línea.",
  "Si no documentas, mañana vuelves a empezar en cero.",
  "Suelta el tutorial y abraza el RFC.",
  "Tu payload no entra porque tu modelo mental no cabe.",
  "No hay rabbit hole; hay pereza para descartar hipótesis.",
  "Un diff te habría ahorrado esta hora perdida.",
  "Haz pequeñas victorias: una validación menos, un byte más.",
  "Tu exploit no es frágil: es improvisado.",
  "Confundes suerte con habilidad y por eso no creces.",
  "Cuando aprendas a leer errores, te leerán como experto.",
  "Deja de impresionar y empieza a entender.",
  "Si te sientes lento, ajusta el plan; no el ego.",
  "Tu método es tu exploit real. Ahora mismo el tuyo es vulnerable.",
  "Pruébalo otra vez, pero esta vez toma notas."
];

function addTerm(msg) {
  const t = document.getElementById('term');
  if(!t) return;
  const p = document.createElement('div');
  p.textContent = msg;
  t.appendChild(p);
  t.scrollTop = t.scrollHeight;
}

function setConnected(on) {
  const led = document.querySelector('.panel-header .led');
  if (!led) return;
  if (on) { led.style.background=''; led.style.boxShadow=''; }
  else { led.style.background='#555'; led.style.boxShadow='none'; }
}

function loadRoastState() {
  try {
    const raw = localStorage.getItem('c0l1n_roast_state');
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  const order = Array.from(ROASTS.keys());
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { order, idx: 0, finished: false };
}

function saveRoastState(st) {
  try { localStorage.setItem('c0l1n_roast_state', JSON.stringify(st)); } catch (e) { }
}

const roastState = loadRoastState();

function nextRoast() {
  if (roastState.finished) return;
  const i = roastState.idx;
  const order = roastState.order;
  if (i < order.length) {
    const phrase = ROASTS[order[i]];
    addTerm('c0l1nr00t: ' + phrase);
    roastState.idx++;
    saveRoastState(roastState);
    if (roastState.idx === order.length) {
      addTerm('c0l1nr00t: Ahh ya me aburrí de ver a este pseudohacker... bye');
      addTerm('c0l1nr00t se desconectó.');
      roastState.finished = true;
      saveRoastState(roastState);
      setConnected(false);
      const talkBtn = document.getElementById('talk');
      if (talkBtn) talkBtn.disabled = true;
    }
  }
}

document.getElementById('talk')?.addEventListener('click', nextRoast);

document.getElementById('giveup')?.addEventListener('click', ()=>{
  addTerm('c0l1nr00t: YOU LOSE. Vuelve cuando el buffer no te desborde la paciencia.');
  const grid = document.querySelector('.grid'); if (grid) grid.innerHTML='';
});

// Init
refresh();
