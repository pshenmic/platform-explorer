require('dotenv').config()
const { initClient, logInfo } = require('./utils')
const doc = require('../document.json')

async function pushDocument () {
  logInfo('Client initialization')
  const { platform } = initClient()

  logInfo('Getting identity')
  if (!process.env.OWNER_IDENTIFIER) {
    logInfo('No identity in env :(')
    process.exit()
  }
  const identity = await platform.identities.get(process.env.OWNER_IDENTIFIER)

  if (!process.env.CONTRACT_ID) {
    logInfo('No contract ID in env')
    process.exit()
  }

  if (!process.env.DOCUMENT_NAME) {
    logInfo('No document name in env')
    process.exit()
  }

  logInfo('Creating Document')
  const document = await platform.documents.create(
        `contract.${process.env.DOCUMENT_NAME}`,
        identity,
        doc
  )
  const documentBatch = {
    create: [document],
    replace: [],
    delete: []
  }

  logInfo('Broadcasting Document')
  await platform.documents.broadcast(documentBatch, identity)

  console.log()
  logInfo('Done')
  logInfo(`Document at: ${document.getId()}`)
}

pushDocument().catch(console.error)
