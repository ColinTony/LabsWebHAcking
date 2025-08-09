FROM alpine:3.20
RUN apk add --no-cache build-base socat
WORKDIR /app
COPY vuln.c .
RUN gcc -no-pie -fno-stack-protector -z execstack -o vuln vuln.c
EXPOSE 31337
CMD socat TCP-LISTEN:31337,reuseaddr,fork EXEC:/app/vuln
