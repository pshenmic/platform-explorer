const pg = require('pg')
const fs = require('fs')
const path = require('path')
const { getKnex } = require('../../src/utils')

console.log(process.argv)
console.log(process.execArgv)

postgres://pshenmic:<user password>@:6432/pshenmic_main

const client = getKnex()

client
  .connect()
  .then(async () => {
    const tables = ['transfers', 'documents', 'identities', 'data_contracts', 'state_transitions', 'blocks', 'refinery_schema_history']

    const sql = tables.reduce((acc, table) => acc + `DROP TABLE IF EXISTS ${table};`, '')

    console.log(sql)
    await client.query(sql)
  })
  .then(() => console.log('Done'))
  .finally(() => client.end())
