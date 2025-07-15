const crypto = require('crypto')
const StateTransitionEnum = require('./enums/StateTransitionEnum')
const DocumentActionEnum = require('./enums/DocumentActionEnum')
const net = require('net')
const { TCP_CONNECT_TIMEOUT, DPNS_CONTRACT, NETWORK } = require('./constants')
const { base58 } = require('@scure/base')
const convertToHomographSafeChars = require('dash/build/utils/convertToHomographSafeChars').default
const Intervals = require('./enums/IntervalsEnum')
const dashcorelib = require('@dashevo/dashcore-lib')
const Alias = require('./models/Alias')
const TokenTransitionEnum = require('./enums/TokenTransitionsEnum')
const {
  StateTransitionWASM,
  BatchTransitionWASM,
  DataContractCreateTransitionWASM,
  IdentityCreateTransitionWASM, IdentityTopUpTransitionWASM, DataContractUpdateTransitionWASM,
  IdentityUpdateTransitionWASM, IdentityCreditTransferWASM, IdentityCreditWithdrawalTransitionWASM,
  MasternodeVoteTransitionWASM, IdentifierWASM, PlatformVersionWASM
} = require('pshenmic-dpp')

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

/**
 * allows to get address from output script
 * @param {Buffer} script
 * @returns {String}
 */

const outputScriptToAddress = (script) => {
  const address = dashcorelib.Script(script).toAddress(NETWORK)
  return address ? address.toString() : null
}

const decodeStateTransition = async (base64) => {
  const stateTransition = StateTransitionWASM.fromBase64(base64)

  const decoded = {
    type: stateTransition.getActionTypeNumber(),
    typeString: StateTransitionEnum[stateTransition.getActionTypeNumber()]
  }

  switch (decoded.type) {
    case StateTransitionEnum.DATA_CONTRACT_CREATE: {
      const dataContractCreateTransition = DataContractCreateTransitionWASM.fromStateTransition(stateTransition)

      const dataContract = dataContractCreateTransition.getDataContract(PlatformVersionWASM.PLATFORM_V9)

      const dataContractConfig = dataContract.getConfig()

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

      decoded.version = dataContract.version
      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.identityNonce = String(dataContractCreateTransition.identityNonce)
      decoded.dataContractId = dataContract.id.base58()
      decoded.ownerId = dataContract.ownerId.base58()
      decoded.schema = dataContract.getSchemas()
      decoded.signature = Buffer.from(stateTransition.signature).toString('hex')
      decoded.signaturePublicKeyId = stateTransition.signaturePublicKeyId
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.BATCH: {
      const batch = BatchTransitionWASM.fromStateTransition(stateTransition)

      decoded.transitions = batch.transitions.map((batchedTransitions) => {
        const transition = batchedTransitions.toTransition()

        const transitionType = transition.__type === 'DocumentTransitionWASM' ? 0 : 1

        let out = {}

        switch (transitionType) {
          case 1: {
            const tokenTransitionType = transition.getTransitionTypeNumber()

            const tokenTransition = transition.getTransition()

            out = {
              transitionType: 'tokenTransition',
              tokenTransitionType,
              tokenTransitionTypeString: TokenTransitionEnum[tokenTransitionType],
              tokenId: tokenTransition.base.tokenId.base58(),
              identityContractNonce: String(transition.identityContractNonce),
              tokenContractPosition: tokenTransition.base.tokenContractPosition,
              dataContractId: tokenTransition.base.dataContractId.base58(),
              historicalDocumentTypeName: transition.getHistoricalDocumentTypeName(),
              historicalDocumentId: transition.getHistoricalDocumentId(stateTransition.getOwnerId()).base58()
            }

            switch (tokenTransitionType) {
              case TokenTransitionEnum.Burn: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.burnAmount = tokenTransition.burnAmount.toString()

                break
              }
              case TokenTransitionEnum.Mint: {
                out.issuedToIdentityId = tokenTransition.issuedToIdentityId.base58()
                out.publicNote = tokenTransition.publicNote ?? null
                out.amount = tokenTransition.amount.toString()

                break
              }
              case TokenTransitionEnum.Transfer: {
                out.recipient = tokenTransition.recipientId.base58()
                out.amount = tokenTransition.amount.toString()
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.Freeze: {
                out.frozenIdentityId = tokenTransition.frozenIdentityId.base58()
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.Unfreeze: {
                out.frozenIdentityId = tokenTransition.frozenIdentityId.base58()
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.DestroyFrozenFunds: {
                out.frozenIdentityId = tokenTransition.frozenIdentityId.base58()
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.Claim: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.distributionType = tokenTransition.distributionType

                break
              }
              case TokenTransitionEnum.EmergencyAction: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.emergencyAction = tokenTransition.emergencyAction

                break
              }
              case TokenTransitionEnum.ConfigUpdate: {
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.DirectPurchase: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.totalAgreedPrice = tokenTransition.totalAgreedPrice.toString()
                out.tokenCount = tokenTransition.tokenCount.toString()

                break
              }
              case TokenTransitionEnum.SetPriceForDirectPurchase: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.price = tokenTransition.price.toString() ?? null

                break
              }
            }
            break
          }
          case 0: {
            out = {
              transitionType: 'documentTransition',
              id: transition.id.base58(),
              dataContractId: transition.dataContractId.base58(),
              revision: String(transition.revision),
              type: transition.documentTypeName,
              action: transition.actionTypeNumber,
              actionString: DocumentActionEnum[transition.actionTypeNumber],
              identityContractNonce: String(transition.identityContractNonce)
            }

            switch (transition.actionTypeNumber) {
              case DocumentActionEnum.Create: {
                const createTransition = transition.createTransition

                const prefundedVotingBalance = createTransition.prefundedVotingBalance

                out.entropy = Buffer.from(createTransition.entropy).toString('hex')

                out.data = createTransition.data
                out.prefundedVotingBalance = prefundedVotingBalance
                  ? Object.fromEntries(
                    Object.entries(prefundedVotingBalance)
                      .map(prefund => [prefund[0], Number(prefund[1])])
                  )
                  : null

                break
              }
              case DocumentActionEnum.Replace: {
                const replaceTransition = transition.replaceTransition

                out.data = replaceTransition.data

                break
              }
              case DocumentActionEnum.UpdatePrice: {
                const updatePriceTransition = transition.updatePriceTransition

                out.price = Number(updatePriceTransition.price)

                break
              }
              case DocumentActionEnum.Purchase: {
                const purchaseTransition = transition.purchaseTransition

                out.price = Number(purchaseTransition.price)

                break
              }
              case DocumentActionEnum.Transfer: {
                const transferTransition = transition.transferTransition

                out.receiverId = transferTransition.receiverId
                out.recipientId = transferTransition.recipientId.base58()

                break
              }
            }
            break
          }
        }
        return out
      })

      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.signature = Buffer.from(stateTransition.signature).toString('hex')
      decoded.signaturePublicKeyId = stateTransition.signaturePublicKeyId
      decoded.ownerId = stateTransition.getOwnerId().base58()
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREATE: {
      const identityCreateTransition = IdentityCreateTransitionWASM.fromStateTransition(stateTransition)

      const assetLockProof = identityCreateTransition.assetLock

      const decodedTransaction =
        assetLockProof.getLockType() === 'Instant'
          ? dashcorelib.Transaction(Buffer.from(assetLockProof.getInstantLockProof().getTransaction()))
          : null

      decoded.assetLockProof = {
        coreChainLockedHeight: assetLockProof.getLockType() === 'Chain' ? assetLockProof.getChainLockProof().coreChainLockedHeight : null,
        type: assetLockProof.getLockType() === 'Instant' ? 'instantSend' : 'chainLock',
        instantLock: assetLockProof.getLockType() === 'Instant' ? Buffer.from(assetLockProof.getInstantLockProof().getInstantLockBytes()).toString('base64') : null,
        fundingAmount: decodedTransaction?.outputs[assetLockProof.getOutPoint().getVOUT()].satoshis
          ? String(decodedTransaction?.outputs[assetLockProof.getOutPoint().getVOUT()].satoshis)
          : null,
        fundingCoreTx: assetLockProof.getOutPoint().getTXID(),
        vout: assetLockProof.getOutPoint().getVOUT()
      }

      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.identityId = stateTransition.getOwnerId().base58()
      decoded.signature = Buffer.from(stateTransition.signature ?? []).toString('hex') ?? null
      decoded.raw = stateTransition.hex()

      decoded.publicKeys = identityCreateTransition.publicKeys.map(key => {
        const { contractBounds } = key

        return {
          contractBounds: contractBounds
            ? {
                type: contractBounds.contractBoundsType,
                id: contractBounds.identi.base58(),
                typeName: contractBounds.document_type_name
              }
            : null,
          id: key.keyId,
          type: key.keyType,
          data: Buffer.from(key.data).toString('hex'),
          publicKeyHash: Buffer.from(key.getHash()).toString('hex'),
          purpose: key.purpose,
          securityLevel: key.securityLevel,
          readOnly: key.readOnly,
          signature: Buffer.from(key.signature).toString('hex')
        }
      })

      break
    }
    case StateTransitionEnum.IDENTITY_TOP_UP: {
      const identityTopUpTransition = IdentityTopUpTransitionWASM.fromStateTransition(stateTransition)

      const assetLockProof = identityTopUpTransition.assetLockProof
      const output =
        assetLockProof.getLockType() === 'Instant'
          ? assetLockProof.getInstantLockProof().getOutput()
          : null

      const decodedTransaction =
        assetLockProof.getLockType() === 'Instant'
          ? dashcorelib.Transaction(Buffer.from(assetLockProof.getInstantLockProof().getTransaction()))
          : null

      decoded.assetLockProof = {
        coreChainLockedHeight: assetLockProof.getLockType() === 'Chain' ? assetLockProof.getChainLockProof().coreChainLockedHeight : null,
        type: assetLockProof.getLockType() === 'Instant' ? 'instantSend' : 'chainLock',
        instantLock: assetLockProof.getLockType() === 'Instant' ? Buffer.from(assetLockProof.getInstantLockProof().getInstantLockBytes()).toString('base64') : null,
        fundingAmount: decodedTransaction?.outputs[assetLockProof.getOutPoint().getVOUT()].satoshis
          ? String(decodedTransaction?.outputs[assetLockProof.getOutPoint().getVOUT()].satoshis)
          : null,
        fundingCoreTx: assetLockProof.getOutPoint().getTXID(),
        vout: assetLockProof.getOutPoint().getVOUT()
      }

      decoded.identityId = stateTransition.getOwnerId().base58()
      decoded.amount = String(output.value * 1000n)
      decoded.signature = Buffer.from(stateTransition.signature ?? []).toString('hex') ?? null
      decoded.raw = stateTransition.hex()

      break
    }
    case StateTransitionEnum.DATA_CONTRACT_UPDATE: {
      const dataContractUpdateTransition = DataContractUpdateTransitionWASM.fromStateTransition(stateTransition)

      const dataContractConfig = dataContractUpdateTransition.getDataContract().getConfig()

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

      decoded.identityContractNonce = dataContractUpdateTransition.identityContractNonce.toString()
      decoded.signaturePublicKeyId = stateTransition.signaturePublicKeyId
      decoded.signature = Buffer.from(stateTransition.signature).toString('hex')
      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.ownerId = dataContractUpdateTransition.getDataContract().ownerId.base58()
      decoded.dataContractId = dataContractUpdateTransition.getDataContract().id.base58()
      decoded.schema = dataContractUpdateTransition.getDataContract().getSchemas()
      decoded.version = dataContractUpdateTransition.getDataContract().version
      decoded.dataContractOwner = dataContractUpdateTransition.getDataContract().ownerId.base58()
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_UPDATE: {
      const identityUpdateTransition = IdentityUpdateTransitionWASM.fromStateTransition(stateTransition)

      decoded.identityNonce = String(identityUpdateTransition.nonce)
      decoded.userFeeIncrease = identityUpdateTransition.userFeeIncrease
      decoded.identityId = identityUpdateTransition.identityIdentifier.base58()
      decoded.revision = String(identityUpdateTransition.revision)

      decoded.publicKeysToAdd = identityUpdateTransition.publicKeyIdsToAdd
        .map(key => {
          const { contractBounds } = key

          return {
            contractBounds: contractBounds
              ? {
                  type: contractBounds.contractBoundsType,
                  id: contractBounds.identifier.base58(),
                  typeName: contractBounds.documentTypeName
                }
              : null,
            id: key.keyId,
            type: key.keyType,
            data: Buffer.from(key.data).toString('hex'),
            publicKeyHash: Buffer.from(key.getHash()).toString('hex'),
            purpose: key.purpose,
            securityLevel: key.securityLevel,
            readOnly: key.readOnly,
            signature: Buffer.from(key.signature).toString('hex')
          }
        })
      decoded.setPublicKeyIdsToDisable = Array.from(identityUpdateTransition.publicKeyIdsToDisable ?? [])
      decoded.signature = Buffer.from(identityUpdateTransition.signature).toString('hex')
      decoded.signaturePublicKeyId = identityUpdateTransition.signaturePublicKeyId
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_TRANSFER: {
      const identityCreditTransferTransition = IdentityCreditTransferWASM.fromStateTransition(stateTransition)

      decoded.identityNonce = String(identityCreditTransferTransition.nonce)
      decoded.userFeeIncrease = identityCreditTransferTransition.userFeeIncrease
      decoded.senderId = identityCreditTransferTransition.senderId.base58()
      decoded.recipientId = identityCreditTransferTransition.recipientId.base58()
      decoded.amount = String(identityCreditTransferTransition.amount)
      decoded.signaturePublicKeyId = identityCreditTransferTransition.signaturePublicKeyId
      decoded.signature = Buffer.from(stateTransition.signature)?.toString('hex') ?? null
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL: {
      const identityCreditWithdrawalTransition = IdentityCreditWithdrawalTransitionWASM.fromStateTransition(stateTransition)

      decoded.outputAddress = identityCreditWithdrawalTransition.outputScript
        ? outputScriptToAddress(Buffer.from(identityCreditWithdrawalTransition.outputScript.bytes()))
        : null

      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.senderId = identityCreditWithdrawalTransition.identityId.base58()
      decoded.amount = String(identityCreditWithdrawalTransition.amount)
      decoded.outputScript = identityCreditWithdrawalTransition?.outputScript.hex() ?? null
      decoded.coreFeePerByte = identityCreditWithdrawalTransition.coreFeePerByte
      decoded.signature = Buffer.from(stateTransition.signature ?? []).toString('hex') ?? null
      decoded.signaturePublicKeyId = stateTransition.signaturePublicKeyId
      decoded.pooling = identityCreditWithdrawalTransition.pooling
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')
      decoded.identityNonce = String(identityCreditWithdrawalTransition.nonce)

      break
    }
    case StateTransitionEnum.MASTERNODE_VOTE: {
      const masternodeVoteTransition = MasternodeVoteTransitionWASM.fromStateTransition(stateTransition)

      const towardsIdentity = masternodeVoteTransition.vote.resourceVoteChoice.getValue()?.base58()

      decoded.indexValues = masternodeVoteTransition.vote.votePoll.indexValues.map(bytes => Buffer.from(bytes).toString('base64'))
      decoded.contractId = masternodeVoteTransition.vote.votePoll.contractId.base58()
      decoded.modifiedDataIds = masternodeVoteTransition.modifiedDataIds.map(identifier => identifier.base58())
      decoded.ownerId = stateTransition.getOwnerId().base58()
      decoded.signature = Buffer.from(stateTransition.signature ?? []).toString('hex') ?? null
      decoded.documentTypeName = masternodeVoteTransition.vote.votePoll.documentTypeName
      decoded.indexName = masternodeVoteTransition.vote.votePoll.indexName
      decoded.choice = `${masternodeVoteTransition.vote.resourceVoteChoice.getType()}${towardsIdentity ? `(${towardsIdentity})` : ''}`
      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')
      decoded.proTxHash = masternodeVoteTransition.proTxHash.hex()
      decoded.identityNonce = String(masternodeVoteTransition.nonce)

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
  const { label, parentDomainName, normalizedLabel } = aliasDocument.properties
  const documentId = aliasDocument.id
  const timestamp = new Date(Number(aliasDocument.createdAt))

  const alias = `${label}.${parentDomainName}`

  return {
    alias,
    status: 'ok',
    timestamp,
    documentId: documentId.base58(),
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
      new IdentifierWASM(DPNS_CONTRACT).base64(),
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
  outputScriptToAddress,
  getAliasFromDocument
}
