# HTB-style Easy — v2 HARD (by c0l1nr00t)

## /etc/hosts
Añade:
```
127.0.0.1 intranet.lab blog.lab files.lab vuln.lab
```

## Levantar
```bash
docker compose up -d --build
```
Landing: http://localhost:8080

## Flags (Easy + Hard)
- Intranet → http://intranet.lab:8080/private/flag_intranet_c0l1nr00t.txt
- Blog → http://blog.lab:8080/wp-content/uploads/flag_blog_c0l1nr00t.txt
- Files → http://files.lab:8080/secrets/flag_files_c0l1nr00t.txt
- Buffer Overflow → servicio en 31337 (nc 127.0.0.1 31337)
- IDOR → http://vuln.lab:8080/api/profile?user=1337
- LFI/Traversal → http://vuln.lab:8080/api/view?file=../../secret/flag_hard_c0l1nr00t.txt

El scoreboard verifica con fetch real y sólo marca si el contenido contiene la flag.

## Reset
```bash
./reset.sh
```

## Detener
```bash
docker compose down
```
