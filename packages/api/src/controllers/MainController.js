const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')
const IdentitiesDAO = require('../dao/IdentitiesDAO')
const TenderdashRPC = require('../tenderdashRpc')

class MainController {
  constructor (knex) {
    this.blocksDAO = new BlocksDAO(knex)
    this.dataContractsDAO = new DataContractsDAO(knex)
    this.documentsDAO = new DocumentsDAO(knex)
    this.transactionsDAO = new TransactionsDAO(knex)
    this.identitiesDAO = new IdentitiesDAO(knex)
  }

  getStatus = async (request, response) => {
    const [blocks, stats, genesis, tdStatus] = (await Promise.allSettled([
      this.blocksDAO.getBlocks(1, 1, 'desc'),
      this.blocksDAO.getStats(),
      TenderdashRPC.getGenesis(),
      TenderdashRPC.getStatus()
    ])).map((e) => e.value ?? null)

    const [currentBlock] = blocks.resultSet

    const currentBlocktime = currentBlock.header.timestamp.getTime()
    const epochChangeTime = Number(process.env.EPOCH_CHANGE_TIME)
    const genesisTime = new Date(genesis.genesis_time).getTime()
    const epochIndex = Math.floor((currentBlocktime - genesisTime) / epochChangeTime)
    const startEpochTime = Math.floor(genesisTime + epochChangeTime * epochIndex)
    const nextEpochTime = Math.floor(genesisTime + epochChangeTime * (epochIndex + 1))

    const epoch = {
      index: epochIndex,
      startTime: new Date(startEpochTime),
      endTime: new Date(nextEpochTime)
    }

    response.send({
      epoch,
      transactionsCount: stats?.transactionsCount,
      transfersCount: stats?.transfersCount,
      dataContractsCount: stats?.dataContractsCount,
      documentsCount: stats?.documentsCount,
      network: tdStatus?.network ?? null,
      tenderdashVersion: tdStatus?.tenderdashVersion ?? null,
      platformVersion: tdStatus?.platformVersion ?? null,
      maxPeerHeight: tdStatus?.maxPeerHeight ?? null,
      tenderdashChainHeight: tdStatus?.tenderdashChainHeight ?? null,
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
