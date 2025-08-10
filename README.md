
# HTB Easy Lab — c0l1nr00t

Laboratorio local, intencionalmente vulnerable, para practicar Web y Reversing. **No expongas a Internet.**

## Requisitos
- Docker + Docker Compose

## /etc/hosts de ejemplo
```
127.0.0.1 lab xss.lab lfi.lab sqli.lab xxe.lab idor.lab csrf.lab ssrf.lab upload.lab bover.lab crackme.lab
```

## Levantar
```bash
docker compose up -d --build
# Dashboard: http://lab
```

## Scripts
- `scripts/lab-manager.sh`
- `scripts/reset.sh`
- `scripts/nuke.sh`

## Retos
| Nombre | Subdominio | Dificultad | Pista #1 |
|---|---|---|---|
| XSS Guestbook | xss.lab | Easy | Reflejo en ?msg |
| LFI Classic | lfi.lab | Easy | Doble encoding |
| SQLi Login | sqli.lab | Medium | OR 1=1 |
| XXE Peek | xxe.lab | Medium | DTD externa |
| IDOR Profile | idor.lab | Easy | /api/users/1 |
| CSRF Action | csrf.lab | Easy | Form sin token |
| SSRF Filter | ssrf.lab | Medium | Allowlist laxa |
| Upload Trick | upload.lab | Medium | Doble extensión |
| BoF 31337 | bover.lab | Hard | Sin canarios |
| Crackme 909 | crackme.lab | Easy | Charcodes |

## Variables .env del scoreboard
- `ADMIN_TOKEN`
- `SEED`
- `ENABLE_LEADERBOARD`
- `THEME`

## Añadir reto nuevo (API)
```
POST /admin/challenges
Headers: X-Admin-Token: <token>
Body: { name, slug, subdomain, track, difficulty, hints:[...], timebox }
```

## Flags
Todas contienen `c0l1nr00t`:
{
  "xss": "HTB{c0l1nr00t-xss-a1}",
  "lfi": "HTB{c0l1nr00t-lfi-b2}",
  "sqli": "HTB{c0l1nr00t-sqli-c3}",
  "xxe": "HTB{c0l1nr00t-xxe-d4}",
  "idor": "HTB{c0l1nr00t-idor-e5}",
  "csrf": "HTB{c0l1nr00t-csrf-f6}",
  "ssrf": "HTB{c0l1nr00t-ssrf-g7}",
  "upload": "HTB{c0l1nr00t-upload-h8}",
  "bover": "HTB{c0l1nr00t-bover-1337}",
  "crackme": "HTB{c0l1nr00t-crackme-909}"
}
