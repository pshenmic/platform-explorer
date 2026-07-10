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
    const { index } = request.params

    try {
      const [currentEpoch, nextEpoch] = await this.sdk.node.getEpochsInfo(2, index ? true : undefined, index ?? undefined)

      const epochObject = typeof index === 'number' ? { ...currentEpoch, nextEpoch } : { ...nextEpoch }

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
