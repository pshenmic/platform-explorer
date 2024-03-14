FROM node:20-alpine
COPY packages/api/index.js /app/index.js
COPY packages/api/src /app/src
COPY packages/indexer/migrations /app/migrations
COPY package.json /app/package.json
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
