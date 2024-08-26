require('dotenv').config()
const schema = require('../../schema.json')

const { initClient } = require('../utils')

async function deployContract () {
  console.log('Deploying Contract')

  if (!process.env.MNEMONIC) {
    throw new Error('Mnemonic not setted')
  }

  if (!process.env.OWNER_IDENTIFIER) {
    throw new Error('No identity in env :(')
  }

  const client = initClient()

  const identity = await client.platform.identities.get(process.env.OWNER_IDENTIFIER)

  console.log(`Using: ${identity.toJSON().id}`)

  const contract = await client.platform.contracts.create(schema, identity)
  const deployedContract = await client.platform.contracts.publish(contract, identity)

  console.log('All Done!')
  console.log(`Contract deployed at: ${deployedContract.getDataContract().getId()}`)
  console.log(`Used id: ${identity.toJSON().id}`)
}

deployContract().catch(console.error)
