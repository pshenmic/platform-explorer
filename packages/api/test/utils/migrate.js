const pg = require('pg')
const fs = require('fs')
const path = require('path')

const [, , filepath] = process.argv

if (!filepath) {
  throw new Error('Pass filepath as an argument')
}

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
  .then(async () => {
    console.log(path.join(process.cwd(), filepath))
    const migrations = fs
      .readdirSync(path.join(process.cwd(), filepath))
      .map(sql => ({
        // parsing migration id into number
        id: parseInt(sql.match(/[^V\[](.*)__/g)[0].replace('__', '')), // eslint-disable-line
        sqlPath: sql
      }))
      .sort((a, b) => a.id - b.id)
      .map(({ sqlPath }) => fs.readFileSync(path.join(process.cwd(), filepath, sqlPath)).toString())

    for (const sql of migrations) {
      await client.query(sql)
    }
  })
  .then(() => console.log('Done'))
  .finally(() => client.end())
