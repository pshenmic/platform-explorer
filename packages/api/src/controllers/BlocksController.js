const BlocksDAO = require('../dao/BlocksDAO')
const { EPOCH_CHANGE_TIME } = require('../constants')
const DashCoreRPC = require('../dashcoreRpc')
const TenderdashRPC = require('../tenderdashRpc')
const Quorum = require('../models/Quorum')
const QuorumTypeEnum = require('../enums/QuorumTypeEnum')

class BlocksController {
  constructor (knex, dapi) {
    this.blocksDAO = new BlocksDAO(knex, dapi)
    this.dapi = dapi
  }

  getBlockByHash = async (request, response) => {
    const { hash } = request.params

    const block = await this.blocksDAO.getBlockByHash(hash)

    if (!block) {
      return response.status(404).send({ message: 'not found' })
    }

    const {
      block: {
        header: {
          app_hash: appHash
        }
      }
    } = await TenderdashRPC.getBlockByHash(block.header.hash)

    const { block: blockInfo } = await TenderdashRPC.getBlockByHeight(block.header.height + 1)

    const { last_commit: lastCommit } = blockInfo ?? { last_commit: undefined }

    let quorum = null

    if (lastCommit?.quorum_hash !== '' && lastCommit?.quorum_hash !== undefined) {
      const quorumsList = await DashCoreRPC.getQuorumsListExtended(block.header.l1LockedHeight)

      const quorumsTypes = Object.keys(quorumsList)

      const [quorumType] = quorumsTypes
        .filter(type =>
          quorumsList[type]
            .some(quorum =>
              Object.keys(quorum).includes(lastCommit.quorum_hash.toLowerCase()
              )
            )
        )

      const quorumInfo = quorumsList[quorumType]
        .find(quorum => Object.keys(quorum).includes(lastCommit.quorum_hash.toLowerCase()))

      const quorumDetailedInfo = await DashCoreRPC.getQuorumInfo(lastCommit.quorum_hash, QuorumTypeEnum[quorumType])

      quorum = Quorum.fromObject({ ...quorumDetailedInfo, ...quorumInfo[lastCommit.quorum_hash.toLowerCase()] })
    }

    response.send(
      {
        ...block,
        header: {
          ...block.header,
          appHash: appHash ?? null
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
      start_epoch_index: startEpochIndex,
      end_epoch_index: endEpochIndex,
      gas_min: gasMin,
      gas_max: gasMax,
      validator,
      height_max: heightMax,
      height_min: heightMin,
      transactions_count_min: transactionCountMin,
      transactions_count_max: transactionCountMax,
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

    if (startEpochIndex) {
      if (endEpochIndex <= startEpochIndex) {
        return response.status(400).send('Bad epochs range')
      }

      const [startEpoch] = await this.dapi.getEpochsInfo(
        1,
        Number(startEpochIndex),
        true
      )

      epochStartTimestamp = startEpoch?.startTime

      if (endEpochIndex) {
        const [endEpoch] = await this.dapi.getEpochsInfo(
          1,
          Number(endEpochIndex),
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
}

module.exports = BlocksController
