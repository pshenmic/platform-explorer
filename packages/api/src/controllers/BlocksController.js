const BlocksDAO = require('../dao/BlocksDAO')
const {
  EPOCH_CHANGE_TIME,
  NETWORK,
  REDIS_PUBSUB_NEW_BLOCK_CHANNEL
} = require('../constants')
const DashCoreRPC = require('../dashcoreRpc')
const TenderdashRPC = require('../tenderdashRpc')
const Quorum = require('../models/Quorum')
const QuorumTypeEnum = require('../enums/QuorumTypeEnum')
const RedisNotConnectedError = require('../errors/RedisNotConnectedError')

class BlocksController {
  constructor (knex, sdk, redis) {
    this.blocksDAO = new BlocksDAO(knex, sdk)
    this.sdk = sdk
    this.redis = redis
  }

  getBlockByHash = async (request, response) => {
    const { hash } = request.params

    const block = await this.blocksDAO.getBlockByHash(hash)

    if (!block) {
      return response.status(404).send({ message: 'not found' })
    }

    const { block: blockInfo } = await TenderdashRPC.getBlockByHeight(block.header.height + 1)

    const { last_commit: lastCommit } = blockInfo ?? { last_commit: undefined }

    let quorum = null

    if (lastCommit?.quorum_hash !== '' && lastCommit?.quorum_hash !== undefined) {
      const quorumsList = await DashCoreRPC.getQuorumsListExtended(block.header.l1LockedHeight)

      const quorumType = NETWORK === 'testnet'
        ? QuorumTypeEnum.llmq_25_67
        : QuorumTypeEnum.llmq_100_67

      const quorumTypeName = QuorumTypeEnum[quorumType]

      const quorumInfo = quorumsList[quorumTypeName]
        .find(quorum => Object.keys(quorum).includes(lastCommit.quorum_hash.toLowerCase()))

      const quorumIndex = quorumsList[quorumTypeName]
        .findIndex(quorum => Object.keys(quorum).includes(lastCommit.quorum_hash.toLowerCase()))

      const quorumDetailedInfo = await DashCoreRPC.getQuorumInfo(lastCommit.quorum_hash, quorumType)

      quorum = Quorum.fromObject({
        ...quorumDetailedInfo,
        ...(quorumInfo ?? [])[lastCommit.quorum_hash.toLowerCase()],
        quorumIndex
      })
    }

    response.send(
      {
        ...block,
        header: {
          ...block.header
        },
        quorum
      }
    )
  }

  getBlocksByValidator = async (request, response) => {
    const { validator } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const block = await this.blocksDAO.getBlocksByValidator(validator, Number(page ?? 1), Number(limit ?? 10), order)

    if (!block) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(block)
  }

  getBlocks = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc',
      epoch_index_min: epochIndexMin,
      epoch_index_max: epochIndexMax,
      gas_min: gasMin,
      gas_max: gasMax,
      validator,
      height_max: heightMax,
      height_min: heightMin,
      tx_count_min: transactionCountMin,
      tx_count_max: transactionCountMax,
      timestamp_start: timestampStart,
      timestamp_end: timestampEnd
    } = request.query

    let epochStartTimestamp
    let epochEndTimestamp

    if (gasMin && gasMax && gasMax < gasMin) {
      return response.status(400).send('Bad gas range')
    }

    if (heightMin && heightMax && heightMax < heightMin) {
      return response.status(400).send('Bad height range')
    }

    if (transactionCountMin && transactionCountMax && transactionCountMax < transactionCountMin) {
      return response.status(400).send('Bad transaction range')
    }

    if (timestampStart && !timestampEnd) {
      return response.status(400).send('Request must have start and end timestamps')
    }

    if (epochIndexMin) {
      if (epochIndexMax <= epochIndexMin) {
        return response.status(400).send('Bad epochs range')
      }

      const [startEpoch] = await this.sdk.node.getEpochsInfo(
        1,
        true,
        Number(epochIndexMin)
      )

      epochStartTimestamp = startEpoch?.startTime

      if (epochIndexMax) {
        const [endEpoch] = await this.sdk.node.getEpochsInfo(
          1,
          Number(epochIndexMax),
          true
        )
        epochEndTimestamp = endEpoch?.startTime + EPOCH_CHANGE_TIME
      } else {
        epochEndTimestamp = new Date().getTime()
      }
    }

    const blocks = await this.blocksDAO.getBlocks(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      validator,
      gasMin,
      gasMax,
      heightMin,
      heightMax,
      timestampStart,
      timestampEnd,
      epochStartTimestamp,
      epochEndTimestamp,
      transactionCountMin,
      transactionCountMax
    )

    response.send(blocks)
  }

  subscribeBlock = async (request, response) => {
    if (!this.redis) {
      throw new RedisNotConnectedError()
    }

    const callback = async (channel, message) => {
      if (channel === REDIS_PUBSUB_NEW_BLOCK_CHANNEL) {
        const { blockHeight } = JSON.parse(message)

        const block = await this.blocksDAO.getBlockByHeight(blockHeight)

        response.sse({
          data: JSON.stringify(block),
          event: 'block',
          id: String(blockHeight)
        })
      }
    }

    await this.redis.subscribeMessages(callback)

    const lastBlock = await this.blocksDAO.getLastBlock()

    response.sse({
      data: JSON.stringify(lastBlock ?? { error: 'no blocks' }),
      event: 'block',
      id: String(-1)
    })

    request.raw.on('close', () => {
      this.redis.unsubscribeMessages(callback)
    })
  }
}

module.exports = BlocksController
