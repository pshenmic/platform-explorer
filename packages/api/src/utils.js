const crypto = require('crypto')
const StateTransitionEnum = require('./enums/StateTransitionEnum')
const net = require('net')
const { TCP_CONNECT_TIMEOUT, DPNS_CONTRACT } = require('./constants')
const convertToHomographSafeChars = require('dash/build/utils/convertToHomographSafeChars').default

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
      decoded.outputScript = stateTransition.getOutputScript()?.toString('hex') ?? null
      decoded.coreFeePerByte = stateTransition.getCoreFeePerByte()

      break
    }
    case StateTransitionEnum.MASTERNODE_VOTE: {
      decoded.contestedResourcesVotePoll = stateTransition.getContestedDocumentResourceVotePoll().indexValues.map(buff => buff.toString('base64'))
      decoded.contractId = stateTransition.getContestedDocumentResourceVotePoll().contractId.toString()
      decoded.modifiedDataIds = stateTransition.getModifiedDataIds().map(identifier => identifier.toString())
      decoded.ownerId = stateTransition.getOwnerId().toString()

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
  const intervals = {
    PT5M: 300000,
    PT30M: 1800000,
    PT1H: 3600000,
    PT2H: 7200000,
    PT12H: 43200000,
    P1D: 86400000,
    P1W: 604800000,
    P1M: 2419200000,
    P1Y: 29030400000
  }

  const intervalsInRFC = Object.keys(intervals)

  const startTimestamp = start.getTime()
  const endTimestamp = end.getTime()

  const period = endTimestamp - startTimestamp

  return intervalsInRFC.reduce((previousValue, currentValue, currentIndex, array) => {
    const parts = period / intervals[currentValue]

    if (parts <= 2 && currentIndex > 0) {
      array.splice(intervalsInRFC.length)

      return previousValue
    } else if (parts <= 12 && currentIndex === 0) {
      array.splice(intervalsInRFC.length)

      return currentValue
    }

    return currentValue
  }, intervalsInRFC[0])
}

const generateNameIndexBuffer = (name) => {
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
    const domainBuffer = generateNameIndexBuffer(domain)

    const labelBuffer = generateNameIndexBuffer(normalizedLabel)

    const contestedState = await dapi.getContestedState(
      DPNS_CONTRACT,
      'domain',
      'parentNameAndLabel',
      1,
      [
        domainBuffer,
        labelBuffer
      ]
    )

    return { alias, contestedState }
  }

  return { alias, contestedState: null }
}

module.exports = {
  hash,
  decodeStateTransition,
  getKnex,
  checkTcpConnect,
  calculateInterval,
  getAliasInfo
}
