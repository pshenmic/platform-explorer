const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')
const IdentitiesDAO = require('../dao/IdentitiesDAO')
const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Epoch = require('../models/Epoch')
const { validateAliases } = require('../utils')
const { base58 } = require('@scure/base')

const API_VERSION = require('../../package.json').version
const PLATFORM_VERSION = '1' + require('../../package.json').dependencies.dash.substring(1)

class MainController {
  constructor (knex, dapi) {
    this.blocksDAO = new BlocksDAO(knex)
    this.dataContractsDAO = new DataContractsDAO(knex)
    this.documentsDAO = new DocumentsDAO(knex)
    this.transactionsDAO = new TransactionsDAO(knex)
    this.identitiesDAO = new IdentitiesDAO(knex, dapi)
    this.validatorsDAO = new ValidatorsDAO(knex)
    this.dapi = dapi
  }

  getStatus = async (request, response) => {
    const [blocks, stats, tdStatus, epochsInfo, totalCredits, totalCollectedFeesDay] = (await Promise.allSettled([
      this.blocksDAO.getBlocks(1, 1, 'desc'),
      this.blocksDAO.getStats(),
      TenderdashRPC.getStatus(),
      this.dapi.getEpochsInfo(1),
      this.dapi.getTotalCredits(),
      this.transactionsDAO.getCollectedFees('24h')
    ])).map((e) => e.value ?? null)

    const [currentBlock] = blocks?.resultSet ?? []

    const [epochInfo] = epochsInfo ?? []

    const epoch = epochInfo ? Epoch.fromObject(epochInfo) : null

    response.send({
      epoch,
      transactionsCount: stats?.transactionsCount,
      totalCredits,
      totalCollectedFeesDay,
      transfersCount: stats?.transfersCount,
      dataContractsCount: stats?.dataContractsCount,
      documentsCount: stats?.documentsCount,
      identitiesCount: stats?.identitiesCount,
      network: tdStatus?.network ?? null,
      api: {
        version: API_VERSION,
        block: {
          height: currentBlock?.header?.height,
          hash: currentBlock?.header?.hash,
          timestamp: currentBlock?.header?.timestamp.toISOString()
        }
      },
      platform: {
        version: PLATFORM_VERSION
      },
      tenderdash: {
        version: tdStatus?.version ?? null,
        block: {
          height: tdStatus?.highestBlock?.height ?? null,
          hash: tdStatus?.highestBlock?.hash ?? null,
          timestamp: tdStatus?.highestBlock?.timestamp ?? null
        }
      }
    })
  }

  search = async (request, response) => {
    const { query } = request.query

    const epoch = Epoch.fromObject({
      startTime: 0,
      endTime: 0
    })

    if (/^[0-9]+$/.test(query)) {
      // search block by height
      const block = await this.blocksDAO.getBlockByHeight(query)

      if (block) {
        return response.send({ block })
      }
    }

    if (/^[0-9A-f]{64,64}$/.test(query)) {
      // search block by hash
      const block = await this.blocksDAO.getBlockByHash(query)

      if (block) {
        return response.send({ block })
      }

      // search transactions
      const transaction = await this.transactionsDAO.getTransactionByHash(query)

      if (transaction) {
        return response.send({ transaction })
      }

      // search validators
      const validator = await this.validatorsDAO.getValidatorByProTxHash(query, null, epoch)

      if (validator) {
        return response.send({ validator })
      }
    }

    // check for any Identifiers (identities, data contracts, documents)
    if (/^[0-9A-z]{43,44}$/.test(query)) {
      // search identites
      const identity = await this.identitiesDAO.getIdentityByIdentifier(query)

      if (identity) {
        // Sending without balance and aliases, not available on search, use 
        // request /identity/:identifier for actual data
        return response.send({ identity })
      }

      // search data contracts
      const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(query)

      if (dataContract) {
        return response.send({ dataContract })
      }

      // search documents
      const document = await this.documentsDAO.getDocumentByIdentifier(query)

      if (document) {
        return response.send({ document })
      }
    }

    if (/^[^\s.]+(\.[^\s.]+)*$/.test(query)) {
      let preIdentity
      let identity

      if (!query.includes('.')) {
        preIdentity = await this.identitiesDAO.getIdentityByDPNS(query)

        if (!preIdentity) {
          return response.status(404).send({ message: 'not found' })
        }
      }

      const [{ contestedState }] = await validateAliases(
        [preIdentity ? preIdentity.aliases.find(v => v.includes(`${query}.`)) : query],
        null,
        this.dapi
      )

      if (contestedState) {
        if (typeof contestedState.finishedVoteInfo?.wonByIdentityId === 'string') {
          const identifier = base58.encode(Buffer.from(contestedState.finishedVoteInfo?.wonByIdentityId, 'base64'))

          identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)
        }
      }

      if (!contestedState) {
        identity = preIdentity ?? await this.identitiesDAO.getIdentityByDPNS(query)
      }

      if (identity) {
        // Sending without actual balance and aliases, because on frontend we were making
        // request /identity/:identifier for actual data
        return response.send({ identity })
      }
    }

    response.status(404).send({ message: 'not found' })
  }
}

module.exports = MainController
