require('dotenv').config()
const { initClient, logInfo, registerIdentity } = require('./utils')

async function createIdentity () {
  logInfo('Client initialization')
  const client = initClient()

  logInfo('Registering new identity')
  const identity = await registerIdentity(client)

  console.log()
  logInfo('Done')
  logInfo(`Identity: ${identity.toJSON().id}`)
}

createIdentity().catch(console.error)
