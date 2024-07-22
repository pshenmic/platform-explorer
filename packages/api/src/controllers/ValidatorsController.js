const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')
const ProTxInfo = require('../models/ProTxInfo')
const ServiceNotAvailableError = require('../errors/ServiceNotAvailableError')

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

    let proTxInfo

    try {
      proTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash)
    } catch (error) {
      if (error.code === -8) {
        proTxInfo = null
      } else {
        throw new ServiceNotAvailableError()
      }
    }

    const isActive = validators.some(validator => validator.pro_tx_hash === hash)

    response.send(
      new Validator(
        validator.proTxHash,
        isActive,
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader,
        proTxInfo
          ? ProTxInfo.fromObject(proTxInfo)
          : null))
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
        new Validator(validator.proTxHash, activeValidators.some(activeValidator =>
          activeValidator.pro_tx_hash === validator.proTxHash),
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader,
        validator.proTxInfo
          ? ProTxInfo.fromObject(validator.proTxInfo)
          : null
        )
      )
    })
  }

  getValidatorStatsByProTxHash = async (request, response) => {
    const { hash } = request.params
    const { timespan = '1h' } = request.query

    const possibleValues = ['1h', '24h', '3d', '1w']

    if (possibleValues.indexOf(timespan) === -1) {
      return response.status(400)
        .send({ message: `invalid timespan value ${timespan}. only one of '${possibleValues}' is valid` })
    }

    const stats = await this.validatorsDAO.getValidatorStatsByProTxHash(hash, timespan)

    response.send(stats)
  }
}

module.exports = ValidatorsController
