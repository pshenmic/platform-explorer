FROM node:alpine
COPY index.js /app/index.js
COPY src /app/src
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
