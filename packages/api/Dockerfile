FROM node:alpine
COPY index.js /app/index.js
COPY src /app/src
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
WORKDIR /app
RUN yarn
CMD ["npm", "start"]
