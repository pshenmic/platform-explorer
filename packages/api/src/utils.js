const crypto = require('crypto')
const StateTransitionEnum = require('./enums/StateTransitionEnum')
const PoolingEnum = require('./enums/PoolingEnum')
const DocumentActionEnum = require('./enums/DocumentActionEnum')
const net = require('net')
const { TCP_CONNECT_TIMEOUT, DPNS_CONTRACT, NETWORK } = require('./constants')
const { base58 } = require('@scure/base')
const convertToHomographSafeChars = require('dash/build/utils/convertToHomographSafeChars').default
const Intervals = require('./enums/IntervalsEnum')
const dashcorelib = require('@dashevo/dashcore-lib')
const { Identifier } = require('@dashevo/wasm-dpp')
const SecurityLevelEnum = require('./enums/SecurityLevelEnum')
const KeyPurposeEnum = require('./enums/KeyPurposeEnum')
const KeyTypeEnum = require('./enums/KeyTypeEnum')
const Alias = require('./models/Alias')
const TokenTransitionEnum = require('./enums/TokenTransitionsEnum')

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

const createDocumentBatchTransition = async (client, dataContractObject, owner, documentTypeName, data, batchType, nonce) => {
  const dpp = client.platform.dpp

  const dataContract = dpp.dataContract.create(Identifier.from(dataContractObject.owner.identifier), BigInt(0), JSON.parse(dataContractObject.schema))

  dataContract.setId(Identifier.from(dataContractObject.identifier))

  const document = dpp.document.create(dataContract, Identifier.from(owner), documentTypeName, data)

  let batch = {
    create: [],
    replace: [],
    delete: []
  }

  batch = { ...batch, [batchType]: [document] }

  const tx = dpp.document.createStateTransition(batch, {
    [owner]: {
      [dataContract.getId().toString()]: BigInt(nonce).toString()
    }
  })

  return tx.toBuffer().toString('base64')
}

/**
 * allows to get address from output script
 * @param {Buffer} script
 * @returns {String}
 */

const outputScriptToAddress = (script) => {
  const address = dashcorelib.Script(script).toAddress(NETWORK)
  return address ? address.toString() : null
}

const decodeStateTransition = async (client, base64) => {
  const stateTransition = await client.platform.dpp.stateTransition.createFromBuffer(Buffer.from(base64, 'base64'))

  const decoded = {
    type: stateTransition.getType(),
    typeString: StateTransitionEnum[stateTransition.getType()]
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

      decoded.version = stateTransition.getDataContract().getVersion()
      decoded.userFeeIncrease = stateTransition.toObject().userFeeIncrease
      decoded.identityNonce = String(stateTransition.getIdentityNonce())
      decoded.dataContractId = stateTransition.getDataContract().getId().toString()
      decoded.ownerId = stateTransition.getOwnerId().toString()
      decoded.schema = stateTransition.getDataContract().getDocumentSchemas()
      decoded.signature = Buffer.from(stateTransition.toObject().signature).toString('hex')
      decoded.signaturePublicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.BATCH: {
      decoded.transitions = stateTransition.getTransitions().map((transition) => {
        const transitionType = transition.constructor.name === 'TokenTransition' ? 1 : 0

        let out = {}

        switch (transitionType) {
          case 1: {
            const tokenTransitionType = transition.getTransitionType()

            out = {
              transitionType: 'tokenTransition',
              tokenTransitionType,
              tokenTransitionTypeString: TokenTransitionEnum[tokenTransitionType],
              tokenId: transition.getTokenId().toString(),
              identityContractNonce: String(transition.getIdentityContractNonce()),
              tokenContractPosition: transition.getTokenContractPosition(),
              dataContractId: transition.getDataContractId().toString(),
              historicalDocumentTypeName: transition.getHistoricalDocumentTypeName(),
              historicalDocumentId: transition.getHistoricalDocumentId(stateTransition.getOwnerId())?.toString()
            }

            const tokenTransition = transition.toTransition()

            switch (tokenTransitionType) {
              case TokenTransitionEnum.Burn: {
                out.publicNote = tokenTransition.getPublicNote() ?? null
                out.burnAmount = tokenTransition.getBurnAmount().toString()

                break
              }
              case TokenTransitionEnum.Mint: {
                out.issuedToIdentityId = tokenTransition.getIssuedToIdentityId().toString()
                out.publicNote = tokenTransition.getPublicNote() ?? null
                out.amount = tokenTransition.getAmount().toString()

                break
              }
              case TokenTransitionEnum.Transfer: {
                out.recipient = tokenTransition.getRecipientId().toString()
                out.amount = tokenTransition.getAmount().toString()
                out.publicNote = tokenTransition.getPublicNote() ?? null

                break
              }
              case TokenTransitionEnum.Freeze: {
                out.frozenIdentityId = tokenTransition.getFrozenIdentityId().toString()
                out.publicNote = tokenTransition.getPublicNote() ?? null

                break
              }
              case TokenTransitionEnum.Unfreeze: {
                out.frozenIdentityId = tokenTransition.getFrozenIdentityId().toString()
                out.publicNote = tokenTransition.getPublicNote() ?? null

                break
              }
              case TokenTransitionEnum.DestroyFrozenFunds: {
                out.frozenIdentityId = tokenTransition.getFrozenIdentityId().toString()
                out.publicNote = tokenTransition.getPublicNote() ?? null

                break
              }
              case TokenTransitionEnum.Claim: {
                out.publicNote = tokenTransition.getPublicNote() ?? null
                out.distributionType = tokenTransition.getDistributionType()

                break
              }
              case TokenTransitionEnum.EmergencyAction: {
                out.publicNote = tokenTransition.getPublicNote() ?? null
                out.emergencyAction = tokenTransition.getEmergencyAction()

                break
              }
              case TokenTransitionEnum.ConfigUpdate: {
                out.publicNote = tokenTransition.getPublicNote() ?? null

                break
              }
              case TokenTransitionEnum.DirectPurchase: {
                out.publicNote = tokenTransition.getPublicNote() ?? null
                out.price = tokenTransition.getPrice().toString()

                break
              }
              case TokenTransitionEnum.SetPriceForDirectPurchase: {
                out.publicNote = tokenTransition.getPublicNote() ?? null
                out.price = tokenTransition.getPrice()?.toString() ?? null

                break
              }
            }
            break
          }
          case 0: {
            out = {
              transitionType: 'documentTransition',
              id: transition.getId().toString(),
              dataContractId: transition.getDataContractId().toString(),
              revision: String(transition.getRevision()),
              type: transition.getType(),
              action: transition.getAction(),
              actionString: DocumentActionEnum[transition.getAction()],
              identityContractNonce: String(transition.getIdentityContractNonce())
            }

            switch (transition.getAction()) {
              case DocumentActionEnum.Create: {
                const prefundedVotingBalance = transition.getPrefundedVotingBalance()

                out.entropy = Buffer.from(transition.getEntropy()).toString('hex')

                out.data = transition.getData()
                out.prefundedVotingBalance = prefundedVotingBalance
                  ? Object.fromEntries(
                    Object.entries(prefundedVotingBalance)
                      .map(prefund => [prefund[0], Number(prefund[1])])
                  )
                  : null

                break
              }
              case DocumentActionEnum.Replace: {
                out.data = transition.getData()

                break
              }
              case DocumentActionEnum.UpdatePrice: {
                out.price = Number(transition.get_price())

                break
              }
              case DocumentActionEnum.Purchase: {
                out.price = Number(transition.get_price())

                break
              }
              case DocumentActionEnum.Transfer: {
                out.receiverId = transition.getReceiverId().toString()

                break
              }
            }
            break
          }
        }
        return out
      })

      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.signature = Buffer.from(stateTransition.getSignature()).toString('hex')
      decoded.signaturePublicKeyId = stateTransition.getSignaturePublicKeyId()
      decoded.ownerId = stateTransition.getOwnerId().toString()
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREATE: {
      const assetLockProof = stateTransition.getAssetLockProof()

      const decodedTransaction =
        assetLockProof.constructor.name === 'InstantAssetLockProof'
          ? dashcorelib.Transaction(assetLockProof.getTransaction())
          : null

      decoded.assetLockProof = {
        coreChainLockedHeight: assetLockProof.constructor.name === 'ChainAssetLockProof' ? assetLockProof.getCoreChainLockedHeight() : null,
        type: assetLockProof.constructor.name === 'InstantAssetLockProof' ? 'instantSend' : 'chainLock',
        instantLock: assetLockProof.constructor.name === 'InstantAssetLockProof' ? assetLockProof.getInstantLock().toString('base64') : null,
        fundingAmount: decodedTransaction?.outputs[assetLockProof.getOutPoint().readInt8(32)].satoshis
          ? String(decodedTransaction?.outputs[assetLockProof.getOutPoint().readInt8(32)].satoshis)
          : null,
        fundingCoreTx: Buffer.from(assetLockProof.getOutPoint().slice(0, 32).toReversed()).toString('hex'),
        vout: assetLockProof.getOutPoint().readInt8(32)
      }

      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.identityId = stateTransition.getIdentityId().toString()
      decoded.signature = stateTransition.getSignature()?.toString('hex') ?? null
      decoded.raw = stateTransition.toBuffer().toString('hex')

      decoded.publicKeys = stateTransition.publicKeys.map(key => {
        const { contractBounds } = key.toObject()

        return {
          contractBounds: contractBounds
            ? {
                type: contractBounds.type,
                id: Identifier.from(Buffer.from(contractBounds.id)).toString(),
                typeName: contractBounds.document_type_name
              }
            : null,
          id: key.getId(),
          type: KeyTypeEnum[key.getType()],
          data: Buffer.from(key.getData()).toString('hex'),
          publicKeyHash: Buffer.from(key.hash()).toString('hex'),
          purpose: KeyPurposeEnum[key.getPurpose()],
          securityLevel: SecurityLevelEnum[key.getSecurityLevel()],
          readOnly: key.isReadOnly(),
          signature: Buffer.from(key.getSignature()).toString('hex')
        }
      })

      break
    }
    case StateTransitionEnum.IDENTITY_TOP_UP: {
      const assetLockProof = stateTransition.getAssetLockProof()
      const output = assetLockProof.getOutput()

      const decodedTransaction =
        assetLockProof.constructor.name === 'InstantAssetLockProof'
          ? dashcorelib.Transaction(assetLockProof.getTransaction())
          : null

      decoded.assetLockProof = {
        coreChainLockedHeight: assetLockProof.constructor.name === 'ChainAssetLockProof' ? assetLockProof.getCoreChainLockedHeight() : null,
        type: assetLockProof.constructor.name === 'InstantAssetLockProof' ? 'instantSend' : 'chainLock',
        fundingAmount: decodedTransaction?.outputs[assetLockProof.getOutPoint().readInt8(32)].satoshis
          ? String(decodedTransaction?.outputs[assetLockProof.getOutPoint().readInt8(32)].satoshis)
          : null,
        fundingCoreTx: Buffer.from(assetLockProof.getOutPoint().slice(0, 32).toReversed()).toString('hex'),
        vout: assetLockProof.getOutPoint().readInt8(32)
      }

      decoded.identityId = stateTransition.getIdentityId().toString()
      decoded.amount = String(output.satoshis * 1000)
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
      decoded.signaturePublicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.signature = Buffer.from(stateTransition.toObject().signature).toString('hex')
      decoded.userFeeIncrease = stateTransition.toObject().userFeeIncrease
      decoded.ownerId = stateTransition.getDataContract().getOwnerId().toString()
      decoded.dataContractId = stateTransition.getDataContract().getId().toString()
      decoded.dataContractIdentityNonce = String(stateTransition.getDataContract().getIdentityNonce())
      decoded.schema = stateTransition.getDataContract().getDocumentSchemas()
      decoded.version = stateTransition.getDataContract().getVersion()
      decoded.dataContractOwner = stateTransition.getDataContract().getOwnerId().toString()
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_UPDATE: {
      decoded.identityNonce = String(stateTransition.getIdentityContractNonce())
      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.identityId = stateTransition.getOwnerId().toString()
      decoded.revision = String(stateTransition.getRevision())

      decoded.publicKeysToAdd = stateTransition.getPublicKeysToAdd()
        .map(key => {
          const { contractBounds } = key.toObject()

          return {
            contractBounds: contractBounds
              ? {
                  type: contractBounds.type,
                  id: Identifier.from(Buffer.from(contractBounds.id)).toString(),
                  typeName: contractBounds.document_type_name
                }
              : null,
            id: key.getId(),
            type: KeyTypeEnum[key.getType()],
            data: Buffer.from(key.getData()).toString('hex'),
            publicKeyHash: Buffer.from(key.hash()).toString('hex'),
            purpose: KeyPurposeEnum[key.getPurpose()],
            securityLevel: SecurityLevelEnum[key.getSecurityLevel()],
            readOnly: key.isReadOnly(),
            signature: Buffer.from(key.getSignature()).toString('hex')
          }
        })
      decoded.setPublicKeyIdsToDisable = stateTransition.getPublicKeyIdsToDisable() ?? []
      decoded.signature = stateTransition.getSignature().toString('hex')
      decoded.signaturePublicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_TRANSFER: {
      decoded.identityNonce = String(stateTransition.getNonce())
      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.senderId = stateTransition.getIdentityId().toString()
      decoded.recipientId = stateTransition.getRecipientId().toString()
      decoded.amount = String(stateTransition.getAmount())
      decoded.signaturePublicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.signature = stateTransition.getSignature()?.toString('hex') ?? null
      decoded.raw = stateTransition.toBuffer().toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL: {
      decoded.outputAddress = stateTransition.getOutputScript()
        ? outputScriptToAddress(stateTransition.getOutputScript())
        : null

      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.senderId = stateTransition.getIdentityId().toString()
      decoded.amount = String(stateTransition.getAmount())
      decoded.outputScript = stateTransition.getOutputScript()?.toString('hex') ?? null
      decoded.coreFeePerByte = stateTransition.getCoreFeePerByte()
      decoded.signature = stateTransition.getSignature()?.toString('hex')
      decoded.signaturePublicKeyId = stateTransition.toObject().signaturePublicKeyId
      decoded.pooling = PoolingEnum[stateTransition.getPooling()]
      decoded.raw = stateTransition.toBuffer().toString('hex')
      decoded.identityNonce = String(stateTransition.getNonce())

      break
    }
    case StateTransitionEnum.MASTERNODE_VOTE: {
      decoded.indexValues = stateTransition.getContestedDocumentResourceVotePoll().indexValues.map(buff => buff.toString('base64'))
      decoded.contractId = stateTransition.getContestedDocumentResourceVotePoll().contractId.toString()
      decoded.modifiedDataIds = stateTransition.getModifiedDataIds().map(identifier => identifier.toString())
      decoded.ownerId = stateTransition.getOwnerId().toString()
      decoded.signature = stateTransition.getSignature()?.toString('hex') ?? null
      decoded.documentTypeName = stateTransition.getContestedDocumentResourceVotePoll().documentTypeName
      decoded.indexName = stateTransition.getContestedDocumentResourceVotePoll().indexName
      decoded.choice = stateTransition.getContestedDocumentResourceVotePoll().choice
      decoded.userFeeIncrease = stateTransition.getUserFeeIncrease()
      decoded.raw = stateTransition.toBuffer().toString('hex')
      decoded.proTxHash = stateTransition.getProTxHash().toString('hex')
      decoded.identityNonce = String(stateTransition.getIdentityContractNonce())

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
  lengthBuffer.writeUInt8(name.length, 0)

  return Buffer.concat(
    [
      Buffer.from('12', 'hex'),
      lengthBuffer,
      Buffer.from(name, 'ascii')
    ]
  )
}

const getAliasStateByVote = (aliasInfo, alias, identifier) => {
  let status = null

  if (aliasInfo.contestedState === null) {
    return Alias.fromObject({
      alias: alias.alias,
      status: 'ok',
      contested: false,
      timestamp: alias.timestamp ? new Date(alias.timestamp) : null,
      txHash: alias.tx
    })
  }

  const bs58Identifier = base58.encode(
    Buffer.from(aliasInfo.contestedState?.finishedVoteInfo?.wonByIdentityId ?? '', 'base64')
  )

  if (identifier === bs58Identifier) {
    status = 'ok'
  } else if (bs58Identifier !== '' || aliasInfo.contestedState?.finishedVoteInfo?.wonByIdentityId === '') {
    status = 'locked'
  } else if (aliasInfo.contestedState?.finishedVoteInfo?.wonByIdentityId === undefined) {
    status = 'pending'
  }

  return Alias.fromObject({
    alias: alias.alias ?? alias,
    status,
    contested: true,
    timestamp: alias.timestamp ? new Date(alias.timestamp) : null,
    txHash: alias.tx
  })
}

const getAliasFromDocument = (aliasDocument) => {
  const {label, parentDomainName, normalizedLabel} = aliasDocument.getData()
  const documentId = aliasDocument.getId()
  const timestamp = aliasDocument.getCreatedAt()

  const alias = `${label}.${parentDomainName}`

  return {
    alias,
    status: 'ok',
    timestamp,
    documentId: documentId.toString(),
    contested: /^[a-zA-Z01-]{3,19}$/.test(normalizedLabel)
  }
}

const getAliasInfo = async (aliasText, dapi) => {
  const [label, domain] = aliasText.split('.')

  const normalizedLabel = convertToHomographSafeChars(label ?? '')

  if (/^[a-zA-Z01-]{3,19}$/.test(normalizedLabel)) {
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

    return { alias: aliasText, contestedState }
  }

  return { alias: aliasText, contestedState: null }
}

module.exports = {
  hash,
  decodeStateTransition,
  getKnex,
  checkTcpConnect,
  calculateInterval,
  iso8601duration,
  getAliasInfo,
  getAliasStateByVote,
  buildIndexBuffer,
  createDocumentBatchTransition,
  outputScriptToAddress,
  getAliasFromDocument
}
