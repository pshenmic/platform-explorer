require('dotenv').config()
const schema = require('../../schema.json')

const { initClient, signAndBroadcast } = require('../utils')

async function deployContract () {
  console.log('Deploying Contract')

  if (!process.env.MNEMONIC) {
    throw new Error('Mnemonic not set')
  }

  if (!process.env.OWNER_IDENTIFIER) {
    throw new Error('No identity in env :(')
  }

  const client = initClient()
  const identity = await client.identities.getIdentityByIdentifier(process.env.OWNER_IDENTIFIER)
  const nonce = await client.identities.getIdentityNonce(identity.id) + 1n

  console.log(`Using: ${identity.id.base58()}`)

  const contract = client.dataContracts.create(identity.id, nonce, schema)
  const transition = client.dataContracts.createStateTransition(contract, 'create', nonce)
  await signAndBroadcast(client, transition, identity)

  console.log('All Done!')
  console.log(`Contract deployed at: ${contract.id.base58()}`)
  console.log(`Used id: ${identity.id.base58()}`)
}

deployContract().catch(error => {
  console.error(error)
  process.exitCode = 1
})
