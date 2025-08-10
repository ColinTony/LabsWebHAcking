
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm init -y && npm install express body-parser multer
EXPOSE 3000
CMD ["node", "server.js"]
