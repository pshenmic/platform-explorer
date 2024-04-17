const { getKnex } = require('../../src/utils')

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
