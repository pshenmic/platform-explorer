FROM node:18-alpine
COPY index.js /app/index.js
COPY src /app/src
COPY package.json /app/package.json
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
