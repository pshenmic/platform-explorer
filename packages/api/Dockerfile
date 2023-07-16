FROM node:alpine
COPY index.js /app/index.js
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
WORKDIR /app
CMD ['npm', 'start']
