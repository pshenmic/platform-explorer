const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')
const IdentitiesDAO = require('../dao/IdentitiesDAO')
const TenderdashRPC = require('../tenderdashRpc')
const { calculateEpoch } = require('../utils')

const API_VERSION = require('../../package.json').version
const PLATFORM_VERSION = '1' + require('../../package.json').dependencies.dash.substring(1)

class MainController {
  constructor (knex, genesisTime) {
    this.blocksDAO = new BlocksDAO(knex)
    this.dataContractsDAO = new DataContractsDAO(knex)
    this.documentsDAO = new DocumentsDAO(knex)
    this.transactionsDAO = new TransactionsDAO(knex)
    this.identitiesDAO = new IdentitiesDAO(knex)
    this.genesisTime = genesisTime
  }

  getStatus = async (request, response) => {
    const [blocks, stats, tdStatus] = (await Promise.allSettled([
      this.blocksDAO.getBlocks(1, 1, 'desc'),
      this.blocksDAO.getStats(),
      TenderdashRPC.getStatus()
    ])).map((e) => e.value ?? null)

    const [currentBlock] = blocks.resultSet

    const epoch = calculateEpoch({
      timestamp: currentBlock.header.timestamp,
      genesisTime: this.genesisTime
    })

    response.send({
      epoch,
      transactionsCount: stats?.transactionsCount,
      transfersCount: stats?.transfersCount,
      dataContractsCount: stats?.dataContractsCount,
      documentsCount: stats?.documentsCount,
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

    // todo validate
    if (!query) {
      return response.status(400).send({ error: '`?query=` missing' })
    }

    if (/^[0-9]+$/.test(query)) {
      // search block by height
      const block = await this.blocksDAO.getBlockByHeight(query)

      if (block) {
        return response.send({ block })
      }
    }

    if (/^[0-9A-F]{64,64}$/.test(query)) {
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
    }

    // check for any Identifiers (identities, data contracts, documents)
    if (query.length >= 43 && query.length <= 44) {
      // search identites
      const identity = await this.identitiesDAO.getIdentityByIdentifier(query)

      if (identity) {
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

    response.status(404).send({ message: 'not found' })
  }
}

module.exports = MainController
