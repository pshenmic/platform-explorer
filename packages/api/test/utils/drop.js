const { getKnex } = require('../../src/utils')

const knex = getKnex()

const tables = ['token_holders', 'data_contract_transitions', 'token_transitions', 'tokens', 'masternode_votes', 'transfers', 'documents', 'identity_aliases', 'identities', 'data_contracts', 'state_transitions', 'blocks', 'validators', 'refinery_schema_history']

const sql = tables.reduce((acc, table) => acc + `DROP TABLE IF EXISTS ${table};`, '')

knex.raw(sql)
  .then(async () => {
    console.log(sql)
  })
  .then(() => console.log('Done'))
  .finally(() => knex.destroy())
