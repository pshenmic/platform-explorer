const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')
const ProTxInfo = require('../models/ProTxInfo')
const { checkTcpConnect, calculateInterval, iso8601duration } = require('../utils')
const Epoch = require('../models/Epoch')
const { base58 } = require('@scure/base')
const Intervals = require('../enums/IntervalsEnum')

class ValidatorsController {
  constructor (knex, dapi) {
    this.validatorsDAO = new ValidatorsDAO(knex, dapi)
    this.dapi = dapi
  }

  getValidatorByProTxHash = async (request, response) => {
    const { hash } = request.params

    const [currentEpoch] = await this.dapi.getEpochsInfo(1)
    const epochInfo = Epoch.fromObject(currentEpoch)

    const validator = await this.validatorsDAO.getValidatorByProTxHash(hash, epochInfo)

    if (!validator) {
      return response.status(404).send({ message: 'not found' })
    }

    const validators = await TenderdashRPC.getValidators()

    const proTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash)

    const isActive = validators.some(validator => validator.pro_tx_hash === hash)

    const [host] = proTxInfo?.state?.service?.match(/^\d+\.\d+\.\d+\.\d+/) ?? [null]
    const [servicePort] = proTxInfo?.state?.service?.match(/\d+$/) ?? [null]

    const [coreStatus, platformStatus, grpcStatus] = (await Promise.allSettled([
      checkTcpConnect(servicePort, host),
      checkTcpConnect(proTxInfo?.state.platformP2PPort, host),
      checkTcpConnect(proTxInfo?.state.platformHTTPPort, host)
    ])).map(
      (e) => ({
        status: e.value ?? e.reason?.code,
        message: e.reason?.message ?? null
      }))

    const endpoints = {
      coreP2PPortStatus: {
        host,
        port: Number(servicePort),
        ...coreStatus
      },
      platformP2PPortStatus: {
        host,
        port: Number(proTxInfo?.state.platformP2PPort),
        ...platformStatus
      },
      platformGrpcPortStatus: {
        host,
        port: Number(proTxInfo?.state.platformHTTPPort ?? 0),
        ...grpcStatus
      }
    }

    response.send(
      Validator.fromObject(
        {
          ...validator,
          isActive,
          proTxInfo: ProTxInfo.fromObject(proTxInfo),
          epochInfo,
          endpoints
        }
      )
    )
  }

  getValidatorByMasternodeIdentifier = async (request, response) => {
    const { identifier } = request.params

    const proTxHash = Buffer.from(base58.decode(identifier)).toString('hex')

    await this.getValidatorByProTxHash({ ...request, params: { hash: proTxHash } }, response)
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
              identity: identifier,
              identityBalance: String(identityBalance),
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
      timestamp_start: start = new Date().getTime() - 3600000,
      timestamp_end: end = new Date().getTime(),
      intervalsCount = null
    } = request.query

    if (!start || !end) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const intervalInMs =
      Math.ceil(
        (new Date(end).getTime() - new Date(start).getTime()) / Number(intervalsCount ?? NaN) / 1000
      ) * 1000

    const interval = intervalsCount
      ? iso8601duration(intervalInMs)
      : calculateInterval(new Date(start), new Date(end))

    const stats = await this.validatorsDAO.getValidatorStatsByProTxHash(
      hash,
      new Date(start),
      new Date(end),
      interval,
      isNaN(intervalInMs) ? Intervals[interval] : intervalInMs
    )

    response.send(stats)
  }

  getValidatorRewardStatsByProTxHash = async (request, response) => {
    const { hash } = request.params
    const {
      timestamp_start: timestampStart = new Date().getTime() - 3600000,
      timestamp_end: timestampEnd = new Date().getTime(),
      intervalsCount = null
    } = request.query

    if (!timestampStart || !timestampEnd) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (timestampStart > timestampEnd) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const intervalInMs =
      Math.ceil(
        (new Date(timestampEnd).getTime() - new Date(timestampStart).getTime()) / Number(intervalsCount ?? NaN) / 1000
      ) * 1000

    const interval = intervalsCount
      ? iso8601duration(intervalInMs)
      : calculateInterval(new Date(timestampStart), new Date(timestampEnd))

    const stats = await this.validatorsDAO.getValidatorRewardStatsByProTxHash(
      hash,
      new Date(timestampStart),
      new Date(timestampEnd),
      interval,
      isNaN(intervalInMs) ? Intervals[interval] : intervalInMs
    )

    response.send(stats)
  }
}

module.exports = ValidatorsController
