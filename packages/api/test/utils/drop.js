const { getKnex } = require('../../src/utils')

const knex = getKnex()

const tables = ['transfers', 'documents', 'identities', 'data_contracts', 'state_transitions', 'blocks', 'refinery_schema_history']

const sql = tables.reduce((acc, table) => acc + `DROP TABLE IF EXISTS ${table};`, '')

knex.raw(sql)
  .then(async () => {

    console.log(sql)
  })
  .then(() => console.log('Done'))
  .finally(() => knex.destroy())
