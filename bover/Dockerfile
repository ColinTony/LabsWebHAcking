
FROM alpine:3.20
RUN apk add --no-cache build-base
WORKDIR /app
COPY bover.c .
COPY flag.txt .
RUN gcc -m64 -fno-stack-protector -z execstack -no-pie -o bover bover.c
EXPOSE 31337
CMD ["./bover"]
