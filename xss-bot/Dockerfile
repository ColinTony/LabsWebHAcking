FROM node:18
WORKDIR /bot
RUN apt-get update && apt-get install -y chromium && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY bot.js ./
CMD ["node","bot.js"]
