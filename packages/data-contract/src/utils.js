const Dash = require('dash')

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

module.exports = { initClient }
