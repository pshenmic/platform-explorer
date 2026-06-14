const pg = require('pg')
const fs = require('fs')
const path = require('path')

const [, , filepath] = process.argv

if (!filepath) {
  throw new Error('Pass filepath as an argument')
}

const sql = fs.readFileSync(path.join(process.cwd(), filepath)).toString()

const client = new pg.Client({
  connectionString: process.env.POSTGRES_URL
})

client
  .connect()
  .then(() => client.query(sql))
  .then(() => console.log('Done'))
  .finally(() => client.end())
