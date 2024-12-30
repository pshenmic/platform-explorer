const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')
const IdentitiesDAO = require('../dao/IdentitiesDAO')
const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Epoch = require('../models/Epoch')
const { base58 } = require('@scure/base')

const API_VERSION = require('../../package.json').version

class MainController {
  constructor (knex, dapi, client) {
    this.blocksDAO = new BlocksDAO(knex, dapi)
    this.dataContractsDAO = new DataContractsDAO(knex)
    this.documentsDAO = new DocumentsDAO(knex, client)
    this.transactionsDAO = new TransactionsDAO(knex, dapi)
    this.identitiesDAO = new IdentitiesDAO(knex, dapi, client)
    this.validatorsDAO = new ValidatorsDAO(knex)
    this.dapi = dapi
  }

  getStatus = async (request, response) => {
    const [blocks, stats, status, tdStatus, epochsInfo, totalCredits, totalCollectedFeesDay] = (await Promise.allSettled([
      this.blocksDAO.getBlocks(1, 1, 'desc'),
      this.blocksDAO.getStats(),
      this.dapi.getStatus(),
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
      tenderdash: {
        version: status?.version?.software.tenderdash ?? null,
        block: {
          height: tdStatus?.highestBlock?.height ?? null,
          hash: tdStatus?.highestBlock?.hash ?? null,
          timestamp: tdStatus?.highestBlock?.timestamp ?? null
        }
      },
      versions: {
        software: {
          dapi: status?.version?.software.dapi ?? null,
          drive: status?.version?.software.drive ?? null,
          tenderdash: status?.version?.software.tenderdash ?? null
        },
        protocol: {
          tenderdash: {
            p2p: status?.version?.protocol.tenderdash?.p2p ?? null,
            block: status?.version?.protocol.tenderdash?.block ?? null
          },
          drive: {
            latest: status?.version?.protocol.drive?.latest ?? null,
            current: status?.version?.protocol.drive?.current ?? null
          }
        }
      }
    })
  }

  search = async (request, response) => {
    const { query } = request.query

    let result = {}

    const epoch = Epoch.fromObject({
      startTime: 0,
      endTime: 0
    })

    if (/^[0-9]+$/.test(query)) {
      // search block by height
      const block = await this.blocksDAO.getBlockByHeight(query)

      if (block) {
        result = { ...result, block }
      }
    }

    if (/^[0-9A-f]{64,64}$/.test(query)) {
      // search block by hash
      const block = await this.blocksDAO.getBlockByHash(query)

      if (block) {
        result = { ...result, block }
      }

      // search transactions
      const transaction = await this.transactionsDAO.getTransactionByHash(query)

      if (transaction) {
        result = { ...result, transaction }
      }

      // search validators by hash
      const validator = await this.validatorsDAO.getValidatorByProTxHash(query, null, epoch)

      if (validator) {
        result = { ...result, validator }
      }
    }

    // check for any Identifiers (identities, data contracts, documents)
    if (/^[0-9A-z]{43,44}$/.test(query)) {
      // search identites
      const identity = await this.identitiesDAO.getIdentityByIdentifier(query)

      if (identity) {
        result = { ...result, identity }
      }

      // search validator by MasterNode identity
      const proTxHash = Buffer.from(base58.decode(query)).toString('hex')

      const validator = await this.validatorsDAO.getValidatorByProTxHash(proTxHash, null, epoch)

      if (validator) {
        result = { ...result, validator }
      }

      // search data contract by id
      const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(query)

      if (dataContract) {
        result = { ...result, dataContract }
      }

      // search documents
      const document = await this.documentsDAO.getDocumentByIdentifier(query)

      if (document) {
        result = { ...result, document }
      }
    }

    // by dpns name
    const identities = await this.identitiesDAO.getIdentitiesByDPNSName(query)

    if (identities) {
      result = { ...result, identities }
    }

    // by data-contract name
    const dataContracts = await this.dataContractsDAO.getDataContractByName(query)

    if (dataContracts) {
      result = { ...result, dataContracts }
    }

    if (Object.keys(result).length === 0) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(result)
  }
}

module.exports = MainController
