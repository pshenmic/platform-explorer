require('dotenv').config()
const schema = require('./schema.json')

const { initClient, logInfo } = require('./src/utils')

async function main () {
  logInfo('Client Initialization')
  const client = initClient()

  logInfo('Getting Identity')
  if (!process.env.OWNER_IDENTIFIER) {
    logInfo('No identity in env :(')
    process.exit()
  }

  const identity = await client.platform.identities.get(process.env.OWNER_IDENTIFIER)
  logInfo(`Using: ${identity.toJSON().id}`)

  logInfo('Contract Deployment')
  const contract = await client.platform.contracts.create(schema, identity)
  const deployedContract = await client.platform.contracts.publish(contract, identity)

  console.log()
  logInfo('All Done!')
  logInfo(`Contract deployed at: ${deployedContract.getDataContract().getId()}`)
  logInfo(`Used id: ${identity.toJSON().id}`)
}

main().catch(console.error)
