const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')
const ProTxInfo = require('../models/ProTxInfo')
const { calculateInterval } = require('../utils')

class ValidatorsController {
  constructor (knex) {
    this.validatorsDAO = new ValidatorsDAO(knex)
  }

  getValidatorByProTxHash = async (request, response) => {
    const { hash } = request.params

    const validator = await this.validatorsDAO.getValidatorByProTxHash(hash)

    if (!validator) {
      return response.status(404).send({ message: 'not found' })
    }

    const validators = await TenderdashRPC.getValidators()

    const proTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash)

    const isActive = validators.some(validator => validator.pro_tx_hash === hash)

    response.send(
      new Validator(
        validator.proTxHash,
        isActive,
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader,
        ProTxInfo.fromObject(proTxInfo)
      )
    )
  }

  getValidators = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc', isActive = undefined } = request.query

    const activeValidators = await TenderdashRPC.getValidators()

    const validators = await this.validatorsDAO.getValidators(
      Number(page),
      Number(limit),
      order,
      isActive,
      activeValidators
    )

    const validatorsWithInfo = await Promise.all(
      validators.resultSet.map(async (validator) =>
        ({ ...validator, proTxInfo: await DashCoreRPC.getProTxInfo(validator.proTxHash) })))

    return response.send({
      ...validators,
      resultSet: validatorsWithInfo.map(validator =>
        new Validator(
          validator.proTxHash, activeValidators.some(activeValidator =>
            activeValidator.pro_tx_hash === validator.proTxHash),
          validator.proposedBlocksAmount,
          validator.lastProposedBlockHeader,
          ProTxInfo.fromObject(validator.proTxInfo)
        )
      )
    })
  }

  getValidatorStatsByProTxHash = async (request, response) => {
    const { hash } = request.params
    const {
      start = new Date().getTime() - 3600000,
      end = new Date().getTime()
    } = request.query

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const interval = calculateInterval(new Date(start), new Date(end))

    const stats = await this.validatorsDAO.getValidatorStatsByProTxHash(
      hash,
      new Date(start),
      new Date(end),
      interval
    )

    response.send(stats)
  }
}

module.exports = ValidatorsController
