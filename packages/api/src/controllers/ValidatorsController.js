const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')

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

    const proTxInfo = await DashCoreRPC.getValidatorInfo(validator.proTxHash)

    const isActive = validators.some(validator => validator.pro_tx_hash === proTxHash)

    response.send(
      new Validator(
        validator.proTxHash,
        isActive,
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader,
        proTxInfo
          ? {
              type: proTxInfo.type,
              collateralHash: proTxInfo.collateralHash,
              collateralIndex: proTxInfo.collateralIndex,
              collateralAddress: proTxInfo.collateralAddress,
              operatorReward: proTxInfo.operatorReward,
              confirmations: proTxInfo.confirmations,
              state: proTxInfo.state
            }
          : null))
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

    for (let i = 0; i < validators.resultSet.length; i++) {
      const proTxInfo = await DashCoreRPC.getValidatorInfo(validators.resultSet[i].proTxHash)
      validators.resultSet[i].proTxInfo = proTxInfo
        ? {
            type: proTxInfo.type,
            collateralHash: proTxInfo.collateralHash,
            collateralIndex: proTxInfo.collateralIndex,
            collateralAddress: proTxInfo.collateralAddress,
            operatorReward: proTxInfo.operatorReward,
            confirmations: proTxInfo.confirmations,
            state: proTxInfo.state
          }
        : null
    }

    return response.send({
      ...validators,
      resultSet: validators.resultSet.map(validator =>
        new Validator(validator.proTxHash, activeValidators.some(activeValidator =>
          activeValidator.pro_tx_hash === validator.proTxHash),
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader, validator.proTxInfo))
    })
  }
}

module.exports = ValidatorsController