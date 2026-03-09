const crypto = require('crypto')
const StateTransitionEnum = require('./enums/StateTransitionEnum')
const DocumentActionEnum = require('./enums/DocumentActionEnum')
const net = require('net')
const { TCP_CONNECT_TIMEOUT, NETWORK, DPNS_CONTRACT } = require('./constants')
const { base58 } = require('@scure/base')
const Intervals = require('./enums/IntervalsEnum')
const Alias = require('./models/Alias')
const TokenTransitionEnum = require('./enums/TokenTransitionsEnum')
const {
  StateTransitionWASM,
  IdentityCreditTransferToAddressesTransitionWASM,
  BatchTransitionWASM,
  TokenConfigurationWASM,
  DataContractCreateTransitionWASM,
  IdentityCreateTransitionWASM,
  IdentityTopUpTransitionWASM,
  DataContractUpdateTransitionWASM,
  IdentityUpdateTransitionWASM,
  IdentityCreditTransferWASM,
  IdentityCreditWithdrawalTransitionWASM,
  MasternodeVoteTransitionWASM,
  PlatformVersionWASM,
  DataContractWASM,
  IdentityCreateFromAddressesTransitionWASM,
  IdentityTopUpFromAddressesTransitionWASM,
  AddressFundsTransferTransitionWASM,
  AddressFundingFromAssetLockTransitionWASM,
  AddressCreditWithdrawalTransitionWASM
} = require('pshenmic-dpp')
const BatchEnum = require('./enums/BatchEnum')
const dpnsContract = require('../data_contracts/dpns.json')
const { ContestedStateResultType } = require('dash-platform-sdk/types')
const PreProgrammedDistribution = require('./models/PreProgrammedDistribution')
const Token = require('./models/Token')
const PerpetualDistribution = require('./models/PerpetualDistribution')
const Localization = require('./models/Localization')
const { Transaction } = require('dash-core-sdk/src/types/Transaction')
const { Script } = require('dash-core-sdk/src/types/Script')

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
  const address = Script.fromBytes(new Uint8Array(script)).getAddress(NETWORK)
  return address ? address.toString() : null
}

const fetchTokenInfoByRows = async (rows, sdk) => {
  const owners = rows
    .filter(row => row.owner)
    .map(row => row.owner?.trim())

  const aliasDocuments = await getAliasDocumentForIdentifiers(owners, sdk)

  const dataContractsWithTokens = await Promise.all(rows.map(async (row) => {
    const dataContract = await sdk.dataContracts.getDataContractByIdentifier(row.data_contract_identifier)

    if (!dataContract) {
      return undefined
    }

    return await Promise.all(dataContract.tokens.map(async (tokenConfig) => {
      const tokenIdentifier = TokenConfigurationWASM.calculateTokenId(dataContract.id, Number(tokenConfig.position))

      const tokenTotalSupply = await sdk.tokens.getTokenTotalSupply(tokenIdentifier)

      const aliasDocument = row.owner ? aliasDocuments[row.owner?.trim()] : undefined

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      const { perpetualDistribution, preProgrammedDistribution } = tokenConfig?.tokenConfiguration.distributionRules ?? {}

      let priceTx = null

      if (row.price_transition_data) {
        const decodedTx = await decodeStateTransition(row.price_transition_data)

        priceTx = decodedTx.transitions[0]
      }

      return Token.fromObject({
        identifier: tokenIdentifier.base58(),
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
        position: Number(tokenConfig.position),
        totalSupply: tokenTotalSupply?.totalSystemAmount.toString(),
        description: tokenConfig?.tokenConfiguration.description,
        localizations: tokenConfig?.tokenConfiguration.conventions?.localizations,
        decimals: tokenConfig?.tokenConfiguration.conventions?.decimals,
        baseSupply: tokenConfig?.tokenConfiguration.baseSupply.toString(),
        maxSupply: tokenConfig?.tokenConfiguration.maxSupply?.toString(),
        mintable: tokenConfig?.tokenConfiguration.manualMintingRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        burnable: tokenConfig?.tokenConfiguration.manualBurningRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        freezable: tokenConfig?.tokenConfiguration.freezeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        changeMaxSupply: tokenConfig?.tokenConfiguration.maxSupplyChangeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        unfreezable: tokenConfig?.tokenConfiguration.unfreezeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        destroyable: tokenConfig?.tokenConfiguration.destroyFrozenFundsRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        allowedEmergencyActions: tokenConfig?.tokenConfiguration.emergencyActionRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
        mainGroup: tokenConfig?.tokenConfiguration.mainControlGroup,
        perpetualDistribution: perpetualDistribution ? PerpetualDistribution.fromWASMObject(perpetualDistribution) : null,
        preProgrammedDistribution: preProgrammedDistribution ? PreProgrammedDistribution.fromWASMObject(preProgrammedDistribution) : null
      })
    }))
  }))

  return dataContractsWithTokens.reduce((acc, contract) => contract ? [...acc, ...contract.filter((token) => token !== undefined)] : acc, [])
}

const getActionTakersValue = (actionTakers) => {
  const value = actionTakers
  return typeof value === 'number' ? value : value?.base58()
}

const tokensConfigToArray = (config, dataContractId) => {
  const tokensKeys = Object.keys(config)

  return tokensKeys.map((position) => {
    const token = config[position]

    const tokenId = TokenConfigurationWASM.calculateTokenId(dataContractId, Number(position))

    const localizations = Object.keys(token.tokenConfiguration.conventions.localizations)
      .reduce((acc, localizationCode) => {
        return {
          [localizationCode]: Localization.fromObject(token.tokenConfiguration.conventions.localizations[localizationCode])
        }
      }, {})

    return {
      position: Number(position),
      tokenId: tokenId.base58(),
      conventions: {
        decimals: token.tokenConfiguration.conventions.decimals,
        localizations
      },
      conventionsChangeRules: {
        authorizedToMakeChange: {
          takerType: token.tokenConfiguration.conventionsChangeRules.authorizedToMakeChange.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.conventionsChangeRules.authorizedToMakeChange.getValue()) ?? null
        },
        adminActionTakers: {
          takerType: token.tokenConfiguration.conventionsChangeRules.adminActionTakers.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.conventionsChangeRules.adminActionTakers.getValue()) ?? null
        },
        changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.conventionsChangeRules.changingAuthorizedActionTakersToNoOneAllowed,
        changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.conventionsChangeRules.changingAdminActionTakersToNoOneAllowed,
        selfChangingAdminActionTakersAllowed: token.tokenConfiguration.conventionsChangeRules.selfChangingAdminActionTakersAllowed
      },
      baseSupply: token.tokenConfiguration.baseSupply.toString(),
      keepsHistory: {
        keepsTransferHistory: token.tokenConfiguration.keepsHistory.keepsTransferHistory,
        keepsFreezingHistory: token.tokenConfiguration.keepsHistory.keepsFreezingHistory,
        keepsMintingHistory: token.tokenConfiguration.keepsHistory.keepsMintingHistory,
        keepsBurningHistory: token.tokenConfiguration.keepsHistory.keepsBurningHistory,
        keepsDirectPricingHistory: token.tokenConfiguration.keepsHistory.keepsDirectPricingHistory,
        keepsDirectPurchaseHistory: token.tokenConfiguration.keepsHistory.keepsDirectPurchaseHistory
      },
      startAsPaused: token.tokenConfiguration.startAsPaused,
      isAllowedTransferToFrozenBalance: token.tokenConfiguration.isAllowedTransferToFrozenBalance,
      maxSupply: token.tokenConfiguration.maxSupply?.toString() ?? null,
      maxSupplyChangeRules: {
        authorizedToMakeChange: {
          takerType: token.tokenConfiguration.maxSupplyChangeRules.authorizedToMakeChange.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.maxSupplyChangeRules.authorizedToMakeChange.getValue()) ?? null
        },
        adminActionTakers: {
          takerType: token.tokenConfiguration.maxSupplyChangeRules.adminActionTakers.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.maxSupplyChangeRules.adminActionTakers.getValue()) ?? null
        },
        changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.maxSupplyChangeRules.changingAuthorizedActionTakersToNoOneAllowed,
        changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.maxSupplyChangeRules.changingAdminActionTakersToNoOneAllowed,
        selfChangingAdminActionTakersAllowed: token.tokenConfiguration.maxSupplyChangeRules.selfChangingAdminActionTakersAllowed
      },
      distributionRules: {
        perpetualDistribution: token.tokenConfiguration.distributionRules?.perpetualDistribution ? PerpetualDistribution.fromWASMObject(token.tokenConfiguration.distributionRules.perpetualDistribution) : null,
        preProgrammedDistribution: token.tokenConfiguration.distributionRules?.preProgrammedDistribution ? PreProgrammedDistribution.fromWASMObject(token.tokenConfiguration.distributionRules.preProgrammedDistribution) : null,
        newTokenDestinationIdentity: token.tokenConfiguration.distributionRules.newTokenDestinationIdentity?.base58() ?? null,
        mintingAllowChoosingDestination: token.tokenConfiguration.distributionRules.mintingAllowChoosingDestination
      },
      marketplaceRules: {
        tradeMode: token.tokenConfiguration.marketplaceRules.tradeMode.getValue(),
        tradeModeChangeRules: {
          authorizedToMakeChange: {
            takerType: token.tokenConfiguration.marketplaceRules.tradeModeChangeRules.authorizedToMakeChange.getTakerType(),
            taker: getActionTakersValue(token.tokenConfiguration.marketplaceRules.tradeModeChangeRules.authorizedToMakeChange.getValue()) ?? null
          },
          adminActionTakers: {
            takerType: token.tokenConfiguration.marketplaceRules.tradeModeChangeRules.adminActionTakers.getTakerType(),
            taker: getActionTakersValue(token.tokenConfiguration.marketplaceRules.tradeModeChangeRules.adminActionTakers.getValue()) ?? null
          },
          changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.marketplaceRules.tradeModeChangeRules.changingAuthorizedActionTakersToNoOneAllowed,
          changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.marketplaceRules.tradeModeChangeRules.changingAdminActionTakersToNoOneAllowed,
          selfChangingAdminActionTakersAllowed: token.tokenConfiguration.marketplaceRules.tradeModeChangeRules.selfChangingAdminActionTakersAllowed
        }
      },
      manualMintingRules: {
        authorizedToMakeChange: {
          takerType: token.tokenConfiguration.manualMintingRules.authorizedToMakeChange.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.manualMintingRules.authorizedToMakeChange.getValue()) ?? null
        },
        adminActionTakers: {
          takerType: token.tokenConfiguration.manualMintingRules.adminActionTakers.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.manualMintingRules.adminActionTakers.getValue()) ?? null
        },
        changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.manualMintingRules.changingAuthorizedActionTakersToNoOneAllowed,
        changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.manualMintingRules.changingAdminActionTakersToNoOneAllowed,
        selfChangingAdminActionTakersAllowed: token.tokenConfiguration.manualMintingRules.selfChangingAdminActionTakersAllowed
      },
      manualBurningRules: {
        authorizedToMakeChange: {
          takerType: token.tokenConfiguration.manualBurningRules.authorizedToMakeChange.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.manualBurningRules.authorizedToMakeChange.getValue()) ?? null
        },
        adminActionTakers: {
          takerType: token.tokenConfiguration.manualBurningRules.adminActionTakers.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.manualBurningRules.adminActionTakers.getValue()) ?? null
        },
        changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.manualBurningRules.changingAuthorizedActionTakersToNoOneAllowed,
        changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.manualBurningRules.changingAdminActionTakersToNoOneAllowed,
        selfChangingAdminActionTakersAllowed: token.tokenConfiguration.manualBurningRules.selfChangingAdminActionTakersAllowed
      },
      freezeRules: {
        authorizedToMakeChange: {
          takerType: token.tokenConfiguration.freezeRules.authorizedToMakeChange.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.freezeRules.authorizedToMakeChange.getValue()) ?? null
        },
        adminActionTakers: {
          takerType: token.tokenConfiguration.freezeRules.adminActionTakers.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.freezeRules.adminActionTakers.getValue()) ?? null
        },
        changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.freezeRules.changingAuthorizedActionTakersToNoOneAllowed,
        changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.freezeRules.changingAdminActionTakersToNoOneAllowed,
        selfChangingAdminActionTakersAllowed: token.tokenConfiguration.freezeRules.selfChangingAdminActionTakersAllowed
      },
      unfreezeRules: {
        authorizedToMakeChange: {
          takerType: token.tokenConfiguration.unfreezeRules.authorizedToMakeChange.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.unfreezeRules.authorizedToMakeChange.getValue()) ?? null
        },
        adminActionTakers: {
          takerType: token.tokenConfiguration.unfreezeRules.adminActionTakers.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.unfreezeRules.adminActionTakers.getValue()) ?? null
        },
        changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.unfreezeRules.changingAuthorizedActionTakersToNoOneAllowed,
        changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.unfreezeRules.changingAdminActionTakersToNoOneAllowed,
        selfChangingAdminActionTakersAllowed: token.tokenConfiguration.unfreezeRules.selfChangingAdminActionTakersAllowed
      },
      destroyFrozenFundsRules: {
        authorizedToMakeChange: {
          takerType: token.tokenConfiguration.destroyFrozenFundsRules.authorizedToMakeChange.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.destroyFrozenFundsRules.authorizedToMakeChange.getValue()) ?? null
        },
        adminActionTakers: {
          takerType: token.tokenConfiguration.destroyFrozenFundsRules.adminActionTakers.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.destroyFrozenFundsRules.adminActionTakers.getValue()) ?? null
        },
        changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.destroyFrozenFundsRules.changingAuthorizedActionTakersToNoOneAllowed,
        changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.destroyFrozenFundsRules.changingAdminActionTakersToNoOneAllowed,
        selfChangingAdminActionTakersAllowed: token.tokenConfiguration.destroyFrozenFundsRules.selfChangingAdminActionTakersAllowed
      },
      emergencyActionRules: {
        authorizedToMakeChange: {
          takerType: token.tokenConfiguration.emergencyActionRules.authorizedToMakeChange.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.emergencyActionRules.authorizedToMakeChange.getValue()) ?? null
        },
        adminActionTakers: {
          takerType: token.tokenConfiguration.emergencyActionRules.adminActionTakers.getTakerType(),
          taker: getActionTakersValue(token.tokenConfiguration.emergencyActionRules.adminActionTakers.getValue()) ?? null
        },
        changingAuthorizedActionTakersToNoOneAllowed: token.tokenConfiguration.emergencyActionRules.changingAuthorizedActionTakersToNoOneAllowed,
        changingAdminActionTakersToNoOneAllowed: token.tokenConfiguration.emergencyActionRules.changingAdminActionTakersToNoOneAllowed,
        selfChangingAdminActionTakersAllowed: token.tokenConfiguration.emergencyActionRules.selfChangingAdminActionTakersAllowed
      },
      mainControlGroupCanBeModified: {
        takerType: token.tokenConfiguration.mainControlGroupCanBeModified.getTakerType(),
        taker: getActionTakersValue(token.tokenConfiguration.mainControlGroupCanBeModified.getValue()) ?? null
      },
      mainControlGroup: token.tokenConfiguration.mainControlGroup ?? null,
      description: token.tokenConfiguration.description ?? null
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
      decoded.tokens = tokensConfigToArray(dataContract.tokens ?? {}, dataContract.id)
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

        const transitionType = transition.idDocumentTransition()

        let out = {}

        switch (transitionType) {
          case false: {
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
                      amount: tokenTransition.updateTokenConfigurationItem.getItem()?.toString() ?? null
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
          case true: {
            out = {
              action: BatchEnum[transition.actionTypeNumber],
              id: transition.id.base58(),
              dataContractId: transition.dataContractId.base58(),
              revision: String(transition.revision ?? 0),
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

                out.tokenPaymentInfo = createTransition.base.tokenPaymentInfo
                  ? {
                      paymentTokenContractId: createTransition.base.tokenPaymentInfo.paymentTokenContractId?.base58() ?? null,
                      tokenContractPosition: createTransition.base.tokenPaymentInfo.tokenContractPosition,
                      minimumTokenCost: createTransition.base.tokenPaymentInfo.minimumTokenCost?.toString() ?? null,
                      maximumTokenCost: createTransition.base.tokenPaymentInfo.maximumTokenCost?.toString() ?? null,
                      gasFeesPaidBy: createTransition.base.tokenPaymentInfo.gasFeesPaidBy
                    }
                  : null

                break
              }
              case DocumentActionEnum.Replace: {
                const replaceTransition = transition.replaceTransition

                out.data = replaceTransition.data

                out.tokenPaymentInfo = replaceTransition.base.tokenPaymentInfo
                  ? {
                      paymentTokenContractId: replaceTransition.base.tokenPaymentInfo.paymentTokenContractId?.base58() ?? null,
                      tokenContractPosition: replaceTransition.base.tokenPaymentInfo.tokenContractPosition,
                      minimumTokenCost: replaceTransition.base.tokenPaymentInfo.minimumTokenCost?.toString() ?? null,
                      maximumTokenCost: replaceTransition.base.tokenPaymentInfo.maximumTokenCost?.toString() ?? null,
                      gasFeesPaidBy: replaceTransition.base.tokenPaymentInfo.gasFeesPaidBy
                    }
                  : null

                break
              }
              case DocumentActionEnum.Delete: {
                const deleteTransition = transition.deleteTransition

                out.tokenPaymentInfo = deleteTransition.base.tokenPaymentInfo
                  ? {
                      paymentTokenContractId: deleteTransition.base.tokenPaymentInfo.paymentTokenContractId?.base58() ?? null,
                      tokenContractPosition: deleteTransition.base.tokenPaymentInfo.tokenContractPosition,
                      minimumTokenCost: deleteTransition.base.tokenPaymentInfo.minimumTokenCost?.toString() ?? null,
                      maximumTokenCost: deleteTransition.base.tokenPaymentInfo.maximumTokenCost?.toString() ?? null,
                      gasFeesPaidBy: deleteTransition.base.tokenPaymentInfo.gasFeesPaidBy
                    }
                  : null

                break
              }
              case DocumentActionEnum.UpdatePrice: {
                const updatePriceTransition = transition.updatePriceTransition

                out.price = Number(updatePriceTransition.price)

                out.tokenPaymentInfo = updatePriceTransition.base.tokenPaymentInfo
                  ? {
                      paymentTokenContractId: updatePriceTransition.base.tokenPaymentInfo.paymentTokenContractId?.base58() ?? null,
                      tokenContractPosition: updatePriceTransition.base.tokenPaymentInfo.tokenContractPosition,
                      minimumTokenCost: updatePriceTransition.base.tokenPaymentInfo.minimumTokenCost?.toString() ?? null,
                      maximumTokenCost: updatePriceTransition.base.tokenPaymentInfo.maximumTokenCost?.toString() ?? null,
                      gasFeesPaidBy: updatePriceTransition.base.tokenPaymentInfo.gasFeesPaidBy
                    }
                  : null

                break
              }
              case DocumentActionEnum.Purchase: {
                const purchaseTransition = transition.purchaseTransition

                out.price = Number(purchaseTransition.price)

                out.tokenPaymentInfo = purchaseTransition.base.tokenPaymentInfo
                  ? {
                      paymentTokenContractId: purchaseTransition.base.tokenPaymentInfo.paymentTokenContractId?.base58() ?? null,
                      tokenContractPosition: purchaseTransition.base.tokenPaymentInfo.tokenContractPosition,
                      minimumTokenCost: purchaseTransition.base.tokenPaymentInfo.minimumTokenCost?.toString() ?? null,
                      maximumTokenCost: purchaseTransition.base.tokenPaymentInfo.maximumTokenCost?.toString() ?? null,
                      gasFeesPaidBy: purchaseTransition.base.tokenPaymentInfo.gasFeesPaidBy
                    }
                  : null

                break
              }
              case DocumentActionEnum.Transfer: {
                const transferTransition = transition.transferTransition

                out.receiverId = transferTransition.receiverId
                out.recipientId = transferTransition.recipientId.base58()

                out.tokenPaymentInfo = transferTransition.base.tokenPaymentInfo
                  ? {
                      paymentTokenContractId: transferTransition.base.tokenPaymentInfo.paymentTokenContractId?.base58() ?? null,
                      tokenContractPosition: transferTransition.base.tokenPaymentInfo.tokenContractPosition,
                      minimumTokenCost: transferTransition.base.tokenPaymentInfo.minimumTokenCost?.toString() ?? null,
                      maximumTokenCost: transferTransition.base.tokenPaymentInfo.maximumTokenCost?.toString() ?? null,
                      gasFeesPaidBy: transferTransition.base.tokenPaymentInfo.gasFeesPaidBy
                    }
                  : null

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
          ? Transaction.fromBytes(new Uint8Array(Buffer.from(assetLockProof.getInstantLockProof().getTransaction())))
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
                type: contractBounds.contractBoundsType ?? null,
                id: contractBounds.identifier.base58()
              }
            : null,
          id: key.keyId,
          keyType: key.keyType,
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
          ? Transaction.fromBytes(new Uint8Array(Buffer.from(assetLockProof.getInstantLockProof().getTransaction())))
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
      decoded.tokens = tokensConfigToArray(dataContractUpdateTransition.getDataContract().tokens ?? {}, dataContractUpdateTransition.getDataContract().id)
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
      decoded.publicKeyIdsToDisable = Array.from(identityUpdateTransition.publicKeyIdsToDisable ?? [])
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
      decoded.outputScript = identityCreditWithdrawalTransition?.outputScript?.hex() ?? null
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

      decoded.indexValues = masternodeVoteTransition.vote.votePoll.indexValues
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
    case StateTransitionEnum.IDENTITY_CREDIT_TRANSFER_TO_ADDRESS: {
      const identityCreditTransferToAddress = IdentityCreditTransferToAddressesTransitionWASM.fromStateTransition(stateTransition)

      decoded.userFeeIncrease = identityCreditTransferToAddress.userFeeIncrease
      decoded.nonce = identityCreditTransferToAddress.nonce.toString()
      decoded.recipientAddresses = identityCreditTransferToAddress.recipientAddresses.map(({ address, amount }) => ({
        address: address.toAddress(NETWORK),
        amount: amount.toString()
      }))
      decoded.senderId = identityCreditTransferToAddress.identityId.base58()
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_CREATE_FROM_ADDRESSES: {
      const identityCreateFromAddresses = IdentityCreateFromAddressesTransitionWASM.fromStateTransition(stateTransition)

      decoded.userFeeIncrease = identityCreateFromAddresses.userFeeIncrease
      decoded.inputs = identityCreateFromAddresses.inputs.map((input) => ({
        address: input.address.toAddress(NETWORK),
        credits: input.credits.toString(),
        nonce: input.nonce.toString()
      }))
      decoded.output = identityCreateFromAddresses.output
        ? {
            address: identityCreateFromAddresses.output.address.toAddress(NETWORK),
            credits: identityCreateFromAddresses.output.credits.toString()
          }
        : null
      decoded.publicKeys = identityCreateFromAddresses.publicKeys.map(key => {
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
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.IDENTITY_TOP_UP_FROM_ADDRESSES: {
      const identityTopUpFromAddresses = IdentityTopUpFromAddressesTransitionWASM.fromStateTransition(stateTransition)

      decoded.userFeeIncrease = identityTopUpFromAddresses.userFeeIncrease
      decoded.inputs = identityTopUpFromAddresses.inputs.map((input) => ({
        address: input.address.toAddress(NETWORK),
        credits: input.credits.toString(),
        nonce: input.nonce.toString()
      }))
      decoded.inputWitness = identityTopUpFromAddresses.inputWitness.map((input) => {
        const type = input.getType()
        const rawValue = input.getValue()
        const value = type === 'P2PKH'
          ? {
              signature: Buffer.from(rawValue.signature).toString('hex')
            }
          : {
              signatures: rawValue.signatures.map(sig => Buffer.from(sig).toString('hex')),
              redeemScript: Buffer.from(rawValue.redeemScript).toString('hex')
            }
        return {
          type: input.getType(),
          value
        }
      })
      decoded.output = identityTopUpFromAddresses.output
        ? {
            address: identityTopUpFromAddresses.output.address.toAddress(NETWORK),
            credits: identityTopUpFromAddresses.output.credits.toString()
          }
        : null
      decoded.feeStrategy = identityTopUpFromAddresses.feeStrategy.map(step => ({
        type: step.getValueType(),
        value: step.getValue()
      }))
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.ADDRESS_FUNDS_TRANSFER: {
      const addressFundsTransferTransition = AddressFundsTransferTransitionWASM.fromStateTransition(stateTransition)

      decoded.userFeeIncrease = addressFundsTransferTransition.userFeeIncrease
      decoded.inputs = addressFundsTransferTransition.inputs.map((input) => ({
        address: input.address.toAddress(NETWORK),
        credits: input.credits.toString(),
        nonce: input.nonce.toString()
      }))
      decoded.inputWitness = addressFundsTransferTransition.inputWitness.map((input) => {
        const type = input.getType()
        const rawValue = input.getValue()
        const value = type === 'P2PKH'
          ? {
              signature: Buffer.from(rawValue.signature).toString('hex')
            }
          : {
              signatures: rawValue.signatures.map(sig => Buffer.from(sig).toString('hex')),
              redeemScript: Buffer.from(rawValue.redeemScript).toString('hex')
            }
        return {
          type: input.getType(),
          value
        }
      })
      decoded.outputs = addressFundsTransferTransition.outputs.map((output) => ({
        address: output.address.toAddress(NETWORK),
        credits: output.credits.toString()
      }))
      decoded.feeStrategy = addressFundsTransferTransition.feeStrategy.map(step => ({
        type: step.getValueType(),
        value: step.getValue()
      }))
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK: {
      const addressFundingFromAssetLockTransition = AddressFundingFromAssetLockTransitionWASM.fromStateTransition(stateTransition)

      const assetLockProof = addressFundingFromAssetLockTransition.assetLockProof

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

      decoded.userFeeIncrease = addressFundingFromAssetLockTransition.userFeeIncrease
      decoded.inputs = addressFundingFromAssetLockTransition.inputs.map((input) => ({
        address: input.address.toAddress(NETWORK),
        credits: input.credits.toString(),
        nonce: input.nonce.toString()
      }))
      decoded.inputWitness = addressFundingFromAssetLockTransition.inputWitness.map((input) => {
        const type = input.getType()
        const rawValue = input.getValue()
        const value = type === 'P2PKH'
          ? {
              signature: Buffer.from(rawValue.signature).toString('hex')
            }
          : {
              signatures: rawValue.signatures.map(sig => Buffer.from(sig).toString('hex')),
              redeemScript: Buffer.from(rawValue.redeemScript).toString('hex')
            }
        return {
          type: input.getType(),
          value
        }
      })
      decoded.outputs = addressFundingFromAssetLockTransition.outputs.map((output) => ({
        address: output.address.toAddress(NETWORK),
        credits: output.credits?.toString() ?? '0'
      }))
      decoded.feeStrategy = addressFundingFromAssetLockTransition.feeStrategy.map(step => ({
        type: step.getValueType(),
        value: step.getValue()
      }))
      decoded.signature = Buffer.from(addressFundingFromAssetLockTransition.signature).toString('hex')
      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

      break
    }
    case StateTransitionEnum.ADDRESS_CREDIT_WITHDRAWAL: {
      const addressCreditWithdrawalTransition = AddressCreditWithdrawalTransitionWASM.fromStateTransition(stateTransition)

      decoded.userFeeIncrease = addressCreditWithdrawalTransition.userFeeIncrease
      decoded.inputs = addressCreditWithdrawalTransition.inputs.map((input) => ({
        address: input.address.toAddress(NETWORK),
        credits: input.credits.toString(),
        nonce: input.nonce.toString()
      }))
      decoded.inputWitness = addressCreditWithdrawalTransition.inputWitness.map((input) => {
        const type = input.getType()
        const rawValue = input.getValue()
        const value = type === 'P2PKH'
          ? {
              signature: Buffer.from(rawValue.signature).toString('hex')
            }
          : {
              signatures: rawValue.signatures.map(sig => Buffer.from(sig).toString('hex')),
              redeemScript: Buffer.from(rawValue.redeemScript).toString('hex')
            }
        return {
          type: input.getType(),
          value
        }
      })
      decoded.output = addressCreditWithdrawalTransition.output
        ? {
            address: addressCreditWithdrawalTransition.output.address.toAddress(NETWORK),
            credits: addressCreditWithdrawalTransition.output.credits.toString()
          }
        : null
      decoded.feeStrategy = addressCreditWithdrawalTransition.feeStrategy.map(step => ({
        type: step.getValueType(),
        value: step.getValue()
      }))
      decoded.pooling = addressCreditWithdrawalTransition.pooling
      decoded.outputAddress = addressCreditWithdrawalTransition.outputScript
        ? outputScriptToAddress(Buffer.from(addressCreditWithdrawalTransition.outputScript.bytes()))
        : null
      decoded.outputScript = addressCreditWithdrawalTransition?.outputScript?.hex() ?? null

      decoded.raw = Buffer.from(stateTransition.bytes()).toString('hex')

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

  const alias = `${label}${parentDomainName ? '.' : ''}${parentDomainName}`

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
      DataContractWASM.fromValue(dpnsContract, true),
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

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getAliasDocumentForIdentifier = async (identifier, sdk) => {
  const [alias] = await sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', identifier]], [], 1)

  return alias
}

const getAliasDocumentForIdentifiers = async (identifiers, sdk) => {
  const identifiersWithoutDuplicates = identifiers.filter((item, pos) => identifiers.indexOf(item) === pos)

  const identifiersWithAliasDocument = await Promise.all(identifiersWithoutDuplicates.map(
    async (identifier) => {
      const alias = await getAliasDocumentForIdentifier(identifier, sdk)

      return {
        owner: identifier,
        alias
      }
    }
  ))

  return identifiersWithAliasDocument.reduce((acc, identifierWithAliasDocument) => ({
    ...acc,
    [identifierWithAliasDocument.owner]: identifierWithAliasDocument.alias
  }), {})
}

// replace all wildcard characters to "safe" characters
const convertToSqlSafeString = (sql) => sql.replaceAll('_', '\\_').replaceAll('%', '\\%')

module.exports = {
  hash,
  decodeStateTransition,
  getKnex,
  sleep,
  checkTcpConnect,
  calculateInterval,
  iso8601duration,
  getAliasInfo,
  getAliasStateByVote,
  buildIndexBuffer,
  outputScriptToAddress,
  getAliasFromDocument,
  fetchTokenInfoByRows,
  convertToHomographSafeChars,
  getAliasDocumentForIdentifiers,
  getAliasDocumentForIdentifier,
  convertToSqlSafeString
}
