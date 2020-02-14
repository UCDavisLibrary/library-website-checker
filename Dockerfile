FROM node:11

RUN mkdir app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install --production

COPY client client
COPY server.js .

CMD ["node", "server.js"]