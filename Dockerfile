# Use Node.js v14
FROM node:22.9.0
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm run build

COPY . .

EXPOSE 8000

CMD [ "node", "dist/server.js" ]
