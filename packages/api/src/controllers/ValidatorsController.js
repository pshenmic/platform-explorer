const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')

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

    const isActive = validators.some(validator => validator.pro_tx_hash === proTxHash)

    response.send(new Validator(validator.proTxHash, isActive, validator.proposedBlocksAmount, validator.lastProposedBlockHeader))
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

    return response.send({
      ...validators,
      resultSet: validators.resultSet.map(validator =>
        new Validator(validator.proTxHash, activeValidators.some(activeValidator =>
          activeValidator.pro_tx_hash === validator.proTxHash),
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader))
    })
  }
}

module.exports = ValidatorsController
