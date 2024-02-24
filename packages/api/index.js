require('dotenv').config()

const server = require('./src/server')

server.start()
    .then(server.listen)
    .then(() => console.log(`Platform Explorer API started`))
