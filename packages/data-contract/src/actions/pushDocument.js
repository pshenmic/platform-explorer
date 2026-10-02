require('dotenv').config()
const { initClient, signAndBroadcast } = require('../utils')
const doc = require('../../document.json')

async function pushDocument () {
  console.log('Client initialization')

  if (!process.env.MNEMONIC) {
    throw new Error('Mnemonic not set')
  }

  if (!process.env.OWNER_IDENTIFIER) {
    throw new Error('No identity in env :(')
  }

  if (!process.env.CONTRACT_ID) {
    throw new Error('No contract ID in env')
  }

  if (!process.env.DOCUMENT_NAME) {
    throw new Error('No document name in env')
  }

  const client = initClient()
  const identity = await client.identities.getIdentityByIdentifier(process.env.OWNER_IDENTIFIER)
  const nonce = await client.identities.getIdentityContractNonce(identity.id, process.env.CONTRACT_ID) + 1n
  const document = client.documents.create(process.env.CONTRACT_ID, process.env.DOCUMENT_NAME, doc, identity.id)
  const transition = client.documents.createStateTransition(document, 'create', { identityContractNonce: nonce })

  console.log('Broadcasting Document')
  await signAndBroadcast(client, transition, identity)

  console.log('Done', '\n', `Document at: ${document.id.base58()}`)
}

pushDocument().catch(error => {
  console.error(error)
  process.exitCode = 1
})
