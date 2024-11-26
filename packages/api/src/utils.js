const crypto = require('crypto')
const StateTransitionEnum = require('./enums/StateTransitionEnum')
const PoolingEnum = require('./enums/PoolingEnum')
const DocumentActionEnum = require('./enums/DocumentActionEnum')
const net = require('net')
const {TCP_CONNECT_TIMEOUT, DPNS_CONTRACT, NETWORK} = require('./constants')
const {base58} = require('@scure/base')
const convertToHomographSafeChars = require('dash/build/utils/convertToHomographSafeChars').default
const Intervals = require('./enums/IntervalsEnum')

const dashcorelib = require('@dashevo/dashcore-lib')

const getKnex = () => {
  return require('knex')({
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASS,
      ssl: process.env.POSTGRES_SSL ? {rejectUnauthorized: false} : false
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
      const dataContractConfig = stateTransition.getDataContract().getConfig()

      decoded.internalConfig = {
        canBeDeleted: dataContractConfig.canBeDeleted,
        readonly: dataContractConfig.readonly,
        keepsHistory: dataContractConfig.keepsHistory,
        documentsKeepHistoryContractDefault: dataContractConfig.documentsKeepHistoryContractDefault,
        documentsMutableContractDefault: dataContractConfig.documentsMutableContractDefault,
        documentsCanBeDeletedContractDefault: dataContractConfig.documentsCanBeDeletedContractDefault,
        requiresIdentityDecryptionBoundedKey: dataContractConfig.requiresIdentityDecryptionBoundedKey ?? null,
        requiresIdentityEncryptionBoundedKey: dataContractConfig.requiresIdentityEncryptionBoundedKey ?? null
      }

      decoded.userFeeIncrease = stateTransition.toObject().userFeeIncrease
      decoded.identityNonce = Number(stateTransition.getIdentityNonce())
      decoded.dataContractId = stateTransition.getDataContract().getId().toString()
      decoded.ownerId = stateTransition.getOwnerId().toString()
      decoded.schema = stateTransition.getDataContract().getDocumentSchemas()
      decoded.signature = Buffer.from(stateTransition.toObject().signature).toString('hex')
      decoded.publicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.DOCUMENTS_BATCH: {
      decoded.transitions = stateTransition.getTransitions().map((documentTransition) => {
        const out = {
          id: documentTransition.getId().toString(),
          dataContractId: documentTransition.getDataContractId().toString(),
          revision: documentTransition.getRevision(),
          type: documentTransition.getType(),
          action: DocumentActionEnum[documentTransition.getAction()]
        }

        switch (documentTransition.getAction()) {
          case DocumentActionEnum.Create: {
            out.data = documentTransition.getData()

            break
          }
          case DocumentActionEnum.Replace: {
            out.data = documentTransition.getData()

            break
          }
        }

        return out
      })

      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.signature = Buffer.from(stateTransition.getSignature()).toString('hex')
      decoded.publicKeyId = stateTransition.getSignaturePublicKeyId()
      decoded.ownerId = stateTransition.getOwnerId().toString()
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREATE: {
      const assetLockProof = stateTransition.getAssetLockProof()

      decoded.input = dashcorelib.Script(assetLockProof.getOutput().script).toAddress(NETWORK).toString()
      decoded.assetLockProof = assetLockProof.toJSON()
      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.identityId = stateTransition.getIdentityId().toString()
      decoded.signature = stateTransition.getSignature()?.toString('hex') ?? null
      decoded.raw = stateTransition.toBuffer().toString('hex')
      decoded.publicKeys = stateTransition.publicKeys.map(key => ({
        ...key.toJSON(),
        signature: Buffer.from(key.getSignature()).toString('hex')
      }))

      break
    }
    case StateTransitionEnum.IDENTITY_TOP_UP: {
      const assetLockProof = stateTransition.getAssetLockProof()
      const output = assetLockProof.getOutput()

      decoded.input = dashcorelib.Script(assetLockProof.getOutput().script).toAddress(NETWORK).toString()
      decoded.assetLockProof = assetLockProof.toJSON()
      decoded.identityId = stateTransition.getIdentityId().toString()
      decoded.amount = output.satoshis * 1000
      decoded.signature = stateTransition.getSignature()?.toString('hex') ?? null
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.DATA_CONTRACT_UPDATE: {
      const dataContractConfig = stateTransition.getDataContract().getConfig()

      decoded.internalConfig = {
        canBeDeleted: dataContractConfig.canBeDeleted,
        readonly: dataContractConfig.readonly,
        keepsHistory: dataContractConfig.keepsHistory,
        documentsKeepHistoryContractDefault: dataContractConfig.documentsKeepHistoryContractDefault,
        documentsMutableContractDefault: dataContractConfig.documentsMutableContractDefault,
        documentsCanBeDeletedContractDefault: dataContractConfig.documentsCanBeDeletedContractDefault,
        requiresIdentityDecryptionBoundedKey: dataContractConfig.requiresIdentityDecryptionBoundedKey ?? null,
        requiresIdentityEncryptionBoundedKey: dataContractConfig.requiresIdentityEncryptionBoundedKey ?? null
      }

      decoded.identityContractNonce = stateTransition.toObject()['$identity-contract-nonce']
      decoded.publicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.signature = Buffer.from(stateTransition.toObject().signature).toString('hex')
      decoded.userFeeIncrease = stateTransition.toObject().userFeeIncrease
      decoded.ownerId = stateTransition.getDataContract().getOwnerId().toString()
      decoded.dataContractId = stateTransition.getDataContract().getId().toString()
      decoded.dataContractNonce = Number(stateTransition.getDataContract().getIdentityNonce())
      decoded.schema = stateTransition.getDataContract().getDocumentSchemas()
      decoded.version = stateTransition.getDataContract().getVersion()
      decoded.dataContractOwner = stateTransition.getDataContract().getOwnerId().toString()
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_UPDATE: {
      decoded.identityContractNonce = Number(stateTransition.getIdentityContractNonce())
      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.identityId = stateTransition.getOwnerId().toString()
      decoded.revision = stateTransition.getRevision()
      decoded.publicKeysToAdd = stateTransition.getPublicKeysToAdd()
        .map(key => ({
          ...key.toJSON(),
          signature: Buffer.from(key.getSignature()).toString('hex')
        }))
      decoded.setPublicKeyIdsToDisable = (stateTransition.getPublicKeyIdsToDisable() ?? []).map(key => key.toJSON())
      decoded.signature = stateTransition.getSignature().toString('hex')
      decoded.publicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_TRANSFER: {
      decoded.identityContractNonce = Number(stateTransition.getIdentityContractNonce())
      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.senderId = stateTransition.getIdentityId().toString()
      decoded.recipientId = stateTransition.getRecipientId().toString()
      decoded.amount = stateTransition.getAmount()
      decoded.publicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.signature = stateTransition.getSignature()?.toString('hex') ?? null
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL: {
      decoded.output = dashcorelib.Script(stateTransition.getOutputScript()).toAddress(NETWORK).toString()
      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.identityContractNonce = Number(stateTransition.getIdentityContractNonce())
      decoded.senderId = stateTransition.getIdentityId().toString()
      decoded.amount = parseInt(stateTransition.getAmount())
      decoded.nonce = parseInt(stateTransition.getNonce())
      decoded.outputScript = stateTransition.getOutputScript()?.toString('hex') ?? null
      decoded.coreFeePerByte = stateTransition.getCoreFeePerByte()
      decoded.signature = stateTransition.getSignature()?.toString('hex')
      decoded.publicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.pooling = PoolingEnum[stateTransition.getPooling()]
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.MASTERNODE_VOTE: {
      decoded.contestedResourcesVotePoll = stateTransition.getContestedDocumentResourceVotePoll().indexValues.map(buff => buff.toString('base64'))
      decoded.contractId = stateTransition.getContestedDocumentResourceVotePoll().contractId.toString()
      decoded.modifiedDataIds = stateTransition.getModifiedDataIds().map(identifier => identifier.toString())
      decoded.ownerId = stateTransition.getOwnerId().toString()
      decoded.signature = stateTransition.getSignature()?.toString('hex') ?? null
      decoded.documentTypeName = stateTransition.getContestedDocumentResourceVotePoll().documentTypeName
      decoded.indexName = stateTransition.getContestedDocumentResourceVotePoll().indexName
      decoded.choice = stateTransition.getContestedDocumentResourceVotePoll().choice
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    default:
      throw new Error('Unknown state transition')
  }

  return decoded
}

const checkTcpConnect = (port, host) => {
  return new Promise((resolve, reject) => {
    let connection
    try {
      connection = net.createConnection(port, host)

      connection.setTimeout(TCP_CONNECT_TIMEOUT)

      connection.once('error', async (e) => {
        await connection.destroy()
        console.error(e)
        reject(e)
      })

      connection.once('connect', async () => {
        await connection.destroy()
        resolve('OK')
      })

      connection.once('timeout', async () => {
        await connection.destroy()
        resolve('ERR_CONNECTION_REFUSED')
      })
    } catch (e) {
      console.error(e)
      connection.destroy()
      reject(e)
    }
  })
}

// Calculating period and calculate the period
// and find the interval with less than 2 periods
// and take the previous interval
const calculateInterval = (start, end) => {
  const intervalsInRFC = Object.keys(Intervals)

  const startTimestamp = start.getTime()
  const endTimestamp = end.getTime()

  const period = endTimestamp - startTimestamp

  return intervalsInRFC.reduce((previousValue, currentValue, currentIndex, array) => {
    const parts = period / Intervals[currentValue]

    if (parts < 4 && currentIndex > 0) {
      array.splice(intervalsInRFC.length)

      return previousValue
    } else if (parts <= 12 && currentIndex === 0) {
      array.splice(intervalsInRFC.length)

      return currentValue
    }

    return currentValue
  })
}

// https://github.com/wking/milliseconds-to-iso-8601-duration
const iso8601duration = function (milliseconds) {
  if (milliseconds === 0) {
    return 'P0D'
  }

  let offset = Math.floor(milliseconds)
  let days = 0

  if (offset < 0) {
    days = Math.floor(offset % 86400000)
    offset -= 86400000 * days
  }

  milliseconds = offset % 1000

  offset = Math.floor(offset / 1000)

  const seconds = offset % 60
  offset = Math.floor(offset / 60)

  const minutes = offset % 60
  offset = Math.floor(offset / 60)

  const hours = offset % 24

  days += Math.floor(offset / 24)

  const parts = ['P']

  if (days) {
    parts.push(days + 'D')
  }

  if (hours || minutes || seconds || milliseconds) {
    parts.push('T')
    if (hours) {
      parts.push(hours + 'H')
    }
    if (minutes) {
      parts.push(minutes + 'M')
    }
    if (seconds || milliseconds) {
      parts.push(seconds)
      if (milliseconds) {
        milliseconds = milliseconds.toString()
        while (milliseconds.length < 3) {
          milliseconds = '0' + milliseconds
        }
        parts.push('.' + milliseconds)
      }
      parts.push('S')
    }
  }
  return parts.join('')
}

const buildIndexBuffer = (name) => {
  const lengthBuffer = Buffer.alloc(1)
  lengthBuffer.writeUInt8(name.length.toString(16), 0)

  return Buffer.concat(
    [
      Buffer.from('12', 'hex'),
      lengthBuffer,
      Buffer.from(name, 'ascii')
    ]
  )
}

const getAliasInfo = async (alias, dapi) => {
  const [label, domain] = alias.split('.')

  const normalizedLabel = convertToHomographSafeChars(label ?? '')

  if (/^[a-zA-Z01]{3,19}$/.test(normalizedLabel)) {
    const domainBuffer = buildIndexBuffer(domain)

    const labelBuffer = buildIndexBuffer(normalizedLabel)

    const contestedState = await dapi.getContestedState(
      Buffer.from(base58.decode(DPNS_CONTRACT)).toString('base64'),
      'domain',
      'parentNameAndLabel',
      1,
      [
        domainBuffer,
        labelBuffer
      ]
    )

    return {alias, contestedState}
  }

  return {alias, contestedState: null}
}

module.exports = {
  hash,
  decodeStateTransition,
  getKnex,
  checkTcpConnect,
  calculateInterval,
  iso8601duration,
  getAliasInfo
}
