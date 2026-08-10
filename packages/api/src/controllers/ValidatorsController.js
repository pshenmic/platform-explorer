const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')
const ProTxInfo = require('../models/ProTxInfo')
const GeoIP = require('../geoip')
const { checkTcpConnect, calculateInterval, iso8601duration, getFinalPoSeBanHeight, getPlatformQuorums } = require('../utils')
const Epoch = require('../models/Epoch')
const { base58 } = require('@scure/base')
const Intervals = require('../enums/IntervalsEnum')

const cache = require('../cache')
const { VALIDATORS_CACHE_KEY, VALIDATORS_CACHE_LIFE_INTERVAL } = require('../constants')

class ValidatorsController {
  constructor (knex, sdk) {
    this.validatorsDAO = new ValidatorsDAO(knex)
    this.sdk = sdk
  }

  getValidatorByProTxHash = async (request, response) => {
    const { hash } = request.params

    const [currentEpoch] = await this.sdk.node.getEpochsInfo(1)
    const epochInfo = Epoch.fromObject(currentEpoch)

    const validator = await this.validatorsDAO.getValidatorByProTxHash(hash, epochInfo)

    if (!validator) {
      return response.status(404).send({ message: 'not found' })
    }

    const { validators } = await TenderdashRPC.getValidators()

    // Tenderdash and the indexer store proTxHashes upper case, but the hash can
    // reach this handler lower case — the identity route decodes it from base58
    const isActive = validators.some(validator => validator.pro_tx_hash === hash.toUpperCase())

    const cached = cache.get(`${VALIDATORS_CACHE_KEY}_${validator.proTxHash}`)

    let validatorInfo = null

    if (cached) {
      validatorInfo = cached
    } else {
      const proTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash)
      const identifier = validator.proTxHash ? base58.encode(Buffer.from(validator.proTxHash, 'hex')) : null
      const identityBalance = identifier ? await this.sdk.identities.getIdentityBalance(identifier) : null

      const [serviceHost] = proTxInfo?.state?.service?.match(/^\d+\.\d+\.\d+\.\d+/) ?? [null]

      validatorInfo = Validator.fromObject(
        {
          ...validator,
          isActive,
          proTxInfo: ProTxInfo.fromObject(proTxInfo),
          identity: identifier,
          identityBalance: String(identityBalance),
          epochInfo,
          geoIpInfo: serviceHost ? GeoIP.lookup(serviceHost) : null
        }
      )

      cache.set(`${VALIDATORS_CACHE_KEY}_${validator.proTxHash}`, validatorInfo, VALIDATORS_CACHE_LIFE_INTERVAL)
    }

    // For a validator that has left the masternode list, getProTxInfo resolves
    // its state from the registration block, which reports it as not banned.
    // This endpoint reports the precise final ban state instead (the list
    // endpoint stays coarse). A present validator (no-fallback lookup succeeds)
    // already carries its accurate ban height.
    if (!isActive && validatorInfo.proTxInfo?.state) {
      const currentProTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash, undefined, false)

      if (!currentProTxInfo) {
        validatorInfo.proTxInfo.state.PoSeBanHeight = await getFinalPoSeBanHeight(validator.proTxHash)
      }
    }

    const { proTxInfo } = validatorInfo

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
          ...validatorInfo,
          isActive,
          epochInfo,
          endpoints
        }
      )
    )
  }

  getValidatorQuorumsByProTxHash = async (request, response) => {
    const { hash } = request.params

    const validatorsHashes = await this.validatorsDAO.getValidatorsHashes()

    if (!validatorsHashes.some(validatorHash => validatorHash.toUpperCase() === hash.toUpperCase())) {
      return response.status(404).send({ message: 'not found' })
    }

    const { quorums } = await getPlatformQuorums()

    response.send(
      quorums.filter(quorum =>
        (quorum.members ?? []).some(member => member.proTxHash === hash.toUpperCase()))
    )
  }

  getValidatorByMasternodeIdentifier = async (request, response) => {
    const { identifier } = request.params

    const proTxHash = Buffer.from(base58.decode(identifier)).toString('hex')

    await this.getValidatorByProTxHash({ ...request, params: { hash: proTxHash } }, response)
  }

  getValidators = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc',
      isActive = undefined,
      isBanned = undefined,
      owner,
      blocks_proposed_min: blocksProposedMin,
      blocks_proposed_max: blocksProposedMax,
      last_proposed_block_height_min: lastProposedBlockHeightMin,
      last_proposed_block_height_max: lastProposedBlockHeightMax,
      last_proposed_block_timestamp_start: lastProposedBlockTimestampStart,
      last_proposed_block_timestamp_end: lastProposedBlockTimestampEnd,
      last_proposed_block_hash: lastProposedBlockHash
    } = request.query

    if (blocksProposedMin > blocksProposedMax) {
      return response.status(400).send({ message: 'Bad blocks proposed range' })
    }

    if (lastProposedBlockHeightMin > lastProposedBlockHeightMax) {
      return response.status(400).send({ message: 'Bad last proposed block height range' })
    }

    if (lastProposedBlockTimestampStart && lastProposedBlockTimestampEnd && new Date(lastProposedBlockTimestampStart).getTime() > new Date(lastProposedBlockTimestampEnd).getTime()) {
      return response.status(400).send({ message: 'Bad last proposed block timestamp range' })
    }

    const { validators: activeValidators } = await TenderdashRPC.getValidators()

    const [currentEpoch] = await this.sdk.node.getEpochsInfo(1)
    const epochInfo = Epoch.fromObject(currentEpoch)

    let validatorsWithoutBan = []

    // Ban status is derived from the current masternode list. A validator that
    // has left the list (collateral spent) is treated as banned here: resolving
    // its precise final ban state requires a per-node historical lookup that is
    // too expensive for the list endpoint (see getFinalPoSeBanHeight, used only
    // on the single-validator endpoint).
    if (isBanned !== undefined) {
      const registeredMasternodes = await DashCoreRPC.getProTxList('registered', true)

      validatorsWithoutBan = registeredMasternodes.filter(masternode => masternode.state?.PoSeBanHeight === -1)
    }

    const validators = await this.validatorsDAO.getValidators(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      isActive,
      activeValidators,
      isBanned,
      validatorsWithoutBan,
      owner,
      blocksProposedMin,
      blocksProposedMax,
      lastProposedBlockHeightMin,
      lastProposedBlockHeightMax,
      lastProposedBlockTimestampStart,
      lastProposedBlockTimestampEnd,
      lastProposedBlockHash
    )

    const activeValidatorsHashes = new Set(activeValidators.map(validator => validator.pro_tx_hash))

    const resultSet = await Promise.all(
      validators.resultSet.map(async (validator) => {
        const cached = cache.get(`${VALIDATORS_CACHE_KEY}_${validator.proTxHash}`)

        let validatorInfo = null

        // first run needed for pose ban info, but it doesn't contain all needed info
        // re-cache validators with actual data when they don't have identifier field
        if (cached && cached?.identifier != null) {
          validatorInfo = cached
        } else {
          const proTxInfo = await DashCoreRPC.getProTxInfo(validator.proTxHash)
          const identifier = validator.proTxHash ? base58.encode(Buffer.from(validator.proTxHash, 'hex')) : null
          const identityBalance = identifier ? await this.sdk.identities.getIdentityBalance(identifier) : null

          const [serviceHost] = proTxInfo?.state?.service?.match(/^\d+\.\d+\.\d+\.\d+/) ?? [null]

          validatorInfo = Validator.fromObject(
            {
              ...validator,
              isActive: activeValidatorsHashes.has(validator.proTxHash),
              proTxInfo: ProTxInfo.fromObject(proTxInfo),
              identity: identifier,
              identityBalance: String(identityBalance),
              epochInfo,
              geoIpInfo: serviceHost ? GeoIP.lookup(serviceHost) : null
            }
          )

          cache.set(`${VALIDATORS_CACHE_KEY}_${validator.proTxHash}`, validatorInfo, VALIDATORS_CACHE_LIFE_INTERVAL)
        }

        // isActive is applied outside the per-validator cache: the validator set
        // rotates independently of the cached ProTx and identity data
        return Validator.fromObject({
          ...validatorInfo,
          isActive: activeValidatorsHashes.has(validator.proTxHash)
        })
      }))

    return response.send({
      pagination: validators.pagination,
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

  getValidatorIncomeStatsByProTxHash = async (request, response) => {
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

    const stats = await this.validatorsDAO.getValidatorIncomeStatsByProTxHash(
      hash,
      new Date(timestampStart),
      new Date(timestampEnd),
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
