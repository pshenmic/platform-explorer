const crypto = require('crypto')
const StateTransitionEnum = require('./enums/StateTransitionEnum')

const getKnex = () => {
  return require('knex')({
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASS,
      ssl: process.env.POSTGRES_SSL ? { rejectUnauthorized: false } : false
    }
  })
}

const hash = (data) => {
  return crypto.createHash('sha1').update(data).digest('hex')
}

const decodeStateTransition = async (client, base64) => {
  const stateTransition = await client.platform.dpp.stateTransition.createFromBuffer(Buffer.from(base64, 'base64'))

  const decoded = {
    type: stateTransition.getType()
  }

  switch (decoded.type) {
    case StateTransitionEnum.DATA_CONTRACT_CREATE: {
      decoded.dataContractId = stateTransition.getDataContract().getId().toString()
      decoded.identityId = stateTransition.getOwnerId().toString()

      break
    }
    case StateTransitionEnum.DOCUMENTS_BATCH: {
      decoded.transitions = stateTransition.getTransitions().map((documentTransition) => ({
        id: documentTransition.getId().toString(),
        dataContractId: documentTransition.getDataContractId().toString(),
        action: documentTransition.getAction(),
        revision: documentTransition.getRevision()
      }))

      break
    }
    case StateTransitionEnum.IDENTITY_CREATE: {
      decoded.identityId = stateTransition.getIdentityId().toString()

      break
    }
    case StateTransitionEnum.IDENTITY_TOP_UP: {
      const assetLockProof = stateTransition.getAssetLockProof()
      const output = assetLockProof.getOutput()

      decoded.identityId = stateTransition.getIdentityId().toString()
      decoded.amount = output.satoshis * 1000

      break
    }
    case StateTransitionEnum.DATA_CONTRACT_UPDATE: {
      decoded.identityId = stateTransition.getDataContract().getOwnerId().toString()
      decoded.dataContractId = stateTransition.getDataContract().getId().toString()
      decoded.version = stateTransition.getDataContract().getVersion()

      break
    }
    case StateTransitionEnum.IDENTITY_UPDATE: {
      decoded.identityId = stateTransition.getOwnerId().toString()
      decoded.revision = stateTransition.getRevision()

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_TRANSFER: {
      decoded.senderId = stateTransition.getIdentityId().toString()
      decoded.recipientId = stateTransition.getRecipientId().toString()
      decoded.amount = stateTransition.getAmount()

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL: {
      decoded.senderId = stateTransition.getIdentityId().toString()
      decoded.amount = parseInt(stateTransition.getAmount())
      decoded.nonce = parseInt(stateTransition.getNonce())
      decoded.outputScript = stateTransition.getOutputScript().toString('hex')
      decoded.coreFeePerByte = stateTransition.getCoreFeePerByte()

      break
    }
    default:
      throw new Error('Unknown state transition')
  }

  return decoded
}

module.exports = { hash, decodeStateTransition, getKnex }
