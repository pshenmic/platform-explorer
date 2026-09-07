const EpochDAO = require('../dao/EpochDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const Epoch = require('../models/Epoch')

class EpochController {
  epochDAO
  blocksDAO

  constructor (knex, sdk) {
    this.epochDAO = new EpochDAO(knex)
    this.blocksDAO = new BlocksDAO(knex)
    this.sdk = sdk
  }

  getEpochByIndex = async (request, response) => {
    const rawIndex = request.params?.index
    const hasIndex = rawIndex !== undefined && rawIndex !== null && rawIndex !== ''
    const index = hasIndex ? Number(rawIndex) : undefined

    try {
      const [requestedEpoch, followingEpoch] = await this.sdk.node.getEpochsInfo(
        2,
        hasIndex ? true : undefined,
        hasIndex ? index : undefined
      )

      const epochObject = { ...(requestedEpoch ?? followingEpoch), nextEpoch: followingEpoch } : { ...nextEpoch }

      // Finalized info is only available for already-completed epochs, so the
      // current (in-progress) epoch is expected to reject here.
      let finalizedEpochInfo
      try {
        [finalizedEpochInfo] = await this.sdk.node
          .getFinalizedEpochsInfo(epochObject.number, true, epochObject.number + 1, false)
      } catch (e) {
        finalizedEpochInfo = undefined
      }

      const epoch = Epoch.fromObject({ ...epochObject, finalizedEpochInfo })

      const epochInfo = await this.epochDAO.getEpochByObject(epoch)

      response.send(epochInfo)
    } catch (e) {
      console.error(e)

      response.status(400).send({ message: 'not found' })
    }
  }
}

module.exports = EpochController
