const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')
const ProTxInfo = require('../models/ProTxInfo')

class ValidatorsController {
  constructor (knex) {
    this.validatorsDAO = new ValidatorsDAO(knex)
  }

  getValidatorByProTxHash = async (request, response) => {
    const { proTxHash } = request.params

    const validator = await this.validatorsDAO.getValidatorByProTxHash(proTxHash)

    if (!validator) {
      return response.status(404).send({ message: 'not found' })
    }

    const validators = await TenderdashRPC.getValidators()

    const proTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash)

    const isActive = validators.some(validator => validator.pro_tx_hash === proTxHash)

    response.send(
      new Validator(
        validator.proTxHash,
        isActive,
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader,
        ProTxInfo.fromObject(proTxInfo ?? null)))
  }

  getValidators = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc', isActive = undefined } = request.query

    if (order !== 'asc' && order !== 'desc') {
      return response.status(400).send({ message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values` })
    }

    const activeValidators = await TenderdashRPC.getValidators()

    if (typeof isActive !== 'undefined') {
      if (isActive !== 'true' && isActive !== 'false') {
        return response.status(400).send({ message: `invalid isActive value ${order}. only boolean values are accepted` })
      }
    }

    const validators = await this.validatorsDAO.getValidators(
      Number(page),
      Number(limit),
      order,
      typeof isActive === 'undefined' ? undefined : isActive === 'true',
      activeValidators
    )

    const validatorsWithInfo = await Promise.all(
      validators.resultSet.map(async (validator) => ({ ...validator, proTxInfo: await DashCoreRPC.getProTxInfo(validator.proTxHash) })))

    return response.send({
      ...validators,
      resultSet: validatorsWithInfo.map(validator =>
        new Validator(validator.proTxHash, activeValidators.some(activeValidator =>
          activeValidator.pro_tx_hash === validator.proTxHash),
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader,
        ProTxInfo.fromObject(validator.proTxInfo ?? null)
        )
      )
    })
  }
}

module.exports = ValidatorsController
