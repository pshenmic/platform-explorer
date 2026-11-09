require('dotenv').config()
const { AssetLockProofWASM, IdentityPublicKeyInCreationWASM, PrivateKeyWASM } = require('pshenmic-dpp')
const { initClient, deriveIdentityKey } = require('../utils')

async function createIdentity () {
  console.log('Creating Identity')

  if (!process.env.MNEMONIC) {
    throw new Error('Mnemonic not set')
  }

  if (!process.env.ASSET_LOCK_PROOF || !process.env.ASSET_LOCK_PRIVATE_KEY) {
    throw new Error('Asset lock proof (hex) and asset lock private key (WIF) are required')
  }

  const client = initClient()
  const assetLockProof = AssetLockProofWASM.fromHex(process.env.ASSET_LOCK_PROOF)
  const assetLockPrivateKey = PrivateKeyWASM.fromWIF(process.env.ASSET_LOCK_PRIVATE_KEY)
  const privateKeys = await Promise.all([0, 1, 2].map(keyId => deriveIdentityKey(client, keyId)))
  const publicKeys = privateKeys.map((privateKey, keyId) => new IdentityPublicKeyInCreationWASM(
    keyId, 'AUTHENTICATION', ['MASTER', 'CRITICAL', 'HIGH'][keyId], 'ECDSA_SECP256K1', false,
    privateKey.getPublicKey().bytes()
  ))

  const unsignedTransition = client.identities.createStateTransition('create', { publicKeys, assetLockProof })
  publicKeys.forEach((publicKey, keyId) => {
    publicKey.signature = unsignedTransition.signByPrivateKey(privateKeys[keyId])
  })

  const transition = client.identities.createStateTransition('create', { publicKeys, assetLockProof })
  transition.signByPrivateKey(assetLockPrivateKey)
  await client.stateTransitions.broadcast(transition)
  await client.stateTransitions.waitForStateTransitionResult(transition)

  console.log('Done', '\n', `Identity: ${assetLockProof.createIdentityId().base58()}`)
}

createIdentity().catch(error => {
  console.error(error)
  process.exitCode = 1
})
