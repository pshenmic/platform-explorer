require('dotenv').config()

const Dash = require('dash')

function logInfo (...messages) {
  console.log('\x1b[32m [INFO]', ...messages, '\x1b[0m ')
}

async function main () {
  logInfo('Client Initialization')

  const schema = {
    dataContracts: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          minLength: 43,
          maxLength: 44,
          position: 0
        },
        name: {
          type: 'string',
          maxLength: 32,
          minLength: 3,
          position: 1.0
        }
      },
      required: [
        'identifier',
        'name'
      ],
      additionalProperties: false
    }
  }

  const options = {
    network: 'testnet',
    wallet: {
      mnemonic: process.env.MNEMONIC
    }
  }

  if (process.env.SKIP_SYNCHRONIZATION_BEFORE_HEIGHT) {
    options.unsafeOptions = { skipSynchronizationBeforeHeight: Number(process.env.SKIP_SYNCHRONIZATION_BEFORE_HEIGHT) }
  }
  const client = new Dash.Client(options)

  logInfo('Contract Deployment')

  const identity = await client.platform.identities.get(process.env.OWNER_IDENTIFIER)

  const contract = await client.platform.contracts.create(schema, identity)
  const deployedContract = await client.platform.contracts.publish(contract, identity)

  logInfo('All Done!')
  logInfo(`Contract deployed at: ${deployedContract.getDataContract().getId(client)}`)
}

main().catch(console.error)
