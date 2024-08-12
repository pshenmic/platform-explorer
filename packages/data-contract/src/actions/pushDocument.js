require('dotenv').config()
const { initClient } = require('../utils')
const doc = require('../../document.json')

async function pushDocument () {
  console.log('Client initialization')

  const { platform } = initClient()

  if (!process.env.OWNER_IDENTIFIER) {
    throw new Error('No identity in env :(')
  }
  const identity = await platform.identities.get(process.env.OWNER_IDENTIFIER)

  if (!process.env.CONTRACT_ID) {
    throw new Error('No contract ID in env')
  }

  if (!process.env.DOCUMENT_NAME) {
    throw new Error('No document name in env')
  }

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

  console.log('Broadcasting Document')
  await platform.documents.broadcast(documentBatch, identity)

  console.log('Done', '\n', `Document at: ${document.getId()}`)
}

pushDocument().catch(console.error)
