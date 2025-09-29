const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')
const IdentitiesDAO = require('../dao/IdentitiesDAO')
const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Epoch = require('../models/Epoch')
const {base58} = require('@scure/base')
const DashCoreRPC = require('../dashcoreRpc')
const TokensDAO = require('../dao/TokensDAO')
const {REDIS_PUBSUB_NEW_BLOCK_CHANNEL} = require("../constants");
const StateTransitionEnum = require('../enums/StateTransitionEnum');
const MasternodeVotesDAO = require("../dao/MasternodeVotesDAO");
const {decodeStateTransition} = require("../utils");
const BatchEnum = require("../enums/BatchEnum");

const API_VERSION = require('../../package.json').version

class MainController {
  constructor(knex, sdk, redis) {
    this.dataContractsDAO = new DataContractsDAO(knex, sdk)
    this.transactionsDAO = new TransactionsDAO(knex, sdk)
    this.documentsDAO = new DocumentsDAO(knex, sdk)
    this.identitiesDAO = new IdentitiesDAO(knex, sdk)
    this.masternodeVotesDAO = new MasternodeVotesDAO(knex, sdk)
    this.redis = redis
    this.validatorsDAO = new ValidatorsDAO(knex)
    this.blocksDAO = new BlocksDAO(knex, sdk)
    this.tokensDAO = new TokensDAO(knex, sdk)
    this.sdk = sdk
  }

  getStatus = async (request, response) => {
    const [currentBlock, stats, status, tdStatus, epochsInfo, totalCredits, totalCollectedFeesDay] = (await Promise.allSettled([
      this.blocksDAO.getLastBlock(),
      this.blocksDAO.getStats(),
      this.sdk.node.status(),
      TenderdashRPC.getStatus(),
      this.sdk.node.getEpochsInfo(1),
      this.sdk.node.totalCredits(),
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
        version: status?.version?.software?.tenderdash ?? null,
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
          dapi: status?.version?.software?.dapi ?? null,
          drive: status?.version?.software?.drive ?? null,
          tenderdash: status?.version?.software?.tenderdash ?? null
        },
        protocol: {
          tenderdash: {
            p2p: status?.version?.protocol?.tenderdash.p2p ?? null,
            block: status?.version?.protocol?.tenderdash.block ?? null
          },
          drive: {
            latest: status?.version?.protocol?.drive.latest ?? null,
            current: status?.version?.protocol?.drive.current ?? null
          }
        }
      }
    })
  }

  search = async (request, response) => {
    const {query} = request.query

    let result = {}

    const epoch = Epoch.fromObject({
      startTime: 0,
      endTime: 0
    })

    if (/^[0-9]+$/.test(query)) {
      // search block by height
      const block = await this.blocksDAO.getBlockByHeight(query)

      if (block) {
        result = {...result, blocks: [block]}
      }
    }

    if (/^[0-9A-f]{64,64}$/.test(query)) {
      // search block by hash
      const block = await this.blocksDAO.getBlockByHash(query)

      if (block) {
        result = {...result, blocks: [block]}
      }

      // search transactions
      const transaction = await this.transactionsDAO.getTransactionByHash(query)

      if (transaction) {
        result = {...result, transactions: [transaction]}
      }

      // search validators by hash
      const validator = await this.validatorsDAO.getValidatorByProTxHash(query, epoch)

      if (validator) {
        result = {...result, validators: [validator]}
      }
    }

    // check for any Identifiers (identities, data contracts, documents)
    if (/^[0-9A-z]{43,44}$/.test(query)) {
      // search identites
      const identity = await this.identitiesDAO.getIdentityByIdentifier(query)

      if (identity) {
        result = {...result, identities: [identity]}
      }

      // search validator by MasterNode identity
      const proTxHash = Buffer.from(base58.decode(query)).toString('hex')

      const validator = await this.validatorsDAO.getValidatorByProTxHash(proTxHash, epoch)

      if (validator) {
        result = {...result, validators: [validator]}
      }

      // search data contract by id
      const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(query)

      if (dataContract) {
        result = {...result, dataContracts: [dataContract]}
      }

      // search documents
      const document = await this.documentsDAO.getDocumentByIdentifier(query)

      if (document) {
        result = {...result, documents: [document]}
      }

      const token = await this.tokensDAO.getTokenByIdentifier(query)

      if (token) {
        result = {...result, tokens: [token]}
      }
    }

    // by dpns name
    const identities = await this.identitiesDAO.getIdentitiesByDPNSName(query)

    if (identities) {
      if (result.identities) {
        result.identities.push(identities)
      } else {
        result = {...result, identities}
      }
    }

    // by token name
    const {resultSet: tokens} = await this.tokensDAO.getTokensByName(query, 1, 20, 'desc')

    if (tokens.length > 0) {
      if (result.tokens) {
        result.tokens.push(tokens)
      } else {
        result = {...result, tokens}
      }
    }

    // by data-contract name
    const dataContracts = await this.dataContractsDAO.getDataContractByName(query)

    if (dataContracts) {
      if (result.dataContracts) {
        result.dataContracts.push(dataContracts)
      } else {
        result = {...result, dataContracts}
      }
    }

    if (Object.keys(result).length === 0) {
      return response.status(404).send({message: 'not found'})
    }

    response.send(result)
  }

  getQuorumInfo = async (request, response) => {
    const {quorumType, quorumHash} = request.query

    if (!quorumType) {
      return response.status(400).send({message: 'quorumType must be provided.'})
    }

    let lastQuorumHash

    if (!quorumHash) {
      const block = await this.blocksDAO.getLastBlock()

      const {block: blockInfo} = await TenderdashRPC.getBlockByHeight(block.header.height)

      const {last_commit: lastCommit} = blockInfo ?? {last_commit: undefined}

      if (!lastCommit) {
        return response.status(500).send({message: 'Last Commit not found try to provide quorum hash manually'})
      }

      lastQuorumHash = lastCommit.quorum_hash
    }

    const quorumInfo = await DashCoreRPC.getQuorumInfo(quorumHash ?? lastQuorumHash, quorumType)

    response.send(quorumInfo)
  }

  test = async (request, response) => {
    response.sse({
      data: JSON.stringify({message: 'listening'}),
      comment: 'initial message'
    })

    const redis = await this.redis.duplicate();

    await redis.connect()

    await redis.subscribe(REDIS_PUBSUB_NEW_BLOCK_CHANNEL, async (blockInfo) => {
      const {txIds, blockHeight} = JSON.parse(blockInfo)

      const block = await this.blocksDAO.getBlockByHeight(blockHeight)
      const txs = await this.transactionsDAO.getTransactionsByIds(txIds)

      const txsWithData = await Promise.all(txs.map(async (tx) => ({
        ...tx,
        details: await decodeStateTransition(tx.data),
      })))

      response.sse({
        data: JSON.stringify({
          block,
          txs: txsWithData
        })
      })
    })

    request.raw.on('close', async () => {
      await redis.destroy()
    })
  }
}

module.exports = MainController
