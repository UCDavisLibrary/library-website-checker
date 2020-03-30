FROM node:12

RUN mkdir app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install --production

COPY client client
COPY lib lib
COPY server.js .
COPY cli.js .

CMD ["node", "server.js"]