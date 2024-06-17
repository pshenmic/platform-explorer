require('dotenv').config()

const Dash = require('dash')
const schema = require('./schema.json')

function logInfo (...messages) {
  console.log('\x1b[32m [INFO]', ...messages, '\x1b[0m ')
}

async function main () {
  logInfo('Client Initialization')

  const options = {
    network: 'testnet',
    wallet: {
      mnemonic: process.env.MNEMONIC
    }
  }

  if (process.env.SKIP_SYNCHRONIZATION_BEFORE_HEIGHT) {
    options.wallet.unsafeOptions = { skipSynchronizationBeforeHeight: Number(process.env.SKIP_SYNCHRONIZATION_BEFORE_HEIGHT) }
  }

  const client = new Dash.Client(options)

  logInfo('Contract Deployment')

  const identity = await client.platform.identities.get(process.env.OWNER_IDENTIFIER)

  const contract = await client.platform.contracts.create(schema, identity)
  const deployedContract = await client.platform.contracts.publish(contract, identity)

  logInfo('All Done!')
  logInfo(`Contract deployed at: ${deployedContract.getDataContract().getId()}`)
}

main().catch(console.error)
