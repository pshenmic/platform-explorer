FROM node:20-alpine
COPY packages/indexer/.env /app/.env
COPY packages/api/index.js /app/index.js
COPY packages/api/src /app/src
COPY packages/api/test /app/test
COPY packages/api/package.json /app/package.json
COPY packages/indexer/migrations /app/migrations
WORKDIR /app/packages/api
RUN npm install
CMD ["npm", "start"]
