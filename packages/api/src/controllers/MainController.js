const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')
const IdentitiesDAO = require('../dao/IdentitiesDAO')
const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Epoch = require('../models/Epoch')
const {searchLimit} = require("../constants");
const {base58} = require("@scure/base");

const API_VERSION = require('../../package.json').version
const PLATFORM_VERSION = '1' + require('../../package.json').dependencies.dash.substring(1)

class MainController {
  constructor(knex, dapi) {
    this.blocksDAO = new BlocksDAO(knex, dapi)
    this.dataContractsDAO = new DataContractsDAO(knex)
    this.documentsDAO = new DocumentsDAO(knex)
    this.transactionsDAO = new TransactionsDAO(knex, dapi)
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

    let output = {}

    const epoch = Epoch.fromObject({
      startTime: 0,
      endTime: 0
    })

    if (/^[0-9]+$/.test(query)) {
      // search block by height
      const block = await this.blocksDAO.getBlockByHeight(query)

      if(block){
        output = {...output, block}
      }
    }

    if (/^[0-9A-f]{64,64}$/.test(query)) {
      // search block by hash
      const block = await this.blocksDAO.getBlockByHash(query)

      if (block) {
        output = {...output, block}
      }

      // search transactions
      const transaction = await this.transactionsDAO.getTransactionByHash(query)

      if (transaction) {
        output = {...output, transaction}
      }

      // search validators by hash
      const validator = await this.validatorsDAO.getValidatorByProTxHash(query, null, epoch)

      if (validator) {
        output = {...output, validator}
      }
    }

    // check for any Identifiers (identities, data contracts, documents)
    if (/^[0-9A-z]{43,44}$/.test(query)) {
      // search identites
      const identity = await this.identitiesDAO.getIdentityByIdentifier(query)

      if (identity) {
        output = {...output, identity}
      }

      // search validator by MasterNode identity
      const proTxHash = Buffer.from(base58.decode(query)).toString('hex')

      const validator = await this.validatorsDAO.getValidatorByProTxHash(proTxHash, null, epoch)

      if (validator) {
        output = {...output, validator}
      }

      // search data contract by id
      const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(query)

      if (dataContract) {
        output = {...output, dataContract}
      }

      // search documents
      const document = await this.documentsDAO.getDocumentByIdentifier(query)

      if (document) {
        output = {...output, document}
      }
    }

    // by dpns name
    if (/^[^\s.]+(\.[^\s.]+)*$/.test(query)) {
      const identities = await this.identitiesDAO.getIdentitiesByDPNSName(query)

      if (identities) {
        output = {...output, identities}
      }
    }

    // by data-contract name
    if(/^[A-z]/.test(query)) {
      const dataContracts = await this.dataContractsDAO.getDataContractByName(query)

      if (dataContracts) {
        output = {...output, dataContracts}
      }
    }

    if(output!=={}){
      response.send(output)
    }

    response.status(404).send({ message: 'not found' })
  }
}

module.exports = MainController
