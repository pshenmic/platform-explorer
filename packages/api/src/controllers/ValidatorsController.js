const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')
const ProTxInfo = require('../models/ProTxInfo')
const { isConnectable } = require('../utils')
const ConnectionData = require('../models/ConnectionData')
const Epoch = require('../models/Epoch')
const { base58 } = require('@scure/base')
const IdentitiesDAO = require('../dao/IdentitiesDAO')

class ValidatorsController {
  constructor (knex, dapi) {
    this.validatorsDAO = new ValidatorsDAO(knex)
    this.identityDAO = new IdentitiesDAO(knex)
    this.dapi = dapi
  }

  getValidatorByProTxHash = async (request, response) => {
    const { hash } = request.params

    const [currentEpoch] = await this.dapi.getEpochsInfo(1)
    const epoch = Epoch.fromObject(currentEpoch)

    const validatorIdentifier = base58.encode(Buffer.from(hash, 'hex'))
    const validatorBalance = await this.dapi.getIdentityBalance(validatorIdentifier)

    const validator = await this.validatorsDAO.getValidatorByProTxHash(hash, validatorIdentifier, epoch.startTime, epoch.endTime)

    if (!validator) {
      return response.status(404).send({ message: 'not found' })
    }

    const validators = await TenderdashRPC.getValidators()

    const proTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash)

    const isActive = validators.some(validator => validator.pro_tx_hash === hash)

    const connectionInfo = proTxInfo?.state
      ? await isConnectable(proTxInfo?.state)
      : ConnectionData.fromObject({
        serviceConnectable: false,
        p2pConnectable: false,
        httpConnectable: false,
        p2pResponse: null
      })

    response.send(
      new Validator(
        validator.proTxHash,
        isActive,
        validator.proposedBlocksAmount,
        validator.lastProposedBlockHeader,
        ProTxInfo.fromObject({
          ...proTxInfo,
          state: {
            ...proTxInfo.state,
            connectionInfo
          }
        }),
        validator.totalReward,
        validator.epochReward,
        validator.withdrawlsCount,
        validator.lastWithdrawl,
        validatorIdentifier,
        validatorBalance,
        epoch
      )
    )
  }

  getValidators = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc', isActive = undefined } = request.query

    const activeValidators = await TenderdashRPC.getValidators()

    const [currentEpoch] = await this.dapi.getEpochsInfo(1)
    const epoch = Epoch.fromObject(currentEpoch)

    const validators = await this.validatorsDAO.getValidators(
      Number(page),
      Number(limit),
      order,
      isActive,
      activeValidators,
      epoch.startTime,
      epoch.endTime
    )

    const validatorsWithInfo = await Promise.all(
      validators.resultSet.map(async (validator) =>
        ({ ...validator, proTxInfo: await DashCoreRPC.getProTxInfo(validator.proTxHash) })))

    const resultSet = await Promise.all(
      validatorsWithInfo.map(
        async (validator) => {
          const validatorIdentifier = validator.proTxHash ? base58.encode(Buffer.from(validator.proTxHash, 'hex')) : null
          const validatorBalance = validatorIdentifier ? await this.dapi.getIdentityBalance(validatorIdentifier) : null

          return new Validator(
            validator.proTxHash,
            activeValidators.some(activeValidator =>
              activeValidator.pro_tx_hash === validator.proTxHash),
            validator.proposedBlocksAmount,
            validator.lastProposedBlockHeader,
            ProTxInfo.fromObject(validator.proTxInfo),
            validator.totalReward,
            validator.epochReward,
            null,
            null,
            validatorIdentifier,
            validatorBalance,
            epoch
          )
        }
      )
    )

    return response.send({
      ...validators,
      resultSet
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
