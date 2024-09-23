# Use Node.js v14
FROM node:18.20.4
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 8080

CMD [ "node", "dist/server.js" ]
