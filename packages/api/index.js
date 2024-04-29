require('dotenv').config()

const server = require('./src/server')

server.start()
  .then((_server) => server.listen(_server))
  .then(() => console.log('Platform Explorer API started'))
