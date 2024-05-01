const pg = require('pg')
const fs = require('fs')
const path = require('path')

const [, , filepath] = process.argv

if (!filepath) {
  throw new Error('Pass filepath as an argument')
}

const sql = fs.readFileSync(path.join(process.cwd(), filepath)).toString()

const user = process.env.POSTGRES_USER
const password = process.env.POSTGRES_PASS
const host = process.env.POSTGRES_HOST
const database = process.env.POSTGRES_DB

const client = new pg.Client({
  host,
  database,
  user,
  password
})

client
  .connect()
  .then(() => client.query(sql))
  .then(() => console.log('Done'))
  .finally(() => client.end())
