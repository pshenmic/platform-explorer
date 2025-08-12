const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')
const IdentitiesDAO = require('../dao/IdentitiesDAO')
const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Epoch = require('../models/Epoch')
const { base58 } = require('@scure/base')
const DashCoreRPC = require('../dashcoreRpc')
const QuorumTypeEnum = require('../enums/QuorumTypeEnum')

const API_VERSION = require('../../package.json').version

class MainController {
  constructor (knex, dapi, client) {
    this.blocksDAO = new BlocksDAO(knex, dapi)
    this.dataContractsDAO = new DataContractsDAO(knex, client, dapi)
    this.documentsDAO = new DocumentsDAO(knex, dapi, client)
    this.transactionsDAO = new TransactionsDAO(knex, dapi)
    this.identitiesDAO = new IdentitiesDAO(knex, dapi, client)
    this.validatorsDAO = new ValidatorsDAO(knex, dapi)
    this.dapi = dapi
  }

  getStatus = async (request, response) => {
    const [currentBlock, stats, status, tdStatus, epochsInfo, totalCredits, totalCollectedFeesDay] = (await Promise.allSettled([
      this.blocksDAO.getLastBlock(),
      this.blocksDAO.getStats(),
      this.dapi.getStatus(),
      TenderdashRPC.getStatus(),
      this.dapi.getEpochsInfo(1),
      this.dapi.getTotalCredits(),
      this.transactionsDAO.getCollectedFees('24h')
    ])).map((e) => e.value ?? null)

    const [epochInfo] = epochsInfo ?? []

    const epoch = epochInfo ? Epoch.fromObject(epochInfo) : null

    const tdHeight = tdStatus?.highestBlock?.height
    const indexerHeight = currentBlock.header.height

    const indexerSynced = (tdHeight - indexerHeight) <= 1

    response.send({
      epoch,
      transactionsCount: stats?.transactionsCount,
      totalCredits: String(totalCredits),
      totalCollectedFeesDay,
      transfersCount: stats?.transfersCount,
      dataContractsCount: stats?.dataContractsCount,
      documentsCount: stats?.documentsCount,
      identitiesCount: stats?.identitiesCount,
      network: tdStatus?.network ?? null,
      api: {
        version: API_VERSION,
        block: {
          height: currentBlock?.header?.height ?? null,
          hash: currentBlock?.header?.hash ?? null,
          timestamp: currentBlock?.header?.timestamp.toISOString() ?? null
        }
      },
      tenderdash: {
        version: status?.version?.tenderdashVersion ?? null,
        block: {
          height: tdStatus?.highestBlock?.height ?? null,
          hash: tdStatus?.highestBlock?.hash ?? null,
          timestamp: tdStatus?.highestBlock?.timestamp ?? null
        }
      },
      indexer: {
        status: indexerSynced ? 'synced' : 'syncing',
        syncProgress: indexerHeight / tdHeight * 100
      },
      versions: {
        software: {
          dapi: status?.version?.dapiVersion ?? null,
          drive: status?.version?.driveVersion ?? null,
          tenderdash: status?.version?.tenderdashVersion ?? null
        },
        protocol: {
          tenderdash: {
            p2p: status?.version?.tenderdashP2pProtocol ?? null,
            block: status?.version?.tenderdashBlockProtocol ?? null
          },
          drive: {
            latest: status?.version?.driveLatestProtocol ?? null,
            current: status?.version?.driveCurrentProtocol ?? null
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
        result = { ...result, blocks: [block] }
      }
    }

    if (/^[0-9A-f]{64,64}$/.test(query)) {
      // search block by hash
      const block = await this.blocksDAO.getBlockByHash(query)

      if (block) {
        result = { ...result, blocks: [block] }
      }

      // search transactions
      const transaction = await this.transactionsDAO.getTransactionByHash(query)

      if (transaction) {
        result = { ...result, transactions: [transaction] }
      }

      // search validators by hash
      const validator = await this.validatorsDAO.getValidatorByProTxHash(query, epoch)

      if (validator) {
        result = { ...result, validators: [validator] }
      }
    }

    // check for any Identifiers (identities, data contracts, documents)
    if (/^[0-9A-z]{43,44}$/.test(query)) {
      // search identites
      const identity = await this.identitiesDAO.getIdentityByIdentifier(query)

      if (identity) {
        result = { ...result, identities: [identity] }
      }

      // search validator by MasterNode identity
      const proTxHash = Buffer.from(base58.decode(query)).toString('hex')

      const validator = await this.validatorsDAO.getValidatorByProTxHash(proTxHash, epoch)

      if (validator) {
        result = { ...result, validators: [validator] }
      }

      // search data contract by id
      const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(query)

      if (dataContract) {
        result = { ...result, dataContracts: [dataContract] }
      }

      // search documents
      const document = await this.documentsDAO.getDocumentByIdentifier(query)

      if (document) {
        result = { ...result, documents: [document] }
      }
    }

    // by dpns name
    const identities = await this.identitiesDAO.getIdentitiesByDPNSName(query)

    if (identities) {
      if (result.identities) {
        result.identities.push(identities)
      } else {
        result = { ...result, identities }
      }
    }

    // by data-contract name
    const dataContracts = await this.dataContractsDAO.getDataContractByName(query)

    if (dataContracts) {
      if (result.dataContracts) {
        result.dataContracts.push(dataContracts)
      } else {
        result = { ...result, dataContracts }
      }
    }

    if (Object.keys(result).length === 0) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(result)
  }

  getQuorum = async (request, response) => {
    const { quorum_type: quorumType, quorum_hash: quorumHash } = request.query

    try {
      const quorumDetailedInfo = await DashCoreRPC.getQuorumInfo(quorumHash, QuorumTypeEnum[quorumType])

      response.send(quorumDetailedInfo)
    } catch (error) {
      response.status(404).send({ message: 'Quorum not found' })
    }
  }
}

module.exports = MainController
