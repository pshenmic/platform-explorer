const crypto = require('crypto')
const StateTransitionEnum = require('./enums/StateTransitionEnum')
const DocumentActionEnum = require('./enums/DocumentActionEnum')
const net = require('net')
const { TCP_CONNECT_TIMEOUT, NETWORK, DPNS_CONTRACT } = require('./constants')
const { base58 } = require('@scure/base')
const Intervals = require('./enums/IntervalsEnum')
const dashcorelib = require('@dashevo/dashcore-lib')
const Alias = require('./models/Alias')
const TokenTransitionEnum = require('./enums/TokenTransitionsEnum')
const {
  StateTransitionWASM,
  BatchTransitionWASM,
  DataContractCreateTransitionWASM,
  IdentityCreateTransitionWASM, IdentityTopUpTransitionWASM, DataContractUpdateTransitionWASM,
  IdentityUpdateTransitionWASM, IdentityCreditTransferWASM, IdentityCreditWithdrawalTransitionWASM,
  MasternodeVoteTransitionWASM, PlatformVersionWASM, DataContractWASM
} = require('pshenmic-dpp')
const BatchEnum = require('./enums/BatchEnum')
const dpnsContract = require('../data_contracts/dpns.json')
const { ContestedStateResultType } = require('dash-platform-sdk/src/types')
const PreProgrammedDistribution = require('./models/PreProgrammedDistribution')
const Token = require('./models/Token')
const PerpetualDistribution = require('./models/PerpetualDistribution')

const getKnex = () => {
  return require('knex')({
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASS,
      ssl: process.env.POSTGRES_SSL ? { rejectUnauthorized: false } : false
    }
  })
}

const hash = (data) => {
  return crypto.createHash('sha1').update(data).digest('hex')
}

const convertToHomographSafeChars = (input) => {
  return input.toLowerCase().replace(/[oli]/g, (match) => {
    if (match === 'o') {
      return '0'
    }
    if (match === 'l' || match === 'i') {
      return '1'
    }
    return match
  })
}

/**
 * allows to get address from output script
 * @param {Buffer} script
 * @returns {String}
 */

const outputScriptToAddress = (script) => {
  const address = dashcorelib.Script(script).toAddress(NETWORK)
  return address ? address.toString() : null
}

const fetchTokenInfoByRows = async (rows, sdk) => {
  const dataContractsWithTokens = await Promise.all(rows.map(async (row) => {
    const dataContract = await sdk.dataContracts.getDataContractByIdentifier(row.data_contract_identifier)

    if (!dataContract) {
      return undefined
    }

    const tokensPositions = Object.keys(dataContract.tokens)

    return await Promise.all(tokensPositions.map(async (tokenPosition) => {
      const tokenIdentifier =
        row.tokens?.find(token => token.position === Number(tokenPosition))?.token_identifier ?? row.identifier

      if (!tokenIdentifier) {
        return undefined
      }

      const tokenConfig = dataContract.tokens[tokenPosition]

      const tokenTotalSupply = await sdk.tokens.getTokenTotalSupply(tokenIdentifier)

      const [aliasDocument] = await sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', dataContract.ownerId.base58()]], 1)

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      const { perpetualDistribution, preProgrammedDistribution } = tokenConfig?.distributionRules ?? {}

      const preProgrammedDistributions = preProgrammedDistribution?.distributions

      const preProgrammedDistributionTimestamps = preProgrammedDistributions ? Object.keys(preProgrammedDistributions) : undefined

      const preProgrammedDistributionNormal = preProgrammedDistributionTimestamps?.map((timestamp) => PreProgrammedDistribution.fromWASMObject({ timestamp, value: preProgrammedDistributions[timestamp] }))

      let priceTx = null

      if (row.price_transition_data) {
        const decodedTx = await decodeStateTransition(row.price_transition_data)

        priceTx = decodedTx.transitions[0]
      }

      return Token.fromObject({
        identifier: tokenIdentifier,
        dataContractIdentifier: row.data_contract_identifier,
        owner: {
          identifier: dataContract.ownerId.base58(),
          aliases: aliases ?? []
        },
        price: priceTx?.price,
        prices: priceTx?.prices,
        timestamp: row.timestamp,
        totalGasUsed: Number(row.total_gas_used),
        totalTransitionsCount: Number(row.total_transitions_count),
        totalBurnTransitionsCount: Number(row.total_burn_transitions_count),
        totalFreezeTransitionsCount: Number(row.total_freeze_transitions_count),
        position: Number(tokenPosition),
        totalSupply: tokenTotalSupply?.totalSystemAmount.toString(),
        description: tokenConfig?.description,
        localizations: tokenConfig?.conventions?.localizations,
        decimals: tokenConfig?.conventions?.decimals,
        baseSupply: tokenConfig?.baseSupply.toString(),
        maxSupply: tokenConfig?.maxSupply?.toString(),
        mintable: tokenConfig?.manualMintingRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        burnable: tokenConfig?.manualBurningRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        freezable: tokenConfig?.freezeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        changeMaxSupply: tokenConfig?.maxSupplyChangeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        unfreezable: tokenConfig?.unfreezeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        destroyable: tokenConfig?.destroyFrozenFundsRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        allowedEmergencyActions: tokenConfig?.emergencyActionRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        mainGroup: tokenConfig?.mainControlGroup,
        perpetualDistribution: perpetualDistribution ? PerpetualDistribution.fromWASMObject(perpetualDistribution) : null,
        preProgrammedDistribution: preProgrammedDistributionNormal
      })
    }))
  }))

  return dataContractsWithTokens.reduce((acc, contract) => contract ? [...acc, ...contract.filter((token) => token !== undefined)] : acc, [])
}

const tokensConfigToObject = (config) => {
  const tokensKeys = Object.keys(config)

  return tokensKeys.reduce((acc, tokenKey) => {
    const token = config[tokenKey]

    return {
      ...acc,
      [tokenKey]: {
        position: Number(tokenKey),
        conventions: {
          decimals: token.conventions.decimals,
          localizations: token.conventions.localizations
        },
        conventionsChangeRules: {
          authorizedToMakeChange: {
            takerType: token.conventionsChangeRules.authorizedToMakeChange.getTakerType(),
            taker: typeof token.conventionsChangeRules.authorizedToMakeChange.getValue() === 'number' ? token.conventionsChangeRules.authorizedToMakeChange.getValue() : token.conventionsChangeRules.authorizedToMakeChange.getValue()?.base58()
          },
          adminActionTakers: {
            takerType: token.conventionsChangeRules.adminActionTakers.getTakerType(),
            taker: typeof token.conventionsChangeRules.adminActionTakers.getValue() === 'number' ? token.conventionsChangeRules.authorizedToMakeChange.getValue() : token.conventionsChangeRules.authorizedToMakeChange.getValue()?.base58()
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.conventionsChangeRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.conventionsChangeRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.conventionsChangeRules.selfChangingAdminActionTakersAllowed
        },
        baseSupply: token.baseSupply.toString(),
        keepsHistory: {
          keepsTransferHistory: token.keepsHistory.keepsTransferHistory,
          keepsFreezingHistory: token.keepsHistory.keepsFreezingHistory,
          keepsMintingHistory: token.keepsHistory.keepsMintingHistory,
          keepsBurningHistory: token.keepsHistory.keepsBurningHistory,
          keepsDirectPricingHistory: token.keepsHistory.keepsDirectPricingHistory,
          keepsDirectPurchaseHistory: token.keepsHistory.keepsDirectPurchaseHistory
        },
        startAsPaused: token.startAsPaused,
        isAllowedTransferToFrozenBalance: token.isAllowedTransferToFrozenBalance,
        maxSupply: token.maxSupply?.toString() ?? null,
        maxSupplyChangeRules: {
          authorizedToMakeChange: {
            takerType: token.maxSupplyChangeRules.authorizedToMakeChange.getTakerType(),
            taker: typeof token.maxSupplyChangeRules.authorizedToMakeChange.getValue() === 'number' ? token.maxSupplyChangeRules.authorizedToMakeChange.getValue() : token.maxSupplyChangeRules.authorizedToMakeChange.getValue()?.base58()
          },
          adminActionTakers: {
            takerType: token.maxSupplyChangeRules.adminActionTakers.getTakerType(),
            taker: typeof token.maxSupplyChangeRules.adminActionTakers.getValue() === 'number' ? token.maxSupplyChangeRules.authorizedToMakeChange.getValue() : token.maxSupplyChangeRules.authorizedToMakeChange.getValue()?.base58()
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.maxSupplyChangeRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.maxSupplyChangeRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.maxSupplyChangeRules.selfChangingAdminActionTakersAllowed
        },
        // TODO: Implement distributionRules
        distributionRules: null,
        marketplaceRules: {
          tradeMode: token.marketplaceRules.tradeMode.getValue(),
          tradeModeChangeRules: {
            authorizedToMakeChange: {
              takerType: token.marketplaceRules.tradeModeChangeRules.authorizedToMakeChange.getTakerType(),
              taker: typeof token.marketplaceRules.tradeModeChangeRules.authorizedToMakeChange.getValue() === 'number' ? token.conventionsChangeRules.authorizedToMakeChange.getValue() : token.marketplaceRules.tradeModeChangeRules.authorizedToMakeChange.getValue()?.base58()
            },
            adminActionTakers: {
              takerType: token.marketplaceRules.tradeModeChangeRules.adminActionTakers.getTakerType(),
              taker: typeof token.marketplaceRules.tradeModeChangeRules.adminActionTakers.getValue() === 'number' ? token.conventionsChangeRules.authorizedToMakeChange.getValue() : token.marketplaceRules.tradeModeChangeRules.authorizedToMakeChange.getValue()?.base58()
            },
            changingAuthorizedActionTakersToNoOneAllowed: token.marketplaceRules.tradeModeChangeRules.changingAuthorizedActionTakersToNoOneAllowed,
            changingAdminActionTakersToNoOneAllowed: token.marketplaceRules.tradeModeChangeRules.changingAdminActionTakersToNoOneAllowed,
            selfChangingAdminActionTakersAllowed: token.marketplaceRules.tradeModeChangeRules.selfChangingAdminActionTakersAllowed
          }
        },
        manualMintingRules: {
          authorizedToMakeChange: {
            takerType: token.manualMintingRules.authorizedToMakeChange.getTakerType(),
            taker: typeof token.manualMintingRules.authorizedToMakeChange.getValue() === 'number' ? token.manualMintingRules.authorizedToMakeChange.getValue() : token.manualMintingRules.authorizedToMakeChange.getValue()?.base58()
          },
          adminActionTakers: {
            takerType: token.manualMintingRules.adminActionTakers.getTakerType(),
            taker: typeof token.manualMintingRules.adminActionTakers.getValue() === 'number' ? token.manualMintingRules.authorizedToMakeChange.getValue() : token.manualMintingRules.authorizedToMakeChange.getValue()?.base58()
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.manualMintingRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.manualMintingRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.manualMintingRules.selfChangingAdminActionTakersAllowed
        },
        manualBurningRules: {
          authorizedToMakeChange: {
            takerType: token.manualBurningRules.authorizedToMakeChange.getTakerType(),
            taker: typeof token.manualBurningRules.authorizedToMakeChange.getValue() === 'number' ? token.manualBurningRules.authorizedToMakeChange.getValue() : token.manualBurningRules.authorizedToMakeChange.getValue()?.base58()
          },
          adminActionTakers: {
            takerType: token.manualBurningRules.adminActionTakers.getTakerType(),
            taker: typeof token.manualBurningRules.adminActionTakers.getValue() === 'number' ? token.manualBurningRules.authorizedToMakeChange.getValue() : token.manualBurningRules.authorizedToMakeChange.getValue()?.base58()
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.manualBurningRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.manualBurningRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.manualBurningRules.selfChangingAdminActionTakersAllowed
        },
        freezeRules: {
          authorizedToMakeChange: {
            takerType: token.freezeRules.authorizedToMakeChange.getTakerType(),
            taker: typeof token.freezeRules.authorizedToMakeChange.getValue() === 'number' ? token.freezeRules.authorizedToMakeChange.getValue() : token.freezeRules.authorizedToMakeChange.getValue()?.base58()
          },
          adminActionTakers: {
            takerType: token.freezeRules.adminActionTakers.getTakerType(),
            taker: typeof token.freezeRules.adminActionTakers.getValue() === 'number' ? token.freezeRules.authorizedToMakeChange.getValue() : token.freezeRules.authorizedToMakeChange.getValue()?.base58()
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.freezeRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.freezeRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.freezeRules.selfChangingAdminActionTakersAllowed
        },
        unfreezeRules: {
          authorizedToMakeChange: {
            takerType: token.unfreezeRules.authorizedToMakeChange.getTakerType(),
            taker: typeof token.unfreezeRules.authorizedToMakeChange.getValue() === 'number' ? token.unfreezeRules.authorizedToMakeChange.getValue() : token.unfreezeRules.authorizedToMakeChange.getValue()?.base58()
          },
          adminActionTakers: {
            takerType: token.unfreezeRules.adminActionTakers.getTakerType(),
            taker: typeof token.unfreezeRules.adminActionTakers.getValue() === 'number' ? token.unfreezeRules.authorizedToMakeChange.getValue() : token.unfreezeRules.authorizedToMakeChange.getValue()?.base58()
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.unfreezeRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.unfreezeRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.unfreezeRules.selfChangingAdminActionTakersAllowed
        },
        destroyFrozenFundsRules: {
          authorizedToMakeChange: {
            takerType: token.destroyFrozenFundsRules.authorizedToMakeChange.getTakerType(),
            taker: typeof token.destroyFrozenFundsRules.authorizedToMakeChange.getValue() === 'number' ? token.destroyFrozenFundsRules.authorizedToMakeChange.getValue() : token.destroyFrozenFundsRules.authorizedToMakeChange.getValue()?.base58()
          },
          adminActionTakers: {
            takerType: token.destroyFrozenFundsRules.adminActionTakers.getTakerType(),
            taker: typeof token.destroyFrozenFundsRules.adminActionTakers.getValue() === 'number' ? token.destroyFrozenFundsRules.authorizedToMakeChange.getValue() : token.destroyFrozenFundsRules.authorizedToMakeChange.getValue()?.base58()
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.destroyFrozenFundsRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.destroyFrozenFundsRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.destroyFrozenFundsRules.selfChangingAdminActionTakersAllowed
        },
        emergencyActionRules: {
          authorizedToMakeChange: {
            takerType: token.emergencyActionRules.authorizedToMakeChange.getTakerType(),
            taker: typeof token.emergencyActionRules.authorizedToMakeChange.getValue() === 'number' ? token.emergencyActionRules.authorizedToMakeChange.getValue() : token.emergencyActionRules.authorizedToMakeChange.getValue()?.base58()
          },
          adminActionTakers: {
            takerType: token.emergencyActionRules.adminActionTakers.getTakerType(),
            taker: typeof token.emergencyActionRules.adminActionTakers.getValue() === 'number' ? token.emergencyActionRules.authorizedToMakeChange.getValue() : token.emergencyActionRules.authorizedToMakeChange.getValue()?.base58()
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.emergencyActionRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.emergencyActionRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.emergencyActionRules.selfChangingAdminActionTakersAllowed
        },
        mainControlGroupCanBeModified: {
          takerType: token.mainControlGroupCanBeModified.getTakerType(),
          taker: typeof token.mainControlGroupCanBeModified.getValue() === 'number' ? token.mainControlGroupCanBeModified.getValue() : token.mainControlGroupCanBeModified.getValue()?.base58()
        },
        mainControlGroup: token.mainControlGroup ?? null,
        description: token.description
      }
    }
  }, {})
}

const decodeStateTransition = async (base64) => {
  const stateTransition = StateTransitionWASM.fromBase64(base64)

  const decoded = {
    type: stateTransition.getActionTypeNumber(),
    typeString: StateTransitionEnum[stateTransition.getActionTypeNumber()]
  }

  switch (decoded.type) {
    case StateTransitionEnum.DATA_CONTRACT_CREATE: {
      const dataContractCreateTransition = DataContractCreateTransitionWASM.fromStateTransition(stateTransition)

      const dataContract = dataContractCreateTransition.getDataContract(PlatformVersionWASM.PLATFORM_V9)

      const dataContractConfig = dataContract.getConfig()

      decoded.internalConfig = {
        canBeDeleted: dataContractConfig.canBeDeleted,
        readonly: dataContractConfig.readonly,
        keepsHistory: dataContractConfig.keepsHistory,
        documentsKeepHistoryContractDefault: dataContractConfig.documentsKeepHistoryContractDefault,
        documentsMutableContractDefault: dataContractConfig.documentsMutableContractDefault,
        documentsCanBeDeletedContractDefault: dataContractConfig.documentsCanBeDeletedContractDefault,
        requiresIdentityDecryptionBoundedKey: dataContractConfig.requiresIdentityDecryptionBoundedKey ?? null,
        requiresIdentityEncryptionBoundedKey: dataContractConfig.requiresIdentityEncryptionBoundedKey ?? null
      }

      decoded.version = dataContract.version
      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.identityNonce = String(dataContractCreateTransition.identityNonce)
      decoded.dataContractId = dataContract.id.base58()
      decoded.ownerId = dataContract.ownerId.base58()
      decoded.schema = dataContract.getSchemas()
      decoded.tokens = tokensConfigToObject(dataContract.tokens ?? {})
      decoded.signature = Buffer.from(stateTransition.signature).toString('hex')
      decoded.signaturePublicKeyId = stateTransition.signaturePublicKeyId
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      const groupsKeys = Object.keys(dataContract.groups)

      decoded.groups = groupsKeys.map((key) => ({
        position: Number(key),
        members: dataContract.groups[key].members,
        requiredPower: dataContract.groups[key].requiredPower
      }))

      break
    }
    case StateTransitionEnum.BATCH: {
      const batch = BatchTransitionWASM.fromStateTransition(stateTransition)

      decoded.transitions = batch.transitions.map((batchedTransitions) => {
        const transition = batchedTransitions.toTransition()

        const transitionType = transition.__type === 'DocumentTransitionWASM' ? 0 : 1

        let out = {}

        switch (transitionType) {
          case 1: {
            const tokenTransitionType = transition.getTransitionType()

            const tokenTransition = transition.getTransition()

            out = {
              action: BatchEnum[tokenTransitionType],
              tokenId: tokenTransition.base.tokenId.base58(),
              identityContractNonce: String(transition.identityContractNonce),
              tokenContractPosition: tokenTransition.base.tokenContractPosition,
              dataContractId: tokenTransition.base.dataContractId.base58(),
              historicalDocumentTypeName: transition.getHistoricalDocumentTypeName(),
              historicalDocumentId: transition.getHistoricalDocumentId(stateTransition.getOwnerId()).base58(),
              groupInfo: tokenTransition.base.usingGroupInfo
                ? {
                    groupContractPosition: tokenTransition.base.usingGroupInfo.groupContractPosition,
                    actionId: tokenTransition.base.usingGroupInfo.actionId.base58(),
                    actionIsProposer: tokenTransition.base.usingGroupInfo.actionIsProposer
                  }
                : null
            }

            switch (TokenTransitionEnum[tokenTransitionType]) {
              case TokenTransitionEnum.Burn: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.burnAmount = tokenTransition.burnAmount.toString()

                break
              }
              case TokenTransitionEnum.Mint: {
                out.issuedToIdentityId = tokenTransition.issuedToIdentityId?.base58() ?? null
                out.publicNote = tokenTransition.publicNote ?? null
                out.amount = tokenTransition.amount.toString()

                break
              }
              case TokenTransitionEnum.Transfer: {
                out.recipient = tokenTransition.recipientId.base58()
                out.amount = tokenTransition.amount.toString()
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.Freeze: {
                out.frozenIdentityId = tokenTransition.frozenIdentityId.base58()
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.Unfreeze: {
                out.frozenIdentityId = tokenTransition.frozenIdentityId.base58()
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.DestroyFrozenFunds: {
                out.frozenIdentityId = tokenTransition.frozenIdentityId.base58()
                out.publicNote = tokenTransition.publicNote ?? null

                break
              }
              case TokenTransitionEnum.Claim: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.distributionType = tokenTransition.distributionType

                break
              }
              case TokenTransitionEnum.EmergencyAction: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.emergencyAction = tokenTransition.emergencyAction

                break
              }
              case TokenTransitionEnum.ConfigUpdate: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.itemName = tokenTransition.updateTokenConfigurationItem.getItemName()

                switch (out.itemName) {
                  case 'TokenConfigurationNoChange': {
                    out.itemValue = null
                    break
                  }
                  case 'Conventions': {
                    out.itemValue = {
                      decimals: tokenTransition.updateTokenConfigurationItem.getItem().decimals,
                      localizations: tokenTransition.updateTokenConfigurationItem.getItem().localizations
                    }
                    break
                  }
                  case 'ConventionsControlGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'ConventionsAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'MaxSupply': {
                    out.itemValue = {
                      amount: tokenTransition.updateTokenConfigurationItem.getItem() ?? null
                    }
                    break
                  }
                  case 'MaxSupplyControlGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'MaxSupplyAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'PerpetualDistribution': {
                    out.itemValue = tokenTransition.updateTokenConfigurationItem.getItem()
                      ? {
                          distributionType: {
                            interval: tokenTransition.updateTokenConfigurationItem.getItem().distributionType.getDistribution().interval,
                            function: tokenTransition.updateTokenConfigurationItem.getItem().distributionType.getDistribution().function
                          },
                          distributionRecipient: {
                            type: tokenTransition.updateTokenConfigurationItem.getItem().distributionRecipient.getType(),
                            recipient: tokenTransition.updateTokenConfigurationItem.getItem().distributionRecipient.getValue()?.base58()
                          }
                        }
                      : null
                    break
                  }
                  case 'PerpetualDistributionControlGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'PerpetualDistributionAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'NewTokensDestinationIdentity': {
                    out.itemValue = {
                      identifier: tokenTransition.updateTokenConfigurationItem.getItem()?.base58() ?? null
                    }
                    break
                  }
                  case 'NewTokensDestinationIdentityControlGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'NewTokensDestinationIdentityAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'MintingAllowChoosingDestination': {
                    out.itemValue = {
                      allowed: tokenTransition.updateTokenConfigurationItem.getItem()
                    }
                    break
                  }
                  case 'MintingAllowChoosingDestinationControlGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'MintingAllowChoosingDestinationAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'ManualMinting': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'ManualMintingAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'ManualBurning': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'ManualBurningAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'Freeze': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'FreezeAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'Unfreeze': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'UnfreezeAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'DestroyFrozenFunds': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'DestroyFrozenFundsAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'EmergencyAction': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'EmergencyActionAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'MarketplaceTradeMode': {
                    out.itemValue = {
                      tradeMode: tokenTransition.updateTokenConfigurationItem.getItem().getValue()
                    }
                    break
                  }
                  case 'MarketplaceTradeModeControlGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'MarketplaceTradeModeAdminGroup': {
                    const value = tokenTransition.updateTokenConfigurationItem.getItem().getValue()

                    out.itemValue = {
                      takerType: tokenTransition.updateTokenConfigurationItem.getItem().getTakerType(),
                      value: typeof value === 'number' ? value : value?.base58() ?? null
                    }
                    break
                  }
                  case 'MainControlGroup': {
                    out.itemValue = {
                      contractPosition: tokenTransition.updateTokenConfigurationItem.getItem() ?? null
                    }
                    break
                  }
                }

                break
              }
              case TokenTransitionEnum.DirectPurchase: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.totalAgreedPrice = tokenTransition.totalAgreedPrice.toString()
                out.amount = tokenTransition.tokenCount.toString()

                break
              }
              case TokenTransitionEnum.SetPriceForDirectPurchase: {
                out.publicNote = tokenTransition.publicNote ?? null
                out.price = null
                out.prices = null

                if (tokenTransition.price) {
                  switch (tokenTransition.price.getScheduleType()) {
                    case 'SinglePrice': {
                      out.price = tokenTransition.price.getValue().toString()
                      break
                    }
                    case 'SetPrices': {
                      const prices = tokenTransition.price.getValue()
                      if (prices) {
                        const priceKeys = Object.keys(prices)

                        out.prices = priceKeys.map(key => ({ amount: key, price: prices[key].toString() }))
                      }
                    }
                  }
                }
                break
              }
            }
            break
          }
          case 0: {
            out = {
              action: BatchEnum[transition.actionTypeNumber],
              id: transition.id.base58(),
              dataContractId: transition.dataContractId.base58(),
              revision: String(transition.revision),
              type: transition.documentTypeName,
              identityContractNonce: String(transition.identityContractNonce)
            }

            switch (transition.actionTypeNumber) {
              case DocumentActionEnum.Create: {
                const createTransition = transition.createTransition

                const prefundedVotingBalance = createTransition.prefundedVotingBalance

                out.entropy = Buffer.from(createTransition.entropy).toString('hex')

                out.data = createTransition.data
                out.prefundedVotingBalance = prefundedVotingBalance
                  ? {
                      [prefundedVotingBalance.indexName]: String(prefundedVotingBalance.credits)
                    }
                  : null

                break
              }
              case DocumentActionEnum.Replace: {
                const replaceTransition = transition.replaceTransition

                out.data = replaceTransition.data

                break
              }
              case DocumentActionEnum.UpdatePrice: {
                const updatePriceTransition = transition.updatePriceTransition

                out.price = Number(updatePriceTransition.price)

                break
              }
              case DocumentActionEnum.Purchase: {
                const purchaseTransition = transition.purchaseTransition

                out.price = Number(purchaseTransition.price)

                break
              }
              case DocumentActionEnum.Transfer: {
                const transferTransition = transition.transferTransition

                out.receiverId = transferTransition.receiverId
                out.recipientId = transferTransition.recipientId.base58()

                break
              }
            }
            break
          }
        }
        return out
      })

      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.signature = Buffer.from(stateTransition.signature).toString('hex')
      decoded.signaturePublicKeyId = stateTransition.signaturePublicKeyId
      decoded.ownerId = stateTransition.getOwnerId().base58()
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREATE: {
      const identityCreateTransition = IdentityCreateTransitionWASM.fromStateTransition(stateTransition)

      const assetLockProof = identityCreateTransition.assetLock

      const decodedTransaction =
        assetLockProof.getLockType() === 'Instant'
          ? dashcorelib.Transaction(Buffer.from(assetLockProof.getInstantLockProof().getTransaction()))
          : null

      decoded.assetLockProof = {
        coreChainLockedHeight: assetLockProof.getLockType() === 'Chain' ? assetLockProof.getChainLockProof().coreChainLockedHeight : null,
        type: assetLockProof.getLockType() === 'Instant' ? 'instantSend' : 'chainLock',
        instantLock: assetLockProof.getLockType() === 'Instant' ? Buffer.from(assetLockProof.getInstantLockProof().getInstantLockBytes()).toString('base64') : null,
        fundingAmount: decodedTransaction?.outputs[assetLockProof.getOutPoint().getVOUT()].satoshis
          ? String(decodedTransaction?.outputs[assetLockProof.getOutPoint().getVOUT()].satoshis)
          : null,
        fundingCoreTx: assetLockProof.getOutPoint().getTXID(),
        vout: assetLockProof.getOutPoint().getVOUT()
      }

      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.identityId = stateTransition.getOwnerId().base58()
      decoded.signature = Buffer.from(stateTransition.signature ?? []).toString('hex') ?? null
      decoded.raw = stateTransition.hex()

      decoded.publicKeys = identityCreateTransition.publicKeys.map(key => {
        const { contractBounds } = key

        return {
          contractBounds: contractBounds
            ? {
                type: contractBounds.contractBoundsType,
                id: contractBounds.identi.base58(),
                typeName: contractBounds.document_type_name
              }
            : null,
          id: key.keyId,
          type: key.keyType,
          data: Buffer.from(key.data).toString('hex'),
          publicKeyHash: Buffer.from(key.getHash()).toString('hex'),
          purpose: key.purpose,
          securityLevel: key.securityLevel,
          readOnly: key.readOnly,
          signature: Buffer.from(key.signature).toString('hex')
        }
      })

      break
    }
    case StateTransitionEnum.IDENTITY_TOP_UP: {
      const identityTopUpTransition = IdentityTopUpTransitionWASM.fromStateTransition(stateTransition)

      const assetLockProof = identityTopUpTransition.assetLockProof
      const output =
        assetLockProof.getLockType() === 'Instant'
          ? assetLockProof.getInstantLockProof().getOutput()
          : null

      const decodedTransaction =
        assetLockProof.getLockType() === 'Instant'
          ? dashcorelib.Transaction(Buffer.from(assetLockProof.getInstantLockProof().getTransaction()))
          : null

      decoded.assetLockProof = {
        coreChainLockedHeight: assetLockProof.getLockType() === 'Chain' ? assetLockProof.getChainLockProof().coreChainLockedHeight : null,
        type: assetLockProof.getLockType() === 'Instant' ? 'instantSend' : 'chainLock',
        instantLock: assetLockProof.getLockType() === 'Instant' ? Buffer.from(assetLockProof.getInstantLockProof().getInstantLockBytes()).toString('base64') : null,
        fundingAmount: decodedTransaction?.outputs[assetLockProof.getOutPoint().getVOUT()].satoshis
          ? String(decodedTransaction?.outputs[assetLockProof.getOutPoint().getVOUT()].satoshis)
          : null,
        fundingCoreTx: assetLockProof.getOutPoint().getTXID(),
        vout: assetLockProof.getOutPoint().getVOUT()
      }

      decoded.identityId = stateTransition.getOwnerId().base58()
      decoded.amount = String(output.value * 1000n)
      decoded.signature = Buffer.from(stateTransition.signature ?? []).toString('hex') ?? null
      decoded.raw = stateTransition.hex()

      break
    }
    case StateTransitionEnum.DATA_CONTRACT_UPDATE: {
      const dataContractUpdateTransition = DataContractUpdateTransitionWASM.fromStateTransition(stateTransition)

      const dataContractConfig = dataContractUpdateTransition.getDataContract().getConfig()

      decoded.internalConfig = {
        canBeDeleted: dataContractConfig.canBeDeleted,
        readonly: dataContractConfig.readonly,
        keepsHistory: dataContractConfig.keepsHistory,
        documentsKeepHistoryContractDefault: dataContractConfig.documentsKeepHistoryContractDefault,
        documentsMutableContractDefault: dataContractConfig.documentsMutableContractDefault,
        documentsCanBeDeletedContractDefault: dataContractConfig.documentsCanBeDeletedContractDefault,
        requiresIdentityDecryptionBoundedKey: dataContractConfig.requiresIdentityDecryptionBoundedKey ?? null,
        requiresIdentityEncryptionBoundedKey: dataContractConfig.requiresIdentityEncryptionBoundedKey ?? null
      }

      decoded.identityContractNonce = dataContractUpdateTransition.identityContractNonce.toString()
      decoded.signaturePublicKeyId = stateTransition.signaturePublicKeyId
      decoded.signature = Buffer.from(stateTransition.signature).toString('hex')
      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.ownerId = dataContractUpdateTransition.getDataContract().ownerId.base58()
      decoded.dataContractId = dataContractUpdateTransition.getDataContract().id.base58()
      decoded.schema = dataContractUpdateTransition.getDataContract().getSchemas()
      decoded.tokens = tokensConfigToObject(dataContractUpdateTransition.getDataContract().tokens ?? {})
      decoded.version = dataContractUpdateTransition.getDataContract().version
      decoded.dataContractOwner = dataContractUpdateTransition.getDataContract().ownerId.base58()
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      const groupsKeys = Object.keys(dataContractUpdateTransition.getDataContract().groups)

      decoded.groups = groupsKeys.reduce((acc, key) => {
        return {
          ...acc,
          key: {
            members: dataContractUpdateTransition.getDataContract().groups[key].members,
            requiredPower: dataContractUpdateTransition.getDataContract().groups[key].requiredPower
          }
        }
      }, {})

      break
    }
    case StateTransitionEnum.IDENTITY_UPDATE: {
      const identityUpdateTransition = IdentityUpdateTransitionWASM.fromStateTransition(stateTransition)

      decoded.identityNonce = String(identityUpdateTransition.nonce)
      decoded.userFeeIncrease = identityUpdateTransition.userFeeIncrease
      decoded.identityId = identityUpdateTransition.identityIdentifier.base58()
      decoded.revision = String(identityUpdateTransition.revision)

      decoded.publicKeysToAdd = identityUpdateTransition.publicKeyIdsToAdd
        .map(key => {
          const { contractBounds } = key

          return {
            contractBounds: contractBounds
              ? {
                  type: contractBounds.contractBoundsType,
                  id: contractBounds.identifier.base58(),
                  typeName: contractBounds.documentTypeName
                }
              : null,
            id: key.keyId,
            type: key.keyType,
            data: Buffer.from(key.data).toString('hex'),
            publicKeyHash: Buffer.from(key.getHash()).toString('hex'),
            purpose: key.purpose,
            securityLevel: key.securityLevel,
            readOnly: key.readOnly,
            signature: Buffer.from(key.signature).toString('hex')
          }
        })
      decoded.setPublicKeyIdsToDisable = Array.from(identityUpdateTransition.publicKeyIdsToDisable ?? [])
      decoded.signature = Buffer.from(identityUpdateTransition.signature).toString('hex')
      decoded.signaturePublicKeyId = identityUpdateTransition.signaturePublicKeyId
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_TRANSFER: {
      const identityCreditTransferTransition = IdentityCreditTransferWASM.fromStateTransition(stateTransition)

      decoded.identityNonce = String(identityCreditTransferTransition.nonce)
      decoded.userFeeIncrease = identityCreditTransferTransition.userFeeIncrease
      decoded.senderId = identityCreditTransferTransition.senderId.base58()
      decoded.recipientId = identityCreditTransferTransition.recipientId.base58()
      decoded.amount = String(identityCreditTransferTransition.amount)
      decoded.signaturePublicKeyId = identityCreditTransferTransition.signaturePublicKeyId
      decoded.signature = Buffer.from(stateTransition.signature)?.toString('hex') ?? null
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL: {
      const identityCreditWithdrawalTransition = IdentityCreditWithdrawalTransitionWASM.fromStateTransition(stateTransition)

      decoded.outputAddress = identityCreditWithdrawalTransition.outputScript
        ? outputScriptToAddress(Buffer.from(identityCreditWithdrawalTransition.outputScript.bytes()))
        : null

      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.senderId = identityCreditWithdrawalTransition.identityId.base58()
      decoded.amount = String(identityCreditWithdrawalTransition.amount)
      decoded.outputScript = identityCreditWithdrawalTransition?.outputScript.hex() ?? null
      decoded.coreFeePerByte = identityCreditWithdrawalTransition.coreFeePerByte
      decoded.signature = Buffer.from(stateTransition.signature ?? []).toString('hex') ?? null
      decoded.signaturePublicKeyId = stateTransition.signaturePublicKeyId
      decoded.pooling = identityCreditWithdrawalTransition.pooling
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')
      decoded.identityNonce = String(identityCreditWithdrawalTransition.nonce)

      break
    }
    case StateTransitionEnum.MASTERNODE_VOTE: {
      const masternodeVoteTransition = MasternodeVoteTransitionWASM.fromStateTransition(stateTransition)

      const towardsIdentity = masternodeVoteTransition.vote.resourceVoteChoice.getValue()?.base58()

      decoded.indexValues = masternodeVoteTransition.vote.votePoll.indexValues.map(bytes => Buffer.from(bytes).toString('base64'))
      decoded.contractId = masternodeVoteTransition.vote.votePoll.contractId.base58()
      decoded.modifiedDataIds = masternodeVoteTransition.modifiedDataIds.map(identifier => identifier.base58())
      decoded.ownerId = stateTransition.getOwnerId().base58()
      decoded.signature = Buffer.from(stateTransition.signature ?? []).toString('hex') ?? null
      decoded.documentTypeName = masternodeVoteTransition.vote.votePoll.documentTypeName
      decoded.indexName = masternodeVoteTransition.vote.votePoll.indexName
      decoded.choice = `${masternodeVoteTransition.vote.resourceVoteChoice.getType()}${towardsIdentity ? `(${towardsIdentity})` : ''}`
      decoded.userFeeIncrease = stateTransition.userFeeIncrease
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')
      decoded.proTxHash = masternodeVoteTransition.proTxHash.hex()
      decoded.identityNonce = String(masternodeVoteTransition.nonce)

      break
    }
    default:
      throw new Error('Unknown state transition')
  }

  return decoded
}

const checkTcpConnect = (port, host) => {
  return new Promise((resolve, reject) => {
    let connection
    try {
      connection = net.createConnection(port, host)

      connection.setTimeout(TCP_CONNECT_TIMEOUT)

      connection.once('error', async (e) => {
        await connection.destroy()
        console.error(e)
        reject(e)
      })

      connection.once('connect', async () => {
        await connection.destroy()
        resolve('OK')
      })

      connection.once('timeout', async () => {
        await connection.destroy()
        resolve('ERR_CONNECTION_REFUSED')
      })
    } catch (e) {
      console.error(e)
      connection.destroy()
      reject(e)
    }
  })
}

// Calculating period and calculate the period
// and find the interval with less than 2 periods
// and take the previous interval
const calculateInterval = (start, end) => {
  const intervalsInRFC = Object.keys(Intervals)

  const startTimestamp = start.getTime()
  const endTimestamp = end.getTime()

  const period = endTimestamp - startTimestamp

  return intervalsInRFC.reduce((previousValue, currentValue, currentIndex, array) => {
    const parts = period / Intervals[currentValue]

    if (parts < 4 && currentIndex > 0) {
      array.splice(intervalsInRFC.length)

      return previousValue
    } else if (parts <= 12 && currentIndex === 0) {
      array.splice(intervalsInRFC.length)

      return currentValue
    }

    return currentValue
  })
}

// https://github.com/wking/milliseconds-to-iso-8601-duration
const iso8601duration = function (milliseconds) {
  if (milliseconds === 0) {
    return 'P0D'
  }

  let offset = Math.floor(milliseconds)
  let days = 0

  if (offset < 0) {
    days = Math.floor(offset % 86400000)
    offset -= 86400000 * days
  }

  milliseconds = offset % 1000

  offset = Math.floor(offset / 1000)

  const seconds = offset % 60
  offset = Math.floor(offset / 60)

  const minutes = offset % 60
  offset = Math.floor(offset / 60)

  const hours = offset % 24

  days += Math.floor(offset / 24)

  const parts = ['P']

  if (days) {
    parts.push(days + 'D')
  }

  if (hours || minutes || seconds || milliseconds) {
    parts.push('T')
    if (hours) {
      parts.push(hours + 'H')
    }
    if (minutes) {
      parts.push(minutes + 'M')
    }
    if (seconds || milliseconds) {
      parts.push(seconds)
      if (milliseconds) {
        milliseconds = milliseconds.toString()
        while (milliseconds.length < 3) {
          milliseconds = '0' + milliseconds
        }
        parts.push('.' + milliseconds)
      }
      parts.push('S')
    }
  }
  return parts.join('')
}

const buildIndexBuffer = (name) => {
  const lengthBuffer = Buffer.alloc(1)
  lengthBuffer.writeUInt8(name.length, 0)

  return Buffer.concat(
    [
      Buffer.from('12', 'hex'),
      lengthBuffer,
      Buffer.from(name, 'ascii')
    ]
  )
}

const getAliasStateByVote = (aliasInfo, alias, identifier) => {
  let status = null

  if (aliasInfo.contestedState === null) {
    return Alias.fromObject({
      alias: alias.alias,
      status: 'ok',
      contested: false,
      timestamp: alias.timestamp ? new Date(alias.timestamp) : null,
      txHash: alias.tx
    })
  }

  const bs58Identifier = base58.encode(
    Buffer.from(aliasInfo.contestedState?.finishedVoteInfo?.wonByIdentityId?.bytes() ?? [], 'base64')
  )

  if (identifier === bs58Identifier) {
    status = 'ok'
  } else if (aliasInfo.contestedState?.finishedVoteInfo === undefined) {
    status = 'pending'
  } else {
    status = 'locked'
  }

  return Alias.fromObject({
    alias: alias.alias ?? alias,
    status,
    contested: true,
    timestamp: alias.timestamp ? new Date(alias.timestamp) : null,
    txHash: alias.tx
  })
}

const getAliasFromDocument = (aliasDocument) => {
  const { label, parentDomainName, normalizedLabel } = aliasDocument.properties
  const documentId = aliasDocument.id
  const timestamp = new Date(Number(aliasDocument.createdAt))

  const alias = `${label}.${parentDomainName}`

  return {
    alias,
    status: 'ok',
    timestamp,
    documentId: documentId.base58(),
    contested: /^[a-zA-Z01-]{3,19}$/.test(normalizedLabel)
  }
}

const getAliasInfo = async (aliasText, sdk) => {
  const [label, domain] = aliasText.split('.')

  const normalizedLabel = convertToHomographSafeChars(label ?? '')

  if (/^[a-zA-Z01-]{3,19}$/.test(normalizedLabel)) {
    const domainBuffer = buildIndexBuffer(domain)

    const labelBuffer = buildIndexBuffer(normalizedLabel)

    const contestedState = await sdk.contestedResources.getContestedResourceVoteState(
      DataContractWASM.fromValue(dpnsContract, true, PlatformVersionWASM.PLATFORM_V9),
      'domain',
      'parentNameAndLabel',
      [
        domainBuffer,
        labelBuffer
      ],
      ContestedStateResultType.DOCUMENTS_AND_VOTE_TALLY
    )

    return { alias: aliasText, contestedState }
  }

  return { alias: aliasText, contestedState: null }
}

module.exports = {
  hash,
  decodeStateTransition,
  getKnex,
  checkTcpConnect,
  calculateInterval,
  iso8601duration,
  getAliasInfo,
  getAliasStateByVote,
  buildIndexBuffer,
  outputScriptToAddress,
  getAliasFromDocument,
  fetchTokenInfoByRows
}
