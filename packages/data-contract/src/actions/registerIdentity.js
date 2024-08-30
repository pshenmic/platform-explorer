require('dotenv').config()
const { initClient } = require('../utils')

async function createIdentity () {
  console.log('Creating Identity')

  if (!process.env.MNEMONIC) {
    throw new Error('Mnemonic not setted')
  }

  const client = initClient()

  const identity = await client.platform.identities.register()

  console.log('Done', '\n', `Identity: ${identity.toJSON().id}`)
  return identity
}

createIdentity().catch(console.error)
