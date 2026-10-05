const ValidatorsDAO = require('../dao/ValidatorsDAO')
const TenderdashRPC = require('../tenderdashRpc')
const Validator = require('../models/Validator')
const DashCoreRPC = require('../dashcoreRpc')
const ProTxInfo = require('../models/ProTxInfo')
const GeoIP = require('../geoip')
const { checkTcpConnect, calculateInterval, iso8601duration, getFinalPoSeBanHeight, getPlatformQuorums, getProTxList, blocksUntilCorePayment, getCoreBlockHash, getCoreBlockTime, getCoreNetworkInfo, getCoreYieldPerYear } = require('../utils')
const Epoch = require('../models/Epoch')
const { base58 } = require('@scure/base')
const Intervals = require('../enums/IntervalsEnum')
const ValidatorEarnings = require('../models/ValidatorEarnings')

const cache = require('../cache')
const { VALIDATORS_CACHE_KEY, VALIDATORS_CACHE_LIFE_INTERVAL, CREDITS_PER_DASH, CORE_BLOCKS_PER_DAY } = require('../constants')

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

      const registeredAt = await getCoreBlockTime(proTxInfo?.state?.registeredHeight)

      // the voting identity is derived from the current voting key, its public key hash is
      // the voting address payload without the version byte and the checksum
      const votingIdentity = proTxInfo?.state?.votingAddress
        ? (await this.sdk.utils.createVoterIdentifier(
            validator.proTxHash,
            Buffer.from(base58.decode(proTxInfo.state.votingAddress).subarray(1, 21)).toString('hex')
          )).base58()
        : null

      validatorInfo = Validator.fromObject(
        {
          ...validator,
          isActive,
          proTxInfo: ProTxInfo.fromObject(proTxInfo),
          identity: identifier,
          identityBalance: String(identityBalance),
          epochInfo,
          geoIpInfo: serviceHost ? GeoIP.lookup(serviceHost) : null,
          registeredAt: registeredAt ? new Date(registeredAt).toISOString() : null,
          votingIdentity
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

    const { state } = proTxInfo ?? {}

    const [votingIdentityBalance, masternodes, coreNetworkInfo, registeredCoreBlockHash, lastPaidCoreBlockHash, poseRevivedCoreBlockHash, poseBanCoreBlockHash] = await Promise.all([
      validatorInfo.votingIdentity
        ? this.sdk.identities.getIdentityBalance(validatorInfo.votingIdentity).then(String, () => null)
        : null,
      getProTxList(),
      getCoreNetworkInfo(),
      getCoreBlockHash(state?.registeredHeight),
      getCoreBlockHash(state?.lastPaidHeight),
      getCoreBlockHash(state?.PoSeRevivedHeight),
      getCoreBlockHash(state?.PoSeBanHeight)
    ])

    // a banned or removed masternode is not paid by Core
    const masternode = masternodes
      .find(masternode => masternode.proTxHash.toLowerCase() === validator.proTxHash.toLowerCase())

    const coreYieldPerYear = masternode?.state.PoSeBanHeight === -1
      ? await getCoreYieldPerYear(
        await this.validatorsDAO.getCorePaymentsByMasternode(30 * CORE_BLOCKS_PER_DAY),
        masternode.type,
        masternodes
      )
      : null

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
          endpoints,
          votingIdentityBalance,
          // Core caps the PoSe penalty at the size of the masternode list, at least 100
          poseScoreMax: Math.max(100, masternodes.length),
          blocksUntilCorePayment: blocksUntilCorePayment(validator.proTxHash, masternodes),
          registeredCoreBlockHash,
          lastPaidCoreBlockHash,
          poseRevivedCoreBlockHash,
          poseBanCoreBlockHash,
          coreYieldPerYear,
          ...coreNetworkInfo
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
      const registeredMasternodes = await getProTxList()

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

  getValidatorEpochStatsByProTxHash = async (request, response) => {
    const { hash } = request.params
    const {
      timestamp_start: timestampStart = new Date().getTime() - 3600000,
      timestamp_end: timestampEnd = new Date().getTime()
    } = request.query

    if (!timestampStart || !timestampEnd) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (timestampStart > timestampEnd) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const stats = await this.validatorsDAO.getValidatorEpochStatsByProTxHash(
      hash,
      new Date(timestampStart),
      new Date(timestampEnd)
    )

    if (!stats) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(stats)
  }

  getValidatorEarningsByProTxHash = async (request, response) => {
    const { hash } = request.params
    const {
      timestamp_start: timestampStart = new Date().getTime() - 30 * 86400000,
      timestamp_end: timestampEnd = new Date().getTime()
    } = request.query

    if (!timestampStart || !timestampEnd) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (timestampStart > timestampEnd) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    // the estimate is the gross monthly earnings in DASH by the last 30 days, before the
    // operator and reward shares and expenses, for a masternode Core pays only
    const estimateEnd = new Date()
    const estimateStart = new Date(estimateEnd.getTime() - 30 * 86400000)

    const [earnings, trailingEarnings, masternodes, corePayments] = await Promise.all([
      this.validatorsDAO.getValidatorEarningsByProTxHash(hash, new Date(timestampStart), new Date(timestampEnd)),
      this.validatorsDAO.getValidatorEarningsByProTxHash(hash, estimateStart, estimateEnd),
      getProTxList(),
      this.validatorsDAO.getCorePaymentsByMasternode(30 * CORE_BLOCKS_PER_DAY)
    ])

    if (!earnings) {
      return response.status(404).send({ message: 'not found' })
    }

    const masternode = masternodes
      .find(masternode => masternode.proTxHash.toLowerCase() === hash.toLowerCase())

    const eligible = masternode?.state.PoSeBanHeight === -1

    const [coreYieldPerYear, registeredAt] = eligible
      ? await Promise.all([
        getCoreYieldPerYear(corePayments, masternode.type, masternodes),
        getCoreBlockTime(masternode.state.registeredHeight)
      ])
      : [null, null]

    const corePerMonth = coreYieldPerYear !== null ? coreYieldPerYear * 30 / 365 : null

    // the Platform rewards of a masternode registered during the period are not a month yet
    const platformPerMonth = eligible && registeredAt <= estimateStart.getTime()
      ? trailingEarnings.platform.reward / CREDITS_PER_DASH
      : null

    response.send(
      ValidatorEarnings.fromObject({
        ...earnings,
        estimate: {
          periodDays: 30,
          eligible,
          corePerMonth,
          platformPerMonth,
          totalPerMonth: corePerMonth !== null && platformPerMonth !== null ? corePerMonth + platformPerMonth : null,
          platformHistory: platformPerMonth !== null
            ? {
                firstEpoch: trailingEarnings.platform.firstEpoch,
                lastEpoch: trailingEarnings.platform.lastEpoch,
                startTime: estimateStart.toISOString(),
                endTime: estimateEnd.toISOString(),
                reward: trailingEarnings.platform.reward
              }
            : null
        }
      })
    )
  }
}

module.exports = ValidatorsController
