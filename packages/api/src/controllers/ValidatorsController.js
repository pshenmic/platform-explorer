const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')
const ProTxInfo = require('../models/ProTxInfo')
const { checkTcpConnect, calculateInterval } = require('../utils')
const Epoch = require('../models/Epoch')
const { base58 } = require('@scure/base')

class ValidatorsController {
  constructor (knex, dapi) {
    this.validatorsDAO = new ValidatorsDAO(knex)
    this.dapi = dapi
  }

  getValidatorByProTxHash = async (request, response) => {
    const { hash } = request.params

    const [currentEpoch] = await this.dapi.getEpochsInfo(1)
    const epochInfo = Epoch.fromObject(currentEpoch)

    const identifier = base58.encode(Buffer.from(hash, 'hex'))
    const identityBalance = await this.dapi.getIdentityBalance(identifier)

    const validator = await this.validatorsDAO.getValidatorByProTxHash(hash, identifier, epochInfo)

    if (!validator) {
      return response.status(404).send({ message: 'not found' })
    }

    const validators = await TenderdashRPC.getValidators()

    const proTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash)

    const isActive = validators.some(validator => validator.pro_tx_hash === hash)

    const [host] = proTxInfo?.state.service ? proTxInfo?.state.service.match(/^\d+\.\d+\.\d+\.\d+/) : [null]
    const [servicePort] = proTxInfo?.state.service ? proTxInfo?.state.service.match(/\d+$/) : [null]

    const [coreStatus, platformStatus, grpcStatus] = (await Promise.allSettled([
      checkTcpConnect(servicePort, host),
      checkTcpConnect(proTxInfo?.state.platformP2PPort, host),
      checkTcpConnect(proTxInfo?.state.platformHTTPPort, host)
    ])).map((e) => e.value ?? (e.reason?.code ? e.reason?.code : e.message))

    const endpoints = {
      coreP2PPortStatus: {
        host,
        port: Number(servicePort),
        status: coreStatus
      },
      platformP2PPortStatus: {
        host,
        port: Number(proTxInfo?.state.platformP2PPort),
        status: platformStatus
      },
      platformGrpcPortStatus: {
        host,
        port: Number(proTxInfo?.state.platformHTTPPort ?? 0),
        status: grpcStatus
      }
    }

    response.send(
      Validator.fromObject(
        {
          ...validator,
          isActive,
          proTxInfo: ProTxInfo.fromObject(proTxInfo),
          identifier,
          identityBalance,
          epochInfo,
          endpoints
        }
      )
    )
  }

  getValidators = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc', isActive = undefined } = request.query

    const activeValidators = await TenderdashRPC.getValidators()

    const [currentEpoch] = await this.dapi.getEpochsInfo(1)
    const epochInfo = Epoch.fromObject(currentEpoch)

    const validators = await this.validatorsDAO.getValidators(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      isActive,
      activeValidators,
      epochInfo
    )

    const validatorsWithInfo = await Promise.all(
      validators.resultSet.map(async (validator) =>
        ({ ...validator, proTxInfo: await DashCoreRPC.getProTxInfo(validator.proTxHash) })))

    const resultSet = await Promise.all(
      validatorsWithInfo.map(
        async (validator) => {
          const identifier = validator.proTxHash ? base58.encode(Buffer.from(validator.proTxHash, 'hex')) : null
          const identityBalance = identifier ? await this.dapi.getIdentityBalance(identifier) : null

          return Validator.fromObject(
            {
              ...validator,
              isActive: activeValidators.some(activeValidator =>
                activeValidator.pro_tx_hash === validator.proTxHash),
              proTxInfo: ProTxInfo.fromObject(validator.proTxInfo),
              identifier,
              identityBalance,
              epochInfo
            }
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
