const { DashPlatformSDK } = require('dash-platform-sdk')
const { PrivateKeyWASM } = require('pshenmic-dpp')

function initClient () {
  return new DashPlatformSDK({ network: 'testnet' })
}

async function deriveIdentityKey (client, keyId) {
  if (!process.env.MNEMONIC) {
    throw new Error('Mnemonic not set')
  }

  const identityIndex = Number(process.env.IDENTITY_INDEX || 0)
  if (!Number.isSafeInteger(identityIndex) || identityIndex < 0) {
    throw new Error('Invalid identity index')
  }

  const seed = client.keyPair.mnemonicToSeed(process.env.MNEMONIC)
  const hdKey = client.keyPair.seedToHdKey(seed, 'testnet')
  const { privateKey } = await client.keyPair.deriveIdentityPrivateKey(hdKey, identityIndex, keyId, 'testnet')
  return PrivateKeyWASM.fromBytes(privateKey, 'testnet')
}

async function signAndBroadcast (client, transition, identity) {
  const keyId = Number(process.env.IDENTITY_KEY_ID || 1)
  const publicKey = identity.getPublicKeyById(keyId)
  if (!publicKey || publicKey.disabledAt !== undefined) {
    throw new Error(`Identity has no active key ${keyId}`)
  }

  const privateKey = await deriveIdentityKey(client, keyId)
  if (!publicKey.validatePrivateKey(privateKey, 'testnet')) {
    throw new Error('Mnemonic does not match the identity signing key')
  }

  transition.sign(privateKey, publicKey)
  await client.stateTransitions.broadcast(transition)
  await client.stateTransitions.waitForStateTransitionResult(transition)
}

module.exports = { initClient, deriveIdentityKey, signAndBroadcast }
