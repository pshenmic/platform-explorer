FROM node:20-alpine as build
COPY packages/api/package.json /app/package.json
COPY packages/indexer/migrations /app/migrations
COPY packages/api/test /app/test
COPY packages/api/src /app/src
COPY packages/api/data_contracts /app/data_contracts
COPY packages/api/.env /app/.env
COPY packages/api/index.js /app/index.js
COPY packages/api/scripts /app/scripts
WORKDIR /app/packages/api

RUN apk add git
RUN npm install
RUN npm run geoip

FROM node:20-alpine as api
WORKDIR /app
COPY --from=build /app /app
CMD ["npm", "start"]
