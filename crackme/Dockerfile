
FROM alpine:3.20 AS build
RUN apk add --no-cache build-base
WORKDIR /app
COPY crackme.c .
RUN gcc -O2 -s -o crackme.bin crackme.c

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/crackme.bin /app/public/crackme.bin
COPY public ./public
COPY check.js .
RUN npm init -y && npm install express body-parser
EXPOSE 3000
CMD ["node", "check.js"]
