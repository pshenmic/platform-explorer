const Dash = require('dash')

function logInfo (...messages) {
  console.log('\x1b[32m [INFO]', ...messages, '\x1b[0m ')
}

function initClient () {
  const options = {
    network: 'testnet',
    wallet: {
      mnemonic: process.env.MNEMONIC
    }
  }

  if (process.env.SKIP_SYNCHRONIZATION_BEFORE_HEIGHT) {
    options.wallet.unsafeOptions =
            { skipSynchronizationBeforeHeight: Number(process.env.SKIP_SYNCHRONIZATION_BEFORE_HEIGHT) }
  }

  if (process.env.CONTRACT_ID) {
    options.apps = {
      contract: {
        contractId: process.env.CONTRACT_ID
      }
    }
  }

  const client = new Dash.Client(options)
  return client
}

async function registerIdentity (client) {
  return await client.platform.identities.register()
}

module.exports = { initClient, logInfo, registerIdentity }
