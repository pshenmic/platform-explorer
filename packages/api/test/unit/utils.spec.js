const { describe, it, mock, before } = require('node:test')
const assert = require('node:assert').strict
const utils = require('../../src/utils')
const DashCoreRPC = require('../../src/dashcoreRpc')
const cache = require('../../src/cache')
const createIdentityMock = require('./mocks/create_identity.json')
const dataContractCreateMock = require('./mocks/data_contract_create.json')
const dataContractCreateWithTokensMock = require('./mocks/data_contract_create_with_tokens.json')
const documentTransitionMock = require('./mocks/document_transition.json')
const tokenTransferTransitionMock = require('./mocks/token_transfer_transition.json')
const tokenConfigUpdateTransitionMock = require('./mocks/token_config_update_transition.json')
const tokenMintTransitionMock = require('./mocks/token_mint_transition.json')
const identityTopUpMock = require('./mocks/identity_top_up.json')
const dataContractUpdateMock = require('./mocks/data_contract_update.json')
const identityUpdateMock = require('./mocks/identity_update.json')
const identityCreditTransfer = require('./mocks/identity_credit_transfer.json')
const identityWithdrawal = require('./mocks/identity_withdrawal.json')
const masternodeVote = require('./mocks/masternode_vote.json')
const addressCreditWithdrawal = require('./mocks/address_credit_withdrawal.json')
const addressFundingFromAssetLock = require('./mocks/address_funding_from_asset_lock.json')
const addressFundsTransfer = require('./mocks/address_funds_transfer.json')
const shield = require('./mocks/shield.json')
const shieldFromAssetLock = require('./mocks/shield_from_asset_lock.json')
const shieldedWithdrawal = require('./mocks/shielded_withdrawal.json')
const identityCreditTransferToAddress = require('./mocks/identity_credit_transfer_to_address.json')
const Alias = require('../../src/models/Alias')
const { buildIndexBuffer } = require('../../src/utils')
const { IdentifierWASM } = require('pshenmic-dpp')
const Localization = require('../../src/models/Localization')
const PerpetualDistribution = require('../../src/models/PerpetualDistribution')
const DistributionFunction = require('../../src/models/DistributionFunction')

describe('Utils', () => {
  describe('decodeStateTransition()', () => {
    it('should decode DataContractCreate', async () => {
      const decoded = await utils.decodeStateTransition(dataContractCreateMock.data)

      assert.deepEqual(decoded, {
        type: 0,
        typeString: 'DATA_CONTRACT_CREATE',
        internalConfig: {
          canBeDeleted: false,
          readonly: false,
          keepsHistory: false,
          documentsKeepHistoryContractDefault: false,
          documentsMutableContractDefault: true,
          documentsCanBeDeletedContractDefault: true,
          requiresIdentityDecryptionBoundedKey: null,
          requiresIdentityEncryptionBoundedKey: null
        },
        userFeeIncrease: 0,
        version: 1,
        identityNonce: '10',
        dataContractId: 'GbGD5YbS9GVh7FSZjz3uUJpbrXo9ctbdKycfTqqg3Cmn',
        ownerId: '7dwjL5frrkM69pv3BsKSQb4ELrMYmDeE11KNoDSefG6c',
        tokens: [],
        groups: [],
        schema: {
          labler: {
            type: 'object',
            properties: {
              contractId: {
                type: 'string',
                minLength: 43,
                maxLength: 44,
                position: 0
              },
              shortName: {
                type: 'string',
                maxLength: 32,
                minLength: 3,
                position: 1
              }
            },
            required: [
              'shortName',
              'contractId'
            ],
            additionalProperties: false
          }
        },
        signature: '1f003ab4804374bf7a655620b4bc5b21dc300f7b0ad639ac7edd0780d28c09bfd31e8365d65c9bc8f2188748bae4d400b47cfcdef6e18871c213901ea526e62a4d',
        signaturePublicKeyId: 2,
        raw: '000000e7a63f573069e6f96b251f094423d20cb95a6639e0c32339d30f1d4009807b7100000000000101000001629ce9f3eb4e43c8fa936e16ec55e3aa8ef36663197326cc2032f0ed57cb4f410001066c61626c6572160412047479706512066f626a656374120a70726f706572746965731602120a636f6e7472616374496416041204747970651206737472696e6712096d696e4c656e677468035612096d61784c656e67746803581208706f736974696f6e0300120973686f72744e616d6516041204747970651206737472696e6712096d61784c656e677468034012096d696e4c656e67746803061208706f736974696f6e0302120872657175697265641502120973686f72744e616d65120a636f6e7472616374496412146164646974696f6e616c50726f7065727469657313000a0002411f003ab4804374bf7a655620b4bc5b21dc300f7b0ad639ac7edd0780d28c09bfd31e8365d65c9bc8f2188748bae4d400b47cfcdef6e18871c213901ea526e62a4d'
      })
    })

    it('should decode DataContractCreate with Tokens', async () => {
      const decoded = await utils.decodeStateTransition(dataContractCreateWithTokensMock.data)

      assert.deepEqual(decoded, {
        type: 0,
        typeString: 'DATA_CONTRACT_CREATE',
        internalConfig: {
          canBeDeleted: false,
          readonly: false,
          keepsHistory: false,
          documentsKeepHistoryContractDefault: false,
          documentsMutableContractDefault: true,
          documentsCanBeDeletedContractDefault: true,
          requiresIdentityDecryptionBoundedKey: null,
          requiresIdentityEncryptionBoundedKey: null
        },
        userFeeIncrease: 0,
        version: 1,
        identityNonce: '16',
        dataContractId: 'HMx6XgczJQaMU67WGPM3TJkz5YptJFnge5ac8yErZ7Ce',
        ownerId: 'DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD',
        tokens: [
          {
            tokenId: '76HAP8UMczsohFApQiGtGfhkUscUceq28jWJDYa3Ghzn',
            position: 0,
            description: null,
            conventions: {
              decimals: 8,
              localizations: {
                en: Localization.fromObject({
                  shouldCapitalize: true,
                  pluralForm: 'A1-DISTS',
                  singularForm: 'A1-DIST'
                })
              }
            },
            conventionsChangeRules: {
              authorizedToMakeChange: {
                takerType: 'ContractOwner',
                taker: null
              },
              adminActionTakers: {
                takerType: 'ContractOwner',
                taker: null
              },
              changingAuthorizedActionTakersToNoOneAllowed: true,
              changingAdminActionTakersToNoOneAllowed: true,
              selfChangingAdminActionTakersAllowed: true
            },
            baseSupply: '10000000000000',
            keepsHistory: {
              keepsTransferHistory: true,
              keepsFreezingHistory: true,
              keepsMintingHistory: true,
              keepsBurningHistory: true,
              keepsDirectPricingHistory: true,
              keepsDirectPurchaseHistory: true
            },
            startAsPaused: false,
            isAllowedTransferToFrozenBalance: true,
            maxSupply: null,
            maxSupplyChangeRules: {
              authorizedToMakeChange: {
                takerType: 'ContractOwner',
                taker: null
              },
              adminActionTakers: {
                takerType: 'ContractOwner',
                taker: null
              },
              changingAuthorizedActionTakersToNoOneAllowed: true,
              changingAdminActionTakersToNoOneAllowed: true,
              selfChangingAdminActionTakersAllowed: true
            },
            distributionRules: {
              perpetualDistribution: PerpetualDistribution.fromObject({
                type: 'BlockBasedDistribution',
                recipientType: 'ContractOwner',
                recipientValue: null,
                interval: 100,
                functionName: 'FixedAmount',
                functionValue: DistributionFunction.fromObject({
                  a: undefined,
                  amount: '10000',
                  b: undefined,
                  d: undefined,
                  decreasePerIntervalDenominator: undefined,
                  decreasePerIntervalNumerator: undefined,
                  distributionStartAmount: undefined,
                  m: undefined,
                  max: undefined,
                  maxIntervalCount: undefined,
                  maxValue: undefined,
                  min: undefined,
                  minValue: undefined,
                  n: undefined,
                  o: undefined,
                  p: undefined,
                  startDecreasingOffset: undefined,
                  startMoment: undefined,
                  startStep: undefined,
                  startingAmount: undefined,
                  stepCount: undefined,
                  trailingDistributionIntervalAmount: undefined
                })
              }),
              preProgrammedDistribution: null,
              newTokenDestinationIdentity: 'DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD',
              mintingAllowChoosingDestination: false
            },
            marketplaceRules: {
              tradeMode: 'NotTradeable',
              tradeModeChangeRules: {
                authorizedToMakeChange: {
                  takerType: 'ContractOwner',
                  taker: null
                },
                adminActionTakers: {
                  takerType: 'ContractOwner',
                  taker: null
                },
                changingAuthorizedActionTakersToNoOneAllowed: true,
                changingAdminActionTakersToNoOneAllowed: true,
                selfChangingAdminActionTakersAllowed: true
              }
            },
            manualMintingRules: {
              authorizedToMakeChange: {
                takerType: 'ContractOwner',
                taker: null
              },
              adminActionTakers: {
                takerType: 'ContractOwner',
                taker: null
              },
              changingAuthorizedActionTakersToNoOneAllowed: true,
              changingAdminActionTakersToNoOneAllowed: true,
              selfChangingAdminActionTakersAllowed: true
            },
            manualBurningRules: {
              authorizedToMakeChange: {
                takerType: 'ContractOwner',
                taker: null
              },
              adminActionTakers: {
                takerType: 'ContractOwner',
                taker: null
              },
              changingAuthorizedActionTakersToNoOneAllowed: true,
              changingAdminActionTakersToNoOneAllowed: true,
              selfChangingAdminActionTakersAllowed: true
            },
            freezeRules: {
              authorizedToMakeChange: {
                takerType: 'ContractOwner',
                taker: null
              },
              adminActionTakers: {
                takerType: 'ContractOwner',
                taker: null
              },
              changingAuthorizedActionTakersToNoOneAllowed: true,
              changingAdminActionTakersToNoOneAllowed: true,
              selfChangingAdminActionTakersAllowed: true
            },
            unfreezeRules: {
              authorizedToMakeChange: {
                takerType: 'ContractOwner',
                taker: null
              },
              adminActionTakers: {
                takerType: 'ContractOwner',
                taker: null
              },
              changingAuthorizedActionTakersToNoOneAllowed: true,
              changingAdminActionTakersToNoOneAllowed: true,
              selfChangingAdminActionTakersAllowed: true
            },
            destroyFrozenFundsRules: {
              authorizedToMakeChange: {
                takerType: 'ContractOwner',
                taker: null
              },
              adminActionTakers: {
                takerType: 'ContractOwner',
                taker: null
              },
              changingAuthorizedActionTakersToNoOneAllowed: true,
              changingAdminActionTakersToNoOneAllowed: true,
              selfChangingAdminActionTakersAllowed: true
            },
            emergencyActionRules: {
              authorizedToMakeChange: {
                takerType: 'ContractOwner',
                taker: null
              },
              adminActionTakers: {
                takerType: 'ContractOwner',
                taker: null
              },
              changingAuthorizedActionTakersToNoOneAllowed: true,
              changingAdminActionTakersToNoOneAllowed: true,
              selfChangingAdminActionTakersAllowed: true
            },
            mainControlGroupCanBeModified: {
              takerType: 'ContractOwner',
              taker: null
            },
            mainControlGroup: null
          }
        ],
        groups: [],
        schema: {},
        signature: '1f266a8a0153abceec829764c66b8f1b6fdec9e2c1e468b813a46d16bd18b26c2901a8be6c930b0cb0db0962b038ae419370a2ee2776145f238c5fb4239e0060fe',
        signaturePublicKeyId: 1,
        raw: '000001f318e74b0e6b8c3be2f3871aa8503dbb872d223975e64e0b6a5017e46eea1c2b0100000000010100000101b9059c00837dbe1cf91cceef2f5bff89be0a31ab2ca91fe202d4a5a52ed5d7f8000000000000000000010000000102656e00010741312d444953540841312d444953545308000101010101fd000009184e72a00000000101010101010001000101010101000100006400fb2710000001010101010001b9059c00837dbe1cf91cceef2f5bff89be0a31ab2ca91fe202d4a5a52ed5d7f8000101010101000001010101010001010101010000000101010101000101010101000101010101000101010101000101010101000101010101000101010101000100010741312d4449535400100001411f266a8a0153abceec829764c66b8f1b6fdec9e2c1e468b813a46d16bd18b26c2901a8be6c930b0cb0db0962b038ae419370a2ee2776145f238c5fb4239e0060fe'
      })
    })

    it('should decode Document Transition', async () => {
      const decoded = await utils.decodeStateTransition(documentTransitionMock.data)

      assert.deepEqual(decoded, {
        type: 1,
        typeString: 'BATCH',
        transitions: [
          {
            action: 'DOCUMENT_CREATE',
            id: 'bohnFt5XRFTercyoJZbtUTR2G8fdA5EbUSsHCijHu4E',
            dataContractId: 'Gx2XsZdt323XewFK7onzDKDTxT6Lg2ocDpz68FF63PgZ',
            revision: '1',
            prefundedVotingBalance: null,
            type: 'note',
            entropy: '3b9a57348313149503540e71b0d2bcf747f85130b95a896f347506777d7c34a9',
            identityContractNonce: '3',
            data: {
              message: 'test'
            },
            tokenPaymentInfo: {
              paymentTokenContractId: 'dfaPU4HsMpUX7NMF2TR5oeAC4cZvLwYrSU6WT4884bq',
              tokenContractPosition: 0,
              minimumTokenCost: null,
              maximumTokenCost: '15',
              gasFeesPaidBy: 'DocumentOwner'
            }
          }
        ],
        userFeeIncrease: 1,
        signature: '1f6ee1b3e98c2171b34ad67ff832bfede3e3d34e9140632d34f2e3ccf3a9b0b2200c5d097e45f5f16ac52fd9501a3ce3cd4cc3c61f0d2ca303f7d515015d85e8ad',
        signaturePublicKeyId: 2,
        ownerId: 'HT3pUBM1Uv2mKgdPEN1gxa7A4PdsvNY89aJbdSKQb5wR',
        raw: '0201f46747563f38be9c1fe0f5ccf426f0d2b2d41c07151f95229b00a984f8f8f224010000000108ea8e0cb77412791567ec36b342f2f49616c154d54f216de657a5a500721e8b03046e6f7465ecf7fb1ede8dd6c6aba2cf7dc6afc7408a8990cb2568ceeeec84df879bae2a6e010001096486d8db0a3f4a1b71a34988b9a81ff51a3e5fcf6851b2a8b3c1956de634b80000010f003b9a57348313149503540e71b0d2bcf747f85130b95a896f347506777d7c34a901076d657373616765120474657374000102411f6ee1b3e98c2171b34ad67ff832bfede3e3d34e9140632d34f2e3ccf3a9b0b2200c5d097e45f5f16ac52fd9501a3ce3cd4cc3c61f0d2ca303f7d515015d85e8ad'
      })
    })

    it('should decode Token Transfer Transition', async () => {
      const decoded = await utils.decodeStateTransition(tokenTransferTransitionMock.data)

      assert.deepEqual(decoded, {
        type: 1,
        typeString: 'BATCH',
        transitions: [
          {
            action: 'TOKEN_TRANSFER',
            tokenId: '8AnZE2i955j9PC55m3y3e6rVQVZHbLWTk66iNp8eoNWn',
            identityContractNonce: '16',
            tokenContractPosition: 1,
            groupInfo: null,
            dataContractId: '9g672HNThwyShq1c5MqQURENR2Ncxce8fLrafh6MmHLr',
            historicalDocumentTypeName: 'transfer',
            historicalDocumentId: 'EmF2uMAEWrZKwcN3WnZW5ajt9YwkTe5Zr5y4NYJMCHFx',
            recipient: 'DkWXAH3qSpCL4BEULAjWdYF8n29WWBRS7TWE8GGN2kWY',
            publicNote: null,
            amount: '111'
          }
        ],
        userFeeIncrease: 0,
        signature: '1f423b5dca10a8169795a8935b58007ffa0cc35faee58de23281bd5523ba5cf8b27cf475c3fa49495cfe7356c3a3219060bef1e2bbd72f6a9c5948ee13896e8843',
        signaturePublicKeyId: 1,
        ownerId: '8noJkyFbsawoVkMsLxNo1k3oEVaJppUG2B4UriFHFoi',
        raw: '020101fed99d7fcf72ca41aa2dba4445ae349421aa86ae6714319e271d8bab0cb34d0101020000100180e0eafa62ead97989b2ee14006ecefb24e290c03c9c7321a5a777aa8a86b6ff6a838baf57e456b1408869e3b12d1a1db56a5b9c67ff764512f1885d99df21d3006fbd7198a587375bf219dea865ced2abbd8605e9adb03c8c5cffbd1ba83fa99ad50000000001411f423b5dca10a8169795a8935b58007ffa0cc35faee58de23281bd5523ba5cf8b27cf475c3fa49495cfe7356c3a3219060bef1e2bbd72f6a9c5948ee13896e8843'
      })
    })

    it('should decode Token Mint Transition', async () => {
      const decoded = await utils.decodeStateTransition(tokenMintTransitionMock.data)

      assert.deepEqual(decoded, {
        type: 1,
        typeString: 'BATCH',
        transitions: [
          {
            action: 'TOKEN_MINT',
            tokenId: '42dmsi5zHvZg5Mg5q6rgghhQqn8bdAPhfnP96bH5GEQL',
            identityContractNonce: '3',
            tokenContractPosition: 0,
            dataContractId: 'AXBhHJpZtSMHMgDrSVpb6aJzBTWYMk7cjCZAZt34XYJT',
            historicalDocumentTypeName: 'mint',
            groupInfo: null,
            historicalDocumentId: 'DeuEqvk4yWtPesJJZsjWqkHZk3CtZZzwqeAKKzuAruGD',
            issuedToIdentityId: 'CcGoZt1etCP7NXitxe1Df18eBAEKuCfoM86yLMFNmcGi',
            publicNote: null,
            amount: '5'
          }
        ],
        userFeeIncrease: 0,
        signature: '201f6c4b7755a040db6ac00b6aa6810cb07cb9b3178673eb95fa3b2d2a73bdf502742bae71d509268364ba24485f16647f01a300695e72d1f4e2a872cd9c36e272',
        signaturePublicKeyId: 2,
        ownerId: '3G6e2uxNTAZ8eQnsFPvKH7BCHLKQC19A1ANxR56DEcsT',
        raw: '0201219576224b11ffdf5f7c659e227b91abb4c5ae9e2bf1b90d32593696dda3b642010101000003008d74b2ec913a2379ae097ed38a56fa82ceb0edbc64bd0fb003ab8d8a251a82302cfe38c3c30f331ea18c42f57c16c2595a1e931533c8afdf7621d4464d6397b50001ac79c0bc9b7fcf3ef61d0a41ede605a2b239e165df15cd00ca08d42797af29eb0500000241201f6c4b7755a040db6ac00b6aa6810cb07cb9b3178673eb95fa3b2d2a73bdf502742bae71d509268364ba24485f16647f01a300695e72d1f4e2a872cd9c36e272'
      })
    })

    it('should decode Token Config Update Transition', async () => {
      const decoded = await utils.decodeStateTransition(tokenConfigUpdateTransitionMock.data)

      assert.deepEqual(decoded, {
        type: 1,
        typeString: 'BATCH',
        transitions: [
          {
            action: 'TOKEN_CONFIG_UPDATE',
            tokenId: '6p86udGakFcMxG2yJdZaWavcs6RbFeV3bmx4EGwBKkyN',
            identityContractNonce: '3',
            tokenContractPosition: 0,
            dataContractId: '3J8WVdMqwbaCWyvUYCDEFakXcoT6vwHMjFRjCcTBezqn',
            historicalDocumentTypeName: 'configUpdate',
            historicalDocumentId: '453L2ynEPDc6ScMVYoQd8Nfn6ps2H49khYEQuuTv69MK',
            groupInfo: null,
            publicNote: null,
            itemName: 'ManualMinting',
            itemValue: {
              takerType: 'Identity(HNKNaYnZhBFywgbv7WiycDPVzGh7LZHqiaUR3WhiNx7r)',
              value: 'HNKNaYnZhBFywgbv7WiycDPVzGh7LZHqiaUR3WhiNx7r'
            }
          }
        ],
        userFeeIncrease: 0,
        signature: '2072f21d135de51a80d00bd501ab04b78f590bb98cfca22facdb4995cab0211abc1d8ce20d67e2c727031aeabdccfb2978beec78784f29b9da20b0d5f9e364f269',
        signaturePublicKeyId: 1,
        ownerId: 'HJCQnUa9CVVYGWwbyzHyvrwh5KamyrNGzPCA4N3aMT8r',
        raw: '0201f222c41778db4bf7fc1c2a58f3aabe803b04750460f5159a6dbbc21d6ef5f69f01010800000300221abccd324e28c6d23bfd9c134f9ed1c382d53d432ae35b1a3a94d8f5c984f9565cc34357ee9967a21b1dcba6ddae7cad3a6cc1efb8498da38382878f464a41001002f330f60da878e53be24aa1160ccb39492f903e8400b774a847e70efeff251e61000001412072f21d135de51a80d00bd501ab04b78f590bb98cfca22facdb4995cab0211abc1d8ce20d67e2c727031aeabdccfb2978beec78784f29b9da20b0d5f9e364f269'
      })
    })

    it('should decode CreateIdentity', async () => {
      const decoded = await utils.decodeStateTransition(createIdentityMock.data)

      assert.deepEqual(decoded, {
        type: 2,
        typeString: 'IDENTITY_CREATE',
        assetLockProof: {
          coreChainLockedHeight: null,
          type: 'instantSend',
          fundingAmount: '30000000',
          vout: 0,
          fundingCoreTx: 'fc89dd4cbe2518da3cd9737043603e81665df58d4989a38b2942eec56bacad1d',
          instantLock: 'AQEKM9t1ICNzvddKryjM4enKn0Y5amBn3o6DwDoC4uk5SAAAAAAdraxrxe5CKYujiUmN9V1mgT5gQ3Bz2TzaGCW+TN2J/JQP49yOk0uJ6el6ls9CmNo++yPYoX1Sx1lWEZTTAAAAhXiuCBXgzawuboxMAXDiXQpJCCPi417VE4mdcYPgTa0/Hd+RCHLAR6H+MXhqKazlGddI7AdWxxLZ94ZvQu+qIpe7G9XRRjQWeYwroIyc6MqQF5mKpvV0AUMYUNMXjCsq'
        },
        userFeeIncrease: 65,
        identityId: '3B3pVgtqLyZx9tUYoSTubXQMs6BQN6kkLURvGG8ax8NJ',
        signature: '8b14ae68bb53d39b6e48703ee1258d7cf51d3ac545f8290ec7efb944d34470',
        raw: '03000300000000000000210348a6a633850f3c83a0cb30a9fceebbaa3b9ab3f923f123d92728cef234176dc5412042186a3dec52bfe9a24ee17b98adc5efcbc0a0a6bacbc9627f1405ea5e1bb7ae2bb94a270363400969669e9884ab9967659e9a0d8de7464ee7c47552c8cb0e990001000002000021034278b0d7f5e6d902ec5a30ae5c656937a0323bdc813e851eb8a2d6a1d23c51cf411fbb0d0bb63d26c0d5b6e1f4b8c0eebef4d256c4e8aa933a2cb6bd6b2d8aae545215312924c7dd41c963071e2ccfe2187a8684d93c55063cb45fdd03e76344d6a400020000010000210245c3b0f0323ddbb9ddf123f939bf37296af4f38fa489aad722c50486575cd8f441204013dcca13378b820e40cf1da77abe38662546ef0a304545de3c35845b83a7ad4b42051c2b3539c9181b3f0cb3fb4bc970db89663c6bd6ca1468568a62beaa7500c601010a33db75202373bdd74aaf28cce1e9ca9f46396a6067de8e83c03a02e2e93948000000001dadac6bc5ee42298ba389498df55d66813e60437073d93cda1825be4cdd89fc940fe3dc8e934b89e9e97a96cf4298da3efb23d8a17d52c759561194d30000008578ae0815e0cdac2e6e8c4c0170e25d0a490823e2e35ed513899d7183e04dad3f1ddf910872c047a1fe31786a29ace519d748ec0756c712d9f7866f42efaa2297bb1bd5d1463416798c2ba08c9ce8ca9017998aa6f57401431850d3178c2b2af003000800010a33db75202373bdd74aaf28cce1e9ca9f46396a6067de8e83c03a02e2e93948000000006b483045022100a1be790d2e3b5c5a4958c9319f0ed1181c62a9d6a92cd85e4668694cb32037c002200b9c5a9b00099abb7d2435ee071d5c31b88f9593f8aac8e3cc3117f298629f470121029b92e9a5d33bff31f6e274d06159567c4ce09c707def6b8fe4788a0779db485fffffffff0280c3c90100000000026a0058474c00000000001976a914fde116faf385e18395d4f656bd4af0bfb6f7903888ac0000000024010180c3c901000000001976a914c5dc061d4a5b6621bbadfb80d1cc84da8cde84bc88ac00411f8b14ae68bb53d39b6e48703ee1258d7cf51d3ac545f8290ec7efb944d34470204a5e875d4f9b70f3c9dbcb24543e0f82cdfbc5a18f30369537c778c2887a17',
        publicKeys: [
          {
            contractBounds: null,
            id: 0,
            keyType: 'ECDSA_SECP256K1',
            data: '0348a6a633850f3c83a0cb30a9fceebbaa3b9ab3f923f123d92728cef234176dc5',
            publicKeyHash: '07630dddc55729c043de7bdeb145ee0d44feae3b',
            purpose: 'AUTHENTICATION',
            securityLevel: 'MASTER',
            readOnly: false,
            signature: '2042186a3dec52bfe9a24ee17b98adc5efcbc0a0a6bacbc9627f1405ea5e1bb7ae2bb94a270363400969669e9884ab9967659e9a0d8de7464ee7c47552c8cb0e99'
          },
          {
            contractBounds: null,
            id: 1,
            keyType: 'ECDSA_SECP256K1',
            data: '034278b0d7f5e6d902ec5a30ae5c656937a0323bdc813e851eb8a2d6a1d23c51cf',
            publicKeyHash: 'e2615c5ef3f910ebe5ada7930e7b2c04a7ffbb23',
            purpose: 'AUTHENTICATION',
            securityLevel: 'HIGH',
            readOnly: false,
            signature: '1fbb0d0bb63d26c0d5b6e1f4b8c0eebef4d256c4e8aa933a2cb6bd6b2d8aae545215312924c7dd41c963071e2ccfe2187a8684d93c55063cb45fdd03e76344d6a4'
          },
          {
            contractBounds: null,
            id: 2,
            keyType: 'ECDSA_SECP256K1',
            data: '0245c3b0f0323ddbb9ddf123f939bf37296af4f38fa489aad722c50486575cd8f4',
            publicKeyHash: 'd53ee3b3518fee80816ab26af98a34ea60ae9af7',
            purpose: 'AUTHENTICATION',
            securityLevel: 'CRITICAL',
            readOnly: false,
            signature: '204013dcca13378b820e40cf1da77abe38662546ef0a304545de3c35845b83a7ad4b42051c2b3539c9181b3f0cb3fb4bc970db89663c6bd6ca1468568a62beaa75'
          }
        ]
      })
    })

    it('should decode IdentityTopUp', async () => {
      const decoded = await utils.decodeStateTransition(identityTopUpMock.data)

      assert.deepEqual(decoded, {
        type: 3,
        typeString: 'IDENTITY_TOP_UP',
        assetLockProof: {
          coreChainLockedHeight: null,
          type: 'instantSend',
          fundingAmount: '300000',
          vout: 0,
          fundingCoreTx: '7734f498c5b59f64f73070e0a5ec4fa113065da00358223cf888c3c27317ea64',
          instantLock: 'AQHs1rAxR380KAbfV0C3D5O4o+klu/LZDZeaXtFiqNfVZgAAAABk6hdzwsOI+DwiWAOgXQYToU/speBwMPdkn7XFmPQ0d5QP49yOk0uJ6el6ls9CmNo++yPYoX1Sx1lWEZTTAAAApegVl+lFWGGL8UZIARiOy8CcehLnNIkiXGNoQlnwdfh6o9R+qbu+H5wxQIbdw1ptGLMP9P5XmFV3n5JouL9ceXYMfYxW00Fjkx8BbC4wNoUt0zprZD3VncjFQZnzTj0t'
        },
        identityId: '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF',
        amount: '300000000',
        signature: '810cd0bfe02104362941d35bd05fdf82cdc50c3bc8510077bfa62d47b68710',
        raw: '040000c60101ecd6b031477f342806df5740b70f93b8a3e925bbf2d90d979a5ed162a8d7d5660000000064ea1773c2c388f83c225803a05d0613a14feca5e07030f7649fb5c598f43477940fe3dc8e934b89e9e97a96cf4298da3efb23d8a17d52c759561194d3000000a5e81597e94558618bf1464801188ecbc09c7a12e73489225c63684259f075f87aa3d47ea9bbbe1f9c314086ddc35a6d18b30ff4fe579855779f9268b8bf5c79760c7d8c56d34163931f016c2e3036852dd33a6b643dd59dc8c54199f34e3d2def0300080001ecd6b031477f342806df5740b70f93b8a3e925bbf2d90d979a5ed162a8d7d566000000006a4730440220339d4d894eb2ff9c193bd8c33cdb3030a8be18ddbf30d983e8286c08c6c4c7d90220181741d9eed3814ec077030c26c0b9fff63b9ef10e1e6ca1c87069b261b0127a0121034951bbd5d0d500942426507d4b84e6d88406300ed82009a8db087f493017786affffffff02e093040000000000026a0078aa0a00000000001976a914706db5d1e8fb5f925c6db64104f4b77f0c8b73d488ac00000000240101e0930400000000001976a91474a509b4f3b80ce818465dc0f9f66e2103d9178b88ac003012c19b98ec0033addb36cd64b7f510670f2a351a4304b5f6994144286efdac411f810cd0bfe02104362941d35bd05fdf82cdc50c3bc8510077bfa62d47b68710'
      })
    })

    it.only('should decode DataContractUpdate', async () => {
      const decoded = await utils.decodeStateTransition(dataContractUpdateMock.data)

      assert.deepEqual(decoded, {
        type: 4,
        typeString: 'DATA_CONTRACT_UPDATE',
        internalConfig: {
          canBeDeleted: false,
          readonly: false,
          keepsHistory: false,
          documentsKeepHistoryContractDefault: false,
          documentsMutableContractDefault: true,
          documentsCanBeDeletedContractDefault: true,
          requiresIdentityDecryptionBoundedKey: null,
          requiresIdentityEncryptionBoundedKey: null
        },
        identityContractNonce: '4',
        signaturePublicKeyId: 2,
        signature: '204b16deb1faf827d76dddb4228c717c09baa153b9a6c82952439191d7dddd3a171385ef31482ef7c7950a95605fc4b7096ff50d8c4aceb24f259276979f16b188',
        userFeeIncrease: 0,
        ownerId: '7dwjL5frrkM69pv3BsKSQb4ELrMYmDeE11KNoDSefG6c',
        dataContractId: '8BzeH7dmyLHNzcCtG6DGowAkWyRgWEq15y88Zz2zBxVg',
        tokens: [],
        groups: {},
        schema: {
          labler: {
            type: 'object',
            properties: {
              shortName: {
                type: 'string',
                maxLength: 32,
                minLength: 3,
                position: 1
              },
              contractId: {
                type: 'string',
                minLength: 43,
                maxLength: 44,
                position: 0
              }
            },
            required: [
              'shortName',
              'contractId'
            ],
            additionalProperties: false
          }
        },
        version: 2,
        dataContractOwner: '7dwjL5frrkM69pv3BsKSQb4ELrMYmDeE11KNoDSefG6c',
        raw: '010004006ad2cb1cc89d13f05a01a91a9ec72a20d08018c9c4186bb57aaec0bd2deb2e3b00000000000101000002629ce9f3eb4e43c8fa936e16ec55e3aa8ef36663197326cc2032f0ed57cb4f410001066c61626c6572160412047479706512066f626a656374120a70726f706572746965731602120973686f72744e616d6516041204747970651206737472696e6712096d61784c656e677468022012096d696e4c656e67746802031208706f736974696f6e0201120a636f6e7472616374496416041204747970651206737472696e6712096d696e4c656e677468022b12096d61784c656e677468022c1208706f736974696f6e0200120872657175697265641502120973686f72744e616d65120a636f6e7472616374496412146164646974696f6e616c50726f706572746965731300000241204b16deb1faf827d76dddb4228c717c09baa153b9a6c82952439191d7dddd3a171385ef31482ef7c7950a95605fc4b7096ff50d8c4aceb24f259276979f16b188'
      })
    })

    it('should decode IdentityUpdate', async () => {
      const decoded = await utils.decodeStateTransition(identityUpdateMock.data)

      assert.deepEqual(decoded, {
        type: 5,
        typeString: 'IDENTITY_UPDATE',
        identityNonce: '2',
        userFeeIncrease: 0,
        identityId: 'AGQc1dwAc46Js6fvSBSqV2Zi7fCq2YvoAwEb1SmYtXuM',
        revision: '1',
        publicKeysToAdd: [
          {
            contractBounds: {
              type: 'documentType',
              id: '3Fq4GuFDSaPm7qN2rG8chtif6jgZnqyY48rw9caUMGo6',
              typeName: 'contact'
            },
            id: 5,
            type: 'ECDSA_SECP256K1',
            data: '023b63a7e2321db63f5dbd26e08e3aa1da974404fd6b9303903195be10fe12e2b0',
            publicKeyHash: 'aefbbefbbf99eee9e134c0657a13651a5692e98d',
            purpose: 'ENCRYPTION',
            securityLevel: 'MEDIUM',
            readOnly: false,
            signature: '1f58d5c8ee4e87e6d6fffcfebcaadc030599cc4e18e41f3d7f78bd993666e146973beb1ca57e0366eceef0510e3b55a97db765110d4ff07b9653db237d8a021d51'
          },
          {
            contractBounds: {
              type: 'documentType',
              id: '3Fq4GuFDSaPm7qN2rG8chtif6jgZnqyY48rw9caUMGo6',
              typeName: 'contact'
            },
            id: 6,
            type: 'ECDSA_SECP256K1',
            data: '026e9189c76f667c774da971d5eacee575acfd747c3ea6ca8af3636f93ac871f73',
            publicKeyHash: '56db223d9e394d9a15db5064f9e19be3c40d20ff',
            purpose: 'DECRYPTION',
            securityLevel: 'MEDIUM',
            readOnly: false,
            signature: '1fd753dbf431f8be55fe5545678c05ca81a1b3cfb676ff85fe22caf0042b2ad84b437c203bf16ead8d3f62f74d832d6ca8a492804340d356f1d003856ca50f170a'
          }
        ],
        publicKeyIdsToDisable: [],
        signature: '1f2aed7dde98c36f35e1a58faac11b4ec6f84f72cf1529425f30822a09f227216719fe576a1c30361b1cc86a149dfd2eff30f3fd5890dc8d1c8f7789f8ade0b5e5',
        signaturePublicKeyId: 0,
        raw: '060089ab954c07d311e0956d0ae1920e0787e5ce9c17bb2b8476d9a17605c36b28bc010202000500010301012183d7c08fb0c9bf280d0cd299fcdf2359db9bc3048b1648ec3775f190e1c7bd07636f6e746163740021023b63a7e2321db63f5dbd26e08e3aa1da974404fd6b9303903195be10fe12e2b0411f58d5c8ee4e87e6d6fffcfebcaadc030599cc4e18e41f3d7f78bd993666e146973beb1ca57e0366eceef0510e3b55a97db765110d4ff07b9653db237d8a021d51000600020301012183d7c08fb0c9bf280d0cd299fcdf2359db9bc3048b1648ec3775f190e1c7bd07636f6e746163740021026e9189c76f667c774da971d5eacee575acfd747c3ea6ca8af3636f93ac871f73411fd753dbf431f8be55fe5545678c05ca81a1b3cfb676ff85fe22caf0042b2ad84b437c203bf16ead8d3f62f74d832d6ca8a492804340d356f1d003856ca50f170a000000411f2aed7dde98c36f35e1a58faac11b4ec6f84f72cf1529425f30822a09f227216719fe576a1c30361b1cc86a149dfd2eff30f3fd5890dc8d1c8f7789f8ade0b5e5'
      })
    })

    it('should decode IdentityCreditTransfer', async () => {
      const decoded = await utils.decodeStateTransition(identityCreditTransfer.data)

      assert.deepEqual(decoded, {
        type: 7,
        typeString: 'IDENTITY_CREDIT_TRANSFER',
        identityNonce: '3',
        userFeeIncrease: 2,
        senderId: '4CpFVPyU95ZxNeDnRWfkpjUa9J72i3nZ4YPsTnpdUudu',
        recipientId: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
        amount: '9998363',
        signaturePublicKeyId: 65,
        signature: 'ca8aaa0ee3861da3579129ada28d1f2bdcbd847dd2dc1ddc9897fba3ba8c5060',
        raw: '07002f99e00e7f82a904c3fbf60ae6b5329ef77444436d022fb0aeb068c35bc7b0c4ed1f6e1c441217d504cf4e5e2b4754890563cd4410dda131cfd2973f03acffdffc0098901b03024120ca8aaa0ee3861da3579129ada28d1f2bdcbd847dd2dc1ddc9897fba3ba8c5060'
      })
    })

    it('should decode IdentityWithdrawal', async () => {
      const decoded = await utils.decodeStateTransition(identityWithdrawal.data)

      assert.deepEqual(decoded, {
        type: 6,
        typeString: 'IDENTITY_CREDIT_WITHDRAWAL',
        outputAddress: 'yZF5JqEgS9xT1xSkhhUQACdLLDbqSixL8i',
        userFeeIncrease: 2,
        senderId: 'FvqzjDyub72Hk51pcmJvd1JUACuor7vA3aJawiVG7Z17',
        amount: '1000000',
        identityNonce: '1',
        outputScript: '76a9148dc5fd6be194390035cca6293a357bac8e3c35c588ac',
        coreFeePerByte: 2,
        signature: '8422df782b5e51b8a53ae46fe9b7a9280df4de575f031e58ed527e7a17c1e9',
        signaturePublicKeyId: 65,
        pooling: 'Never',
        raw: '0500ddcecc8cd40dfc1d88a7135a3f29834ca8788f844bca10349140507905f09926fc000f424002001976a9148dc5fd6be194390035cca6293a357bac8e3c35c588ac0102411f8422df782b5e51b8a53ae46fe9b7a9280df4de575f031e58ed527e7a17c1e9'
      })
    })

    it('should decode MasternodeVote', async () => {
      const decoded = await utils.decodeStateTransition(masternodeVote.data)

      assert.deepEqual(decoded, {
        type: 8,
        typeString: 'MASTERNODE_VOTE',
        indexValues: [
          'EgRkYXNo',
          'Egh0ZXN0MDEwMA=='
        ],
        contractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
        modifiedDataIds: [
          '2Ey6wdP5YYSqhq96KmU349CeSCsV4avrsNCaXqogGEr9'
        ],
        ownerId: '2Ey6wdP5YYSqhq96KmU349CeSCsV4avrsNCaXqogGEr9',
        signature: '1f6c69fa9201b57bb7e7c24b392de9056cce5a66bcf2154d57631419e9c68efa8e4d1ca11e81c35de31dd52321d0fbb25f6ff17f5ff69a9cf47fce54746ee72644',
        documentTypeName: 'domain',
        indexName: 'parentNameAndLabel',
        choice: 'TowardsIdentity(4VRAaVi8vq492FznoHKTsQd4odaXa7vDxdghpTSQBVSV)',
        raw: '0800bc77a5a2cec455c79fb92fb683dbd87a2a92b663c9a46d0c50d11889b4aeb121126fac34e15653f82356cffd3d37c5cd84c1f634d4043340dbae781d93d6b87e000000e668c659af66aee1e72c186dde7b5b7e0a1d712a09c40d5721f622bf53c5315506646f6d61696e12706172656e744e616d65416e644c6162656c02120464617368120874657374303130300033daa5a3e330b61e5a4416ab224f0a45ef4e4cab1357b5f4a86fae9314717a561000411f6c69fa9201b57bb7e7c24b392de9056cce5a66bcf2154d57631419e9c68efa8e4d1ca11e81c35de31dd52321d0fbb25f6ff17f5ff69a9cf47fce54746ee72644',
        proTxHash: 'bc77a5a2cec455c79fb92fb683dbd87a2a92b663c9a46d0c50d11889b4aeb121',
        userFeeIncrease: 0,
        identityNonce: '16'
      })
    })

    it('should decode AddressCredtiWithdrawal', async () => {
      const decoded = await utils.decodeStateTransition(addressCreditWithdrawal.data)

      assert.deepEqual(decoded, {
        type: 14,
        typeString: 'ADDRESS_CREDIT_WITHDRAWAL',
        userFeeIncrease: 0,
        inputs: [
          {
            platformAddress: {
              base58: 'yZZkv2xhfqoXMgWEDvog9U65c17RzZLrbV',
              bech32m: 'tdash1kzg5azscav69z7m6dfzr9ner0a5vt7pn9ca4sz8d'
            },
            credits: '250000000000',
            nonce: '5'
          }
        ],
        inputWitness: [
          {
            type: 'P2PKH',
            value: {
              signature: '2097d5baef616aeeb6b19e5baf4fdc2bdadcc685bd01161844c199b22b41afe1547a90cef74d70a776263ef723f509711f495a6907a63f89b7ddb260956404299b'
            }
          }
        ],
        output: null,
        feeStrategy: [
          {
            type: 'DeductFromInput',
            value: 0
          }
        ],
        pooling: 'Never',
        outputAddress: 'yT6NQzvH2h16ggSKNj2b2Wu3NMFiYVKXeB',
        outputScript: '76a9144a4fc56e14aa98799880abbcd46de5d2e09998fb88ac',
        raw: '0e000100914e8a18eb34517b7a6a4432cf237f68c5f8332e05fd0000003a352944000001000001001976a9144a4fc56e14aa98799880abbcd46de5d2e09998fb88ac000100412097d5baef616aeeb6b19e5baf4fdc2bdadcc685bd01161844c199b22b41afe1547a90cef74d70a776263ef723f509711f495a6907a63f89b7ddb260956404299b'
      })
    })
    it('should decode AddressFundingFromAssetLock', async () => {
      const decoded = await utils.decodeStateTransition(addressFundingFromAssetLock.data)

      assert.deepEqual(decoded, {
        type: 13,
        typeString: 'ADDRESS_FUNDING_FROM_ASSET_LOCK',
        assetLockProof: {
          coreChainLockedHeight: null,
          type: 'instantSend',
          instantLock: 'AQKflfCMay9YZSHo7Yy2u5l0vwE0obDfr8cqfShF9bqn/gEAAAD2vDZ5zvy1mcNCSF5jfsxQkw0veXBo6aJNE/13WYR7awEAAACJfGgEXp9GdjneIf96kXXJEn+b/Qix6fYXJ1hgqBQzH/y3yJZU0Ky99rsWgfhfdvFC4UBFsddngtq6TJgBAAAAix7+tMc2flwUVAB1uquM+dk5TF/nhmAnX9PmNHbUnIUTFWvpfXw7lnqpLERjGgKeF5ITbSsXcFU2TiKYWg7esh/DYYYrbdXBbJ6OoiLVQjjI60Em+1NK4nPycG9g6xOX',
          fundingAmount: '100000000',
          fundingCoreTx: '1f3314a860582717f6e9b108fd9b7f12c975917aff21de3976469f5e04687c89',
          vout: 0
        },
        userFeeIncrease: 0,
        inputs: [],
        inputWitness: [],
        outputs: [
          {
            platformAddress: {
              base58: 'yTdAgPuFgiByksqV1Hhwgxbw3EdJRKQBwb',
              bech32m: 'tdash1kpgz9hk6tkn5zj3653s8qkjmk9439qkf0gt229dv'
            },
            credits: '0'
          }
        ],
        feeStrategy: [
          {
            type: 'ReduceOutput',
            value: 0
          }
        ],
        signature: '202856c525c2d3c001cfd581bd46df6f73220db84fcbb111c6729bd66d2d07e2d37c84e543627bd9fbb953ff0bf98e0367abedc790970471fec6816df2ad6f4064',
        raw: '0d0000ea01029f95f08c6b2f586521e8ed8cb6bb9974bf0134a1b0dfafc72a7d2845f5baa7fe01000000f6bc3679cefcb599c342485e637ecc50930d2f797068e9a24d13fd7759847b6b01000000897c68045e9f467639de21ff7a9175c9127f9bfd08b1e9f617275860a814331ffcb7c89654d0acbdf6bb1681f85f76f142e14045b1d76782daba4c98010000008b1efeb4c7367e5c14540075baab8cf9d9394c5fe78660275fd3e63476d49c8513156be97d7c3b967aa92c44631a029e1792136d2b177055364e22985a0edeb21fc361862b6dd5c16c9e8ea222d54238c8eb4126fb534ae273f2706f60eb1397fb018303000800029f95f08c6b2f586521e8ed8cb6bb9974bf0134a1b0dfafc72a7d2845f5baa7fe010000006b483045022100bbfbd824846523f7d2c6799b47a9dea88c0fb60dd433d0d8971abee63dd4966b022008dcee6d9780aa962d37cfed6ca54e256f6dba1190c01c7a58cc749709179f450121022bb6c14bedb4deb4059a260c7228f0d38f8274e7fadeea4b5739a4c120d651aefffffffff6bc3679cefcb599c342485e637ecc50930d2f797068e9a24d13fd7759847b6b010000006a473044022074bd9c8c4ca4557cdf57017627b6b666c7586b674503f3f26ae8f1fed714d2510220295ea1d64c5745988e94c963972059d20171d0e0f92b07c31469bb622a468f3c0121022bb6c14bedb4deb4059a260c7228f0d38f8274e7fadeea4b5739a4c120d651aeffffffff0200e1f50500000000026a00a008510b000000001976a914f84b203ee59814a41f1aa2379043ab3af98143f188ac0000000024010100e1f505000000001976a91469dccf851a2cb6c2f18ee1274e4fd1669af7685a88ac000001005022deda5da7414a3aa460705a5bb16b1282c97a000101000041202856c525c2d3c001cfd581bd46df6f73220db84fcbb111c6729bd66d2d07e2d37c84e543627bd9fbb953ff0bf98e0367abedc790970471fec6816df2ad6f406400'
      })
    })
    it('should decode AddressFundsTransfer', async () => {
      const decoded = await utils.decodeStateTransition(addressFundsTransfer.data)

      assert.deepEqual(decoded, {
        type: 12,
        typeString: 'ADDRESS_FUNDS_TRANSFER',
        userFeeIncrease: 0,
        inputs: [
          {
            platformAddress: {
              base58: 'yRpNvoc3hd66c3rNrPRGubVd9vGUoAVpZV',
              bech32m: 'tdash1kq79z66rh34l4u2axlz3jv34zwshggnenul6cvwn'
            },
            credits: '100000000',
            nonce: '2'
          }
        ],
        inputWitness: [
          {
            type: 'P2PKH',
            value: {
              signature: '1f8d77c0034cfbd9dde264a109b36ac666f579a76730de8840c9ec95515286bcfc1b3bdf140d70915e96c251e5e6a63ab210abbe813d99ec6f4a77b4c844c99e94'
            }
          }
        ],
        outputs: [
          {
            platformAddress: {
              base58: 'yLRvYtK1GKU3V96igCuENoDNZTDqMueSq5',
              bech32m: 'tdash1kqqnn84grgmrqrh98h33e3u9f7vasdrt7c0je8pj'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yLy3FKiUN2h1NtJr8D4Cb85KEfQVkgCxBV',
              bech32m: 'tdash1kqr3cxhgel75ru0yrhj5eq8j8jt92m5enqrfajxw'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMEyWias3eQEyZJjFXov2hddgHckxf4Vz5',
              bech32m: 'tdash1kq9plfyacx9q26dtaxgwuw9lt78nyu2mzc3xwcxv'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMGBpsFMpe8jheCwAbLNCTr4XJHRFstFQb',
              bech32m: 'tdash1kq9954jedavs9twj6r07yg25y2ymkzqg5s7umjhc'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMMqB5R21PtheP7AAgKAniZxzzy5z3prjT',
              bech32m: 'tdash1kq9khxq3mrllp3vd72kj4valdnwfmpxfxsrmdvvx'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMScsdSb8fEEHsEYHCGWNuAyRvY6QtJGfV',
              bech32m: 'tdash1kqx9xe7khtgedcr0lyrdh08wm852l0k9xulh2vte'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMVSAUDBTtgX1tDVgaQDprXgtRVHGSN3wY',
              bech32m: 'tdash1kqxdhd4tz8lhu0g66px0qzqe0uhp08840yp7v469'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMYxWfJvp7JvvDeaXyFmKhzZMNdZ2jZ4tE',
              bech32m: 'tdash1kqxcvjmkfw7j0azk66wk6s0r347kldvgnyu8wm7p'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMZ6UKi2VWLPkP7aab7mSRj7w46KVntvu7',
              bech32m: 'tdash1kqxceurw4venw24eway33yvf8qfcs4x2gu8ve4nw'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMancpJ2cEGhAALrLQsbPLbH3fgoXBHnxg',
              bech32m: 'tdash1kqxaah3p4ucc92q8k2g7ttgzmwnrh0zsqsr5lch6'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMjVb7NhnfGoJaoMmDoMwZJb4AL1eQiCa6',
              bech32m: 'tdash1kq8cge2mvmca93flzf8pn449suahm77eeqws5luc'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMokTBpjJ7hwiYbWxt3foP8sjHorgg93FY',
              bech32m: 'tdash1kqg9yau5tgxfv82ge7k3atxm2f2fxtt3lvveyac8'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yMwYsfEeiZToU2JovbKZqnQZqkTZxdhGg2',
              bech32m: 'tdash1kqgucg2zejzkex9rp6dhftnjdxgcmqh8gcv8cukn'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yNZ1cyWUarwRWJNGiEE7s8uesV328i6iLR',
              bech32m: 'tdash1kqvgzpq9q7r9uxnmx8k6a0atfejwrs4gyue7sm9g'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yNZ6Tu7BYiR8jh6kRJexYAXbzvLYQeS7K1',
              bech32m: 'tdash1kqvg2rc377vtkl8qgl6qdmuzr6ayuv7t0v8ql9lg'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yNadMm4hfU1tPBp29uJfzC8oxd1GcPPUBv',
              bech32m: 'tdash1kqvv7sun7efzmq8m4t5fj990cq4pxk5fd5rln02m'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yP4pqSqYeGtWSjZaBfAsKynNgAbDtNQf63',
              bech32m: 'tdash1kq0zgl0qjyhz9f0y4mdvwrf3s29vn7q2dgzsqtnw'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yP8182D7K9NxmQBrvbxy398jN9KM3rNiaf',
              bech32m: 'tdash1kq0tu5mr9vw8gawnyd4qmuzd680l2qzz2c7zggyw'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yP9htGD6Zvc1UpDMh4xASFqMXYVAhM6HHF',
              bech32m: 'tdash1kq03p3xvmtz2appq3ggkmcvrm5fel6a6kqfeffud'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yQDfWfdoU6JBma525GuuSZu1xo35oPqt7f',
              bech32m: 'tdash1kq4v3yl6mw9napv5j9qs6ltxwg0sceyhzskfpvtj'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yQMLwDt3QgDK4s4t7nehYXQQZqY83p2ctM',
              bech32m: 'tdash1kqkrces4qjft9qd5rd907jdaauz8czmhuq8xn54f'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yQSdsMLDJWVbiVzmiB4nAwSgT2cRZ9gYdX',
              bech32m: 'tdash1kqkne8ga388u0kgla8uv4z4jfyzqefl5ds9lh2zm'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yQWXsMMs9ATvRqzzeoV6K4QR4K9hqfTcLb',
              bech32m: 'tdash1kqklj3xlk0pzvjqz3k8rkj22uw7wjdlphgg90sqh'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yRHZpq4qVQcbwyqwTUhTD3xGgASP1Q7uMh',
              bech32m: 'tdash1kqm8m8km8mt5pdf5l66pzpyk4cd43gvhdgr639zz'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yRLDkUcUnhCkaTumhRjLf9uCnDbXXN7Ui9',
              bech32m: 'tdash1kqm0u8z3xrlud5g57p5rp898pus38zdprcak4nzn'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yRRd5NBguXFNp3mcGWUY3TyaU2WVMVDFyR',
              bech32m: 'tdash1kquq82tx800ppjd8x3xkjx2lfx98scvgdu23x7d3'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yRiRVUS5SSApuqk9tpo3iHAMqeASj1Awoz',
              bech32m: 'tdash1kqanzyquh69sx95ndy4asjjkk83qs9cjnsgz8ea7'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yRk5uXAFoQU1a1KYq1i4yzmUC2bqweiZmV',
              bech32m: 'tdash1kqacrzae2enwyr797gtyfrtwj7cwamfdl577l49j'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ySceoSJ3Gwoy2qfiXShiP3YpwWBLE6f36F',
              bech32m: 'tdash1kpz3rnd8sv75uxrugwhx00e9e6jlxlpceu9nlq3n'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ySv2CLogbYUBnHVDey6MTYX7mpAM6J1cGZ',
              bech32m: 'tdash1kpy94wlc7k68rcz3exr9puuykl0esv3cd5jk8c00'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yT1jGGpp22NsvFKS75KNca67BH3E87k88L',
              bech32m: 'tdash1kpyk7xyzzgtlswcl7l03u529prc47qj64vgejtwr'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yT7V5riT1BTLHWPvWKqVacrAgCmUoQQ53J',
              bech32m: 'tdash1kp9gts2xmjjz2jxe97dkzf5gtc2k706deyx4umtx'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yT9BLtjQcVJrah76hJbjHMbWPfEUmJkvee',
              bech32m: 'tdash1kp9d03c522js948sj59av4jh7a2k5jqjxuuck7nf'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yTUc6sZGwPGEQTmuX22fpK6xWnaNLGK9zC',
              bech32m: 'tdash1kp8ggkgujpvgehgq3kxswgegd5j2tam3w5rua25x'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yTVozH4Trw5ZEEzZjpsGXCKxsr1AQqk4rg',
              bech32m: 'tdash1kp8tatadrzph6z2xh8r9w73leqh9ymtp35ah86fq'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yTxA1HarqB1mk1jkAzCwDgqePjviuvqcVa',
              bech32m: 'tdash1kpfm5d0lpaawh2rmtftelqxek74c0yd9my8tczw3'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yUm6NVpuRLtbL2zCU2XkwoUBxquuVU4Gum',
              bech32m: 'tdash1kpwf4w34yy998jy30vwdwfmcykww4s3mhuaaqlkw'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yUqYfyabEh4YhBdzDNFvjonDfUayWRDCJX',
              bech32m: 'tdash1kpwhyk9nxm37nmnn3azeh88yre38yqlnuqcw0424'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yV8xieK8YMgNCMDiSCurBuFEKkfEqwW4Yi',
              bech32m: 'tdash1kpst6lvv2xdwfqv98xsh8kyynuh0gs3szck4ntlx'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yVMpAbWhUWMbK7HwM2rjDgmmhysXnQJEmD',
              bech32m: 'tdash1kp3jhs352gdwwljn9xs2e7v6pua3kzztmykqwrml'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yVWMZMZUsxr1ag2HpVLBYzWQHjuW7sWDNx',
              bech32m: 'tdash1kpjvjj5kmeksx5dxcac62zdnhtd58pgtl5sak035'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yVwq9cWArNRmvzDaLwdgYhUpxwJSLmBgza',
              bech32m: 'tdash1kp5e4wx07j6rqtu9ay6gnwpwxnrejquce5c9vapf'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yW3rHfmHtA8GQxYAC6vS3y4RAs3umdfB4V',
              bech32m: 'tdash1kp4tu2cugdf2rmpkqdvgkn5quy8elcxmgqz2j5sa'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yW6qq9g9GN8WcMmRtvqrpX7UFRJzXfyLhe',
              bech32m: 'tdash1kp457zxu4wl30lef7ufsj02aun2v4aw0m5u7gflp'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yWfmjfCPToQMyt6sJmE65mwQgHQHSXpvti',
              bech32m: 'tdash1kpccj4lz88tlr26tucza53dwe2p6kshr6cxxra0g'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yWo2mo7P4S7GkoQamwCERfXHGAVc8BSWJ3',
              bech32m: 'tdash1kpew3n4pyrc7m2dd826yduvrsq32ge2ymg4levth'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yWxhMyQ9kKvnYSk86fbJtmVAQZ5BpotNti',
              bech32m: 'tdash1kp6tesm54y4ys8mkgw76kzvs68vshlcu45crqyds'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yX1nE18Wvnn1vnG8FphtrsMzPJJEct6UGH',
              bech32m: 'tdash1kp64yysf73kazy8n5f6gwcsyel4jv3x7q5sqpmlg'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yXMKz81VvXebQRWD13Gb3Hn44vph2DcbSy',
              bech32m: 'tdash1kpusglrcpk9auyyt3earl8dltc67med66um3vxzc'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yXZx4VDFobvosk3pMmG7ESDC1R9DgtG8Gq',
              bech32m: 'tdash1kpak09uysjqeujcmd2jlz6aly5yfy9vpkvjk52tr'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yXhxMuGneNWTpE7vXhKX98tvazPCiNsEEX',
              bech32m: 'tdash1kp7wk2ujf5adtpujxl7tt48mejepe6dr7smfwm4u'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yY69u7ciejdH1f4BGNAMkZQfPAnsGP7egZ',
              bech32m: 'tdash1kzq3muljuxs9ts9m4memdl355z5yuyqe3q99sazg'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yYkQibAJLyoAkH9dzYdfxb79ZJL21B9JAN',
              bech32m: 'tdash1kzy95ggaeu9pkeszlnaxdxv26kkusfqcsqn5n74z'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yYmifT5tpKiMa59mBZMw4qL1s8KdVfrJPv',
              bech32m: 'tdash1kzyfnp5em972xpuclnkz2jq0xpn9ujgjeyh9g8hg'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yZH5jHKaY7UcNTtbAiU95Kvdrta8iWtuuN',
              bech32m: 'tdash1kz8zwtr6getn57yramejt24x8ln5y8c7yuwkltzm'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yZjdPezWkG1izgiy6iJ7gruvf96UFhKeTW',
              bech32m: 'tdash1kzfjc6eyadlxpj77kdftjkwxtf26tj8ekva2xtyl'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yaJwJcb5RVcunVecj5S3aSJk72iJW5Z7Rb',
              bech32m: 'tdash1kzvhjxfdmsyr9hy8d3zfgs8q7nvq0nq46q0heg09'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yaLJxDuPKcp5w6wA5Vfn37bgmAVrxjS7P7',
              bech32m: 'tdash1kzvmh90yvuxv4nenw2u8e9gfvl60ntv93uk6ynfq'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yakXR5Gv5hgYPcctDrXhpS1hVb6z1THTP1',
              bech32m: 'tdash1kz0yl7x7470eme9tlsdth8h0ckcsq4f8yq0vf6e8'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yb6VemqRsVQqfrykp59YayUdMXmJKTLNec',
              bech32m: 'tdash1kz3pd5dv9a362y20ajud6ajfmf9hd45v5gj26fyf'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ybSAidoYahDGajCeHCFciQM4TdnRJYuSHY',
              bech32m: 'tdash1kzju742unjde6f7el4hxc9ngu767qcgp55wlecgf'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ybShKQAjTMRCwiLHCWu9hkpYfoBtXwhDVJ',
              bech32m: 'tdash1kzj73cry0xwvlcfg6qn6jptsd25qv55cjv8pqgur'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ybadnE5pXBDmSdgymzag53MRCVproTiFy3',
              bech32m: 'tdash1kznkjsz5tc79ptw0ck6uf2ns6wtmzrwcwswec4xm'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ybpbqxMkyk6iVgFBcgvQ89YnvHxrJKzHQv',
              bech32m: 'tdash1kz4q6at6h9mdj2q3ec8pks3hm6ursd5e5cex6xw9'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ycDXm8wZUVeV6JSAgXbwSWT7BG4tWPPDBt',
              bech32m: 'tdash1kzhx88s7etpvm0d8dz8ea4qylj0aeq6j4qzw46n5'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ycDpHouARkGcYhbWhH2a4wyCdVzsqseLeR',
              bech32m: 'tdash1kzh8z6jvzhepmv5nxpf2gt87up7lwrpmkgqe843f'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ycSmc4A4unM2q28x2yX9qCw85B8oCxVCw8',
              bech32m: 'tdash1kzcwf99ladwwk6yfvmp6ht3qvylwhj6ke5pett5p'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ycTk8aj9kKTVeJwHYjzQnkebSyKCAwh7Xz',
              bech32m: 'tdash1kzc383zskcsghj6dyk0075wfdtu6j726qvu0qs99'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ycYMMYJLePGGcbJdVYBKiHGKypHHcYW7tp',
              bech32m: 'tdash1kzcl94t0v2aspl5qjredgphx6cn8eclt7u3dd6xu'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ydVTpMEcEXp649wKQ7iDhkoxwewc7SzJAR',
              bech32m: 'tdash1kz797xeyspyqpdpur2tzmhjvc2ccq2rek5xu4rsx'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ydc2GTd7TeBsiaMU6PDmA2P6PLwBNwy5HT',
              bech32m: 'tdash1kz7eevye8ng62ap0en2cwytm3s3v6yqakuf6kju5'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ydmW8n953aMJXHDhaEsRbHZfB5sSpaKVis',
              bech32m: 'tdash1kzlk0v3cvnyj86ff4hpetw3qn529xzua8clpwjx9'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yeTNj7UYKtbzG4YrMrbF3GpQXevaM5TagS',
              bech32m: 'tdash1krr0yf54j284t9qrfxsmd6w2mwdelnjk0sphmw08'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yebRhQKtHp7iTrZ6r1tKL6Wsv9Z6imFVjg',
              bech32m: 'tdash1kry80a29p9xadvj3eakjzkk0vafgy2kgrclldw5e'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yebjGGqvWkVBz7c7zpFJz9PjH4db2GwAiR',
              bech32m: 'tdash1krygd8elwfgwcvd3p3hr5vczdtwltk7qxqpx5u5c'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yewgoHb5qLavZu2fttmaoCQLqPU77uQGJy',
              bech32m: 'tdash1krxyec3y4kf2dkrh7z3c90yg49nqhe4zjy7w09uk'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yf5Z5eBatRAq3i9dBNTeveBEBp5AoGWt5T',
              bech32m: 'tdash1krxun394fd48lvemssrrfchurmy0km3xfuufa020'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yfGL5bmuU8Y1F7GQKjScRuKBra6CF8hWfT',
              bech32m: 'tdash1kr8axlw58lrw72qnfe7ycgj9x42zm45c6vgw8eu2'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yfK9cZ2PQnconkFsaHMybapd6cK878M7eq',
              bech32m: 'tdash1krg9cq98pjyrdjkpxptcwvnrptj6xuwxwcgjhk3x'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yfPFhWXgA1Tst26BpYK987PVK7ZMC6vN2r',
              bech32m: 'tdash1krgj90cv5jqqaam49j9qztvvg59lt4g3aqkck9e4'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yfhjXoef2BTVGBmRVeLf28HwN87bhCs2PT',
              bech32m: 'tdash1kr22zaukume5k40q8c923d2gdtagjm7saqchv682'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yfqZ94mpizRaCb2SxDPVAN1CowV2Nf3VSa',
              bech32m: 'tdash1krtpc84hn05e7xvntng3gnutjl2rxz7euvdg37ne'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yfvqMykpEAVL4Qf71gWmkxtEtjGYcBTGPy',
              bech32m: 'tdash1krt3h009vfff3t9dlq5ya2nfpfvmmvf7nsageagv'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yg1PfyFgGyNQmbMGHMFpzqU6bg9kBh8kHy',
              bech32m: 'tdash1krtlscrhtunhfmaqnzeq2j2uswdtpzxaus4lvlst'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yg2Z7YWoDaqt3rUiKRrMKeJYRDvL1SGAA7',
              bech32m: 'tdash1krvrptr40mz78rffyfef9jqmrvz2m4p3lu0ul5lu'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ygako22ivy56mNfcVMBpyomXDruKYoXvHs',
              bech32m: 'tdash1kr0y00prfp4ceh5pmfnnv5hmze9ms22vqspxvd4x'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ygi43dcsk4rq6fUNHRWR5ZLcbgezFQKRyu',
              bech32m: 'tdash1kr06jrzqgh9xwzxz3zz9s74fqh9fjs7kxuw9eklx'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'ygxTk4iCmeybuZjsHoGJMupNNMogX5PjvU',
              bech32m: 'tdash1kr3x9fc4hnu6ey3f694nh85q73sjahrf0uu4quwa'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yh96RHPCHe2MWRAcpK8weVNZACrwbYSPzv',
              bech32m: 'tdash1krjx2mvnxfx96uqv5q6mdtfxr8vunsy275r5g3hj'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yhp9w9RCnNSms4Tz9qBGuWVEYsyJHSDFru',
              bech32m: 'tdash1kr4u39dghypalhyuyde2yuv39l9q3htc9gnezq7a'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yiBWcJBvUeKYeTYCCeGAxatjFNZnzWrPwS',
              bech32m: 'tdash1krha99q5cv7sm5nj8sn7c2hd3q7a5528gsqm5nct'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yiXVMYTDuxowjJYCR2CNtShMNc6VGQZ26j',
              bech32m: 'tdash1kreenkdl9e27utkpzxtdwl9km49anxfj9qne4c6m'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yiYYsCnWWQGJmy6qExnuc2CCS8sRRKi6Rr',
              bech32m: 'tdash1kreu6v5u09q7zp5qkzm7j02kyhnjttxjqvj83ajn'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yieZW4dNtt1KGboTPhuS8XCNDoMzg2RFCJ',
              bech32m: 'tdash1kr60qw24hmt0qqhvgufspxc6fvhkdumlnqkseqn0'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yigRT5xmcG3FNBV2tooXEE4HEfQCybjo7i',
              bech32m: 'tdash1kr6554wpyeyxqz4wj7p8eex57yse2lt4aun8f467'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yisEgEhYEVrbcMA9PWE6GM4fxASMLSqkFU',
              bech32m: 'tdash1krm4t6hqn80g3thr2xle6frpyxf0zn0yusk73utn'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yisxcvx58QP8p2WMF4VJLsj4ady9iG88yW',
              bech32m: 'tdash1krmh3msrnfjxn2umaegzzftq4zv6uyhtyy98d5tm'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yizbrqY3wP8ih72aq4B2EYmboYMNfxTXe8',
              bech32m: 'tdash1krut4qhlg5hf45xjmspcf84jt56xwrthr54g4pzg'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yj2uK3j6cSKAVCELpWy5ScQHkXS7jN11XL',
              bech32m: 'tdash1krujn6tgqwkqrnppqed2gayakxq7t83l9g06p4v5'
            },
            credits: '1000000'
          },
          {
            platformAddress: {
              base58: 'yj86W4svnFKBuVrXRTiW7i6HdFmcSYoZ4t',
              bech32m: 'tdash1kraz24g7xgv2dadc867nww82lner8yqt4ue5zc5e'
            },
            credits: '1000000'
          }
        ],
        feeStrategy: [
          {
            type: 'DeductFromInput',
            value: 0
          }
        ],
        raw: '0c0001003c516b43bc6bfaf15d37c519323513a17422799f02fc05f5e100640001399ea81a36300ee53de31cc7854f99d8346bf6fc000f424000071c1ae8cffd41f1e41de54c80f23c96556e9998fc000f4240000a1fa49dc18a0569abe990ee38bf5f8f32715b16fc000f4240000a5a56596f5902add2d0dfe221542289bb0808a4fc000f4240000b6b9811d8fff0c58df2ad2ab3bf6cdc9d84c934fc000f4240000c5367d6bad196e06ff906dbbceed9e8afbec537fc000f4240000cdbb6ab11ff7e3d1ad04cf008197f2e179cf579fc000f4240000d864b764bbd27f456d69d6d41e38d7d6fb58899fc000f4240000d8cf06eab33372ab9774918918938138854ca47fc000f4240000ddede21af3182a807b291e5ad02dba63bbc5004fc000f4240000f84655b66f1d2c53f124e19d6a5873b7dfbd9c8fc000f424000105277945a0c961d48cfad1eacdb5254932d71fbfc000f42400011cc2142cc856c98a30e9b74ae7269918d82e746fc000f4240001881040507865e1a7b31edaebfab4e64e1c2a827fc000f42400018850f11f798bb7ce047f406ef821eba4e33cb7bfc000f42400018cf4393f6522d80fbaae89914afc02a135a896dfc000f4240001e247de0912e22a5e4aedac70d31828ac9f80a6afc000f4240001ebe53632b1c7475d3236a0df04dd1dff5004256fc000f4240001f10c4ccdac4ae84208a116de183dd139febbab0fc000f4240002ac893fadb8b3e859491410d7d66721f0c649714fc000f4240002c3c66150492b281b41b4aff49bdef047c0b77e0fc000f4240002d3c9d1d89cfc7d91fe9f8ca8ab249040ca7f46cfc000f4240002df944dfb3c22648028d8e3b494ae3bce937e1bafc000f424000367d9edb3ed740b534feb4110496ae1b58a1976afc000f42400036fe1c5130ffc6d114f068309ca70f211389a11efc000f4240003803a9663bde10c9a7344d69195f498a7861886ffc000f4240003b31101cbe8b031693692bd84a56b1e20817129cfc000f4240003b818bb95666e20fc5f216448d6e97b0eeed2dfdfc000f4240004511cda7833d4e187c43ae67bf25cea5f37c38cffc000f424000485abbf8f5b471e051c98650f384b7df9832386dfc000f424000496f18821217f83b1ff7df1e514508f15f025aabfc000f4240004a85c146dca42548d92f9b6126885e156f3f4dc9fc000f4240004ad7c71452a502d4f0950bd65657f7556a481237fc000f4240004e84591c90588cdd008d8d0723286d24a5f77175fc000f4240004ebeafad18837d0946b9c6577a3fc82e526d618dfc000f42400053ba35ff0f7aeba87b5a579f80d9b7ab8791a5d9fc000f4240005c9aba35210a53c8917b1cd72778259ceac23bbffc000f4240005d7258b336e3e9ee738f459b9ce41e627203f3e0fc000f42400060bd7d8c519ae4818539a173d8849f2ef4423016fc000f424000632bc234521ae77e5329a0acf99a0f3b1b084bd9fc000f42400064c94a96de6d0351a6c771a509b3badb43850bfdfc000f424000699ab8cff4b4302f85e93489b82e34c7990398cdfc000f4240006abe2b1c4352a1ec3603588b4e80e10f9fe0db40fc000f4240006b4f08dcabbf17ff29f713093d5de4d4caf5cfddfc000f424000718957e239d7f1ab4be605da45aeca83ab42e3d6fc000f42400072e8cea120f1eda9ad3ab446f1838022a46544dafc000f42400074bcc374a92a481f7643bdab0990d1d90bff1cadfc000f42400075521209f46dd110f3a274876204cfeb2644de05fc000f42400079047c780d8bde108b8e7a3f9dbf5e35ede5bad7fc000f4240007b67978484819e4b1b6aa5f16bbf2508921581b3fc000f4240007ceb2b924d3ad5879237fcb5d4fbccb21ce9a3f4fc000f424000811df3f2e1a055c0bbaef3b6fe34a0a84e101988fc000f424000885a211dcf0a1b6602fcfa66998ad5adc8241880fc000f42400088998699d97ca30798fcec25480f30665e4912c9fc000f4240008e272c7a46573a7883eef325aaa63fe7421f1e27fc000f424000932c6b24eb7e60cbdeb352b959c65a55a5c8f9b3fc000f4240009979192ddc0832dc876c449440e0f4d807cc15d0fc000f42400099bb95e4670ccacf3372b87c950967f4f9ad858ffc000f4240009e4ff8deaf9f9de4abfc1abb9eefc5b100552720fc000f424000a216d1ac2f63a5114fecb8dd7649da4b76d68ca2fc000f424000a5cf555c9c9b9d27d9fd6e6c1668e7b5e06101a5fc000f424000a5e8e064799ccfe128d027a905706aa806529893fc000f424000a76940545e3c50adcfc5b5c4aa70d397b10dd874fc000f424000aa0d757ab976d92811ce0e1b4237deb8383699a6fc000f424000ae639e1ecac2cdbda7688f9ed404fc9fdc8352a8fc000f424000ae716a4c15f21db2933052a42cfee07df70c3bb2fc000f424000b0e494bfeb5ceb688966c3abae20613eebcb56cdfc000f424000b113c450b6208bcb4d259eff51c96af9a9795a03fc000f424000b1f2d56f62bb00fe8090f2d406e6d6267ce3ebf7fc000f424000bc5f1b24804800b43c1a962dde4cc2b1802879b5fc000f424000bd9cb0993cd1a5742fccd587117b8c22cd101db7fc000f424000bf67b23864c923e929adc395ba209d14530b9d3efc000f424000c6f22695928f55940349a1b6e9cadb9b9fce567cfc000f424000c877f545094dd6b251cf6d215acf6752822ac81efc000f424000c8869f3f7250ec31b10c6e3a33026addf5dbc030fc000f424000cc4ce224ad92a6d877f0a382bc88a9660be6a291fc000f424000cdc9c4b54b6a7fb33b840634e2fc1ec8fb6e264ffc000f424000cfd37dd43fc6ef28134e7c4c224535542dd698d3fc000f424000d05c00a70c8836cac130578732630ae5a371c676fc000f424000d122bf0ca4800ef7752c8a012d8c450bf5d511e8fc000f424000d4a17796e6f34b55e03e0aa8b5486afa896fd0e8fc000f424000d61c1eb79be99f19935cd1144f8b97d4330bd9e3fc000f424000d71bbde5625298acadf8284eaa690a59bdb13e9cfc000f424000d7f860775f2774efa098b205495c839ab088dde4fc000f424000d830ac757ec5e38d29227292c81b1b04add431fffc000f424000de47bc23486b8cde81da673652fb164bb8294c04fc000f424000dfa90c4045ca6708c28884587aa905ca9943d637fc000f424000e262a715bcf9ac9229d16b3b9e80f4612edc697ffc000f424000e4656d93324c5d700ca035b6ad2619d9c9c08af5fc000f424000ebc895a8b903dfdc9c2372a271912fca08dd782afc000f424000efd29414c33d0dd2723c27ec2aed883dda514744fc000f424000f399d9bf2e55ee2ec11196d77cb6dd4bd9993228fc000f424000f3cd329c7941e10680b0b7e93d5625e725acd203fc000f424000f4f03955bed6f002ec4713009b1a4b2f66f37f98fc000f424000f54a55c12648600aae97827ce4d4f121957d75effc000f424000f755eae099de88aee351bf9d24612192f14de4e4fc000f424000f778ee039a6469ab9bee50212560a899ae12eb21fc000f424000f8ba82ff452e9ad0d2dc03849eb25d34670d771dfc000f424000f929e96803ac01cc21065aa4749db181e59e3f2afc000f424000fa25551e3218a6f5b83ebd3738eafcf233900baffc000f4240010000000100411f8d77c0034cfbd9dde264a109b36ac666f579a76730de8840c9ec95515286bcfc1b3bdf140d70915e96c251e5e6a63ab210abbe813d99ec6f4a77b4c844c99e94'
      })
    })

    it('should decode IdentityCreditTransferToAddress', async () => {
      const decoded = await utils.decodeStateTransition(identityCreditTransferToAddress.data)

      assert.deepEqual(
        decoded,
        {
          type: 9,
          typeString: 'IDENTITY_CREDIT_TRANSFER_TO_ADDRESS',
          userFeeIncrease: 0,
          nonce: '22',
          recipientAddresses: [
            {
              platformAddress: {
                base58: 'yZxXgZM6HhFGjBZB1uucEJELa5f5Sq244k',
                bech32m: 'tdash1kz2e6rudezas4y3htwh7ktlgrhqvf05hzs7r65as'
              },
              amount: '179780720'
            }
          ],
          senderId: '8eTDkBhpQjHeqgbVeriwLeZr1tCa6yBGw76SckvD1cwc',
          raw: '09007199f1f68404c86ecf60d9cb93aef318fa0f2b08e59ffd176bdef43154ffde6b0100959d0f8dc8bb0a92375bafeb2fe81dc0c4be9714fc0ab73c701600044120e8594bed0affacc75d13a9190f1b4b8b01657bf4d56823bfe4ef6ca275c4105c63523c9834e3caf9ad2e97ad14fa89231b8fbb532836bbd9f3ef6259e82bdff2'
        }
      )
    })

    it('should decode ShieldTransition', async () => {
      const decoded = await utils.decodeStateTransition(shield.data)

      assert.deepEqual(
        decoded,
        {
          type: 15,
          typeString: 'SHIELD',
          userFeeIncrease: 0,
          inputs: [
            {
              platformAddress: {
                base58: 'ybkZFvnoPxqNnduHgky8fKkw5XTxEEjVhU',
                bech32m: 'tdash1kz55ngky060heuvk2lctml0fuhcht7tejc2mpwnq'
              },
              credits: '5162851200',
              nonce: '4'
            }
          ],
          inputWitnesses: [
            {
              type: 'P2PKH',
              value: {
                signature: '201a8c57c31321b97e65c2c5ea7b1cd2e24eb7dabaedab49d8d7445d459fc98b18340d75a78819a5ed30bfe344587b8811f0007a36abc32fec70cf5be997c9acd6'
              }
            }
          ],
          actions: [
            {
              nullifier: 'a8f661e43e22f78b90c3129576afe937d85d8bc51916042db46394fb635c3513',
              rk: '28320dbf97931dd4497b34b5924102a3355cc797c3f7204513f8615d987cc924',
              cmx: '62a57c3df5e93f4fb458da2fd9c4bd9f9e2d3214031a8f5079f394ad36831d1f',
              encryptedNote: '5ed361ca3c9728d523eaf89a1ec0737b463d846cb64ee7c86437724ffcd47b8f34f283217031260aef3659711f3db8b4498ea2842b39a392e2069bac8bd6fcec89e10cd4a963cd50105a99289fdb6cf1d7f00b0dc57d5e7d4db7a7846725a30bba2abb8abdf7947bd190d1d054acbf7f539693902856990046587fb4a03ae1c795030e6d6d0ce8e9b760d19e98efd4fe2b5fada2703503a11d95e73e8997500f63086aba14188e49d76035d41fee31bd8f536f4b3421c53bc0d09791db3b16bf4255ebed4872a7eee8179a7e0693bd5427435bd2bdffaa3f',
              cvNet: 'ceb7ef032abdc01bcbe73a32eed13b482670031313c9b19bbe9f060de1cc3f0f',
              spendAuthSig: 'd6ff07a0f7b16bc9a67046e97847f39b2a7053017c3e83ca106891a00d787e9b920d18231798d35492a7123d232dcc28933ad22214697b9e5f2e969a14124030'
            },
            {
              nullifier: 'af5fb225ac512165e142325e08223de20552aa9186066cdeefe1c173972c150a',
              rk: 'b6d85adc9d29dbaf16b975e35dc5bb523a24cc94e61fdcc4e359dfb03c8b5a98',
              cmx: 'ff0be90c148aa34475997a8e7c0c3bc22f3fc179e89d963cda8b6cd63ab34720',
              encryptedNote: '67d62c4ac8f4fb886384d344ef61fe849a51573a60a101d3a2c011c4e81aaf1d8ae86d7be16a8e567fd40c9e539975dd185926bf8fbc9f22c19dec05c397070d128de48f45455c2b47b4b5533549e43a1d55bdc1281752e76ca789daa3dbac162c7394018789da41e3a7f68d2a4253ddecff331832ab0db21d29d40ccaa476095818ec54bc1d94ca53566808b9d1f96f6297584cc9c304e13a2788bbe5779111110381618578cfb413d1ec84dc741299e68592272913b5e1bf35121315778a38af14262a6b4c48d36c7b5f2ca4d60632eb69f3443c7305d6',
              cvNet: '412e66d8a5beea24b57d7981de32a96ad996c2d9d110e3d44c5fb6320f35e293',
              spendAuthSig: '8e742b8a89b76f236221d49a64cec8c4d99b0c17e60edeac7ce033cfe1b4d10631b4aa9b1e649534b21282db0446ace8174a331a44c429142a6ccb0023a8ab3a'
            }
          ],
          amount: '5000000000',
          anchor: 'ae2935f1dfd8a24aed7c70df7de3a668eb7a49b1319880dde2bbd9031ae5d82f',
          proof: 'c310678c3496ed181203ad2a0c70e199d27442a7adec8ccd42591dafd4ae211ee9c1afc345532fef08a9512c68a47c373aac54ece61c92c359614955d6184fb0482c9e92861ca45678b6c058f4fe03b92a77573cb1b81b358625d5e2f27b1ba953e0d4446a09e8a54ac549a736a3637dc2e57c7052c68f8a190586eee7ca68998757377146bdb05a5ec8e8f0ea84708b95559274e5db128ce25306632f33881bbcc4739f013919fd26ad4cc392c765df312e2ed16266672bb6cdc9f4207cc3212b640894df6d4d01656bf8059972aa1fb395243d33fb4870a6dea04ebe36d21c87c7e265e42236848d871c894d5d9d52a7464982e5747d0846b0efc103f2f0968a5acff2da85b06ca064951fab41ac7d9986165c069270670f470c4d7a4f399942a173bb6e93422c7410de9031ad4a5b7c4d921eb2b814ee7a455de15a87f02325287557e1ca44ec7d5444cd59d39f4fd21ab86eeee148d0b478195877d3453259d60703cf0815fe0218526f2e61fd1125ddf4073410e5022ab3b55f2f140004bc4484d7e90e14d26aefa4e16e8c136a7767974dccf5b8cb5a79123000c158027526705c76e15f52fb5497e712d57108b7b4cf101db425a1eb9cab5012fa38986fa0833967564c311d888383f6de16992ee04e3a6dc76c7bb3638d320f8823b8c4e0fe005901df21760163819a205bf91339659d444998acbe7b5c804abe72a5862ef154eef75686d6862fde23bfe498e127f49944706b50198a0a9799329e2b40e1e12cfdf98ee3d1e3a66ac35c923dc30d8021c71f1e91a37b562b63f70708822e0feafbd7fc0da47cddf2145309667a2c4b3cfb6d254c80c37341e2840381fc3f781a0d447ba4d7e3b9dc345b7044eb9a5125d29a7f0f69ae4aa639c78819440cf8e6583fd355f13e8dbd7fb6b0eee754c4dd6028250f2fb751e68017b78ca658e5f227148e6f890a3deff5123e3dd41722cf24c16a04bee74c976eef0d11845599215c2b62371ac585a7ccaff98613fd572f6c4a214642b6b8504954c5b870c99349fcdfd762ef3ed255c5097ab589da9c687728c147f375b8431668c1926c4b6506babc6e282575f6707d622d49f6a9b5f3fc95cbfcc51786bc68101c161c07157c60b8392d4f74357d0f668136f452339219f723359c9bf7945322b38a4f16ef15642a169d12d4fa3457f26cacd7f09f40db8542f8ce119ee9d0ab39830e5f209306a78d5b66e04d4213bc2b704412222b37ffe85510d26c2f96230fb7503debe0b98e28f6f0f003e53af0fa1c55701cd97979074f32ee28d105a838052538be040b1086a4703d182a1c38a8a2a7b4d9a5fbe4e2d91a7db062a6a22539a9bf64f947d0158ff9976763ed3a90d74c5eee14c787bc997d7ae931f73e2116911e7cbaa628e2ad2d731fd749c91198a15d8f2d6dce7513437c2ccb09da2b0ec690697e8e06ad041b28fcd43ad0fe45c489b868477d8c70f651dfa6ea03f902021691f54ff15f977aa48686874e0a007796b1506c74e21bb3ef58e29a7ca50923d7b3cc1cd6b6a67e958797c188db80c1c3c53f21d0d203eea9ca55e3f869887948a9e94fca996074ecad21b93a464ef565cc0e75aa0a4b32a553967796b0bc19f2a078354ac3437db9bfd5156d153c6e14e6837b17d62f08a8bdc00528e4b7f248aeb3eed53eb8c550fe196f4d3bcfda3014ae4a02048eaf3b4687979bf8137ef7fcc6c8847464335b154f4a521b8c32fcf33ce157c5fad7462f7c5f6ac23b51e0e64c1b5d813445e39ae1bdf834286e98124b9469c674eef90d23e3161e8d18c7d2fb44b77622356c5cd09040950a2ce901220653342211eb1ae15401750795cb911bfe62bc0742159d27f6e9cabcb124629cbd21e540e023f329899edb0b4e1f584816074dc6c12c9704db0d6c6874153236f7fe531735684494003434a3dd24bfca4dddf607a6d94d3465cd42b975dc83726b0715ea781280093d2689bcc66ea868f80bc678d22482751649f46ecc594dfef75ecb1d8be5a87ffc90578ca0de8f028c61b894a02c1dc5b15fa0317fd05343b2e7e89c3495945c6f0375af9f3cd6e73252f56f19ead5fb5a8b22ca1c827745964399c3c8b075a69b6a3aa877d1899c1612b4133bdc23ccc7904cef3b4b5795c3f9906a1cce3cc7692de2338eab7007d8c9cc3df1a076c7e5aedd87b967fb57345afb33fcfdfe50246e28951cc8a6493262ba24b8afe805d45f1c323161453d8cd3571824303ec18223da3258e1484c358f0a4d4e92c9857ecf9e4d0297d9ca318ff720c9d12eaf49eae186cc9998fc4063ca0304e76ff6b6fefe5f2721515ba4ee7991dbe443c3bfa90d85583e0a0066c5e32824ae462c8386624eb46660f62e854b8b404a29c6692fa3b7ccf8f8688bf39c527bea07f3db2420ed13ffee8014c532c509489d0c3e95072e99956f0c9d5a6af853ab60429e1b272edcb0ad776a89623198fa62bd7306f41765b22ef0739ac5c1bfc2f4de3cab33edaf237971c3e9996bc1df3a49748469112ff3ebdfcb23e73ddb0ab529e05715de328e254e0a57050fda106ede9cc49d2719a80729eebaf350d9b18045ac9bdd90e5b8e0e781a07b6da7fcf37fb28a402669ca5b89c7c0c77b4b0314bfd854dd4d0726f5f6ff3d3fbed5005e9817824305db2812e3b4914abe529d8022fdae0923baa26c4e151bf6e241813bf1956e1926a2d358d9e1a5ae61a87e0345f5cae8c6a386eb9216a037751892a8f5e8239e05a67f79cdf609fa77194a4f831d9d174962a40f46590d95c9049756ec0093d10c8355b1631471f99ecfacb58715150c37b1fe392efde3573e64e1e4c0bd99012dc4b15fe47eb969e9f7386f32aed89eaa14f4d8c3d39aca0f542ea5633de2cf229d7528116bccde73494b21828310a5a2a27b8aae641924e90ece1531f467a31c407f32f720a6e6a6de68268d9e49790e8fdc7f4feed98f121fa0b2cb1569233e3765d05a9f9c8f56f00928bd1bc1131ea14f659d92206c4d38bcd6d609eff524b278478f2e6e7def1ab6ccc39eee0fe4432bc198942fdd75e6c05b15e68ee6306e661c741e146367f7ba25a42d3bf6dcaa03212470b75be328d9ed9c042fcf295241622d37bdab35c272d469ce4fcc3c1a64492edd188436416fc0cf64e1940d314464fe6c771282c183474e26e70f37997828c021780788f7d98ab0cd7c1124e806b12ce512614601737c47b94904c309ef2fee7cf1d2b8b8147af45a2c5b256130f765958f92f91e8a38d49b4a5635e7bb1e1f7e5dc48f10066c75e8e998372be72a25a3e12c8a1d0c2595c085570465560f4b8ee73d147bac2f9fb8d4b62b7d8252708f20b56bfe77be10407febe07bcb12d014f2f5bcfb2638a519ac8c261042e0d120901b4d429d7448376f8aac2077a2bed67643ec2561ad2839f04d360057b1d2fb52c8238a191399060c345fa662e859e99ba811e8c3e699ba5ce32263d5720b92b0013a9d5ba9aef44f0b1fc0a4379a84b45450e4930fd558946513423fd8a70ddb340c5d036aa1495e9e40feaa09ec7949baac429ab288782c34249e7f52f9ca104d4cc89d9bea100ab6047e5b789703d021e7be42b06108b60c3570131d7aae0239bf7bc8e0e8e7534cc1a541e583dce3319f50acfc98f90e8b065c8b1bb16acc14cc6a809e4022b3bb10304e368479266d932564b79db21a9c141918fc85b6d3facff228966cd0ee988430b835414c26a78055f08425d336d0284968794c45af2dc88176e9623f119a51fb8abdfaec2d2386b7e004f6bfb1972da4df77a5334f732b29cd81e961acd24772bc8afbfb5ca97d33f96e21959190025105620c1e28f2459eb6a9f4a974fb71218d88b7def3c4f01c7b37e2604f57004d0ced0f972ebe5dc8e3b8c9c4c994b0a31da45143c1740fd1bda1683b5b27297155465149e0ee522d0787470b6744a8d5d25592c9157b326a42b33f3de62d19aa77344bebf2cf48365302b55ca9f91de2c54a0eb9ed5e89d324cd4538d0fb08d365fe421ea8900725b5c8c9e57ea9b7ad66e9afb8e0037ae4f586dde542f9083f5aa5dc2c5b755d1005174f0ab7759544c8c516d6f9e8ef4f0f76e92c28df3b76e134c64b97c0f487cd2d2107331a61eb78d45b6261ee6e3ea0305cb3bd2b3b5675e52c0a7c121aa3bf41958d1003f6e5679105f4d236afe402f98ad9901d3a0f0673cbdd58837d49daa1d141210a34bd01cd061d61f4f33e6397904f26253a7f0965e0e07fe1173d470d2d0aadfeedc2613dc7a1df95d560b4846c1ff14a30dd9ef53f633b81b2f852e86bfe49b6bd514138ec16d7bcc8dea3f1f89bdcc209f0d34bebf72f292b10c6397f46c70a26d16b2185c45a2128197e4277d5d3162790bd3f6cb3fc08548b7b3c535af7ae27380f90d5b750eb683a15ee36e22b2d3941fee5f4bd8a655388e865a557a49e04b12c5a1e83de1162ea14069530a0f12479ee48d89e67295c2dc8c34ce9098a2ae17ea9160d94d11eca9c61f9bab094167a192f7b313ff0c81fd97131997b53f91b1798fb2173e70e52775ac523b1832f7cd7acfa2311d0170b8eb54b9b9aa223a5838ea5ef99ed8bec1bdbfd4b57791afd32b4c2cc85cf0ee50b814691c8a8363c0435481da3e8deeb0ff771c529b53cf50598dcf57c50983a40aeb1a09609b7bf73e3482804adb40bb41cc2bfc0262e3b2788cbdd6641aef5842cb8f80b8d2430c58d4d05599d76876d493ba2522a1ddaee599379ec6fa93334623a43ec272d191a5009ba075fb14ce8f2f2df43050f39fac44dfc41e81e1c608904d86939ff42db465eec126fa1ac4a4c3c2577631781fc122486888b65a725a376b351cbc3a585500eda2d61fd0cfe1de68424e22efd868020dcc265648fb1a31e1d4512ca39266ed1ed8c0b750ddb7e9f97333b1357e62dbadd79d04680c8e883de4c1f52822e9acabdecb3afef449393f9808f2973203a33318bb9c608818ae3c54257863ee35e3602472c5ecdf18292adbfed389d7e9867d7ba68029474f071d02b1a9b99d0d7228b544581ed4ef13d70d7aa363d2df52bb57f45090cdfd6097fb4489bb74a75406ada185c65645fa4b4636b0ba852ddde869e944193b37bf1446e14a23be66ece34532bd77eb6f48022dbc11322aca3dceb627f804bb638e0cce7f60fd8b9c56f91a2a0b246586c38ca12b82b37470ce582b1c69de20ac55c9ddf44be59d5ff8e07fb86bc6d946d0ff0e9ca3cfcc2583f06383a98af074618d43bf977850da233d03923da7a8d47c98c8a4613726c7c0adc453a80d685ece363f0110e9597c49b1154019e978edc1473529530d64dc90a9300a3842f13a1cf537ec508c25267c1cf7e4d699d44ab5e0be423027ce840572e647d6dd0c049d3b319576214f976516f512d964aea25c5fd700104511d8b12cdc44bdb77244dfea5a3de96d28f80b12339eae81d9fa3508ed8f90a295fc4777de7fd7e8a72f4011f3f1f05d2fc0db0a8362d0b5439a150d6cb600fb1cb5b2b1137d25bc10d1477ab0425c518c63130cd3dd9c7f77709a6fc9b56186e3a559c1f1a2d3097cf9c342bdb137ffbba59787c2bf6536c293d4d546b7701161a8f9caa20bd4ba79a1a89e00765629d30aa7a7658324518351017aa734c3fbb4d584c27ced0c0c1c8675e18451e08a7d0e4cc23e3995bf6ebf7a0ed700f1334970bf87dd4616857dafed9aabc55975c347b8966428beafa800c826268bd25ebd5539f3d13edb53bf98db8f6594bf4d18db7b4bbe296e72da458c13d15d53c0ddef73a37fd8f66cb69507cc43cfb73be4d660ebccc743cbad238e226bbb93fef6ea03c3ca50ce854625b4ffd7ee980b01f1bf2decfd3d775c7bc4ae2f3ff0eec5bd66bc6b472e96fe867c55d48ad1fd2bb97f96f41b666e5e183bf6a7dd401984a9d4649f00583281ba9f3f072f7e721db0dedfcf5d221ce274c5ead6ea03782e2b1080e1d20dc0a4e690d67a2e4d7009bf38925e64dc60ada260a01ac5a0101ce3c2e8fba9fc17f6f7a6fcab311ad3e68565f2d79e566df5f3852d0223916bebeaceea42446e01498e19b99e1933c1246fd4d108e1759737223a708d2760823c38518b492c539496955f237e241b0ed8102b561de71b31366b3ef1f610f1470985893501fa69739a49b40077e8ae38b91200eec9ba3442b2291bdf16a7c03e73a01088c3a5cf41a5a209681a7ec249f20ae16a270779f97bdfb19d13031164d7b1f14983848c477ec48668b35eb00baa2d60cb04699e4512a99fb8c2e2e0b99e1f7206838e9f33db2f2600627129bdf6570552a80fd547bed5286cecd6e374b905154e7541f86e58a7d0f1ae6acd9dcf2c3360a76550b2b04c6291e02dc15e66189dd377e7f295a47eab77f71fcd3d9045a09705d879ad73267ac37ae6c3e938d1e2133901ac49628d26c2e8699640b4268dab9a7019484651adaf76b9508da0a1ae2f794e6cfac5d70d5981a541ccb32f6ea3bd26a91cb47215a724ced201006a0519cc47909075d1741c7ff7740b6c6e6dcec3e5bdcd42f45629569d20ad49024f4b0e2f5be5cec497263744fea5f46ce4f1c13c0105cb9e471687f2f3501420767cd4615e6809deabcc9b91f3d1945e4f98a0555dbebb223caf401cb242b3e486083aba76739d5a1763beffa62acde22bf55e0f0ebeb6fd5a0b1895e11c12fc8dc32cb8adce1c4c48aebb68c7c920062e94496db28adbcb8a337543c184627bc153331b8078c2b1a230343a8c7b1a794aba24600b0f0902c238e8d760ee8ef90a123281e22748e7817e641f4e9ccb20e5814a48d83f7ba4e18e88caa30c7edf9a8fb334081ac2efa5d3c49b52530d00f037b5505b27f949005a8b9f82b64c0bc0df561cd7948c45c8971c3ea97238f8aa7fbeef0b39fac2255af19fc3e303c61ecfd2d94398fa8ecf899e7380f220618c819d9c856025f837fe65f352783227fac152e0e5474e2d5f4f1fc51df6e309152d51d7be0ff59d9d5bc1b1c318dc5b70d241bb9e047dc5641e310b204335e2e51aa3af8fee65b82aa9291b42f089ae883781fc5a650c385f19f8de036f42c75b3fa796d135048b0269809851fc7fa26c4d39f2cccfe809fdc0f8329b896e30cfc8026a591caef0c932742773a9d2c54c84220826902965cf54ddd52b4ee5a61c075f43d2fb5895ec25fec780b7964fe1d73659be8b10ee958dac1d5ac33948b6c526286e644059d83b18e8a305dfdbbb9e842b7ca3b90cd33d81610ec9c5177f0dc526081082e706c1df68607c95322b3a8fdb6511f47b4ded7e4eced6fb1219e8b01fc459877e0db00c6e11aec1f943aeb6ab6c82acec4b5a9f7b3189e4ebff7bf9e501d24b38843e61dc23a6e36d819b67c6d50ae780bd58243551d3c4144e2684145fddffaacbc758bd62691c61aab4ab8c19eb2c770a3678ab7e7441a92b16588b282e7a7892f70b4ae1d116088fa7fe5824ec7786d9a0a32c9b995f6c3c05433f0a85e3c5c24d3891736c158f4bf437a52faaffaf197ca5561ac94859ed7a5cac644232804936ff9bc290fe6a44ac794e6ac57c6329a144734370387daff828a8b0a32e0a7f8adc271056ed9e3a34ec90f9ee621f7f164bfc171b015918429d4457463fa251e2256c21c00904388ab24051982d18a1267cb293313c7aba94637bab7b6e147ddec61e8154544dbc198405bd7b7d649077a57a4cb56d76dd78c01922b580168cd6d019d22fff48e11b876526231b0a55259e1c369b8e952273bb4b567e4842deee1aa3904ec8e1a988cd5ab3c027d23a4b0d361bc7123a3eabe11bbee29cf57fc353b0a282c13690539778a9a20e80cdd2f29d69debab745e0348ec04ef8bfd93a149fd2f90176b8e67a429e42144c9be114143b3b3c60405cc99118ee8fccc6cd7b56b300f9bd149161a7737b454bb67dff470f9933e99a3a81364eafcb0edeb596fe72ae6fecdc03f8f4852c602f4c9d10b7c5ab08269cc5bbea9da9f71dee2906d1f1e6bee514da4ed1366bbd17c43d4f3fe8394f17e4aca6a692c603cf200018e001befd52ac22237bdbf1f4b645caf91b2eb047f8057e0742f51168ee01bac4e2f15469a5d7af51b6b79950f1db756df7163571480ff46fa530039625a901ba3540acabe1abdf034b01ce827accfff4eed37052167ded8571e2bd686ca3235a10f1fd76c90041b411030f2dd1ba35a29cccb054f0ecd7f6b66f48f0099884cf2bd0fcb52783b0c8437f9f6df6a4838c638db9784b24bc85a50d00444dcdd685c883a10581bb46e68ce836a1a2e34b7026524d7ed4a4cd31283a43b1432da50fb5e327e8c6e59cecec8696a539dd8fd492ff1200c9926bef298bf228fa329ccf76030bcabb0d472ef8e3ee1fe192fbfe2f27ab18e0783a49beeb6a89221a2bc49d81e51e3e99b9eae8217508070d1dba747635a3388b51b295ce743705c4588bee43366ca4bb96f0120194391705756a9a89067531b2632d821dcb59b6939c0009a300091b2f538e9bfb885497e12cc9c15141da6d1ef0cdad2b300265a69bacb76147be20e9ab5492e187c978ff9616c8abbb051de2d4ef819f53b52141a79f9960d7d12bfb89f54d506de04459f68dffcac267bacf9679d4383020063a33f84ed0e15761063a36f4760927c0dfa62e3f9e1fac638c4dcdc91d9e9f687026c3d431f7f1daf93089fd7d4723311522b72ee81016463b5f5465517e822c5d18faf3609d030ecf48a242128441900accdd7e3e1ee9a9f255ab5e1d716a2789295fef1299c10655461df46d49d1e0dc1aea4d35f9a8a8d3b178450094ec369e3421c4114c29ad4c2b87ec566c1b04c605a869257dd7416672e3518850a0bd5f7b10bd7035c79a059514036d0b907aab5180cf5a18137277a1e99cabf99626de9484645b0b95ce5ab4b12112fe4f64d37faca637a52ea00bf8c87a85017fd8d6fe36bd0158bd49ab71515964f07318a9e95028b52cae603949e9fb1b8af8de58d6f1b65114576438e585df2bd0c6f6ad1b52403eaf77643d9c6dbe00c18dde335a300bf08a04e8e286e3ffe2fd3f50eebce82e26094392ca17be6b4369d9705017ff5780f1df5dfe6dfb89b8a75ace3201635bfe1800ee9ff2be5705bb8aea931911d233e83788ff2804a48236e00c52cb6366ab33f1ad0b2b7af8eddcecf08affb44bab70f12dd263825253b50bfc113bb772db106aa2d563cbcaa8c62b5eb82ce3dafb0363c104b1d496f8f18b6e19c86e77c341866fc8dc9798b1b3ce641540ba6c60c17666683d95b2685a6dfbb27710c6b212ae3647d9d96358c05c46052a4867d04cc0be06b3f856c00be25677415de91076b13db9e9f3c5edbcd10b685afb281bb0e5d9227158993f69c293fd279eef92c8ea71ec9a2c4655e657bcbe7d6fe9c205e72a59e0ba4147886711b72617e95b83bc84ae00ae8d6b1cfcb886e3d9b4e8abeb225504a52546f47a391edf2798ca0579e37259793a889519c4245e0348f25e100007fcf6662e30695ff88f53505168ffb2d6c23c810f9bd234b3592224ca60fc0da47577cd80b39e62022bd46d2646747aff0a8d99324cd1615e41b745a357e6ff6ab0ee6ef2fbe610c33549cbdd08bb2e764cd08e4bac9c7f9bd6c0b719b2a86181ed7f61c1d5490b2e8c88a2cca9520bec931ad88560eeae4ccc492783d30c0460f390dd0127b827f8ad73735cc98b39d31edc93116c39a26bae6d652a70172499165c99eea34246e93620da6d99cdbbced8e7f08b9cf9dc4128485c92dc335623503290972864cab81d2a59a0b9250d83f61baca0e7b86aa7356ff70ba5504dc7df88151fac03263672e94bf5699d21e6d6382f7acb673e187c1d078aad62a1e101add9768eeeccd0c6d7171a4035f4bfaab61ae5fc75514b0b41228ac214f9cb5797a0478a589c575d2888293d629fd2bdbeb9d4a98dbd2607f9ca8bca8c0875d251a9de3e9cf208788da29c000edf398cbda987cd4751e4c9bca91a8254bdb5eb19b9534263af2c1d7ac23ab2d88f7e355ea42f542742d945f9a672c062659d132b7309ccc5b4e331f071ac4561db418411327e9258f75e42653e898b26a5f49d369fa41c5c71e7ccacccec4f9d8988419163dbde374b0acde0682a574ae674137a7c9e9f97d2759d8de4ad77c41ceb536644318a1f3ef05ad1a0c0a6040b02c2f50e0a780250e40084b6fcbf204b6b39711f1b51b29a7f5fcfe2d03a216eee5277394f3424085711de36f6591cfb0dbaf17fc80e5b14484be98a923',
          bindingsSignature: '2041c3febf5e75889fcc54f0c45eae7d6ce9731627128cb01c8768bdc6dfda9a63ece213d5705005acbce62f3b2bf949e48b3ab0d2d6b6c602e20a7d0b1ecd36',
          feeStrategy: [
            {
              type: 'DeductFromInput',
              value: 0
            }
          ],
          raw: '0f000100a949a2c47e9f7cf19657f0bdfde9e5f175f9799604fd0000000133badb8002a8f661e43e22f78b90c3129576afe937d85d8bc51916042db46394fb635c351328320dbf97931dd4497b34b5924102a3355cc797c3f7204513f8615d987cc92462a57c3df5e93f4fb458da2fd9c4bd9f9e2d3214031a8f5079f394ad36831d1fd85ed361ca3c9728d523eaf89a1ec0737b463d846cb64ee7c86437724ffcd47b8f34f283217031260aef3659711f3db8b4498ea2842b39a392e2069bac8bd6fcec89e10cd4a963cd50105a99289fdb6cf1d7f00b0dc57d5e7d4db7a7846725a30bba2abb8abdf7947bd190d1d054acbf7f539693902856990046587fb4a03ae1c795030e6d6d0ce8e9b760d19e98efd4fe2b5fada2703503a11d95e73e8997500f63086aba14188e49d76035d41fee31bd8f536f4b3421c53bc0d09791db3b16bf4255ebed4872a7eee8179a7e0693bd5427435bd2bdffaa3fceb7ef032abdc01bcbe73a32eed13b482670031313c9b19bbe9f060de1cc3f0fd6ff07a0f7b16bc9a67046e97847f39b2a7053017c3e83ca106891a00d787e9b920d18231798d35492a7123d232dcc28933ad22214697b9e5f2e969a14124030af5fb225ac512165e142325e08223de20552aa9186066cdeefe1c173972c150ab6d85adc9d29dbaf16b975e35dc5bb523a24cc94e61fdcc4e359dfb03c8b5a98ff0be90c148aa34475997a8e7c0c3bc22f3fc179e89d963cda8b6cd63ab34720d867d62c4ac8f4fb886384d344ef61fe849a51573a60a101d3a2c011c4e81aaf1d8ae86d7be16a8e567fd40c9e539975dd185926bf8fbc9f22c19dec05c397070d128de48f45455c2b47b4b5533549e43a1d55bdc1281752e76ca789daa3dbac162c7394018789da41e3a7f68d2a4253ddecff331832ab0db21d29d40ccaa476095818ec54bc1d94ca53566808b9d1f96f6297584cc9c304e13a2788bbe5779111110381618578cfb413d1ec84dc741299e68592272913b5e1bf35121315778a38af14262a6b4c48d36c7b5f2ca4d60632eb69f3443c7305d6412e66d8a5beea24b57d7981de32a96ad996c2d9d110e3d44c5fb6320f35e2938e742b8a89b76f236221d49a64cec8c4d99b0c17e60edeac7ce033cfe1b4d10631b4aa9b1e649534b21282db0446ace8174a331a44c429142a6ccb0023a8ab3afd000000012a05f200ae2935f1dfd8a24aed7c70df7de3a668eb7a49b1319880dde2bbd9031ae5d82ffb1c60c310678c3496ed181203ad2a0c70e199d27442a7adec8ccd42591dafd4ae211ee9c1afc345532fef08a9512c68a47c373aac54ece61c92c359614955d6184fb0482c9e92861ca45678b6c058f4fe03b92a77573cb1b81b358625d5e2f27b1ba953e0d4446a09e8a54ac549a736a3637dc2e57c7052c68f8a190586eee7ca68998757377146bdb05a5ec8e8f0ea84708b95559274e5db128ce25306632f33881bbcc4739f013919fd26ad4cc392c765df312e2ed16266672bb6cdc9f4207cc3212b640894df6d4d01656bf8059972aa1fb395243d33fb4870a6dea04ebe36d21c87c7e265e42236848d871c894d5d9d52a7464982e5747d0846b0efc103f2f0968a5acff2da85b06ca064951fab41ac7d9986165c069270670f470c4d7a4f399942a173bb6e93422c7410de9031ad4a5b7c4d921eb2b814ee7a455de15a87f02325287557e1ca44ec7d5444cd59d39f4fd21ab86eeee148d0b478195877d3453259d60703cf0815fe0218526f2e61fd1125ddf4073410e5022ab3b55f2f140004bc4484d7e90e14d26aefa4e16e8c136a7767974dccf5b8cb5a79123000c158027526705c76e15f52fb5497e712d57108b7b4cf101db425a1eb9cab5012fa38986fa0833967564c311d888383f6de16992ee04e3a6dc76c7bb3638d320f8823b8c4e0fe005901df21760163819a205bf91339659d444998acbe7b5c804abe72a5862ef154eef75686d6862fde23bfe498e127f49944706b50198a0a9799329e2b40e1e12cfdf98ee3d1e3a66ac35c923dc30d8021c71f1e91a37b562b63f70708822e0feafbd7fc0da47cddf2145309667a2c4b3cfb6d254c80c37341e2840381fc3f781a0d447ba4d7e3b9dc345b7044eb9a5125d29a7f0f69ae4aa639c78819440cf8e6583fd355f13e8dbd7fb6b0eee754c4dd6028250f2fb751e68017b78ca658e5f227148e6f890a3deff5123e3dd41722cf24c16a04bee74c976eef0d11845599215c2b62371ac585a7ccaff98613fd572f6c4a214642b6b8504954c5b870c99349fcdfd762ef3ed255c5097ab589da9c687728c147f375b8431668c1926c4b6506babc6e282575f6707d622d49f6a9b5f3fc95cbfcc51786bc68101c161c07157c60b8392d4f74357d0f668136f452339219f723359c9bf7945322b38a4f16ef15642a169d12d4fa3457f26cacd7f09f40db8542f8ce119ee9d0ab39830e5f209306a78d5b66e04d4213bc2b704412222b37ffe85510d26c2f96230fb7503debe0b98e28f6f0f003e53af0fa1c55701cd97979074f32ee28d105a838052538be040b1086a4703d182a1c38a8a2a7b4d9a5fbe4e2d91a7db062a6a22539a9bf64f947d0158ff9976763ed3a90d74c5eee14c787bc997d7ae931f73e2116911e7cbaa628e2ad2d731fd749c91198a15d8f2d6dce7513437c2ccb09da2b0ec690697e8e06ad041b28fcd43ad0fe45c489b868477d8c70f651dfa6ea03f902021691f54ff15f977aa48686874e0a007796b1506c74e21bb3ef58e29a7ca50923d7b3cc1cd6b6a67e958797c188db80c1c3c53f21d0d203eea9ca55e3f869887948a9e94fca996074ecad21b93a464ef565cc0e75aa0a4b32a553967796b0bc19f2a078354ac3437db9bfd5156d153c6e14e6837b17d62f08a8bdc00528e4b7f248aeb3eed53eb8c550fe196f4d3bcfda3014ae4a02048eaf3b4687979bf8137ef7fcc6c8847464335b154f4a521b8c32fcf33ce157c5fad7462f7c5f6ac23b51e0e64c1b5d813445e39ae1bdf834286e98124b9469c674eef90d23e3161e8d18c7d2fb44b77622356c5cd09040950a2ce901220653342211eb1ae15401750795cb911bfe62bc0742159d27f6e9cabcb124629cbd21e540e023f329899edb0b4e1f584816074dc6c12c9704db0d6c6874153236f7fe531735684494003434a3dd24bfca4dddf607a6d94d3465cd42b975dc83726b0715ea781280093d2689bcc66ea868f80bc678d22482751649f46ecc594dfef75ecb1d8be5a87ffc90578ca0de8f028c61b894a02c1dc5b15fa0317fd05343b2e7e89c3495945c6f0375af9f3cd6e73252f56f19ead5fb5a8b22ca1c827745964399c3c8b075a69b6a3aa877d1899c1612b4133bdc23ccc7904cef3b4b5795c3f9906a1cce3cc7692de2338eab7007d8c9cc3df1a076c7e5aedd87b967fb57345afb33fcfdfe50246e28951cc8a6493262ba24b8afe805d45f1c323161453d8cd3571824303ec18223da3258e1484c358f0a4d4e92c9857ecf9e4d0297d9ca318ff720c9d12eaf49eae186cc9998fc4063ca0304e76ff6b6fefe5f2721515ba4ee7991dbe443c3bfa90d85583e0a0066c5e32824ae462c8386624eb46660f62e854b8b404a29c6692fa3b7ccf8f8688bf39c527bea07f3db2420ed13ffee8014c532c509489d0c3e95072e99956f0c9d5a6af853ab60429e1b272edcb0ad776a89623198fa62bd7306f41765b22ef0739ac5c1bfc2f4de3cab33edaf237971c3e9996bc1df3a49748469112ff3ebdfcb23e73ddb0ab529e05715de328e254e0a57050fda106ede9cc49d2719a80729eebaf350d9b18045ac9bdd90e5b8e0e781a07b6da7fcf37fb28a402669ca5b89c7c0c77b4b0314bfd854dd4d0726f5f6ff3d3fbed5005e9817824305db2812e3b4914abe529d8022fdae0923baa26c4e151bf6e241813bf1956e1926a2d358d9e1a5ae61a87e0345f5cae8c6a386eb9216a037751892a8f5e8239e05a67f79cdf609fa77194a4f831d9d174962a40f46590d95c9049756ec0093d10c8355b1631471f99ecfacb58715150c37b1fe392efde3573e64e1e4c0bd99012dc4b15fe47eb969e9f7386f32aed89eaa14f4d8c3d39aca0f542ea5633de2cf229d7528116bccde73494b21828310a5a2a27b8aae641924e90ece1531f467a31c407f32f720a6e6a6de68268d9e49790e8fdc7f4feed98f121fa0b2cb1569233e3765d05a9f9c8f56f00928bd1bc1131ea14f659d92206c4d38bcd6d609eff524b278478f2e6e7def1ab6ccc39eee0fe4432bc198942fdd75e6c05b15e68ee6306e661c741e146367f7ba25a42d3bf6dcaa03212470b75be328d9ed9c042fcf295241622d37bdab35c272d469ce4fcc3c1a64492edd188436416fc0cf64e1940d314464fe6c771282c183474e26e70f37997828c021780788f7d98ab0cd7c1124e806b12ce512614601737c47b94904c309ef2fee7cf1d2b8b8147af45a2c5b256130f765958f92f91e8a38d49b4a5635e7bb1e1f7e5dc48f10066c75e8e998372be72a25a3e12c8a1d0c2595c085570465560f4b8ee73d147bac2f9fb8d4b62b7d8252708f20b56bfe77be10407febe07bcb12d014f2f5bcfb2638a519ac8c261042e0d120901b4d429d7448376f8aac2077a2bed67643ec2561ad2839f04d360057b1d2fb52c8238a191399060c345fa662e859e99ba811e8c3e699ba5ce32263d5720b92b0013a9d5ba9aef44f0b1fc0a4379a84b45450e4930fd558946513423fd8a70ddb340c5d036aa1495e9e40feaa09ec7949baac429ab288782c34249e7f52f9ca104d4cc89d9bea100ab6047e5b789703d021e7be42b06108b60c3570131d7aae0239bf7bc8e0e8e7534cc1a541e583dce3319f50acfc98f90e8b065c8b1bb16acc14cc6a809e4022b3bb10304e368479266d932564b79db21a9c141918fc85b6d3facff228966cd0ee988430b835414c26a78055f08425d336d0284968794c45af2dc88176e9623f119a51fb8abdfaec2d2386b7e004f6bfb1972da4df77a5334f732b29cd81e961acd24772bc8afbfb5ca97d33f96e21959190025105620c1e28f2459eb6a9f4a974fb71218d88b7def3c4f01c7b37e2604f57004d0ced0f972ebe5dc8e3b8c9c4c994b0a31da45143c1740fd1bda1683b5b27297155465149e0ee522d0787470b6744a8d5d25592c9157b326a42b33f3de62d19aa77344bebf2cf48365302b55ca9f91de2c54a0eb9ed5e89d324cd4538d0fb08d365fe421ea8900725b5c8c9e57ea9b7ad66e9afb8e0037ae4f586dde542f9083f5aa5dc2c5b755d1005174f0ab7759544c8c516d6f9e8ef4f0f76e92c28df3b76e134c64b97c0f487cd2d2107331a61eb78d45b6261ee6e3ea0305cb3bd2b3b5675e52c0a7c121aa3bf41958d1003f6e5679105f4d236afe402f98ad9901d3a0f0673cbdd58837d49daa1d141210a34bd01cd061d61f4f33e6397904f26253a7f0965e0e07fe1173d470d2d0aadfeedc2613dc7a1df95d560b4846c1ff14a30dd9ef53f633b81b2f852e86bfe49b6bd514138ec16d7bcc8dea3f1f89bdcc209f0d34bebf72f292b10c6397f46c70a26d16b2185c45a2128197e4277d5d3162790bd3f6cb3fc08548b7b3c535af7ae27380f90d5b750eb683a15ee36e22b2d3941fee5f4bd8a655388e865a557a49e04b12c5a1e83de1162ea14069530a0f12479ee48d89e67295c2dc8c34ce9098a2ae17ea9160d94d11eca9c61f9bab094167a192f7b313ff0c81fd97131997b53f91b1798fb2173e70e52775ac523b1832f7cd7acfa2311d0170b8eb54b9b9aa223a5838ea5ef99ed8bec1bdbfd4b57791afd32b4c2cc85cf0ee50b814691c8a8363c0435481da3e8deeb0ff771c529b53cf50598dcf57c50983a40aeb1a09609b7bf73e3482804adb40bb41cc2bfc0262e3b2788cbdd6641aef5842cb8f80b8d2430c58d4d05599d76876d493ba2522a1ddaee599379ec6fa93334623a43ec272d191a5009ba075fb14ce8f2f2df43050f39fac44dfc41e81e1c608904d86939ff42db465eec126fa1ac4a4c3c2577631781fc122486888b65a725a376b351cbc3a585500eda2d61fd0cfe1de68424e22efd868020dcc265648fb1a31e1d4512ca39266ed1ed8c0b750ddb7e9f97333b1357e62dbadd79d04680c8e883de4c1f52822e9acabdecb3afef449393f9808f2973203a33318bb9c608818ae3c54257863ee35e3602472c5ecdf18292adbfed389d7e9867d7ba68029474f071d02b1a9b99d0d7228b544581ed4ef13d70d7aa363d2df52bb57f45090cdfd6097fb4489bb74a75406ada185c65645fa4b4636b0ba852ddde869e944193b37bf1446e14a23be66ece34532bd77eb6f48022dbc11322aca3dceb627f804bb638e0cce7f60fd8b9c56f91a2a0b246586c38ca12b82b37470ce582b1c69de20ac55c9ddf44be59d5ff8e07fb86bc6d946d0ff0e9ca3cfcc2583f06383a98af074618d43bf977850da233d03923da7a8d47c98c8a4613726c7c0adc453a80d685ece363f0110e9597c49b1154019e978edc1473529530d64dc90a9300a3842f13a1cf537ec508c25267c1cf7e4d699d44ab5e0be423027ce840572e647d6dd0c049d3b319576214f976516f512d964aea25c5fd700104511d8b12cdc44bdb77244dfea5a3de96d28f80b12339eae81d9fa3508ed8f90a295fc4777de7fd7e8a72f4011f3f1f05d2fc0db0a8362d0b5439a150d6cb600fb1cb5b2b1137d25bc10d1477ab0425c518c63130cd3dd9c7f77709a6fc9b56186e3a559c1f1a2d3097cf9c342bdb137ffbba59787c2bf6536c293d4d546b7701161a8f9caa20bd4ba79a1a89e00765629d30aa7a7658324518351017aa734c3fbb4d584c27ced0c0c1c8675e18451e08a7d0e4cc23e3995bf6ebf7a0ed700f1334970bf87dd4616857dafed9aabc55975c347b8966428beafa800c826268bd25ebd5539f3d13edb53bf98db8f6594bf4d18db7b4bbe296e72da458c13d15d53c0ddef73a37fd8f66cb69507cc43cfb73be4d660ebccc743cbad238e226bbb93fef6ea03c3ca50ce854625b4ffd7ee980b01f1bf2decfd3d775c7bc4ae2f3ff0eec5bd66bc6b472e96fe867c55d48ad1fd2bb97f96f41b666e5e183bf6a7dd401984a9d4649f00583281ba9f3f072f7e721db0dedfcf5d221ce274c5ead6ea03782e2b1080e1d20dc0a4e690d67a2e4d7009bf38925e64dc60ada260a01ac5a0101ce3c2e8fba9fc17f6f7a6fcab311ad3e68565f2d79e566df5f3852d0223916bebeaceea42446e01498e19b99e1933c1246fd4d108e1759737223a708d2760823c38518b492c539496955f237e241b0ed8102b561de71b31366b3ef1f610f1470985893501fa69739a49b40077e8ae38b91200eec9ba3442b2291bdf16a7c03e73a01088c3a5cf41a5a209681a7ec249f20ae16a270779f97bdfb19d13031164d7b1f14983848c477ec48668b35eb00baa2d60cb04699e4512a99fb8c2e2e0b99e1f7206838e9f33db2f2600627129bdf6570552a80fd547bed5286cecd6e374b905154e7541f86e58a7d0f1ae6acd9dcf2c3360a76550b2b04c6291e02dc15e66189dd377e7f295a47eab77f71fcd3d9045a09705d879ad73267ac37ae6c3e938d1e2133901ac49628d26c2e8699640b4268dab9a7019484651adaf76b9508da0a1ae2f794e6cfac5d70d5981a541ccb32f6ea3bd26a91cb47215a724ced201006a0519cc47909075d1741c7ff7740b6c6e6dcec3e5bdcd42f45629569d20ad49024f4b0e2f5be5cec497263744fea5f46ce4f1c13c0105cb9e471687f2f3501420767cd4615e6809deabcc9b91f3d1945e4f98a0555dbebb223caf401cb242b3e486083aba76739d5a1763beffa62acde22bf55e0f0ebeb6fd5a0b1895e11c12fc8dc32cb8adce1c4c48aebb68c7c920062e94496db28adbcb8a337543c184627bc153331b8078c2b1a230343a8c7b1a794aba24600b0f0902c238e8d760ee8ef90a123281e22748e7817e641f4e9ccb20e5814a48d83f7ba4e18e88caa30c7edf9a8fb334081ac2efa5d3c49b52530d00f037b5505b27f949005a8b9f82b64c0bc0df561cd7948c45c8971c3ea97238f8aa7fbeef0b39fac2255af19fc3e303c61ecfd2d94398fa8ecf899e7380f220618c819d9c856025f837fe65f352783227fac152e0e5474e2d5f4f1fc51df6e309152d51d7be0ff59d9d5bc1b1c318dc5b70d241bb9e047dc5641e310b204335e2e51aa3af8fee65b82aa9291b42f089ae883781fc5a650c385f19f8de036f42c75b3fa796d135048b0269809851fc7fa26c4d39f2cccfe809fdc0f8329b896e30cfc8026a591caef0c932742773a9d2c54c84220826902965cf54ddd52b4ee5a61c075f43d2fb5895ec25fec780b7964fe1d73659be8b10ee958dac1d5ac33948b6c526286e644059d83b18e8a305dfdbbb9e842b7ca3b90cd33d81610ec9c5177f0dc526081082e706c1df68607c95322b3a8fdb6511f47b4ded7e4eced6fb1219e8b01fc459877e0db00c6e11aec1f943aeb6ab6c82acec4b5a9f7b3189e4ebff7bf9e501d24b38843e61dc23a6e36d819b67c6d50ae780bd58243551d3c4144e2684145fddffaacbc758bd62691c61aab4ab8c19eb2c770a3678ab7e7441a92b16588b282e7a7892f70b4ae1d116088fa7fe5824ec7786d9a0a32c9b995f6c3c05433f0a85e3c5c24d3891736c158f4bf437a52faaffaf197ca5561ac94859ed7a5cac644232804936ff9bc290fe6a44ac794e6ac57c6329a144734370387daff828a8b0a32e0a7f8adc271056ed9e3a34ec90f9ee621f7f164bfc171b015918429d4457463fa251e2256c21c00904388ab24051982d18a1267cb293313c7aba94637bab7b6e147ddec61e8154544dbc198405bd7b7d649077a57a4cb56d76dd78c01922b580168cd6d019d22fff48e11b876526231b0a55259e1c369b8e952273bb4b567e4842deee1aa3904ec8e1a988cd5ab3c027d23a4b0d361bc7123a3eabe11bbee29cf57fc353b0a282c13690539778a9a20e80cdd2f29d69debab745e0348ec04ef8bfd93a149fd2f90176b8e67a429e42144c9be114143b3b3c60405cc99118ee8fccc6cd7b56b300f9bd149161a7737b454bb67dff470f9933e99a3a81364eafcb0edeb596fe72ae6fecdc03f8f4852c602f4c9d10b7c5ab08269cc5bbea9da9f71dee2906d1f1e6bee514da4ed1366bbd17c43d4f3fe8394f17e4aca6a692c603cf200018e001befd52ac22237bdbf1f4b645caf91b2eb047f8057e0742f51168ee01bac4e2f15469a5d7af51b6b79950f1db756df7163571480ff46fa530039625a901ba3540acabe1abdf034b01ce827accfff4eed37052167ded8571e2bd686ca3235a10f1fd76c90041b411030f2dd1ba35a29cccb054f0ecd7f6b66f48f0099884cf2bd0fcb52783b0c8437f9f6df6a4838c638db9784b24bc85a50d00444dcdd685c883a10581bb46e68ce836a1a2e34b7026524d7ed4a4cd31283a43b1432da50fb5e327e8c6e59cecec8696a539dd8fd492ff1200c9926bef298bf228fa329ccf76030bcabb0d472ef8e3ee1fe192fbfe2f27ab18e0783a49beeb6a89221a2bc49d81e51e3e99b9eae8217508070d1dba747635a3388b51b295ce743705c4588bee43366ca4bb96f0120194391705756a9a89067531b2632d821dcb59b6939c0009a300091b2f538e9bfb885497e12cc9c15141da6d1ef0cdad2b300265a69bacb76147be20e9ab5492e187c978ff9616c8abbb051de2d4ef819f53b52141a79f9960d7d12bfb89f54d506de04459f68dffcac267bacf9679d4383020063a33f84ed0e15761063a36f4760927c0dfa62e3f9e1fac638c4dcdc91d9e9f687026c3d431f7f1daf93089fd7d4723311522b72ee81016463b5f5465517e822c5d18faf3609d030ecf48a242128441900accdd7e3e1ee9a9f255ab5e1d716a2789295fef1299c10655461df46d49d1e0dc1aea4d35f9a8a8d3b178450094ec369e3421c4114c29ad4c2b87ec566c1b04c605a869257dd7416672e3518850a0bd5f7b10bd7035c79a059514036d0b907aab5180cf5a18137277a1e99cabf99626de9484645b0b95ce5ab4b12112fe4f64d37faca637a52ea00bf8c87a85017fd8d6fe36bd0158bd49ab71515964f07318a9e95028b52cae603949e9fb1b8af8de58d6f1b65114576438e585df2bd0c6f6ad1b52403eaf77643d9c6dbe00c18dde335a300bf08a04e8e286e3ffe2fd3f50eebce82e26094392ca17be6b4369d9705017ff5780f1df5dfe6dfb89b8a75ace3201635bfe1800ee9ff2be5705bb8aea931911d233e83788ff2804a48236e00c52cb6366ab33f1ad0b2b7af8eddcecf08affb44bab70f12dd263825253b50bfc113bb772db106aa2d563cbcaa8c62b5eb82ce3dafb0363c104b1d496f8f18b6e19c86e77c341866fc8dc9798b1b3ce641540ba6c60c17666683d95b2685a6dfbb27710c6b212ae3647d9d96358c05c46052a4867d04cc0be06b3f856c00be25677415de91076b13db9e9f3c5edbcd10b685afb281bb0e5d9227158993f69c293fd279eef92c8ea71ec9a2c4655e657bcbe7d6fe9c205e72a59e0ba4147886711b72617e95b83bc84ae00ae8d6b1cfcb886e3d9b4e8abeb225504a52546f47a391edf2798ca0579e37259793a889519c4245e0348f25e100007fcf6662e30695ff88f53505168ffb2d6c23c810f9bd234b3592224ca60fc0da47577cd80b39e62022bd46d2646747aff0a8d99324cd1615e41b745a357e6ff6ab0ee6ef2fbe610c33549cbdd08bb2e764cd08e4bac9c7f9bd6c0b719b2a86181ed7f61c1d5490b2e8c88a2cca9520bec931ad88560eeae4ccc492783d30c0460f390dd0127b827f8ad73735cc98b39d31edc93116c39a26bae6d652a70172499165c99eea34246e93620da6d99cdbbced8e7f08b9cf9dc4128485c92dc335623503290972864cab81d2a59a0b9250d83f61baca0e7b86aa7356ff70ba5504dc7df88151fac03263672e94bf5699d21e6d6382f7acb673e187c1d078aad62a1e101add9768eeeccd0c6d7171a4035f4bfaab61ae5fc75514b0b41228ac214f9cb5797a0478a589c575d2888293d629fd2bdbeb9d4a98dbd2607f9ca8bca8c0875d251a9de3e9cf208788da29c000edf398cbda987cd4751e4c9bca91a8254bdb5eb19b9534263af2c1d7ac23ab2d88f7e355ea42f542742d945f9a672c062659d132b7309ccc5b4e331f071ac4561db418411327e9258f75e42653e898b26a5f49d369fa41c5c71e7ccacccec4f9d8988419163dbde374b0acde0682a574ae674137a7c9e9f97d2759d8de4ad77c41ceb536644318a1f3ef05ad1a0c0a6040b02c2f50e0a780250e40084b6fcbf204b6b39711f1b51b29a7f5fcfe2d03a216eee5277394f3424085711de36f6591cfb0dbaf17fc80e5b14484be98a9232041c3febf5e75889fcc54f0c45eae7d6ce9731627128cb01c8768bdc6dfda9a63ece213d5705005acbce62f3b2bf949e48b3ab0d2d6b6c602e20a7d0b1ecd3601000000010041201a8c57c31321b97e65c2c5ea7b1cd2e24eb7dabaedab49d8d7445d459fc98b18340d75a78819a5ed30bfe344587b8811f0007a36abc32fec70cf5be997c9acd6'
        }
      )
    })

    it('should decode ShieldFromAssetLockTransition', async () => {
      const decoded = await utils.decodeStateTransition(shieldFromAssetLock.data)

      assert.deepEqual(
        decoded,
        {
          type: 18,
          typeString: 'SHIELD_FROM_ASSET_LOCK',
          assetLockProof: {
            coreChainLockedHeight: null,
            type: 'instantSend',
            instantLock: 'AQG4T+hY1UZeGoim4naP1xHf2VupK9oFMN2nlu1L5J2bGwEAAAD1Fx3oFdZzCrTtXzbeAi0kn5pR3B0BLlbWslGEpCXIwWsutXHtrY52Q1wtpjaQYfaxibvA2WQYXX2CvMr/AAAArhvyvQA+yllqfotaWvZ/dCmrar7zU9bvUuvZPD71qV/O+XaHvJvBsIxJKQt4GyxACFFlXR2aG87dvRNlLau+Tdb8zgEwL4U0fKGptKuEqp8dHqOKwUilZ5B9B8m5HCCB',
            fundingAmount: '339554',
            fundingCoreTx: 'c1c825a48451b2d6562e011ddc519a9f242d02de365fedb40a73d615e81d17f5',
            vout: 0
          },
          actions: [
            {
              nullifier: 'c1ebb1461050b9bba1b9693342c98fb82cbe8b58c42b9dfafe6496f62af0240c',
              rk: '1caf5be6e9e816176ca030029b1600679ec7638b57ff3488d4aa0a1f3d528738',
              cmx: 'bd62fba0434289918dbbbd8f0dff1cc03552bb93dcd9e0a4fb9f3518f7fae32a',
              encryptedNote: '5a4d66c33801ed9ef0a9bf3431daf0cc0da12d6a6899c98a9043e1235a5f91a9abe9811bd52dbed0992e979b721bd226bc0f3d0cdf00166457b45082b90e5d30d8998c7bafeaa82e6cdc25fac4d09eced1f6e31de0f1a753a87e673c66625d80d8fb10fa9df51abad90e4635415f1d1d3cab5504215a2b8332e17271b1635a6eb9083a502a51e444f8ef2a796b4e827c171c090abcb0356531f5c120e539126f41e4afe8f5ed068c602ba7f25b4f91cb0ead4a2ae8a992b58bc79b496a21932c4855ad5062ab269cd1e8c66c0f0b5f41cd717ca3a4cada56',
              cvNet: '56c44c4376b733bd22b00ede37bc9e5bd6bb7eb5ec6857c862a6c2c0d2b740bb',
              spendAuthSig: '8ac491d4101e079c25b21916954646d2ae44b821364af0aa4e1923534dbeb6b8a7e409f29b6dd1698b127ec3c5bf67e2e10dfde38c7ec2d6329c8f6f4fd98e28'
            },
            {
              nullifier: 'cfba4e47f933d7f000bd3c4d153ae97dc9c8bbfa205c4f7c8f932358a924eb20',
              rk: '10df0d7273e4456b9927945f1b43f69100d2aff113306c56ca6ef39086c33c24',
              cmx: '2889dda02ad2f10a5737e677cdec567f82fd2741cfd9d8af05f38ba4d5d77622',
              encryptedNote: '399027474d08c1d6ce9100114fbd6a5d4c1d0ae85de17e2d64db3ecc05e7160dc0fe96f9badcd87f2d96481f4f83c42d748a6354e049b0e49fd9b9feae08eee3758442748a98cfb58823a14d3accc2c9703d9ba77ddac5808ce076771d8973a2aa2a3a271e914c6c9081d1ef957c4aeefe61169a5e28bb2c0bdfb6b458effd313737504e23a67ce1c7472a6e87db5fb0e138a73e3e7b5f0484399e76dacf23d6c927b0f29d83edb5e17f757f954007804632d9499d0299c4b80a5666b50d9565d9007df8215426a5704e833f9db5ad368230cfde0304e34e',
              cvNet: '5640813101fc28678ab67cc5ad8850cd7f7516b416285955f261de854b0f98be',
              spendAuthSig: '3041f9ab67e61e2b10d35c2282c98f7265d58b94e6cb8a90a382ec63db13ea1852ae59030b286f02f90731c63d0b606139c09605a915f2cfbe9cb9727437e806'
            },
            {
              nullifier: 'e1d9c1e4c9347b005fead2f824ec1d02ac6d8f40908ab5c3033b708e188d4909',
              rk: 'f948d2e7c065dcf7d7c04a9038e1a54f102f0c26c7c69de06da6b5e6348741a7',
              cmx: '7ffee67a2e1ba8fdd48e5d94a8eff4bb384740a8ce99ecaffcdfd2c8001e4e2b',
              encryptedNote: 'eb5845dcbcd1941c2af47b5222a8f6f9405b0698547ac5bc348c80fb87926338ce814dc9da1bf98d6232a241aeb0f8e4be04c102460a5eded3378331efcf8960cc24cffe28087a089eb573158e1a026c2468d98070e29a9e767d503e31721c238f22c890d2f971b24fe24f131bee46c992a203c36a91353d0190e3081fe2f729d0b4b3b2f575d38a215f9d12ef57d416c8f4284efa08fbfde5aa695b0ea4c3e853746fc7e3d4b5ec9927ac196b1c5ab8baba81fb237b7068c32a8012f1a745389905772f40a58bcfc45e531e2554061cedf94d3645f27bbb',
              cvNet: '26be550e4b413bdb7a727e087b398ff54dd67c51365ca1a013a5434d14bb9095',
              spendAuthSig: '0e06c357e7d30c85abd249229654491d14f23a3e0c077f9c57c617e09d8b0106b19c7030b0645038b0a6763f8fdeb55901291a5804491c33495e9f4329609b14'
            },
            {
              nullifier: 'eec6bc74e9a5b824062eb27b1c8628b0c53aa9ad56850392593e41db35deac01',
              rk: '59c5f7f0a0c1ddca1dc3001af846d8f16e42247006f9ef899c4276c43dd680bb',
              cmx: 'e1046849de6073afd921f9360454d7e2acafb72625abb26967fdd53046a6b230',
              encryptedNote: '1159aa1ba100ba98e93532807a4c24517a0200174f8bbd43d4d361d456e421195bfacfbab4504ee6eab994ef6215eccdc951fd8329f5eac6abe2b69c8f28509cc8f4b213d389a507a9e2f778b27be9a9577e4dcf7f3448ab519757877231921ee961a7001e282803fd4042edb1f4f08575893576dd3b88f311869d0f86b9374806e9d05dfe59f59ce6a77b100bc902d53629567eebf87804e64f40ff02d0f8fbad103c8b4ae8cdf6bd05ab2359737d7905d8a07cea2bbc3081d881856b1e68e5ab73e8288221a91d19b185a9d3eb44212a97df02d9c75fa3',
              cvNet: '37c60b3bd8daa7e2ae91141750fed32ba672daced3e41f71f7ec02dda483de8e',
              spendAuthSig: 'd3cbe4a2f33fdcdae68c244b44279852210918ccddedce7f7bf891acd6cc602e1737ad1c752f8bcfd8c082655cefb8b465af3d2c0935079798eeba07797a220e'
            },
            {
              nullifier: '801aadff0d6c4b3bdea94dd11c13f8d20107318af1960bfb6c96f0c04ad89f3c',
              rk: '73ecba0a95e10815c5cf8af946f130df39a5be039af7dee3850af99b972e6c92',
              cmx: '6bfb5c662401a21323aaf2863baf6e7ee2e9c3aca21f8c16017f03f4017fe61d',
              encryptedNote: '7d6cd176246c92624500f7b7116725d19eede487e94442b364bf300543c451880b79e3cf3ea86a61466194e161bc39104a703fa6853d84585c44caafda589e609748be4d7279627795e6731c42542881c51404a245cc14c207e4ee51bbd40383895370a5149478552feb6020439de96982f1441e05655306541669b3801b337e30cdf3caa2358ebd70962350fb9150c6e52eb34ea05177497baab289d0dbd433ae03da78ed6033ced98ecdd4049ccc326c4d559b1fcaeeca8b781ffdbb0296bc53b2e30f31fdc0eb53bea2398f299ffb8e93a3157fdb837e',
              cvNet: '6898bab76fd10533a0ef5fe19207805ccecde613d7671a8bc50fde5feff16000',
              spendAuthSig: 'e1dd60c4d1652275eda2b02a6fc9c58ed8dad8576641e51b0e1cfd3ae0217ea6b388f8e658bdc348ae4e5b6549d43333ff4570f7283ddbd0f2c66d6519661f26'
            },
            {
              nullifier: '8b1d70101d1096fb4ff1830968874be449fcca2a8ad519682aa418ce8901133e',
              rk: '3f59119505b8b39464ec5731edecbfbafab1a6cc33f34c0152d6d63e0fda18b2',
              cmx: '2a21a62f82c9bb70292e4d223b07f4cf2cf20180821a174b92c7249ac0eec40b',
              encryptedNote: '7fa7e3ae0dd5f9d87121ba907db6fc4347c1d837586aa79b3179838475a22205e511cdad1fafaf5c3a8be9a8836f0a6afc378154db43c65fc6960951499729830a8adc72a8583ea7c8da39792784b84db767b0a95b3b27308c852fd7f2b5df86bfc8e4628d24e3c78015001374c61392a5a749ea8290de863e662575cee9a5a9d2ee8d788d37947e419744dc1bc19fb539e7c023d4e2d7e2a6598806b9e51a5d43105d1fa661d2c213185b7c7a5d30be6ffd0cccb03a54bdde540ce874528abab12cedb5398bf77f9df1459a66dabfc1d58175fcd413799b',
              cvNet: 'e5c27b37eb29a7ef23fff10bb91c6b9b1bab2452c063eb4cb8f5da03a3ccfb30',
              spendAuthSig: 'd567f48dd881c8a53379136739db84a4539489bec63814bce4ca25f99ef89f132e1078669607864b40e02ad89477539cac832b2734927d5cafa8bc0d8f3a3318'
            }
          ],
          valueBalance: '1000400',
          anchor: 'ae2935f1dfd8a24aed7c70df7de3a668eb7a49b1319880dde2bbd9031ae5d82f',
          proof: 'de60ec4d98464a6b5ef00689ba4510eb84a05a233190c830efe3e533add4460052155ebd5a7aefe6fc5e33daecef96102ce12c55f63757ca2ebbf9d7c406b893c6015002f584c51db453d27c7d67013fa1a0105e023e635f0b43fe771a80ba17e2ae03f9b0ec2d4cffb7bb4ba2e641560070d2173fcb274b1149a0a71bf3728c93f5310386d6a844fc5a7b363f4daa6ae9aa9aaaaddfd16278cef0a7259a74b64dff45d695be5ddeb4c59f4bdc1afcd1f812af43fcb6a0e72c373a8dd61f2c17f1b4db22d56568d7eb79c00a1f642a973a699bae0001d2c6e94587e9b794cb3b43e321df1d8ffd925375c6fb307eb3516f520619132388164210d71c631400074976b4dd25fc16d9e97eb04df4ccc3ba566ab2c122721170449e223afa9df29ae62743640e8880c0f7c9334769e622130fe104882b81f1532f1733ff81fe3aaf718af087632b458f1489d1ade9f02dee00d36f5b9a0eb23c8342029972676a8e85a8b1798f3afc22912428fdbcaa532048e5ba205c0b20384294f474b2d4ad2aefcc2469c4d98087e1cba03835b4b2cce9b4193760df5e91b652e8d18f8e75097c19af80d9d4030422e8a045a73d0004de959dc3796e4e13328a68abefa7433b75800c9ee813e2d3e80f111e774a81d2ec5d4cb0af4be768fd5a6280514cd588bdd2ca7db5b72f5754cb7d20c7ace296bb1ea1f09c15f11d95c3d03afda3dcb7cbb2a6e414520591e7a5dc06d2a40ca3ba297a8ff0b49b83c6fe87aeb0fe9981534aec1083cd94e4813760f6d8309e23d11a9b8cf3b63aa87b47ccc11d577d32730e2b532111ab0b1936e4bf68614d6771534e61e13ec54195333abc4e3946377680607b619c1656fdf0252df8999e3a7c012d8a1febdfbc3ae9a4ae94cd71bc32cd2325b3e4543d9ad53f11b8a338ec204bdb37a13c447d61de8efcfddd82a89df7db023b73e23894a30b53ef835e31428e20ffbcc8f82c4a1d0208c1cf931ec15fbfe09eabc15ad5a34d4814563ea934dce566d7785616850b20f360dd68227ad615d3e3ef8d874ec51f2ea187143ea319d54248a3304071a7cc9760f3d0b83d1dfdce9f5047d8d0260ccb5290928f36f662cc3475974e279a9a5590819a1f2880aedec950ea1eacc6518e71f1405e5d18b9af34819c2e20737bef1cc4112eb4ed0bbd76dcef6369e14602f17ac569962802b3d8666a17a0ea0e5cef2b98a7d4d0f6585d71b35a288cc8221cc4db750a05fad80caefe0bc1b3970f482603b44d626daa50230058e692e406cbc37f47d8e8fef3f9265cf671dc6a0efe1fcea4974971ac2a94b65644bbf09f6b1894ba8351f2c6c308ef5222b75cb04836308b8614c4b3618b62a44e137a3f6026c89d5868cc0005c3659a889570e5652dd50a655c422dbfb36111ce91e02f8760a20b0c5a86c426b711f841b6f2a54fbdfc873bc1b45787efc233c74d7fc497c6aa94fb8132b6553b577a34fa1f29319117bd0466a70ab7f69172e38dd9b9ec4d388d5d1f12e27d6a8914a95fa4ad7abf8525c40d4ea882652d90bbcb9aa82efda435cd17b030c0fb33d79d862dd70e33c3b319c2507ec6d2df752bd107bf6cba0df896ac26efd39310f985070bfcb6740098dd1a0d5eb53b62cdf37ef1dfed2770ee0e9fb8762356cca7258cede5117bc10bfe7870220bac7006f8b59ece8762809250415466ff51689392dfbe021cbdb2829e92e289efea33a2b2f2c97d49b0e35dd96de90591308fa5bfc97ff3989e459e2cf194e511e5a0f04ff5d619b2a3d04817ffde3d7330245210b46487d029e6952807148cabded14774a12d93630e1fe881ce42d66dd560780feacdffc05a12172d0d18e6ae2830a0c114b42c145c6caaf55132f84a6b02dbbd18501e3c39b0aea94e6d64cfbf8425b1a2723c95acabec9f1de9b440462509cfeb68d6632f989492cd6d99ea58da272835a4567908bc6594536eaa7ba4f2cde1643e3e0295fc0e8c01e0eefe3bc9f3e68467e272c4a9ee2b97f239bd46310fce06c354d3ff61beabb9732003f33d4e1179fd550d2b8d5021836166a1fb9df2b6bacbd4cee6e3b9decd7c8baced915b03c09f1e85b6bae1ff2b987cfaa8915426249543888d062123824bc485f66d171ca0017e24d9e475d1d00279dcac6dd208ca99bf6743c0bd6afa070dab6e8926848fac3bf9ab0d0d888a6886c30ff74df81ac121339a188500d07a1f136feb4765b0d4f0aba54000b1887ee7879dd07333099d827162049c0191b48e8c5ab956c56ae86d115b16ee5430a3ef48c0509a8331a086a71dad93e0f1a697e2a8877225e307b38dbd0c92ce87f0df3ca6e1a58c3cee5a3099b387ee50f894f88623cf952820e5f3cc0f822f301277f84c805b0ac7c9e2f96f120a4162bae3a06adf17d5e2ed813fb6f4a53894f3814538a6d35a497bde41d81f1af0944f9ec2adc1d1621ade8d9b0aa9a312af5d8db7c9fa40874e9fe1baaec988b9d2d65a193a6faa8dc81b31a3b057fba6fad1b5f8436512d159436b9384f480529a5ea7eb12862e59e4047469eba07be56336d5ef7327e1c217b9706c3e053ad6f77e8667e41662060e4eec305dab1e701502186074551e9935c2d8c1816f9f05ab79c86c1ba1e7827602b29a3aa0f26d111166a7557d17875c6abbea44fd2cea765597d9a715abd4746a5b86499e38e282757630c44155aa1c30b89c47f5393065ad0a36a20fba08beec665a5cefeae546dcdf7c76cc332e3c3be4cab196bef84879d0ae7b850c06efb54cdb86833f596775b6ee69311416ea5b0579de1e086e0c8576166c1c2977114aebec3300349c20ebd902e5172ea4d3f36d6102d1a6d771f991d383c74a335a1194ca8a06f12473919e32bf266ad445e974e728f4b5ea62cf3c8b1e0f79fab458a3602795641f8c2264b3d544269669604d6636da1e027e7c451fec30b853ea48bc7469a29aed798d5dc59dcda4a339d5b002f91582825a1938eb85e3cc02ccafe61c27f4f7451afbd4a12b1e45aa064887bc12acbacd32ae994fb02ed32bde25f349eac3eb7d33c8ee82b73752cfc2b1b0d55bae3ecc47c07cd058c6f171d8fb7ed50c721f81845198763b30dd0c1f194974b7018dc0162541a595e172b401e7b2efcefc50666804a08438d50f1293ea9f9c19582cc4a231f9c560b8bfa12d76de6b7de60e8d59738374b992ab24e9133bdc05472942b4a5b2da10c0d9b313eb61b8c4ce6a27b308bc054425ab3c52192687ce59a276046f64cfa18bb7e16693e84d4cad2e1a8e4b78cd3f9f09e48a322a5dec67871aeb53025df54164d16f5ef8c61626a76dd1f31040378887761170d33ca7b2abe8641c94df5257a5e96476c79addd2a1b4586c4132601f3d327e55fdc10430bcdc121ca517d733223b31248513c74a85ce498e56ccc2305e9860d7800252a2852d4ab8cb6d656de4f49ae0a387cb19f3715057f2b36740cdbe09d835e44b9fa8eb7c87e0b4a53e407b3a86fc0c949f984da445463f9b955e37e13d295280dea5bb69f14d51216c160919d61744117b7c681125dff3febf674aebc471e544ff2831c8fe66633b5669cced727fd51b8600455f4fbebc12d2534e2294c09f3735b9770b5dd1e5e6545713ecfe05c4584d2411bafa5ff23fbe3f0052dd589536cf99a1d80e079b9fd0245e96af40140b1d4d2e964eccaec0907e0291714fe82a93161a71f81c7eb894b808ab3a961f2891157e3dc554ee0eabd3ff74e7ed7bca7db9b005595ed71f304ac10b0fb22ac8d7509d73caf7de463632ad78b6e5ad95fa2c281a7b69659db137fc68469800bc1d57fbb39dbb631cf8c55597adaa9253bbb86941649f3093cb6c3d254422fa72e8dea9da71982196da1f6a4d5fa2144d7e1e7e25a3832c3c901b3cc10cca2fd8487836d606dfb47988b420e95b8408522a80553c23a9574c9cf22c6dc13a3f0ac409dbea6249466400ac857d0f49ccb25a114a4d77815cbefa662498d60720d5c4961c3210d23f266beb67a0df30e26c5000c398d3d1de0bc7df22c671a77cb645b825556d5a57dd9870ec49ca49e66cf9a3688aa59bfb4fff21790871424bd1578abc56e864e44bf2b57e79cf9305a5271545c929a8e554590b521c016ac3529ee7ffe46749d4820374843c8f491cdccc37df077ab578eec4edb4e56712e7e69cc8a3e109037486991734c47cc15106ebbc40539d0b4b5dde2d27bbaa03dcca7bcdfa6e2d39b2d552c65f968661ed3b28a2591dd8f8356380322865103e40df714bf58f9a577e1a39fb7cd519d488e734987c53ee1a9507134774d402ac5f9bf64446f06abf21153344b57714a51d15271a33cc2c05269150fef36ef4868a4f3cda434ebf3cda88397f4b093f55a0872f1e01adc4362f1cfa9207b80cb7061a0e9e754783b1a855b3fd79159e73904ef819212502e563d7834a7a986857cfea0e38598337a9fa5e03aba0a2c33c2ce503ad67955eb58a213e28408c46590adc36eaeb67b5fe5f9f0366ee303a8ca516be3fb76a5a790bc61c08268ae3cf8be2485b969b31cbb0dcf234dfc09fa3b49fe33678a3a68f02ad80ccf420ae58be241809bd8ae7b592dece034195e08978d84a3665e71d02745ba178e4381a52a018fd7bbec0baa9cf88d48b013f8fcec9a5d5a3a917575245662b5998b565626c3734eaf23174fb88bbaec0f6d70d3e172e6cb3703aed4a4878721119d977e126530ed78e19e45846006c5da3adac330cd53b9b7b7915914617ba8d1e810a84f86d47a73b5d9c71b0edb3818802c4d46bbc942d05ecc289a1bab9511a25047a751eec3f22ca1dc1d7a2d41b17195502ca8b7aa41c321ec696bea52a6ddfff1d8b59a53ba83b611d12478d5f9a779f43e6d95f0930e52156d0aff304230419b5f8bcd7948ffa013ed50d3e01551698e812664f8fd01baee46bab76869e0541fb9029912576980672b7824415c5d3a511bc2c302e3e14ebffa4a78a59b57156f485bfec992f239b8deb3d136eea0bb5979c05c2b36c288bb6acb1ce95ea3d417e311075d5d318fbadeded96f9a33a5695c2f9449e76a57c058bea73eadd2778876b49fe6ba2f1b243b563b8363c764a9bd75b019cdb75acd578a2f71408ac70ba119469125601a751548165a3ac6e87d053746798c1db1a759ded00e26c8dd6dc381da865761fc5af4a2d9d421ece05aba2af0488dbc0cc3c50067c9ab8ba4bbf861515ca426e89eb350b308d3a04576500001a9791983dcdee6160b91e874dc2c473c7539b9c5897380f492d8f5fda78ce669ba382bbbc346da358fe1df6a58faa84e7c535dcb9dd73672ca7ec9c52521ed5662e2ab346b3712952aa326e795529d29a8c79a0251b002b3afb59b8a909d8fcdf939b210f48d3275a7c80114aab746a9604311912cc6b09cce9634afac5673c8c0b35a46df5a03e27c779c3da6aefcfb0e935fb10bf955d0ee44cebba9884d32f0e67e3991381bd5ef4c41ffec9ddd554a994d83a9c26880151cb904804de8a121a224f99e2fc2d418f5417ac20fac076e70d8a1a2c96569d119972847e62a59d8662e14793f5474e756e06d7de5ff3f0902a121dde2bda9149778eb436ecaf4aa682415cddeca1282ff9bc1493d490ad28a9ca5785ca3497301dfe1700425281a3aa9be371d99d86424db305b46676d99aa4f7ce34241a7f011b5e13b67bd11e236925938e1f91f8b304744fe22c538cde4eae64b011c12abf2fb852df21ff22adcbc3cb124d3fca270c9f94cf0f3b7150dac4d31d98d2fe948dad94af8da2cc1ae03de86e1a2b098d3ce8f022ed1e87b3879922c1ae296574eb7bb4e6dd543a989318ac1e4af2fbcb3153a63cdd8a6c84f2caa67a5e5f3d83163ef1efcfaa8f3812d30da18554455ecbe148ac411ad657581a074fa1e4e763a395b729ad04099b19c6d3f7c912ee9fd1e8e47b2b84e2db60febb6262ba5a20c54605c3722f4f017f2e8e5f1e9bd7a1aef27ce9170c09ef222c48e1cfbee423504ba27bbea6f5bf04f6f1a4e8082ea0d57b35cd4e1d49154cedebb2f883d6e84d46f13ce74d91a2fc66e64ccfd060ad1ab96f3bae8b22bd841c17745f88b8aa6bc3ba7b5e30ef06e1a719304f9af21bdb4e4bf61e0a47029474ff76d738b4c345d5a15baacf6a1ead498d1adbe8230c62f9fbe100d6effb3ea59d1b4f6e5e27589e0f1611b83e077d9782630aa2ab58b868f635c30f30c39a06127f782a8a36d5b4cdf76731690602ab89cb4f77924f5cab314cf5b64e7cbb5ed9518e4d6f97e4f623f79566a80175d4c8ef180bf69d11f976af787530750454b289d5512e75020074bae9f2659a2aab53f2dadf52e308c8228943c6ba04fe257e61d650eb90e4dad8c0dc78020d280d359a571e70c42ef40e7dd427e1ef3021920cf03a0747741cd9269c87703e641c4d06a4c4f1e42b07f949f724cd0849411f137ef1cb1d5577027f405e320183b624d9e9e2fe7e65aae7426841f655dbb17ee39e4a1bd150e34d6a97726804b1185827861e6384afa03c25268800edc5cb7b77aeb12858872b996bc6807d2a04549dbd22157f5293c8ba59ab7d8d6ffcf45f7a031f98f627f0e0f786c0ba2cc8e617cbf0bbc321cd6b7a79071b5ee92c384ec0e46feb4887fdf78cbbde552f7311a32c99d1c916681a6b67e880dcc5338d8106a7a2bf47a60142ac152a551088d227a0ba8a4c2c888b5d5e475e6a5a7250adf1e2019b58d78b41073d1e9c095be960fd90563256800011615c3429b0970ba72db637fdd2889a041a5c3b5005ba3bcfe9c06b99a1611dd824c7c00450fa1a1a03ef735ff54b7b5588aff192048be3cf525143f8190fe6e25f1817abe60ca9eeb31a9662d0e86567bcdad56f072242b3c4d19fd4aed95e8c785ecd9e7d0f42ae12c8c7e80c5ddcb789437bf0274dde03382d76fff77a1e6e8acc040c36cec1f0b45fca40701483bd60e116342a43b24932b1086fbb928a46090b49658f874dcc3491a8ef27b764780439a59d3f022ecbbd5559b53574872bb52a8d46d501b14eaa19b30c679edbd291a3ef7d022b8d0cb07998b14bae7b45987c81405287860f81f3205638a8465ce2232dd53b6d206706a960e413fa0f30b0918471a80afdea5dd60ffce76c119b28fc9c883e0ebd68a6b6f21b2fb67d1c1f1c92d80153c16b83d52527e52873edd12b726e29bd41e9b9e9bfb2e995427e68da3e1ad1d5463047f2c4f1a3cabdac5a3c2faf2bd361b9566f93a8c16cae58d63c91443aa39b482969136bfc8f855d74e390851a99d429e261f0ece79b91b1c4108175fce93de33ec186af6bed5294976f19ae122637bb924f035230fef9f183bcbc213e4c94d0c1f40b099d20d5225811f1e22dee2500f6af06080506d5dcc7377df8cc421c16d377d8bb94c3f89afb382f7e3478fa4587ddf6639e354801322e27eafc93721d113699a4a4b4f7a5d6cde8cf2d135e5c14225b17c43e497a6f453b58e7522f23ff128018fa06dc2cc0069888164073ef08302a841998225e4c8d7a735036d1e16857b6ae1eba8796c1a3c48906ba1efce0cfad5528e1743ef0f00eb9041905db9ba51336cc72979fd479929e2b95f96e1eb249d2bf9933efffc33917800449f1eea26234c108fb3aa6f956a50bc339794d23d28a51ae517fbf4fec3fe52a0c6c00f7d013fcc28f1da3ec416a10b37f1826205e8581ece810ce42b9dea4d7c2c6e47e116a73beccebd939ba751e403d23e36a89934e8dc92f3ee678f0a7d33be76e2293eb9e8d6cb828c35af61fbb40af7e027bf35be29cb9b6ddcfde285a241f9e9d0c3cb2ba7d3fecf588033134d6e20d445793c095d5786666e1a1be275a511a2d4eb29b977b0afec3d5b907d99946d85580eed5eef7dac6b6f691ff79ee94388c37327b5ba5ad7f8b32f00243b148ef4d5351efdf6f43e0646cd95384102e553eb093ffcf108b43a5cbb70281748fb36e666fcd1a80f1b455ff07c84945fba7cdc7b2de95c1ed575d6bad05167fb2b69c11ca2f83502d8202414bb19866fc532797f57f945982acc3341d05e653d0a867d7c4da06531dd1c5f703c91a6c4ab33875165b61637d3267881e1cdfd84bd7ec383e88ff58e71d1c925f9c6c13f9c81fa6d7189b28a863fa47db0228a1fdd81a329327a477ece6b6440720e541e96ae4157de86b11fe21dc729a26ce24c9768f0b9c8b99cc74e440751225215546be581d0b4e6d5bdc8ecdc49f086d2d7657e7104a275077cfa5eed23d50558a8b4adb4903856a7b17ebbcbf9408fd8ca6f29095f57ce6a22bc09acefd9d33ddff2f3f0e5e78a50d080c39969a2a2ffd94c49ae04eeb83b39dbe1978bed089136ab9e1eeaff5846f1f2ec1ac3527f4767c3bfb1b7697d72b56ba966b1566529a5fadd5658138b621978691783c2dd654b0100d00f6077f08c095c0f244436957d74259c1beacd1c6755a0096c938d1552487d8878d010616c90f0314a8fb4cb75507ddd4e51a9a7d668aaa56d30a51451c773cf90bddddd834218b33a91a8e45f13db6b06f6b2e787db02bd289253495639c95d1f323a318b450eba24565dae1b33a87a71ad046052c6e09ff510e3783e7321efe21abb57e1c007297d70ee1ba03f37b20aa53435c7f6b61d2683b5db24d4440c72e039fb18e20e03951db962dde596238a5c27287726a9c614a176a4f247dc0a89f773328e0827b411a362628c4d9b5c0b91c85ced26a7895270723fc48fc42bb91a0dd289ac5dbcabe21a0cf5cbc727288919ab085726277723a39e732728f2748a1ed2ddc87776943d2a2bbe6aad6118bdf1132e0b6bfaed2214a3c3d5e75d9ce1fc9cd83a90aaa60db580684fdd6c60aba0efe220b837d3326202ed718953c525b2e0900504feb8535a73f1812e6e0c83366112f9fb4275a0aef80d3b798a84329cf9b1f9aebcae85b89bbd245f2888b2d4eda16517bbdf308a2ebd2b6c41e5e143bccb9495b481720f2f635751ab6b28f59924ccb296e72301a278cd335596e51fb83abf313a68bfd3b795c45973644d3db6314f09a5b201b267d36065d3335b87d4e4b2c37c6e43f45d9b749a09a866854cb66786ea262076512a1defc28cf74357676604f71dc1564fc1bbc80cd0e045c824831869609085f739cbc8b4b2f4bcac990eead96cb3ce2f85ddf92a29e3a3ad295186dbab03fc642403549024b7032900013811fff1c87e7aa96a3900dd63bc5f5eb34f4d13705185b29d73738cec715d8c658c8cf0f9cabf46d9285612e46d09a58cfe5ed2d50d52bab8d0423052457269d4b1840dd54c1f682640768c1e9c8cb9332640f2ddb4c9613ac032e50e9b7b22010963a00f83daab24e618cd9b9efc3e455dd720f8386db0643a9fefbd8fde7b871c84432895bc56b5efc2c9e05e821a7e4f3510be9438fb2821259ffa290255043219ca17b6aa0d03af4858998bc1bb021078e0be488f1279f85f11e31e8081366d874fc2ef229ef955d89a11a1ea1b11c7385356d5a5c74abf26f346a9d038aa0e528615776fac250bcf0a2d0345bd2d1c135260ccc4cdd82e3eda7d714d8d9d95c2aa860c9ddd45c204908132dae7bb22e903f677477c860c8ccea2044aafb35e6a3958e1c1ef77c7bf6efda2377089adeb03748ccaa605b221fc76e1e83986ee88c23e8c21f168643a8dcc8abec9be99c6e2b71a70a52abd3eb00d8ddc1b8d96db0bd061764de00f08cd6ab177084f090ce02ed0df719f11ea9679375ed2034cfb971e252216bd1a6bb4bf8036655492c870f3ffcaaa552fc641790b9982762b0dfb81a7aa0eb3254fa1bd3926ca300f28e2b18007881d511d6350454d2df310a4071c1da7642aab13e3bc24c4b198dd4ad1f72bc8beace3a3c84b016b0529dade04f7131644f0737587b3c7523ee89860a2f27d00d047efad14f754400be8f606ab18c087c0b46cbf5913dcada50467f32278dd6336f1c1af2fb645780d7bc837d9cacc4bbe5fd4d1769260e16c6dfcc7d2f20c365f1343aacb955c665ee91491683ddd9f0795094943d75291b5004c275133fd44b84ce04f36f98766fa75fc99f5a092dafdfb64b2cea4d74d47884ced12e683d7ff6a5037b403e377365bb48654520af1820ff34b3a6b3b9d18f4757b63cda26cf9168b09bdb86de2f085487af79b854fef63f828becead7b6dd0c333b0c3cdb1a67d710af6c96a9a591022382a9f5bdfaf64810f4a859834fa07979751ba7a00bfa2f54c53117fa0f932e3ef59460adebd23dc0b5a07de17feb30fd0d29e52d1161552a11d6ead0a6bc01f5bf9d1d8585dcbcbff50f65aeab67165e5422d845053ed80e2af8d92133e06e93d8b1354bb57c1fe0e9dc8ea23348cc5e3f30ff078b9adf844160800b9ead4c23a13e0c405a6a801a75ae7d375b66e669971f7b31149a17eb10d531f038543aeccb1e9654b0d2d6153831ae3f908a19aead31385734974b118e9963eb6f23b20c2acc995eeda9a0234c8138077d52e2f1401f93856ac1acb341639cc699ee5c7e6ee9a1fd71f8163ccf1a7bfedcd5500d781d39df56703c9a224c72906fb3cc0cad64c1692aabb74359c988ae0628d3ede833ec7d1a6bc17b309b6277bd25b00a994dd75ba2d132b7e253fc124182973ce92daeccca57fbdaba318dac892186d6b710c1f27d296da6977aa0e4f2480850b83f72c68391bf51df3e95230b59892fb98e1959f92645e812c377738554c8b9f211e02ad42de96119ed36b3279a1327fbb2a538a3850b1eda31233881af6314293572242a5df0c7ac9802bd5b31756ba10680539871e1abd6decb594d553021e80442eebecbfb5f17bee61d7233190e8c8ee627d982b0e5d676f1fba79d533dca2e6ff69709d4e5b5c869d80164a4b776534348de2fdd11c67fe2c437b6336d143f4074b79878ffd540f5550ee028f6512cb42ade1a991290171c0b79f66d4144296a29a06a2067beda472e3b5758d0aa98ef8c77f4838e4ef79ee5bfc0d794fa01ae3e52d4f84bdc7aac1c01eca6213de2e2689ddc9c97c7a68564737a0c26da2894aadf68d9fc4fbd75a9ba62dfb717793407653b96297af7bbe669b4deadab12aab15e7dc655c3b950f70fef95143f805acd4375206160ddfd1a790af918762f2542ccd784ca5a7a511cf84593f51abcb8c828cf53974332c47fd1dd03c6870a9d08cc4b918dd9d205e8a76a12d2ffc70485a82cb61bff8adc6b75857e469d251ec099c8bb03f1a8811598ffe6953931336f2e410d4b51cdde6eb35806d2b429cede8b879c95e77f706b419da522d6a3788b2c701fed5c9d0abff2426cb73e0abd0cde705d36f1ca3376bba9270fcd2be849dec0d627091a7747525bc42c1512031cd623931ada98af097632eb5badacfafa2b0951a957d885144bcc0a390e1411906bbfdab3864bebf1c7e839b2c26c7770f2a0e9bbe26982ba60e8027f5b1822f0f7b7496881810e589037a89d7ba61e1b01bf5fb057634b74b8d5ef24383896531031f539007699445a5e4167ffbc7d3832e2f830538a5ae74cbb88dd7c303d8ed4e39f31f9139fc9d8e534315479aeebd953895f087e102f40e3369ef9325da317e6066dc13d63d3336c3ab6b9770d506d01645aa5377f040dbaf19d2f2283261db40fa82e3394f759fd52f216cc1579b749493ad8d0f40f01fc96410d1d165002fe0b4c51ab28244f7fb56523ff5951d1db68c5a848f032e9c0a6dacc15ccc74d6dc9689a23f66b6b04c4f4ae8d3d123bb2b626a7e549fb60dfffe6e804b7b71dbe829d773f1c07a1923befb30e02bfb72c8de42a5595becff635186523cca1801dbfde30b73bc7e6faa8662fa0f3f4ffc446d310775ffec4dca69647345e78bccc6746458939c0d5b2c6e332f103b2bf216abe553b507725aa9041b313bd7ee04a268c12a263d4174d635c3ca959f5d62fafdadc37d8da44594d0214166973eed20d200f3ce872e6386876d00a8ae7d57fce83885dfc295b787bfc9a337534294a50f15a719c524ca850b930766e8dab6117b1a909ecd2c9fa888fbf3bab80b088f056067f5edbc487ddb703560355cf47ed8c6c3674d52d075ec0d2364eb90e5c93595a912bcbe1287ce628a52829a629f0726c18cd2b212bd294072a72a723a24405e9110bec60ed0de4018df0150f68433a1a36e70b66aaf2731d2302def2fbf4cf5834eed4f450153031404a16f99670d8410af27869847c5cea1acadde4b297074fb16648544abebbafd48dca46ae98c3d885f8e2c18d8766de1f1fa49737c17121b82d8093559624cbff1e18dbfd103854ff1f7e84a8f8404d2568017b2f149f908f44a51398d102365b907fa6aff6f46c4f2ab624f21139d20bc0e571125e87ee2eefdaf5bda5e03ef62af17c6e65c04861974fe8319689423c86f5c2767c208a70bd6700eb245542e5ed18a4d5883ed0a2cbb2a06200cc940ce94232cf365b5897be1aa70cadd25af1c432e4077e54c7aa5c40abc832f60e124cabac79085387adcf90dd4adc761785e6eba1d2c79ec8453bf35d44910a2d026985b81af768b0f42fdb446d2bc9ad1be943200afa24535c83c84fefc949702ad8c45eb67fdd200a3ccd6528614489b4f2eff235c83ad98dd38cec979eee7d3897a8f93432411cbedb6ebba856722bdf8d476a5c64c67c8c6a8093928a36cd10b19b9b6d893929c54c0e4f849f0e76cf49b878acfc73e25baa41be3ff18c2f0f9774e154c6db2e045c3f82f4484b234f5dc50217fd4939b4423ab48c6ae08c2cfed6508c9fa74e4567187c469bd56f4a862067755eaa600a928015e0027350287c373af81c94ac4fc5f710e1435b12d8db2ddce840b6a25ddd4742c7733c5d1a54d0905c301e891a990ba8b1a07cbd77276fc7e8b2af3bcceb8ccc3951fd4537c7bf39e36bc491a0abfeb645f7b4ae8e8572e60fbc38dae423d3631db3f0c41e10458b34e02cc58f175d9f2f5c6947899e63f53ad12afe42c61458d330e58838d235d45686034f369d1449ecc079367c235e6f2907481f9b7e4edfda0429af0fb236daf8f704292c54b1af6d5b34f7c141bc266e77fc22b6a69353a4cebd562d281c1cfce42555dbc6a2e6f6b3940cb9a62066f76eca79a997255852a90bac347d24d733bdbb1316ebf3f317d3a4365f5f32d0990d9db2dbdc5f83ebbc548d12d353277de6dddde9766a15882cd0b7cf58514aff520ce0804f23980b45943d1881b9d41ffd9dcb9b91f3a0e6634e56e0d608ecd7e06cad600b26b9c6a3b76e04c8be54001eefc7294379f85dce154084dbc2cb9881f8a4021887ed93fb5cfd0d896f847089d527b8d5f7cf56e895b64c6a04e4bb972a904dafcf0ba1d51e432b529eeeb6ddcd40eb84fd830fd9a6b01b50cc6ee0b325be360c2a2e4909b5b31dd7d6f00e87e2f292eca2cc9a589e405654d99c2c83a8cb38ec97e8a1cdb6d22241befb88c5b14a5f62eb5c020cb7a8811ed470726268d2371a1127d64a772f0c76f14639a617cd828fcc8df908f30808fe52b297aecbb34ec97ac1c6963f801b8df648e58ca2e5b2b51bf5672fd2e88b2eeb52bb7f7db240fcc48babc3210a02a60ca169be7536f145fa70349b44548b2feb258454c1d9f600dd1f3240489b21cba55e06a8faa2dadbcfe6fbbf18931bf15a02599f6d4725a41aaa46f0b0cc33fbbbeb7ee71b2239793b0bcf8e2b10254fdfb016ed463ae84fb78f1614fa691c01ae286d45bb8c0c38dedb1af36f3836658cb7723c7afb9fdff80d9673ff6c32561b63b2c2911f9575e57a67075534575bba73a2dbd2f7317b40d4e7e5c1531c068ac5cb041be164490e5f260ea236915ef65a781a036691868a577977da5b145bf0e7fe604e6a529424057803e459c3ddc0513b21cb0eb0675668b4ba335632ba9a4c9d057d675d147ed3e840cb7c389cde1e6fca3395f8eb5824a4f924fc26a71497ce8b24c36069fb29fb369a5f863d307cd6b12ec797f47756a57b1e2e067934ba6d1d57c64d73dbd148bf9888dc8baf84dde0367a44347427bd8897db02138f57a6063e3d87b05c684f00d08ac7e3b7376834118745304ce8682d664a3de259f9858455a56029d0ada4242ab3dc194d9978b04b66e3aa8ddc955af3d41787f4e6064566be1cbcbf30d81bd8278e9934acb585c8c919fe1e0a3218d7f131bc5b56eed12afeed033ae1d4fd695c983bfd05aa5ee3534157a6594fb2385a1e34159aaf3436e098c4b93a283154d4743d9324cbdcbd925eb2b851ab77fe232728fe2fdee1358c3a4adead8c8a08aeefd6869f7e5f97efbbcfca8b5e50884115314b4e57740ac1cfc53fdeaffec4e0ddffa79f535f23efce354218192d936432f16b5d46621903ab3b473db627cab8d1b51a787d796025a4c9d7ac458feb3c277fae18c93a5c7a30d636daba0439d28fa0b68b552d07aeab25f8ebe0104249169e06653c82242e10ad0a5e0342dce76fcd709689eba2764f25e112c4c4ed031f54ee08695a0ee2897878c40d184d15c1ad6850fe92751ff9f6fb82004084c63584596148d217b952cdbe69237e940d2768e0971524bb5ffb88ff0de9421da93668e17375e436ebee54bef3bd86bc03e94649e13b13c0389e0d477150a7edf53e024f9d2358cbbe702ff409ed771b74c68447483be1900858256d32a4a0a41c1257063490c190183a0d0a46d05eb16d4cd8dc76bf5bdffadd39de1ad2bac5ba2d3a3261282a5725165fa71a1cc83072610c0b91953b1714b88f0875de29139b1033991014c59f55de67061b3e0e2e65d87ebfddde844b7547475e43e72c2c2a325685dfa85c57dd816c7e938e386a5dc848745f7151741e3e0b2ac67dd8de7f1c119e6fcc125909529adc061c27b482908d4d8ca82f850b291078e1c69ed66a1eebfaa5a109512718ea20e2db1ff9ab3c9a09ac0ffaacb109c7bfe5310e7f3220fba2a7836e22b86f01e995c592638fb4f8cc3dc954298365c4cdcc3719dd1f1e8ca0c8b1ec14d5280189e1c345b1511259f43877145f71c9f22993ae3228072d9f108172983f623ba1be1053c2b3e9b17e68bc023094260c0641f56336ed25285c8fc98d0ad0268c642994d7c00c8e6fd31943c8b2f50194a43721efa7fa970f463a78404b42deff9491717d0cfab435be714e50ffe0f159b8a9368884ab653c571d9cffa61970e51bde1eb88752549a15209c5bcbcec2a6c6a025f9315d48039a69a508190c6df05d18d9b56c797e79b2bf56129e9d1457f5530f321bfb703a28bac246ff33ecf397cae27b86a493ef140a902ee4b0ccd86cf8b9ec8bb7f53fcab6aa50e8f141962680675fcf7e59baece82573bc4ed1b3559b3fb8906ee23722743876ee41c5db784f022ea56cb839e4897c058a5b9e2fd997575e35d6ce03caa61f1c9a401da995721b50a43e567e7b7fb1c97829211e2c37afbd2eb2462d81f253005318d828e610c79743e756f470237a7d5d9df3cb913ea10c22c8d73144bffa2057ab78b103f1fdf958c9f663df1e1221f734363d8e5de5461f3f1c062bb47b508b669a34a259a0ca8ecaa1736821d96582164345150c5c4b39b49109a01690536e890571232070db0dd70261c7051147853cc14d4251d0ef0b214930ff1909c2c2749c0e9e267f033664bc87c979d25ea5b3985ae32efbc127031b071ba82f4c28bb68346d20deffce929476794d3d2dfacff32f38010c82a7a60f3056377d42060654bdc9a438b69b2a559f67c4d0a58581b8a095abc923a763d21943f4f3165849740c38b9c82cd7e59b4e4d848f9b02c34de0818070d4b92bdf3dc439041c4f3fadf27c47bce5d1e1f6c4c1be48dbdf0319163623483b58e8e7218ff11bd334813f55b73d1ca020fc54dfe5a80186df9d1d35e9d8c9f9a5119311df14a3d4bbeb1eaf4ee6df426fee029b914441d78efdc7acaaec9b69bc53b61ab44a4add36f839da926337adc192496e092c1d664d73f409d14a83358b0b1f0f50e152d3d59dc741da192b070adf01f19472a428ea08f220c9a10a62ac974e1c0c58db6e03ef49cbfd2112d40abc3527da535be01154b51b9cd4e2652a910a0107adc83ac74c9f61e0a7545752c006e56f3650cfdef5f4d2c7a48a40d1158d01fc82e3ad9003393e6d5334c0465501b3d57731ccfa05ddcbb1fa03f91cb94d34a9f358834740c12495e23184c449a997774494b95043b19f5ce181b6cafb273f914b17813ab8df1d561e651956d660e1aa88256454dda4f55eaf6574f490823a8c424f56d6a360562ae1ecc48dab72c81d54af2e33eafe3b4a2f6950c0b9783655fd85e4cf43eba051cf5571aa826e164e641905fa00ea49488b8c37f3b1c31114d979c1b4231498883a31fbbab57777dd47fe7777e1b5f6b83a97c8b92af13e7707aaafac3d97c1dc5b10fd6ef77f5ed798343d6117abe09468a1029dea43363486b381bb44f60b93d6a0414da852419c87bfa90e38b4024da06b85999df7284ef93ea4d28547bb87a5f5c312d1b06de8566ece05cd7e47a7b99276a0e86129e4c4174036e02e643db1b666ff961ff428938b412fb9a0fa5db192242732661760e0d5ff648db85667610c6665d4fe5fe11a7a9d9d3304d3cbd3a71ce6384a1ce8d8b1411dd1504ae5f8b76eaa55bb6364793593586a0c112f203f93ee68551c7937d6c7db5c789f541470b51d3ea6ff634fae13eafc7d5cb94ce6d3c0f6ca03e2daf9338e0fbc9b35f79c0fc3780f720cd51f4b194d2e391db7d676729aaa13b8ee71b1ff2c53192448edf09079d85054408b18ce6a6bd53fbb6777b987f906f264f8c25baa48a7d8bef0a5d2ac5f68607466f7d20d864b78b99afae6b7e4323516de1de0285b0f79928d9cfd93f14cc09bdfbb595308f177fcb73e8319c216556411a5317ea4b03fabf28fc09bb884e8b3b2ab0b1fcea1e8807c61762cf421588dd5baff052ce8abe608eab8eac189c7be2f8d5de96587abbb1d3a7dba5d0daa9fb48ed8ac6b1b62b2aa0dbceb1c3384ef84728b81be4a36de8e7e3475f20ee8554fd055712d044ee89fe9df658cee3178f98e604997cbe8e17e8c92141e30ac9ad9f51f4e163a8a29485ed5a77ca23a87d6618e80bd4a6a8adee8e931fa01a1180f55c5af2490bf42230a82053a6082022d522f0e921310d58c802e1fff1b45b9ddef694890a3363898d1e935388414b273c1e8b20024669ce56f0ce0973ccada147631dc104e259bbed2d0de91c8069e74fb09472a6272802c0bb730cf307849e78d55bc013c2c22a1c9b8ee9b45690d15b06b2bc1b7557db3daa7750626bf8a33aab2b015ac9b9e3ed0bb0254e00dd3b6c0438349b215cb7461e41ab93576635fdc665d1a9561dbc449ca635edf17f8fb12fc998cd261638124d5136631dc5766feca4e06e0309d5889fa623aa93b9ccb3bcbbb0ba90c371783591bad00d9516b3b89447960b81758954dfd699446fd6bfbb117b72535a9a6f5e514c017c5e08044b9dba12096f6f8e654eaf74e5dc3833f76f1618631a41dd4e60cd62f04ab1eb8f7821dababb2c630671fd0047ec0fb1f316c88b9bbc2f699cfadc60c20f1cfc8b4fd45fecfdfbe23fef7f49fd0fda66193ed6840e2e4b444d21253216e1d48c641f67e40f80982fe2ee35e4e720879a2165c40c60027b17b5502ec3cd6db39ae2d76d0364eab21bedb9681f344def26331c8882112166ceffc1bb612d2fe446c67f94da56a6648b8c05120d355dd9611d7ea708535b290de4729802763736d42b459baade7e79d8d28c1212018b2ce97ea82982925b981f19849183c59362da2bd63663e7fe36f5cf14022e71f21d356421b5da6dab31318b73e4a19ca0cb898aa2ec999a4911a54624acbafdeab2bf0409c4638596873e3239cc630aa1dbd7dbe28b413c334d6739e0f552723337ec7acb8e0fc2f5ec3e2e3746f30168c3e87553c893b3823bee4bd6882d9bc099b8043bd981d1d245c03ba29ee2a084c81521d6e8e05b46bbbc9ee34f3f46db5f68fbdf41c6fb04193ae777c0d0ca9b32dfcbf070e48a45e96a9e048d75539d516f62b1a42c076ba9b95d6d84d16e9bd1e4cc08b7920a670f3c3ee1e76c80ad58d6ebdfc11726c2ba38814b2bb3e4db31f2f6bf8abb8ae457a3a6f8477b1e8d650e12562dbb6800f08563452b4302de8a4875baf4bc729dc1dd006f32e79b4bded59e216e53fffe2ba30ad7ec90e8f655997c55e96f3752293b6f06b2cc2e7f169166d43dc4fe7d6af06bcd6ba232c41535eace362d2ab8d00dfdae7169189a4bf4af9a7de9fc71478106f98483495d5f1a2cdd6144fe377c3ade06882b5e966e4415f3ecf3883cdf7a30f29c722ddb7d7dc2587c8261c8311d9512625012a6fd1f33b30a2cfc4bc1a6f7a2d750ff5b40aed710c872cadd471b4f1d88ee285ae56a2bf8bd858c6ef288ee785a929854a992027caa0551deb513e93e920825e52528647b5eac1fc29d8aa06ec4c1f26295def4923f774a3e006c1be8beeb8504e814127649a9d62df33856e25511aceb84402fdae6fa6a98f55d8680abf010b668e7e27c54d503f98a2eb1d1df515909ea2a889773e94068e7f58e88fa9b973c828fce215ce8fd1f264a1d549db2bde9b0564befd0c38d1754c0b1a162dff24f913da4913317a519291964fa3583b7655c2965a10df2ab6d14a05755d3042650d1d7e7839e1b4e26a8f4bec90c62e01d74883de37e1ae5c6130509dfd6aae9ce74b9a1a5530d364ec53f3a202c228d6e426d1f827cb78c3da734c19e7dae1c81b063f33e7b05504a0dbc875a9ed328ee4c92b3dff5a925df1141ed318f6dabc1e06730a366bd64b82ff84a1dbeb0308584f8f57638573a89e73f1a4cd4a0540146ab9c38c54922d367b602b1f9036aefd13ae842bd2e6346b7e595961512c202d69c655aaf644b4d5fdb901b81600df767d314f90d83962d943c567b2c21882da91cf12fa8e73204457e5e5b0050d90439e027440fd2fc7e67d5772736d931c131af61e6a628b8adf057919ca3733029ee75e1b40af21b7a2c1b4887198750a57d2217d452f2c74fed88cd039cc056964b6966cbfb581c7135fad90b69349d6e56a98b8e0ecab38d1e76bff49d80e191a5b926d65384402100973d2a87bfc0d17f3997d8ce94426ebbf6dbbae233b7afdadcc2844d89ff01958e70a01cbb78bd42cffd98c942b0beace7d8cb54f2d0ee00a62ace886cf71fdab6b569a6478d4580e0ec7b8237d9061e108a5b47a3ed6038714e4d7765994bcc5241154151ee9f687b16f880a33673e70576e3abb0f0f0946a702e99fe004169704d2fd64e772e625a4006f43838056d47769add40db1dffeeb53a96b0464527fd37d0685a062a8202f8dc9df4091fbe11b5a053b330b4382baaea3759f46e2accb4c0eadd5f72ab3a28e7e5e8c6d173ee5eb8e9836d0942e390e23f053afc89f0d04ae240a6c074f98db98b43290e3c395d6ee901ba8736c51fce856cc19cf7d8fff01e8a7e6f096f97f26bbc90bf8aefcb20cd705c93371e9dd1e74de0d373aff2b690879f427ba89fa95f8b83559b16c6ac19117657bbf0938e9bc7e9241c3d092defde7f4a9a66264bd489333c7b54841c3572fd4938b814be577e2e25af822786cdc3468f1090f242707fb9842ea33f15ec23281cd9261945c3a6600a6e4db818593e4b556921b1282169775fc148b3f3f20072da5b59f14dca320252b32a4147e72ae5844522fda1f748d07be74a7d011011b98c5f4bb3e29fd99ceedd8b9a300bb0a7ed8a938c4640cfb854ada3c56c30c238e197700055bee05e58d560603d9f24fe500e485188d9bbf988fb0fe059d492ed1c8022babb904a5d8a575b20bcecb2cfb268816f37a56f4dd342954492ede01152c975d807df57cda0cc5fd388317ce60691b28b9ff87820e76baeaf273a1065d3bdf38c7847f2b25d92555b414d977b01b673b7f0de3afd997f6bab21ef4080976d1c9c35f405e08904e5cd94f4adeb1e1efa7e378226ea9bd92eae11a9b3e021dbf7e5a647e65b6ec4f0bc7bf73bb266d2fda740071f189d9c98a2fd8672ea776e42a6ef49d4010adeac259e0a3bead9f338c24318ec2293c41134656be074b0a80d535f75b9de79920b8c51848bedb870a5b0e2d9aa8c341e877ba24cd1e4a66b73eef84ca7334b4fb706736751c38a11c01aa88366d23a8ed6aef0a1e3bf082905ea006ce257aba82f176c160eb015d8cfdc52a52820ca07ac0baad190599e9b63363d4d905cddf334a5f222e45a3e2a4dbd78146c170a4957b29ebaf14583061cbb91bc0bf2e643e4e61adf4efef92cdc6a540daa411425e7fc9e0a403baf2e1ebda32a1bad5e84f4e396ce83befc7fd03b0d6dfad6d29fa3c7e650627f2fbd1a3e72867e97bef7dd0a76c25488921df0d36e6d5c3fc7815da065b9935449ee33a28a1fcd835915464629af39b5fd187d4d13658e71098a9422fbc412c29844c477af9f354ec0c5fd35c7aff364dae15b2aa1e807be9d6e74adad4d90f383b9ab8212a772bc68e20731a10b8b18704ec0b6a78e044521794b56e7faa1a33e9e8b354fc80a33ec20f5a7a394721d4dd79480eb3a91a715c37b3190ae50e614f2b095bd77b50f79cca6c2da071a13e0f9175258f6f118873ea0495b49b1ba150534a6df2d283d219f6294bd4f101d49085af964ffdf8d7286ac30c50081f364fec5a6e7037a4a2d4a9fc98d9b461fb0dc954dacafd08f7bfd7a7a70f743f9c119f93dfd0a2234e113e83ee1c63db07f923a187c3f77457d5ddca86a8a1126f3438463bfa523f11ba01ca61d7d3d850d4fce8cb6a52a351e8e840f007b2000a40374d50bab708a29d720abeb1c90127de52d9fe1f388cc1e04b84fdd60719756ca705228f1505e95e8a1975d7a00570641da6b84520250bf8de58315fb23104fedaeb1c85724c3d799f7947f299f9afbc4aff1c0a04c56a499eb52564622a44f47f9b2c56657b530529eb34cca69d8c3bf0c2eb582097a50513672748430455f54ed035e1012a48b118921326efb4a45a602b90c79aab852f777a162158267de64c88a185d0f107a9b2b0bf5425e300ace16b16ee000044034c0058c2480c12b0f30b3702cbde44d8a1b2af22139f068ac2c407d64c5ab79cdd2806ed2f2d6badb5247312b4c3515c39ec7fe3c992a5820f48ead774c7f9504265ac040a3a3b4b2e966ecab8f5dffaa20652eac8111c0883dae55a2bd839687a5c071d3c0c3c019e1375f0127e32acad7cf72d172cf841d5e5c034187532ec5d8d0f67e73df7d40296dc25076835061001e1ee92d0d7c58eda4e2a31a07aec4df307fe721093e61b298cb74b89eaaf4facf5a0e0e3cf0d13dda4e525480d16818c2736ec1c1ab7edfc62b8d39c59d2f06db57475b04111e4db4551ed10f0ba24f7f68782119ea5960ce51bcf2cef4941486f07c49252cd3aa350fd059e82eb37f54227b92975b48424b67038d4677674508c497c9ded0c3e7d1a8a9d2775defe65d562321e96230cc44c735535ba7dce49ce55acec6ba3ae8c324706e6ad2ff1b1e38f3805b897e710c67211cc42fd84c536d50b2f2b9c6ce7234e259c979e8dde1e8c6f05ad5ed753cf44e213872420a42bee51278b7cfd1018f8088967366811f5b98a286a6329ac912a7715cdd9a497561cc0e1bb141baa9676164d4849c118a40fd6202688803e676416f32f3eca646930a4a446dc97d514e3ddba4278fe116140900237d14a955278695b39dca5bef8d1dc57f867d61b9637d35cd0c92213afb479bdd63fdb2041a570f938ec53c30f256f76a4ffeca96c327a20095bff70b4bf291f7d75db753cb18f02510b840b7da0dfa8398b505b9354d5909f184cfbeadb0c05ca005caee0d330ab238ce6a9487c2813832774caf41680281ba8a1ad0c943b3d0edc6d8f3686bafac89a9ce2e2f54f17bb35820d3cdbcaaab0528048bc37ae1897bf11f18622693d6345f97b3bbc8f8fcbf1bb7527d6275ef6fdacffd1d396127e91a14922f337a8398100a517044515e5b4421191c18ca2c4ec4f100edcd7afc513902dc7890f2d603a6353ce81c131d5476e0945631043d831190d94593a9348a87f53c5bfa8b49057d8188bc4630cd714a4ee23bbcd10b671e99ba7bc048b38e1256a9a136a6b9ab8147c64fa9325e7ac11c406d40092dd8857dafbc340319c3eabe6ebca9919c5f333ba250bd27278f71ece8ba61e4aceb9c7342616421784cdc374cf6773881241512d892484b3360a1f9e9a20e9419a7bf67355eff2222507e26f0afedfd7f4849ac101bec07835fb45ab2eb74d1ae168fcc8795d01abdaee696bd835b97b04fbb7997adae232d8901e0f218b33f143140a870b94ae36ec0692350bb7cbfd1aead2e54115e252bcea40c5ec4b0447304b6064f54242b2ecef7577c3a4cfa7576b6290a49f13efcfe4d301ecfceed69345aa1652baa434a1deddebb1b4828859beaf8009ba2f0bb8a854efd64bcb236b3abcbeaed669329a98e741cbcb3a70565ecaf4306d8000e218d8b6c58509d20047cfdc9ea7ae321ccb6defa8603a3063f62c28c794eec64c00b5d3ad0a5e42cebebe27d0a1fd02022432527611951f40ac7dac892cff3f81fee0694b381b3dca792ab9bb387d326edf003955696674b654075b6454994bf2d226c7c47cd04d74a503f185791a225153c2c9b5d33ffaf58288d7c2c33ae8ac7ecf85bf627c26b06a3ff2f9c1901ebad3b2c0a3e64dd5ed5bb0011facd542ae93a4319a3c6cb88bfec55f31bb6b1b69ae65b6d51551a901c12860a623115d5d5a5214fc168e15ee0cd02a8120d707cea64f6dc1f0f6e5d8acbf0056064e9e5c9dfa0f7107738f5fb58f5f4dba84ac5ea50b341f61e11393f6f6ad66a9e93559c7d26ecef0a3639e1db3d09c562b1bca3aadd755b394f1cfa9c8f40fdd57b514dd472420977095f4ebac212a7128b1956c2ff81f38934c8a308020179586ee77fc5b81f2fe999554e5d10871508b153f2a5d6526f672c62c4e8e44c1e9a3fd1db4ac4abf7283a15dca8ea0738c55ad5844f69cef5d0e1ae6d7f3c06d9047800beb171c90f4316d35e1a38d1ae8b222fba72e166aad5f541008e3dbfc6c7730478dede85e03aa51802f0f3189bd172b',
          bindingsSignature: 'db05456e84d9649ff3bc6c57550f18dd0f73b8ce5cdeac974fd599ec5bbea794b6329ed9d198a54757409303237987cfc5b1adc83a7665bf64872f82d64eec10',
          surplusOutput: null,
          signature: '207f1800b46d56b79eb3ed369f7af01dcbb8d345aaac3569499bf8fae614770330713a4276975ca994bf0458c90677f8d7f044b46a24e3683d82e085d0caf95a87',
          raw: '120000c60101b84fe858d5465e1a88a6e2768fd711dfd95ba92bda0530dda796ed4be49d9b1b01000000f5171de815d6730ab4ed5f36de022d249f9a51dc1d012e56d6b25184a425c8c16b2eb571edad8e76435c2da6369061f6b189bbc0d964185d7d82bccaff000000ae1bf2bd003eca596a7e8b5a5af67f7429ab6abef353d6ef52ebd93c3ef5a95fcef97687bc9bc1b08c49290b781b2c400851655d1d9a1bceddbd13652dabbe4dd6fcce01302f85347ca1a9b4ab84aa9f1d1ea38ac148a567907d07c9b91c2081ef0300080001b84fe858d5465e1a88a6e2768fd711dfd95ba92bda0530dda796ed4be49d9b1b010000006a47304402203f213fad1c76e1d75840e9db454e9c504880977a4f38e04e44d254838efb594f02201962ff7ec24900e72d37a266f37f489ce0b1931ca69649100f4af991a6b1050201210392d0a912df649895ab318ee858132afe675e9a884e05bbc7e14039567e7b3c35ffffffff02622e050000000000026a0001581f05000000001976a914cd210437e0f39328dc60f4ef735f487c30c3373f88ac00000000240101622e0500000000001976a91407dad277809a02bfaef35eddf44fa80e97357d9e88ac0006c1ebb1461050b9bba1b9693342c98fb82cbe8b58c42b9dfafe6496f62af0240c1caf5be6e9e816176ca030029b1600679ec7638b57ff3488d4aa0a1f3d528738bd62fba0434289918dbbbd8f0dff1cc03552bb93dcd9e0a4fb9f3518f7fae32ad85a4d66c33801ed9ef0a9bf3431daf0cc0da12d6a6899c98a9043e1235a5f91a9abe9811bd52dbed0992e979b721bd226bc0f3d0cdf00166457b45082b90e5d30d8998c7bafeaa82e6cdc25fac4d09eced1f6e31de0f1a753a87e673c66625d80d8fb10fa9df51abad90e4635415f1d1d3cab5504215a2b8332e17271b1635a6eb9083a502a51e444f8ef2a796b4e827c171c090abcb0356531f5c120e539126f41e4afe8f5ed068c602ba7f25b4f91cb0ead4a2ae8a992b58bc79b496a21932c4855ad5062ab269cd1e8c66c0f0b5f41cd717ca3a4cada5656c44c4376b733bd22b00ede37bc9e5bd6bb7eb5ec6857c862a6c2c0d2b740bb8ac491d4101e079c25b21916954646d2ae44b821364af0aa4e1923534dbeb6b8a7e409f29b6dd1698b127ec3c5bf67e2e10dfde38c7ec2d6329c8f6f4fd98e28cfba4e47f933d7f000bd3c4d153ae97dc9c8bbfa205c4f7c8f932358a924eb2010df0d7273e4456b9927945f1b43f69100d2aff113306c56ca6ef39086c33c242889dda02ad2f10a5737e677cdec567f82fd2741cfd9d8af05f38ba4d5d77622d8399027474d08c1d6ce9100114fbd6a5d4c1d0ae85de17e2d64db3ecc05e7160dc0fe96f9badcd87f2d96481f4f83c42d748a6354e049b0e49fd9b9feae08eee3758442748a98cfb58823a14d3accc2c9703d9ba77ddac5808ce076771d8973a2aa2a3a271e914c6c9081d1ef957c4aeefe61169a5e28bb2c0bdfb6b458effd313737504e23a67ce1c7472a6e87db5fb0e138a73e3e7b5f0484399e76dacf23d6c927b0f29d83edb5e17f757f954007804632d9499d0299c4b80a5666b50d9565d9007df8215426a5704e833f9db5ad368230cfde0304e34e5640813101fc28678ab67cc5ad8850cd7f7516b416285955f261de854b0f98be3041f9ab67e61e2b10d35c2282c98f7265d58b94e6cb8a90a382ec63db13ea1852ae59030b286f02f90731c63d0b606139c09605a915f2cfbe9cb9727437e806e1d9c1e4c9347b005fead2f824ec1d02ac6d8f40908ab5c3033b708e188d4909f948d2e7c065dcf7d7c04a9038e1a54f102f0c26c7c69de06da6b5e6348741a77ffee67a2e1ba8fdd48e5d94a8eff4bb384740a8ce99ecaffcdfd2c8001e4e2bd8eb5845dcbcd1941c2af47b5222a8f6f9405b0698547ac5bc348c80fb87926338ce814dc9da1bf98d6232a241aeb0f8e4be04c102460a5eded3378331efcf8960cc24cffe28087a089eb573158e1a026c2468d98070e29a9e767d503e31721c238f22c890d2f971b24fe24f131bee46c992a203c36a91353d0190e3081fe2f729d0b4b3b2f575d38a215f9d12ef57d416c8f4284efa08fbfde5aa695b0ea4c3e853746fc7e3d4b5ec9927ac196b1c5ab8baba81fb237b7068c32a8012f1a745389905772f40a58bcfc45e531e2554061cedf94d3645f27bbb26be550e4b413bdb7a727e087b398ff54dd67c51365ca1a013a5434d14bb90950e06c357e7d30c85abd249229654491d14f23a3e0c077f9c57c617e09d8b0106b19c7030b0645038b0a6763f8fdeb55901291a5804491c33495e9f4329609b14eec6bc74e9a5b824062eb27b1c8628b0c53aa9ad56850392593e41db35deac0159c5f7f0a0c1ddca1dc3001af846d8f16e42247006f9ef899c4276c43dd680bbe1046849de6073afd921f9360454d7e2acafb72625abb26967fdd53046a6b230d81159aa1ba100ba98e93532807a4c24517a0200174f8bbd43d4d361d456e421195bfacfbab4504ee6eab994ef6215eccdc951fd8329f5eac6abe2b69c8f28509cc8f4b213d389a507a9e2f778b27be9a9577e4dcf7f3448ab519757877231921ee961a7001e282803fd4042edb1f4f08575893576dd3b88f311869d0f86b9374806e9d05dfe59f59ce6a77b100bc902d53629567eebf87804e64f40ff02d0f8fbad103c8b4ae8cdf6bd05ab2359737d7905d8a07cea2bbc3081d881856b1e68e5ab73e8288221a91d19b185a9d3eb44212a97df02d9c75fa337c60b3bd8daa7e2ae91141750fed32ba672daced3e41f71f7ec02dda483de8ed3cbe4a2f33fdcdae68c244b44279852210918ccddedce7f7bf891acd6cc602e1737ad1c752f8bcfd8c082655cefb8b465af3d2c0935079798eeba07797a220e801aadff0d6c4b3bdea94dd11c13f8d20107318af1960bfb6c96f0c04ad89f3c73ecba0a95e10815c5cf8af946f130df39a5be039af7dee3850af99b972e6c926bfb5c662401a21323aaf2863baf6e7ee2e9c3aca21f8c16017f03f4017fe61dd87d6cd176246c92624500f7b7116725d19eede487e94442b364bf300543c451880b79e3cf3ea86a61466194e161bc39104a703fa6853d84585c44caafda589e609748be4d7279627795e6731c42542881c51404a245cc14c207e4ee51bbd40383895370a5149478552feb6020439de96982f1441e05655306541669b3801b337e30cdf3caa2358ebd70962350fb9150c6e52eb34ea05177497baab289d0dbd433ae03da78ed6033ced98ecdd4049ccc326c4d559b1fcaeeca8b781ffdbb0296bc53b2e30f31fdc0eb53bea2398f299ffb8e93a3157fdb837e6898bab76fd10533a0ef5fe19207805ccecde613d7671a8bc50fde5feff16000e1dd60c4d1652275eda2b02a6fc9c58ed8dad8576641e51b0e1cfd3ae0217ea6b388f8e658bdc348ae4e5b6549d43333ff4570f7283ddbd0f2c66d6519661f268b1d70101d1096fb4ff1830968874be449fcca2a8ad519682aa418ce8901133e3f59119505b8b39464ec5731edecbfbafab1a6cc33f34c0152d6d63e0fda18b22a21a62f82c9bb70292e4d223b07f4cf2cf20180821a174b92c7249ac0eec40bd87fa7e3ae0dd5f9d87121ba907db6fc4347c1d837586aa79b3179838475a22205e511cdad1fafaf5c3a8be9a8836f0a6afc378154db43c65fc6960951499729830a8adc72a8583ea7c8da39792784b84db767b0a95b3b27308c852fd7f2b5df86bfc8e4628d24e3c78015001374c61392a5a749ea8290de863e662575cee9a5a9d2ee8d788d37947e419744dc1bc19fb539e7c023d4e2d7e2a6598806b9e51a5d43105d1fa661d2c213185b7c7a5d30be6ffd0cccb03a54bdde540ce874528abab12cedb5398bf77f9df1459a66dabfc1d58175fcd413799be5c27b37eb29a7ef23fff10bb91c6b9b1bab2452c063eb4cb8f5da03a3ccfb30d567f48dd881c8a53379136739db84a4539489bec63814bce4ca25f99ef89f132e1078669607864b40e02ad89477539cac832b2734927d5cafa8bc0d8f3a3318fc000f43d0ae2935f1dfd8a24aed7c70df7de3a668eb7a49b1319880dde2bbd9031ae5d82ffb3fe0de60ec4d98464a6b5ef00689ba4510eb84a05a233190c830efe3e533add4460052155ebd5a7aefe6fc5e33daecef96102ce12c55f63757ca2ebbf9d7c406b893c6015002f584c51db453d27c7d67013fa1a0105e023e635f0b43fe771a80ba17e2ae03f9b0ec2d4cffb7bb4ba2e641560070d2173fcb274b1149a0a71bf3728c93f5310386d6a844fc5a7b363f4daa6ae9aa9aaaaddfd16278cef0a7259a74b64dff45d695be5ddeb4c59f4bdc1afcd1f812af43fcb6a0e72c373a8dd61f2c17f1b4db22d56568d7eb79c00a1f642a973a699bae0001d2c6e94587e9b794cb3b43e321df1d8ffd925375c6fb307eb3516f520619132388164210d71c631400074976b4dd25fc16d9e97eb04df4ccc3ba566ab2c122721170449e223afa9df29ae62743640e8880c0f7c9334769e622130fe104882b81f1532f1733ff81fe3aaf718af087632b458f1489d1ade9f02dee00d36f5b9a0eb23c8342029972676a8e85a8b1798f3afc22912428fdbcaa532048e5ba205c0b20384294f474b2d4ad2aefcc2469c4d98087e1cba03835b4b2cce9b4193760df5e91b652e8d18f8e75097c19af80d9d4030422e8a045a73d0004de959dc3796e4e13328a68abefa7433b75800c9ee813e2d3e80f111e774a81d2ec5d4cb0af4be768fd5a6280514cd588bdd2ca7db5b72f5754cb7d20c7ace296bb1ea1f09c15f11d95c3d03afda3dcb7cbb2a6e414520591e7a5dc06d2a40ca3ba297a8ff0b49b83c6fe87aeb0fe9981534aec1083cd94e4813760f6d8309e23d11a9b8cf3b63aa87b47ccc11d577d32730e2b532111ab0b1936e4bf68614d6771534e61e13ec54195333abc4e3946377680607b619c1656fdf0252df8999e3a7c012d8a1febdfbc3ae9a4ae94cd71bc32cd2325b3e4543d9ad53f11b8a338ec204bdb37a13c447d61de8efcfddd82a89df7db023b73e23894a30b53ef835e31428e20ffbcc8f82c4a1d0208c1cf931ec15fbfe09eabc15ad5a34d4814563ea934dce566d7785616850b20f360dd68227ad615d3e3ef8d874ec51f2ea187143ea319d54248a3304071a7cc9760f3d0b83d1dfdce9f5047d8d0260ccb5290928f36f662cc3475974e279a9a5590819a1f2880aedec950ea1eacc6518e71f1405e5d18b9af34819c2e20737bef1cc4112eb4ed0bbd76dcef6369e14602f17ac569962802b3d8666a17a0ea0e5cef2b98a7d4d0f6585d71b35a288cc8221cc4db750a05fad80caefe0bc1b3970f482603b44d626daa50230058e692e406cbc37f47d8e8fef3f9265cf671dc6a0efe1fcea4974971ac2a94b65644bbf09f6b1894ba8351f2c6c308ef5222b75cb04836308b8614c4b3618b62a44e137a3f6026c89d5868cc0005c3659a889570e5652dd50a655c422dbfb36111ce91e02f8760a20b0c5a86c426b711f841b6f2a54fbdfc873bc1b45787efc233c74d7fc497c6aa94fb8132b6553b577a34fa1f29319117bd0466a70ab7f69172e38dd9b9ec4d388d5d1f12e27d6a8914a95fa4ad7abf8525c40d4ea882652d90bbcb9aa82efda435cd17b030c0fb33d79d862dd70e33c3b319c2507ec6d2df752bd107bf6cba0df896ac26efd39310f985070bfcb6740098dd1a0d5eb53b62cdf37ef1dfed2770ee0e9fb8762356cca7258cede5117bc10bfe7870220bac7006f8b59ece8762809250415466ff51689392dfbe021cbdb2829e92e289efea33a2b2f2c97d49b0e35dd96de90591308fa5bfc97ff3989e459e2cf194e511e5a0f04ff5d619b2a3d04817ffde3d7330245210b46487d029e6952807148cabded14774a12d93630e1fe881ce42d66dd560780feacdffc05a12172d0d18e6ae2830a0c114b42c145c6caaf55132f84a6b02dbbd18501e3c39b0aea94e6d64cfbf8425b1a2723c95acabec9f1de9b440462509cfeb68d6632f989492cd6d99ea58da272835a4567908bc6594536eaa7ba4f2cde1643e3e0295fc0e8c01e0eefe3bc9f3e68467e272c4a9ee2b97f239bd46310fce06c354d3ff61beabb9732003f33d4e1179fd550d2b8d5021836166a1fb9df2b6bacbd4cee6e3b9decd7c8baced915b03c09f1e85b6bae1ff2b987cfaa8915426249543888d062123824bc485f66d171ca0017e24d9e475d1d00279dcac6dd208ca99bf6743c0bd6afa070dab6e8926848fac3bf9ab0d0d888a6886c30ff74df81ac121339a188500d07a1f136feb4765b0d4f0aba54000b1887ee7879dd07333099d827162049c0191b48e8c5ab956c56ae86d115b16ee5430a3ef48c0509a8331a086a71dad93e0f1a697e2a8877225e307b38dbd0c92ce87f0df3ca6e1a58c3cee5a3099b387ee50f894f88623cf952820e5f3cc0f822f301277f84c805b0ac7c9e2f96f120a4162bae3a06adf17d5e2ed813fb6f4a53894f3814538a6d35a497bde41d81f1af0944f9ec2adc1d1621ade8d9b0aa9a312af5d8db7c9fa40874e9fe1baaec988b9d2d65a193a6faa8dc81b31a3b057fba6fad1b5f8436512d159436b9384f480529a5ea7eb12862e59e4047469eba07be56336d5ef7327e1c217b9706c3e053ad6f77e8667e41662060e4eec305dab1e701502186074551e9935c2d8c1816f9f05ab79c86c1ba1e7827602b29a3aa0f26d111166a7557d17875c6abbea44fd2cea765597d9a715abd4746a5b86499e38e282757630c44155aa1c30b89c47f5393065ad0a36a20fba08beec665a5cefeae546dcdf7c76cc332e3c3be4cab196bef84879d0ae7b850c06efb54cdb86833f596775b6ee69311416ea5b0579de1e086e0c8576166c1c2977114aebec3300349c20ebd902e5172ea4d3f36d6102d1a6d771f991d383c74a335a1194ca8a06f12473919e32bf266ad445e974e728f4b5ea62cf3c8b1e0f79fab458a3602795641f8c2264b3d544269669604d6636da1e027e7c451fec30b853ea48bc7469a29aed798d5dc59dcda4a339d5b002f91582825a1938eb85e3cc02ccafe61c27f4f7451afbd4a12b1e45aa064887bc12acbacd32ae994fb02ed32bde25f349eac3eb7d33c8ee82b73752cfc2b1b0d55bae3ecc47c07cd058c6f171d8fb7ed50c721f81845198763b30dd0c1f194974b7018dc0162541a595e172b401e7b2efcefc50666804a08438d50f1293ea9f9c19582cc4a231f9c560b8bfa12d76de6b7de60e8d59738374b992ab24e9133bdc05472942b4a5b2da10c0d9b313eb61b8c4ce6a27b308bc054425ab3c52192687ce59a276046f64cfa18bb7e16693e84d4cad2e1a8e4b78cd3f9f09e48a322a5dec67871aeb53025df54164d16f5ef8c61626a76dd1f31040378887761170d33ca7b2abe8641c94df5257a5e96476c79addd2a1b4586c4132601f3d327e55fdc10430bcdc121ca517d733223b31248513c74a85ce498e56ccc2305e9860d7800252a2852d4ab8cb6d656de4f49ae0a387cb19f3715057f2b36740cdbe09d835e44b9fa8eb7c87e0b4a53e407b3a86fc0c949f984da445463f9b955e37e13d295280dea5bb69f14d51216c160919d61744117b7c681125dff3febf674aebc471e544ff2831c8fe66633b5669cced727fd51b8600455f4fbebc12d2534e2294c09f3735b9770b5dd1e5e6545713ecfe05c4584d2411bafa5ff23fbe3f0052dd589536cf99a1d80e079b9fd0245e96af40140b1d4d2e964eccaec0907e0291714fe82a93161a71f81c7eb894b808ab3a961f2891157e3dc554ee0eabd3ff74e7ed7bca7db9b005595ed71f304ac10b0fb22ac8d7509d73caf7de463632ad78b6e5ad95fa2c281a7b69659db137fc68469800bc1d57fbb39dbb631cf8c55597adaa9253bbb86941649f3093cb6c3d254422fa72e8dea9da71982196da1f6a4d5fa2144d7e1e7e25a3832c3c901b3cc10cca2fd8487836d606dfb47988b420e95b8408522a80553c23a9574c9cf22c6dc13a3f0ac409dbea6249466400ac857d0f49ccb25a114a4d77815cbefa662498d60720d5c4961c3210d23f266beb67a0df30e26c5000c398d3d1de0bc7df22c671a77cb645b825556d5a57dd9870ec49ca49e66cf9a3688aa59bfb4fff21790871424bd1578abc56e864e44bf2b57e79cf9305a5271545c929a8e554590b521c016ac3529ee7ffe46749d4820374843c8f491cdccc37df077ab578eec4edb4e56712e7e69cc8a3e109037486991734c47cc15106ebbc40539d0b4b5dde2d27bbaa03dcca7bcdfa6e2d39b2d552c65f968661ed3b28a2591dd8f8356380322865103e40df714bf58f9a577e1a39fb7cd519d488e734987c53ee1a9507134774d402ac5f9bf64446f06abf21153344b57714a51d15271a33cc2c05269150fef36ef4868a4f3cda434ebf3cda88397f4b093f55a0872f1e01adc4362f1cfa9207b80cb7061a0e9e754783b1a855b3fd79159e73904ef819212502e563d7834a7a986857cfea0e38598337a9fa5e03aba0a2c33c2ce503ad67955eb58a213e28408c46590adc36eaeb67b5fe5f9f0366ee303a8ca516be3fb76a5a790bc61c08268ae3cf8be2485b969b31cbb0dcf234dfc09fa3b49fe33678a3a68f02ad80ccf420ae58be241809bd8ae7b592dece034195e08978d84a3665e71d02745ba178e4381a52a018fd7bbec0baa9cf88d48b013f8fcec9a5d5a3a917575245662b5998b565626c3734eaf23174fb88bbaec0f6d70d3e172e6cb3703aed4a4878721119d977e126530ed78e19e45846006c5da3adac330cd53b9b7b7915914617ba8d1e810a84f86d47a73b5d9c71b0edb3818802c4d46bbc942d05ecc289a1bab9511a25047a751eec3f22ca1dc1d7a2d41b17195502ca8b7aa41c321ec696bea52a6ddfff1d8b59a53ba83b611d12478d5f9a779f43e6d95f0930e52156d0aff304230419b5f8bcd7948ffa013ed50d3e01551698e812664f8fd01baee46bab76869e0541fb9029912576980672b7824415c5d3a511bc2c302e3e14ebffa4a78a59b57156f485bfec992f239b8deb3d136eea0bb5979c05c2b36c288bb6acb1ce95ea3d417e311075d5d318fbadeded96f9a33a5695c2f9449e76a57c058bea73eadd2778876b49fe6ba2f1b243b563b8363c764a9bd75b019cdb75acd578a2f71408ac70ba119469125601a751548165a3ac6e87d053746798c1db1a759ded00e26c8dd6dc381da865761fc5af4a2d9d421ece05aba2af0488dbc0cc3c50067c9ab8ba4bbf861515ca426e89eb350b308d3a04576500001a9791983dcdee6160b91e874dc2c473c7539b9c5897380f492d8f5fda78ce669ba382bbbc346da358fe1df6a58faa84e7c535dcb9dd73672ca7ec9c52521ed5662e2ab346b3712952aa326e795529d29a8c79a0251b002b3afb59b8a909d8fcdf939b210f48d3275a7c80114aab746a9604311912cc6b09cce9634afac5673c8c0b35a46df5a03e27c779c3da6aefcfb0e935fb10bf955d0ee44cebba9884d32f0e67e3991381bd5ef4c41ffec9ddd554a994d83a9c26880151cb904804de8a121a224f99e2fc2d418f5417ac20fac076e70d8a1a2c96569d119972847e62a59d8662e14793f5474e756e06d7de5ff3f0902a121dde2bda9149778eb436ecaf4aa682415cddeca1282ff9bc1493d490ad28a9ca5785ca3497301dfe1700425281a3aa9be371d99d86424db305b46676d99aa4f7ce34241a7f011b5e13b67bd11e236925938e1f91f8b304744fe22c538cde4eae64b011c12abf2fb852df21ff22adcbc3cb124d3fca270c9f94cf0f3b7150dac4d31d98d2fe948dad94af8da2cc1ae03de86e1a2b098d3ce8f022ed1e87b3879922c1ae296574eb7bb4e6dd543a989318ac1e4af2fbcb3153a63cdd8a6c84f2caa67a5e5f3d83163ef1efcfaa8f3812d30da18554455ecbe148ac411ad657581a074fa1e4e763a395b729ad04099b19c6d3f7c912ee9fd1e8e47b2b84e2db60febb6262ba5a20c54605c3722f4f017f2e8e5f1e9bd7a1aef27ce9170c09ef222c48e1cfbee423504ba27bbea6f5bf04f6f1a4e8082ea0d57b35cd4e1d49154cedebb2f883d6e84d46f13ce74d91a2fc66e64ccfd060ad1ab96f3bae8b22bd841c17745f88b8aa6bc3ba7b5e30ef06e1a719304f9af21bdb4e4bf61e0a47029474ff76d738b4c345d5a15baacf6a1ead498d1adbe8230c62f9fbe100d6effb3ea59d1b4f6e5e27589e0f1611b83e077d9782630aa2ab58b868f635c30f30c39a06127f782a8a36d5b4cdf76731690602ab89cb4f77924f5cab314cf5b64e7cbb5ed9518e4d6f97e4f623f79566a80175d4c8ef180bf69d11f976af787530750454b289d5512e75020074bae9f2659a2aab53f2dadf52e308c8228943c6ba04fe257e61d650eb90e4dad8c0dc78020d280d359a571e70c42ef40e7dd427e1ef3021920cf03a0747741cd9269c87703e641c4d06a4c4f1e42b07f949f724cd0849411f137ef1cb1d5577027f405e320183b624d9e9e2fe7e65aae7426841f655dbb17ee39e4a1bd150e34d6a97726804b1185827861e6384afa03c25268800edc5cb7b77aeb12858872b996bc6807d2a04549dbd22157f5293c8ba59ab7d8d6ffcf45f7a031f98f627f0e0f786c0ba2cc8e617cbf0bbc321cd6b7a79071b5ee92c384ec0e46feb4887fdf78cbbde552f7311a32c99d1c916681a6b67e880dcc5338d8106a7a2bf47a60142ac152a551088d227a0ba8a4c2c888b5d5e475e6a5a7250adf1e2019b58d78b41073d1e9c095be960fd90563256800011615c3429b0970ba72db637fdd2889a041a5c3b5005ba3bcfe9c06b99a1611dd824c7c00450fa1a1a03ef735ff54b7b5588aff192048be3cf525143f8190fe6e25f1817abe60ca9eeb31a9662d0e86567bcdad56f072242b3c4d19fd4aed95e8c785ecd9e7d0f42ae12c8c7e80c5ddcb789437bf0274dde03382d76fff77a1e6e8acc040c36cec1f0b45fca40701483bd60e116342a43b24932b1086fbb928a46090b49658f874dcc3491a8ef27b764780439a59d3f022ecbbd5559b53574872bb52a8d46d501b14eaa19b30c679edbd291a3ef7d022b8d0cb07998b14bae7b45987c81405287860f81f3205638a8465ce2232dd53b6d206706a960e413fa0f30b0918471a80afdea5dd60ffce76c119b28fc9c883e0ebd68a6b6f21b2fb67d1c1f1c92d80153c16b83d52527e52873edd12b726e29bd41e9b9e9bfb2e995427e68da3e1ad1d5463047f2c4f1a3cabdac5a3c2faf2bd361b9566f93a8c16cae58d63c91443aa39b482969136bfc8f855d74e390851a99d429e261f0ece79b91b1c4108175fce93de33ec186af6bed5294976f19ae122637bb924f035230fef9f183bcbc213e4c94d0c1f40b099d20d5225811f1e22dee2500f6af06080506d5dcc7377df8cc421c16d377d8bb94c3f89afb382f7e3478fa4587ddf6639e354801322e27eafc93721d113699a4a4b4f7a5d6cde8cf2d135e5c14225b17c43e497a6f453b58e7522f23ff128018fa06dc2cc0069888164073ef08302a841998225e4c8d7a735036d1e16857b6ae1eba8796c1a3c48906ba1efce0cfad5528e1743ef0f00eb9041905db9ba51336cc72979fd479929e2b95f96e1eb249d2bf9933efffc33917800449f1eea26234c108fb3aa6f956a50bc339794d23d28a51ae517fbf4fec3fe52a0c6c00f7d013fcc28f1da3ec416a10b37f1826205e8581ece810ce42b9dea4d7c2c6e47e116a73beccebd939ba751e403d23e36a89934e8dc92f3ee678f0a7d33be76e2293eb9e8d6cb828c35af61fbb40af7e027bf35be29cb9b6ddcfde285a241f9e9d0c3cb2ba7d3fecf588033134d6e20d445793c095d5786666e1a1be275a511a2d4eb29b977b0afec3d5b907d99946d85580eed5eef7dac6b6f691ff79ee94388c37327b5ba5ad7f8b32f00243b148ef4d5351efdf6f43e0646cd95384102e553eb093ffcf108b43a5cbb70281748fb36e666fcd1a80f1b455ff07c84945fba7cdc7b2de95c1ed575d6bad05167fb2b69c11ca2f83502d8202414bb19866fc532797f57f945982acc3341d05e653d0a867d7c4da06531dd1c5f703c91a6c4ab33875165b61637d3267881e1cdfd84bd7ec383e88ff58e71d1c925f9c6c13f9c81fa6d7189b28a863fa47db0228a1fdd81a329327a477ece6b6440720e541e96ae4157de86b11fe21dc729a26ce24c9768f0b9c8b99cc74e440751225215546be581d0b4e6d5bdc8ecdc49f086d2d7657e7104a275077cfa5eed23d50558a8b4adb4903856a7b17ebbcbf9408fd8ca6f29095f57ce6a22bc09acefd9d33ddff2f3f0e5e78a50d080c39969a2a2ffd94c49ae04eeb83b39dbe1978bed089136ab9e1eeaff5846f1f2ec1ac3527f4767c3bfb1b7697d72b56ba966b1566529a5fadd5658138b621978691783c2dd654b0100d00f6077f08c095c0f244436957d74259c1beacd1c6755a0096c938d1552487d8878d010616c90f0314a8fb4cb75507ddd4e51a9a7d668aaa56d30a51451c773cf90bddddd834218b33a91a8e45f13db6b06f6b2e787db02bd289253495639c95d1f323a318b450eba24565dae1b33a87a71ad046052c6e09ff510e3783e7321efe21abb57e1c007297d70ee1ba03f37b20aa53435c7f6b61d2683b5db24d4440c72e039fb18e20e03951db962dde596238a5c27287726a9c614a176a4f247dc0a89f773328e0827b411a362628c4d9b5c0b91c85ced26a7895270723fc48fc42bb91a0dd289ac5dbcabe21a0cf5cbc727288919ab085726277723a39e732728f2748a1ed2ddc87776943d2a2bbe6aad6118bdf1132e0b6bfaed2214a3c3d5e75d9ce1fc9cd83a90aaa60db580684fdd6c60aba0efe220b837d3326202ed718953c525b2e0900504feb8535a73f1812e6e0c83366112f9fb4275a0aef80d3b798a84329cf9b1f9aebcae85b89bbd245f2888b2d4eda16517bbdf308a2ebd2b6c41e5e143bccb9495b481720f2f635751ab6b28f59924ccb296e72301a278cd335596e51fb83abf313a68bfd3b795c45973644d3db6314f09a5b201b267d36065d3335b87d4e4b2c37c6e43f45d9b749a09a866854cb66786ea262076512a1defc28cf74357676604f71dc1564fc1bbc80cd0e045c824831869609085f739cbc8b4b2f4bcac990eead96cb3ce2f85ddf92a29e3a3ad295186dbab03fc642403549024b7032900013811fff1c87e7aa96a3900dd63bc5f5eb34f4d13705185b29d73738cec715d8c658c8cf0f9cabf46d9285612e46d09a58cfe5ed2d50d52bab8d0423052457269d4b1840dd54c1f682640768c1e9c8cb9332640f2ddb4c9613ac032e50e9b7b22010963a00f83daab24e618cd9b9efc3e455dd720f8386db0643a9fefbd8fde7b871c84432895bc56b5efc2c9e05e821a7e4f3510be9438fb2821259ffa290255043219ca17b6aa0d03af4858998bc1bb021078e0be488f1279f85f11e31e8081366d874fc2ef229ef955d89a11a1ea1b11c7385356d5a5c74abf26f346a9d038aa0e528615776fac250bcf0a2d0345bd2d1c135260ccc4cdd82e3eda7d714d8d9d95c2aa860c9ddd45c204908132dae7bb22e903f677477c860c8ccea2044aafb35e6a3958e1c1ef77c7bf6efda2377089adeb03748ccaa605b221fc76e1e83986ee88c23e8c21f168643a8dcc8abec9be99c6e2b71a70a52abd3eb00d8ddc1b8d96db0bd061764de00f08cd6ab177084f090ce02ed0df719f11ea9679375ed2034cfb971e252216bd1a6bb4bf8036655492c870f3ffcaaa552fc641790b9982762b0dfb81a7aa0eb3254fa1bd3926ca300f28e2b18007881d511d6350454d2df310a4071c1da7642aab13e3bc24c4b198dd4ad1f72bc8beace3a3c84b016b0529dade04f7131644f0737587b3c7523ee89860a2f27d00d047efad14f754400be8f606ab18c087c0b46cbf5913dcada50467f32278dd6336f1c1af2fb645780d7bc837d9cacc4bbe5fd4d1769260e16c6dfcc7d2f20c365f1343aacb955c665ee91491683ddd9f0795094943d75291b5004c275133fd44b84ce04f36f98766fa75fc99f5a092dafdfb64b2cea4d74d47884ced12e683d7ff6a5037b403e377365bb48654520af1820ff34b3a6b3b9d18f4757b63cda26cf9168b09bdb86de2f085487af79b854fef63f828becead7b6dd0c333b0c3cdb1a67d710af6c96a9a591022382a9f5bdfaf64810f4a859834fa07979751ba7a00bfa2f54c53117fa0f932e3ef59460adebd23dc0b5a07de17feb30fd0d29e52d1161552a11d6ead0a6bc01f5bf9d1d8585dcbcbff50f65aeab67165e5422d845053ed80e2af8d92133e06e93d8b1354bb57c1fe0e9dc8ea23348cc5e3f30ff078b9adf844160800b9ead4c23a13e0c405a6a801a75ae7d375b66e669971f7b31149a17eb10d531f038543aeccb1e9654b0d2d6153831ae3f908a19aead31385734974b118e9963eb6f23b20c2acc995eeda9a0234c8138077d52e2f1401f93856ac1acb341639cc699ee5c7e6ee9a1fd71f8163ccf1a7bfedcd5500d781d39df56703c9a224c72906fb3cc0cad64c1692aabb74359c988ae0628d3ede833ec7d1a6bc17b309b6277bd25b00a994dd75ba2d132b7e253fc124182973ce92daeccca57fbdaba318dac892186d6b710c1f27d296da6977aa0e4f2480850b83f72c68391bf51df3e95230b59892fb98e1959f92645e812c377738554c8b9f211e02ad42de96119ed36b3279a1327fbb2a538a3850b1eda31233881af6314293572242a5df0c7ac9802bd5b31756ba10680539871e1abd6decb594d553021e80442eebecbfb5f17bee61d7233190e8c8ee627d982b0e5d676f1fba79d533dca2e6ff69709d4e5b5c869d80164a4b776534348de2fdd11c67fe2c437b6336d143f4074b79878ffd540f5550ee028f6512cb42ade1a991290171c0b79f66d4144296a29a06a2067beda472e3b5758d0aa98ef8c77f4838e4ef79ee5bfc0d794fa01ae3e52d4f84bdc7aac1c01eca6213de2e2689ddc9c97c7a68564737a0c26da2894aadf68d9fc4fbd75a9ba62dfb717793407653b96297af7bbe669b4deadab12aab15e7dc655c3b950f70fef95143f805acd4375206160ddfd1a790af918762f2542ccd784ca5a7a511cf84593f51abcb8c828cf53974332c47fd1dd03c6870a9d08cc4b918dd9d205e8a76a12d2ffc70485a82cb61bff8adc6b75857e469d251ec099c8bb03f1a8811598ffe6953931336f2e410d4b51cdde6eb35806d2b429cede8b879c95e77f706b419da522d6a3788b2c701fed5c9d0abff2426cb73e0abd0cde705d36f1ca3376bba9270fcd2be849dec0d627091a7747525bc42c1512031cd623931ada98af097632eb5badacfafa2b0951a957d885144bcc0a390e1411906bbfdab3864bebf1c7e839b2c26c7770f2a0e9bbe26982ba60e8027f5b1822f0f7b7496881810e589037a89d7ba61e1b01bf5fb057634b74b8d5ef24383896531031f539007699445a5e4167ffbc7d3832e2f830538a5ae74cbb88dd7c303d8ed4e39f31f9139fc9d8e534315479aeebd953895f087e102f40e3369ef9325da317e6066dc13d63d3336c3ab6b9770d506d01645aa5377f040dbaf19d2f2283261db40fa82e3394f759fd52f216cc1579b749493ad8d0f40f01fc96410d1d165002fe0b4c51ab28244f7fb56523ff5951d1db68c5a848f032e9c0a6dacc15ccc74d6dc9689a23f66b6b04c4f4ae8d3d123bb2b626a7e549fb60dfffe6e804b7b71dbe829d773f1c07a1923befb30e02bfb72c8de42a5595becff635186523cca1801dbfde30b73bc7e6faa8662fa0f3f4ffc446d310775ffec4dca69647345e78bccc6746458939c0d5b2c6e332f103b2bf216abe553b507725aa9041b313bd7ee04a268c12a263d4174d635c3ca959f5d62fafdadc37d8da44594d0214166973eed20d200f3ce872e6386876d00a8ae7d57fce83885dfc295b787bfc9a337534294a50f15a719c524ca850b930766e8dab6117b1a909ecd2c9fa888fbf3bab80b088f056067f5edbc487ddb703560355cf47ed8c6c3674d52d075ec0d2364eb90e5c93595a912bcbe1287ce628a52829a629f0726c18cd2b212bd294072a72a723a24405e9110bec60ed0de4018df0150f68433a1a36e70b66aaf2731d2302def2fbf4cf5834eed4f450153031404a16f99670d8410af27869847c5cea1acadde4b297074fb16648544abebbafd48dca46ae98c3d885f8e2c18d8766de1f1fa49737c17121b82d8093559624cbff1e18dbfd103854ff1f7e84a8f8404d2568017b2f149f908f44a51398d102365b907fa6aff6f46c4f2ab624f21139d20bc0e571125e87ee2eefdaf5bda5e03ef62af17c6e65c04861974fe8319689423c86f5c2767c208a70bd6700eb245542e5ed18a4d5883ed0a2cbb2a06200cc940ce94232cf365b5897be1aa70cadd25af1c432e4077e54c7aa5c40abc832f60e124cabac79085387adcf90dd4adc761785e6eba1d2c79ec8453bf35d44910a2d026985b81af768b0f42fdb446d2bc9ad1be943200afa24535c83c84fefc949702ad8c45eb67fdd200a3ccd6528614489b4f2eff235c83ad98dd38cec979eee7d3897a8f93432411cbedb6ebba856722bdf8d476a5c64c67c8c6a8093928a36cd10b19b9b6d893929c54c0e4f849f0e76cf49b878acfc73e25baa41be3ff18c2f0f9774e154c6db2e045c3f82f4484b234f5dc50217fd4939b4423ab48c6ae08c2cfed6508c9fa74e4567187c469bd56f4a862067755eaa600a928015e0027350287c373af81c94ac4fc5f710e1435b12d8db2ddce840b6a25ddd4742c7733c5d1a54d0905c301e891a990ba8b1a07cbd77276fc7e8b2af3bcceb8ccc3951fd4537c7bf39e36bc491a0abfeb645f7b4ae8e8572e60fbc38dae423d3631db3f0c41e10458b34e02cc58f175d9f2f5c6947899e63f53ad12afe42c61458d330e58838d235d45686034f369d1449ecc079367c235e6f2907481f9b7e4edfda0429af0fb236daf8f704292c54b1af6d5b34f7c141bc266e77fc22b6a69353a4cebd562d281c1cfce42555dbc6a2e6f6b3940cb9a62066f76eca79a997255852a90bac347d24d733bdbb1316ebf3f317d3a4365f5f32d0990d9db2dbdc5f83ebbc548d12d353277de6dddde9766a15882cd0b7cf58514aff520ce0804f23980b45943d1881b9d41ffd9dcb9b91f3a0e6634e56e0d608ecd7e06cad600b26b9c6a3b76e04c8be54001eefc7294379f85dce154084dbc2cb9881f8a4021887ed93fb5cfd0d896f847089d527b8d5f7cf56e895b64c6a04e4bb972a904dafcf0ba1d51e432b529eeeb6ddcd40eb84fd830fd9a6b01b50cc6ee0b325be360c2a2e4909b5b31dd7d6f00e87e2f292eca2cc9a589e405654d99c2c83a8cb38ec97e8a1cdb6d22241befb88c5b14a5f62eb5c020cb7a8811ed470726268d2371a1127d64a772f0c76f14639a617cd828fcc8df908f30808fe52b297aecbb34ec97ac1c6963f801b8df648e58ca2e5b2b51bf5672fd2e88b2eeb52bb7f7db240fcc48babc3210a02a60ca169be7536f145fa70349b44548b2feb258454c1d9f600dd1f3240489b21cba55e06a8faa2dadbcfe6fbbf18931bf15a02599f6d4725a41aaa46f0b0cc33fbbbeb7ee71b2239793b0bcf8e2b10254fdfb016ed463ae84fb78f1614fa691c01ae286d45bb8c0c38dedb1af36f3836658cb7723c7afb9fdff80d9673ff6c32561b63b2c2911f9575e57a67075534575bba73a2dbd2f7317b40d4e7e5c1531c068ac5cb041be164490e5f260ea236915ef65a781a036691868a577977da5b145bf0e7fe604e6a529424057803e459c3ddc0513b21cb0eb0675668b4ba335632ba9a4c9d057d675d147ed3e840cb7c389cde1e6fca3395f8eb5824a4f924fc26a71497ce8b24c36069fb29fb369a5f863d307cd6b12ec797f47756a57b1e2e067934ba6d1d57c64d73dbd148bf9888dc8baf84dde0367a44347427bd8897db02138f57a6063e3d87b05c684f00d08ac7e3b7376834118745304ce8682d664a3de259f9858455a56029d0ada4242ab3dc194d9978b04b66e3aa8ddc955af3d41787f4e6064566be1cbcbf30d81bd8278e9934acb585c8c919fe1e0a3218d7f131bc5b56eed12afeed033ae1d4fd695c983bfd05aa5ee3534157a6594fb2385a1e34159aaf3436e098c4b93a283154d4743d9324cbdcbd925eb2b851ab77fe232728fe2fdee1358c3a4adead8c8a08aeefd6869f7e5f97efbbcfca8b5e50884115314b4e57740ac1cfc53fdeaffec4e0ddffa79f535f23efce354218192d936432f16b5d46621903ab3b473db627cab8d1b51a787d796025a4c9d7ac458feb3c277fae18c93a5c7a30d636daba0439d28fa0b68b552d07aeab25f8ebe0104249169e06653c82242e10ad0a5e0342dce76fcd709689eba2764f25e112c4c4ed031f54ee08695a0ee2897878c40d184d15c1ad6850fe92751ff9f6fb82004084c63584596148d217b952cdbe69237e940d2768e0971524bb5ffb88ff0de9421da93668e17375e436ebee54bef3bd86bc03e94649e13b13c0389e0d477150a7edf53e024f9d2358cbbe702ff409ed771b74c68447483be1900858256d32a4a0a41c1257063490c190183a0d0a46d05eb16d4cd8dc76bf5bdffadd39de1ad2bac5ba2d3a3261282a5725165fa71a1cc83072610c0b91953b1714b88f0875de29139b1033991014c59f55de67061b3e0e2e65d87ebfddde844b7547475e43e72c2c2a325685dfa85c57dd816c7e938e386a5dc848745f7151741e3e0b2ac67dd8de7f1c119e6fcc125909529adc061c27b482908d4d8ca82f850b291078e1c69ed66a1eebfaa5a109512718ea20e2db1ff9ab3c9a09ac0ffaacb109c7bfe5310e7f3220fba2a7836e22b86f01e995c592638fb4f8cc3dc954298365c4cdcc3719dd1f1e8ca0c8b1ec14d5280189e1c345b1511259f43877145f71c9f22993ae3228072d9f108172983f623ba1be1053c2b3e9b17e68bc023094260c0641f56336ed25285c8fc98d0ad0268c642994d7c00c8e6fd31943c8b2f50194a43721efa7fa970f463a78404b42deff9491717d0cfab435be714e50ffe0f159b8a9368884ab653c571d9cffa61970e51bde1eb88752549a15209c5bcbcec2a6c6a025f9315d48039a69a508190c6df05d18d9b56c797e79b2bf56129e9d1457f5530f321bfb703a28bac246ff33ecf397cae27b86a493ef140a902ee4b0ccd86cf8b9ec8bb7f53fcab6aa50e8f141962680675fcf7e59baece82573bc4ed1b3559b3fb8906ee23722743876ee41c5db784f022ea56cb839e4897c058a5b9e2fd997575e35d6ce03caa61f1c9a401da995721b50a43e567e7b7fb1c97829211e2c37afbd2eb2462d81f253005318d828e610c79743e756f470237a7d5d9df3cb913ea10c22c8d73144bffa2057ab78b103f1fdf958c9f663df1e1221f734363d8e5de5461f3f1c062bb47b508b669a34a259a0ca8ecaa1736821d96582164345150c5c4b39b49109a01690536e890571232070db0dd70261c7051147853cc14d4251d0ef0b214930ff1909c2c2749c0e9e267f033664bc87c979d25ea5b3985ae32efbc127031b071ba82f4c28bb68346d20deffce929476794d3d2dfacff32f38010c82a7a60f3056377d42060654bdc9a438b69b2a559f67c4d0a58581b8a095abc923a763d21943f4f3165849740c38b9c82cd7e59b4e4d848f9b02c34de0818070d4b92bdf3dc439041c4f3fadf27c47bce5d1e1f6c4c1be48dbdf0319163623483b58e8e7218ff11bd334813f55b73d1ca020fc54dfe5a80186df9d1d35e9d8c9f9a5119311df14a3d4bbeb1eaf4ee6df426fee029b914441d78efdc7acaaec9b69bc53b61ab44a4add36f839da926337adc192496e092c1d664d73f409d14a83358b0b1f0f50e152d3d59dc741da192b070adf01f19472a428ea08f220c9a10a62ac974e1c0c58db6e03ef49cbfd2112d40abc3527da535be01154b51b9cd4e2652a910a0107adc83ac74c9f61e0a7545752c006e56f3650cfdef5f4d2c7a48a40d1158d01fc82e3ad9003393e6d5334c0465501b3d57731ccfa05ddcbb1fa03f91cb94d34a9f358834740c12495e23184c449a997774494b95043b19f5ce181b6cafb273f914b17813ab8df1d561e651956d660e1aa88256454dda4f55eaf6574f490823a8c424f56d6a360562ae1ecc48dab72c81d54af2e33eafe3b4a2f6950c0b9783655fd85e4cf43eba051cf5571aa826e164e641905fa00ea49488b8c37f3b1c31114d979c1b4231498883a31fbbab57777dd47fe7777e1b5f6b83a97c8b92af13e7707aaafac3d97c1dc5b10fd6ef77f5ed798343d6117abe09468a1029dea43363486b381bb44f60b93d6a0414da852419c87bfa90e38b4024da06b85999df7284ef93ea4d28547bb87a5f5c312d1b06de8566ece05cd7e47a7b99276a0e86129e4c4174036e02e643db1b666ff961ff428938b412fb9a0fa5db192242732661760e0d5ff648db85667610c6665d4fe5fe11a7a9d9d3304d3cbd3a71ce6384a1ce8d8b1411dd1504ae5f8b76eaa55bb6364793593586a0c112f203f93ee68551c7937d6c7db5c789f541470b51d3ea6ff634fae13eafc7d5cb94ce6d3c0f6ca03e2daf9338e0fbc9b35f79c0fc3780f720cd51f4b194d2e391db7d676729aaa13b8ee71b1ff2c53192448edf09079d85054408b18ce6a6bd53fbb6777b987f906f264f8c25baa48a7d8bef0a5d2ac5f68607466f7d20d864b78b99afae6b7e4323516de1de0285b0f79928d9cfd93f14cc09bdfbb595308f177fcb73e8319c216556411a5317ea4b03fabf28fc09bb884e8b3b2ab0b1fcea1e8807c61762cf421588dd5baff052ce8abe608eab8eac189c7be2f8d5de96587abbb1d3a7dba5d0daa9fb48ed8ac6b1b62b2aa0dbceb1c3384ef84728b81be4a36de8e7e3475f20ee8554fd055712d044ee89fe9df658cee3178f98e604997cbe8e17e8c92141e30ac9ad9f51f4e163a8a29485ed5a77ca23a87d6618e80bd4a6a8adee8e931fa01a1180f55c5af2490bf42230a82053a6082022d522f0e921310d58c802e1fff1b45b9ddef694890a3363898d1e935388414b273c1e8b20024669ce56f0ce0973ccada147631dc104e259bbed2d0de91c8069e74fb09472a6272802c0bb730cf307849e78d55bc013c2c22a1c9b8ee9b45690d15b06b2bc1b7557db3daa7750626bf8a33aab2b015ac9b9e3ed0bb0254e00dd3b6c0438349b215cb7461e41ab93576635fdc665d1a9561dbc449ca635edf17f8fb12fc998cd261638124d5136631dc5766feca4e06e0309d5889fa623aa93b9ccb3bcbbb0ba90c371783591bad00d9516b3b89447960b81758954dfd699446fd6bfbb117b72535a9a6f5e514c017c5e08044b9dba12096f6f8e654eaf74e5dc3833f76f1618631a41dd4e60cd62f04ab1eb8f7821dababb2c630671fd0047ec0fb1f316c88b9bbc2f699cfadc60c20f1cfc8b4fd45fecfdfbe23fef7f49fd0fda66193ed6840e2e4b444d21253216e1d48c641f67e40f80982fe2ee35e4e720879a2165c40c60027b17b5502ec3cd6db39ae2d76d0364eab21bedb9681f344def26331c8882112166ceffc1bb612d2fe446c67f94da56a6648b8c05120d355dd9611d7ea708535b290de4729802763736d42b459baade7e79d8d28c1212018b2ce97ea82982925b981f19849183c59362da2bd63663e7fe36f5cf14022e71f21d356421b5da6dab31318b73e4a19ca0cb898aa2ec999a4911a54624acbafdeab2bf0409c4638596873e3239cc630aa1dbd7dbe28b413c334d6739e0f552723337ec7acb8e0fc2f5ec3e2e3746f30168c3e87553c893b3823bee4bd6882d9bc099b8043bd981d1d245c03ba29ee2a084c81521d6e8e05b46bbbc9ee34f3f46db5f68fbdf41c6fb04193ae777c0d0ca9b32dfcbf070e48a45e96a9e048d75539d516f62b1a42c076ba9b95d6d84d16e9bd1e4cc08b7920a670f3c3ee1e76c80ad58d6ebdfc11726c2ba38814b2bb3e4db31f2f6bf8abb8ae457a3a6f8477b1e8d650e12562dbb6800f08563452b4302de8a4875baf4bc729dc1dd006f32e79b4bded59e216e53fffe2ba30ad7ec90e8f655997c55e96f3752293b6f06b2cc2e7f169166d43dc4fe7d6af06bcd6ba232c41535eace362d2ab8d00dfdae7169189a4bf4af9a7de9fc71478106f98483495d5f1a2cdd6144fe377c3ade06882b5e966e4415f3ecf3883cdf7a30f29c722ddb7d7dc2587c8261c8311d9512625012a6fd1f33b30a2cfc4bc1a6f7a2d750ff5b40aed710c872cadd471b4f1d88ee285ae56a2bf8bd858c6ef288ee785a929854a992027caa0551deb513e93e920825e52528647b5eac1fc29d8aa06ec4c1f26295def4923f774a3e006c1be8beeb8504e814127649a9d62df33856e25511aceb84402fdae6fa6a98f55d8680abf010b668e7e27c54d503f98a2eb1d1df515909ea2a889773e94068e7f58e88fa9b973c828fce215ce8fd1f264a1d549db2bde9b0564befd0c38d1754c0b1a162dff24f913da4913317a519291964fa3583b7655c2965a10df2ab6d14a05755d3042650d1d7e7839e1b4e26a8f4bec90c62e01d74883de37e1ae5c6130509dfd6aae9ce74b9a1a5530d364ec53f3a202c228d6e426d1f827cb78c3da734c19e7dae1c81b063f33e7b05504a0dbc875a9ed328ee4c92b3dff5a925df1141ed318f6dabc1e06730a366bd64b82ff84a1dbeb0308584f8f57638573a89e73f1a4cd4a0540146ab9c38c54922d367b602b1f9036aefd13ae842bd2e6346b7e595961512c202d69c655aaf644b4d5fdb901b81600df767d314f90d83962d943c567b2c21882da91cf12fa8e73204457e5e5b0050d90439e027440fd2fc7e67d5772736d931c131af61e6a628b8adf057919ca3733029ee75e1b40af21b7a2c1b4887198750a57d2217d452f2c74fed88cd039cc056964b6966cbfb581c7135fad90b69349d6e56a98b8e0ecab38d1e76bff49d80e191a5b926d65384402100973d2a87bfc0d17f3997d8ce94426ebbf6dbbae233b7afdadcc2844d89ff01958e70a01cbb78bd42cffd98c942b0beace7d8cb54f2d0ee00a62ace886cf71fdab6b569a6478d4580e0ec7b8237d9061e108a5b47a3ed6038714e4d7765994bcc5241154151ee9f687b16f880a33673e70576e3abb0f0f0946a702e99fe004169704d2fd64e772e625a4006f43838056d47769add40db1dffeeb53a96b0464527fd37d0685a062a8202f8dc9df4091fbe11b5a053b330b4382baaea3759f46e2accb4c0eadd5f72ab3a28e7e5e8c6d173ee5eb8e9836d0942e390e23f053afc89f0d04ae240a6c074f98db98b43290e3c395d6ee901ba8736c51fce856cc19cf7d8fff01e8a7e6f096f97f26bbc90bf8aefcb20cd705c93371e9dd1e74de0d373aff2b690879f427ba89fa95f8b83559b16c6ac19117657bbf0938e9bc7e9241c3d092defde7f4a9a66264bd489333c7b54841c3572fd4938b814be577e2e25af822786cdc3468f1090f242707fb9842ea33f15ec23281cd9261945c3a6600a6e4db818593e4b556921b1282169775fc148b3f3f20072da5b59f14dca320252b32a4147e72ae5844522fda1f748d07be74a7d011011b98c5f4bb3e29fd99ceedd8b9a300bb0a7ed8a938c4640cfb854ada3c56c30c238e197700055bee05e58d560603d9f24fe500e485188d9bbf988fb0fe059d492ed1c8022babb904a5d8a575b20bcecb2cfb268816f37a56f4dd342954492ede01152c975d807df57cda0cc5fd388317ce60691b28b9ff87820e76baeaf273a1065d3bdf38c7847f2b25d92555b414d977b01b673b7f0de3afd997f6bab21ef4080976d1c9c35f405e08904e5cd94f4adeb1e1efa7e378226ea9bd92eae11a9b3e021dbf7e5a647e65b6ec4f0bc7bf73bb266d2fda740071f189d9c98a2fd8672ea776e42a6ef49d4010adeac259e0a3bead9f338c24318ec2293c41134656be074b0a80d535f75b9de79920b8c51848bedb870a5b0e2d9aa8c341e877ba24cd1e4a66b73eef84ca7334b4fb706736751c38a11c01aa88366d23a8ed6aef0a1e3bf082905ea006ce257aba82f176c160eb015d8cfdc52a52820ca07ac0baad190599e9b63363d4d905cddf334a5f222e45a3e2a4dbd78146c170a4957b29ebaf14583061cbb91bc0bf2e643e4e61adf4efef92cdc6a540daa411425e7fc9e0a403baf2e1ebda32a1bad5e84f4e396ce83befc7fd03b0d6dfad6d29fa3c7e650627f2fbd1a3e72867e97bef7dd0a76c25488921df0d36e6d5c3fc7815da065b9935449ee33a28a1fcd835915464629af39b5fd187d4d13658e71098a9422fbc412c29844c477af9f354ec0c5fd35c7aff364dae15b2aa1e807be9d6e74adad4d90f383b9ab8212a772bc68e20731a10b8b18704ec0b6a78e044521794b56e7faa1a33e9e8b354fc80a33ec20f5a7a394721d4dd79480eb3a91a715c37b3190ae50e614f2b095bd77b50f79cca6c2da071a13e0f9175258f6f118873ea0495b49b1ba150534a6df2d283d219f6294bd4f101d49085af964ffdf8d7286ac30c50081f364fec5a6e7037a4a2d4a9fc98d9b461fb0dc954dacafd08f7bfd7a7a70f743f9c119f93dfd0a2234e113e83ee1c63db07f923a187c3f77457d5ddca86a8a1126f3438463bfa523f11ba01ca61d7d3d850d4fce8cb6a52a351e8e840f007b2000a40374d50bab708a29d720abeb1c90127de52d9fe1f388cc1e04b84fdd60719756ca705228f1505e95e8a1975d7a00570641da6b84520250bf8de58315fb23104fedaeb1c85724c3d799f7947f299f9afbc4aff1c0a04c56a499eb52564622a44f47f9b2c56657b530529eb34cca69d8c3bf0c2eb582097a50513672748430455f54ed035e1012a48b118921326efb4a45a602b90c79aab852f777a162158267de64c88a185d0f107a9b2b0bf5425e300ace16b16ee000044034c0058c2480c12b0f30b3702cbde44d8a1b2af22139f068ac2c407d64c5ab79cdd2806ed2f2d6badb5247312b4c3515c39ec7fe3c992a5820f48ead774c7f9504265ac040a3a3b4b2e966ecab8f5dffaa20652eac8111c0883dae55a2bd839687a5c071d3c0c3c019e1375f0127e32acad7cf72d172cf841d5e5c034187532ec5d8d0f67e73df7d40296dc25076835061001e1ee92d0d7c58eda4e2a31a07aec4df307fe721093e61b298cb74b89eaaf4facf5a0e0e3cf0d13dda4e525480d16818c2736ec1c1ab7edfc62b8d39c59d2f06db57475b04111e4db4551ed10f0ba24f7f68782119ea5960ce51bcf2cef4941486f07c49252cd3aa350fd059e82eb37f54227b92975b48424b67038d4677674508c497c9ded0c3e7d1a8a9d2775defe65d562321e96230cc44c735535ba7dce49ce55acec6ba3ae8c324706e6ad2ff1b1e38f3805b897e710c67211cc42fd84c536d50b2f2b9c6ce7234e259c979e8dde1e8c6f05ad5ed753cf44e213872420a42bee51278b7cfd1018f8088967366811f5b98a286a6329ac912a7715cdd9a497561cc0e1bb141baa9676164d4849c118a40fd6202688803e676416f32f3eca646930a4a446dc97d514e3ddba4278fe116140900237d14a955278695b39dca5bef8d1dc57f867d61b9637d35cd0c92213afb479bdd63fdb2041a570f938ec53c30f256f76a4ffeca96c327a20095bff70b4bf291f7d75db753cb18f02510b840b7da0dfa8398b505b9354d5909f184cfbeadb0c05ca005caee0d330ab238ce6a9487c2813832774caf41680281ba8a1ad0c943b3d0edc6d8f3686bafac89a9ce2e2f54f17bb35820d3cdbcaaab0528048bc37ae1897bf11f18622693d6345f97b3bbc8f8fcbf1bb7527d6275ef6fdacffd1d396127e91a14922f337a8398100a517044515e5b4421191c18ca2c4ec4f100edcd7afc513902dc7890f2d603a6353ce81c131d5476e0945631043d831190d94593a9348a87f53c5bfa8b49057d8188bc4630cd714a4ee23bbcd10b671e99ba7bc048b38e1256a9a136a6b9ab8147c64fa9325e7ac11c406d40092dd8857dafbc340319c3eabe6ebca9919c5f333ba250bd27278f71ece8ba61e4aceb9c7342616421784cdc374cf6773881241512d892484b3360a1f9e9a20e9419a7bf67355eff2222507e26f0afedfd7f4849ac101bec07835fb45ab2eb74d1ae168fcc8795d01abdaee696bd835b97b04fbb7997adae232d8901e0f218b33f143140a870b94ae36ec0692350bb7cbfd1aead2e54115e252bcea40c5ec4b0447304b6064f54242b2ecef7577c3a4cfa7576b6290a49f13efcfe4d301ecfceed69345aa1652baa434a1deddebb1b4828859beaf8009ba2f0bb8a854efd64bcb236b3abcbeaed669329a98e741cbcb3a70565ecaf4306d8000e218d8b6c58509d20047cfdc9ea7ae321ccb6defa8603a3063f62c28c794eec64c00b5d3ad0a5e42cebebe27d0a1fd02022432527611951f40ac7dac892cff3f81fee0694b381b3dca792ab9bb387d326edf003955696674b654075b6454994bf2d226c7c47cd04d74a503f185791a225153c2c9b5d33ffaf58288d7c2c33ae8ac7ecf85bf627c26b06a3ff2f9c1901ebad3b2c0a3e64dd5ed5bb0011facd542ae93a4319a3c6cb88bfec55f31bb6b1b69ae65b6d51551a901c12860a623115d5d5a5214fc168e15ee0cd02a8120d707cea64f6dc1f0f6e5d8acbf0056064e9e5c9dfa0f7107738f5fb58f5f4dba84ac5ea50b341f61e11393f6f6ad66a9e93559c7d26ecef0a3639e1db3d09c562b1bca3aadd755b394f1cfa9c8f40fdd57b514dd472420977095f4ebac212a7128b1956c2ff81f38934c8a308020179586ee77fc5b81f2fe999554e5d10871508b153f2a5d6526f672c62c4e8e44c1e9a3fd1db4ac4abf7283a15dca8ea0738c55ad5844f69cef5d0e1ae6d7f3c06d9047800beb171c90f4316d35e1a38d1ae8b222fba72e166aad5f541008e3dbfc6c7730478dede85e03aa51802f0f3189bd172bdb05456e84d9649ff3bc6c57550f18dd0f73b8ce5cdeac974fd599ec5bbea794b6329ed9d198a54757409303237987cfc5b1adc83a7665bf64872f82d64eec100041207f1800b46d56b79eb3ed369f7af01dcbb8d345aaac3569499bf8fae614770330713a4276975ca994bf0458c90677f8d7f044b46a24e3683d82e085d0caf95a87'
        }
      )
    })

    it('should decode ShieldedWithdrawalTransition', async () => {
      const decoded = await utils.decodeStateTransition(shieldedWithdrawal.data)

      assert.deepEqual(
        decoded,
        {
          type: 19,
          typeString: 'SHIELDED_WITHDRAWAL',
          actions: [
            {
              nullifier: '8ddf3dfe649fb1fb27ec3d6214336f8dc0122b9b29dad5be3c12a6d920df6b02',
              rk: '7747a32d7126918985d16daa1a99a9a6201d55954cd40b5c4903e08694a71ab1',
              cmx: 'd19b16611c98b10daee744189b52fe46869bde4a0ea661cd3de7ed786df1fc30',
              encryptedNote: 'fa6c59f435fba7687f552254c7547f199e724910b751e12f4fdf600337a914a12e05045c876dbd553327e9232e6b658eb3e72573e50d2d63fcd9b8105decb727bf989a5b4eb6a236ebb9302bf3432deddc40658cb2640b7e332c7ba6ead4acdbf8058ac35413e922df1a873663b340347a104f1dc0504729c20ee22027a83802b026c2c76c12b2a4d0b997737daa78f7e206c0168c9e0ada1fea7e097a13946f493370ad564cc62dbcfbe32e479f9f28802333683c17a286e9fd57020ae6c0144ffea496cc1435fb2ad366557fc46a98024b4d8a60a5b53b',
              cvNet: '8243eef5daa18bdd1d795698cc78cfc1979d9065d50cb818f47bf67610dc7714',
              spendAuthSig: '5b79f8ed6c584b221b9dc0eab7a02e0d60fc387db6171cb70fa6d73b81244c07e9ff62b3345194149571e83c56db56bf2b5c523266ce8bd0602dc74e5d52f433'
            },
            {
              nullifier: 'c553475645640d02a764143acbe4d03546c3ab84501478b41d334b7e6e5f8727',
              rk: 'a8e9fbbfdc98edfc24baed6a6fd466c5b5dcc0f98d4d4d47580740270274de2d',
              cmx: 'cd177d4118888e7a767b24944a66a332f9c5d4ff869f092718e7285d98a77111',
              encryptedNote: '621f7bf59e4ddbcd869e19977024f035781e7b106d5fe8d04712da9755d619b0989a5476ffabcc2b5338596f1779021ed8f8a35736425083d17f20f47040275861141210b99b240241c15186b0c540afc6a0f6302159c39dd8ac4d5b3003e3956da8e1343ea952d7d62f2e989dba6f4a853a9c04cbd6a55476f7b46fc13423eef6c1537a0f1f65b379a231c59538889eb86e764a1511f7d0a9947e6154cc1875aff59a38464920e950ea263efc14ac8365c104d334428e0e2533cc261821d8070e6c03c692ae3d532a6fbbcb452c0fa79d380dcf49004825',
              cvNet: 'fa9846bc3095716a0907871f940636a9134642bc5d075d4b01d8086c0496f524',
              spendAuthSig: '22d486a529800a06400bc166918c503d33adc014c7519918a9ff8e859e5065a7a2800f321429e9c018713bdf1b20dcc5044de1782e773b1d811a46c029a4b224'
            }
          ],
          unshieldingAmount: '2275191200',
          anchor: 'bb6408408f4bef0785af83e971af52e49723a750d7820d996f251c01017cc813',
          proof: '6dc268049e8d054ba3616a2b8738894c83076f3a71ab5751ed6983f133d750b814cb68ba35557bb53d20772b5c8a5accc2e23f287bdc0c25d2065e08f11c420906a986ba6ff4f66767fa5d9871e016494a1a5a1b9ea90526cd2193436275c53c152914fb8a606492141f69c0d4a7a5abb2fc571a4dec6345ffcefcaaaaecd03d82f091c5574b952a9bab1b953a6bf7887e56cbca5ec0ae11692b3519a6dd3d307ec8c6deb59ddfa5393128fca427453a4dcd082264927729f22c71c98a8441a6d9cfe6c2cdfc2b3aee4bdefaa91f279e7cd60e89a3d220c2f678fed39b02fc272b776a4aa6a37b18ce304220089e1995ebc1a092a95742d924923a3ee4b4c6a82395e5e7e79fa64e864dab5644f46c26f48e07122f9f12d8e4c8f4c6dc71a9829764ee24add95363b1e72d354a3337dda34d87e8d199950d1a7da146b8f2559340768672ae079df4f133fd0496c0a268fd4a6c249e09bc0238d638fb043f358e323b6793f5e4a03e1d6bff2784fc232ca63b38efa276e8110d3aa1a2643cfe341243c507ab6218a10f2bce619403a16eb4a4497a5909327aa39b2025971f3eb9e54205e3db376b17ffca15f4704a65553b72192fab28f274f998e1d8bac1981190b312f804e59f98ab8928ce97c9ff4e7266e3792bd231a89f5b64360a03b0291067500b448bd921c91ca174a686b5abea2f6ff09a72054bf08ead4583150bba0ec3d095df9d17aa999580a2b58223b2017bdc5a1708c78941bf5f6e3df6b90060c9283013c5dfa049ff8c488a745f9123e5f9b03d896a4d75cf6c8e74e8a9205735d5692d65c64aabc8a2d121c6215ffef8886065771a42406d09401f7a2f9185bf90ecc0f0dcf0d040fd23a640792a1298ecb565004bdc8f35dd7bf113d9879aaf0ba4f67fea6ce4df9e1314eb21ef6337b62785a5e8016ce72db32c975f9596b87b27e7d1fae8dbc87e876507449dceb082ab81bd109d7df3e103b5e81d996978316d08a7bb1e1bb9ea7df7953458bf5df5349c28d625bf09a79f8362a28d75c01d85dae48f22145e9d2ab0dec707c78e6380fc572302eb537559215c623ab9e2949c53896bfbd5c928875f846647d1fca5d90c8b3bb4530a1e067d61033a917f36a0db626b9a5df27bcb234e8949b7416f191b3581f16284f9e1d9f15419bee67b80ca7f7bfd4ccf3adadf55f72ccb6765bbef203b22e6fa083f2603fb9e724af66d1df0b1b6eef35321ac61615c3803c52ca3e895137ac8b0eee1d5828bd5dcbf7d45375b55a371838d580d4ddc9a824601dca7082bf4612511307cff1e397aa2b17f0cc6c83bfdb6ec5f5e26513ad4e5facf235147f4cf1beca50dc317e977c411ea44a55cf3a5a3806a252dd713cb0f8acd95ad58de0ad3ef55cb4b10dce3f32a718e51db22032a0f17b4681bc171a0eeda4f42c0d6abddf94c8aab0c57c9e8c47b63666db011ca8bbec6c192eab29ea78107d5115b49c1b12ba7c2900de91d8d43149a983b9c277b2539584ce44ba1630d9568ff7626dd665d77feb55bc41c299272c0ec20a1a2f6f9780b5c2c7e4ac0178efc75c1eea4533530c780d6375b117f1aed99aae266b5608b90e0981a99be68011045d08274e92d1e18b1c69fd8005337c0f4557e69562af774e8aeccafd2c5720cb913cb66edbe5a5a8ebc5d2f38f09c41f9df6fbcf0b187f98970ce936f8f3991162444003219bbf70680be80330c02030c4eade3e40862443f674afaa55193aeecf2bde1d4f7d63db32c5891b6da78e2e8997cc389f27a546888795e37dc0a3055271c2510c120cd9624b46ed75cf9321550d3b7befb1dce813256824ab798cb2bb8b1bb85b6fa481ceaa08205cba86abce57a3ce472aeee953b34622bf221855cb4726ef0c69be886c459f4a49813eb7b4d62672efaf364f6a957f0b80417fc2f2fb7b3a6ab26483e4ce7d1b9cd620ba92649039ff9f31bb8c38141a1ffb1e68a12f2e33e2ab9428dcc90860c58151139b08d7e004866b1c61c5bfdffcd18a656c59f04dcd11dfb8d024ff419a639b888202799afa5f578e928d130321689f57d9ce238073f909cbd6d0f1c6c17827dade8ce920c2b4124b80ebcaf62a0b1449525ebdd94a103c20079d1ec78b8c4d8519ec78845c85b4c90fe5e6f6636b3a6d7b96e1fbe12cc863726f39164cc436bdc81b6fa59a6d03ce688a91678563ae96713caef8df3e2ee927a56783f236198a7dddb994a79d85824f8e9503773c2a37a115de84a0dc3233f6536d25886ee51f7cf60b11025219c11d876b385c2d2d14881d9ac137b0300be847ffa86b572a4db372765986d2bb2bc5674c055f070ab04f9b52d3a02b0df9a44889b40ff2bcb20ab8667dec410aab668cf95e06cf75870bf95d8c8dcfa4fb40908dfca2fd3b82421a59c55be18f192338cd4638ca1bec616b90f013f5d6e0b10c35b7917581d91306e5111fbdda7d8093186d711828b0c7ea199104961de0825d2147b4e6fe1c6e2cbe4de09212f006905000a5417f9d85b7da73d477907285690b47908b79967c876e45c8e617f862d0a27c006c3a5041a26c9b7636eaf0cdf6c7e3fc4b58a8ae22620390f01be0bcc55068b1146b34099c8f5d49f65963c3bf406bdfe083d70a63fb54065306e9379556b8a17ae8a7c660da67659a67d24c862070a4e48878c16b506a7f3fb4d55ebdb96d06f0e990c0934d352033362083454091b702b0b8f5c128336da4423e6eec95d91979efda99b477859df67e30225a6bedbd41721cc81d65beed95490aff9b7409d2cc521e5e213a973fe0aa8106c71507373d2a4cc5c52a6fcd3635e09f7da4fe62e5443b600c4fd99bf4c0622a3246d86e5e29d64166c1df19ff74d687b873a42d7b70dc083b37dbe76ef1414089804fe71222444febfd49f0d138061b835ab48421b1db6da4528f7c574b11276a6c1109670d9f4edd91481b231ea7ed7a11a9fec3af512f4198e866cab141940a6e702041c5b3e3fdfdcdefa95bef70cb2150a77bc4efa69f393f16162512b6cb2631d1be7a80a0832061a3984c71d0ed9a3136eee5ca638cb8851995f1d05522e6b740c217cfed8e6d60b2e8f8c9040751ecbb1832b5a029b8659b936ac2ef9701b1b86fc46c136142fbde9e7fc76e96b132586d3b9bbb23af9327ccc7c03bf6d631175b7880496a1f1f3b5a735c523816c6ada2b4d56037c746e4beb8718d3a8ff5a6bbca35212097b073304e9057e35d180b8a52999dddedae146f7f618239baefc8fba20b17863a81c63d1bad8cae1b91fcd8fa2a318ec66ae66aa0f3e45036d166acdffdff9dc67acad7092ee665815572df1de0a4e024b98d7569832142cc2c5c2e27aeeb4581218f2bf6cb825f4ba8a57a983220a925084a16ba62c5f8fd2d7ff838b357a17540078604245b93548e1d5d817d689136dfe2c96201eb5feb7bd680904b50cfd0af0d300f6991e293fb65d966c6514867ccf6b15db08144fda9fc4bbd15a0a96eb8025dcae069a489d81b81f2a91b1e864442e15282e1dc0e59f77338b87cfb0ce9d5170f89d144048289a9794567d21e5163d38cc33bf20f7409faee06f897d4c7d816151e4370bc71414d222d406a63986064b0911f8b1adce134b8dba2421c62e3dcb454d2b8beaf2390783c1415f4684ac81d61cf6fcd8591d2b32cae3778c3e1f5218133c330916764d6fb1ef8350e038165f0a3801665bba4c4d8031fa93587dd219aa51ee94227323d15ee4b8cd9db1cf3a04127c0232c6af964a8f68edcf041225c22092bee1ce04dbc3c3d309f000920339d99eb53be9f457e7bba3df00b9abdad39db4254de5a01b01fee14f5d1d83e62c9517fa9ffdcd670049f582d8bd4cdf907e6cb9350bcb26d04c3bd222bd651008cd4ee6d464a372bcc213fa5445b375c8dea7fee9000761b5bbb6dd9fc67c2c081c881c13847b2f42c97f50d4ef8c04c9c3125971890cfb11ccf2a805684c5436659196d6123e398799fb0580c0e5455a9ed66bce0ef6e5e498802b5d1fe3bb1f4276ae29ff564433471870d01f6411965875d024f129996bcc156a5d8f30af306d9f836c52f9ffa407e533c0755eaf6d10ed64d5c1a05ab4ca26ed3afdb3973a75ae407e123b70b7456ddb48cc6419b027666f807ee569ad1872b5c4bcf8d3299b7a080da1e0f84223e9888c745879be631fb70be4617a4d427b15f2a360ee0341b8c2e5ae3cdcbeb0f696473a4a4beadc011471e6cf8ebb8cf5e709d9d623044a8a574c13baed91c888e8548956527a90b4c56d170a4c13df400505d478660610ae16d6b95480bde73f016a039f3f6df579a8584ce9fd5e48b12ec37c6b842dc28a71f90acd78c784daeb6f689861903e1743bab45cda260f055cc4fe83ba1db9ed33fe9d555ba9ebb77509fa5ecc47d9cc4401e363e6c5e556ce9cfac677092aada5d96256781fd7ee65cc4594b56d1669d25d763a144d940b16317cdfd4145be26886807daceb6859ad0bf1d806ac66cacf547fcf4867664019fd940c0737222a77f1e5f2f74a3ec0722a0a9d4bde81191874f6b36ebda1cf87005d1695255a54aa573f51f793bd5f17a70fab0d4e46e18b619f0302669f085be38717953ffb4e8d0518f0feb91aab836979eb76e5576b0b36133bb35a4381588111974e26b5f75544007bf84c85f82ad80969c6b5e96bfa8add8d91e841a13924077ad503a540ccb0cd456d58a707c63f4547f8ecace461c9811b27d6f20bf20a2efaa504632a5567fb5be746cc063bc26050f2a30e38737410470e54baf191a57988aa364ef421175423ac36f695711025041688db0be7e1792beb05a02bd1194c7e233fdbdfc747bf754c6b89b606af91a0800054b0a8849ad851da2da5bb55bda4780597d8809762e72c5875816ed3aab93a2f15a7a617a16da4df942be6d9fd5c3417c18719638b345d00a5a8446d107e008085d0c3da37a4c55e31846d0bc50692052049f7d6bf1d137b7663dc48d3ca0d01d0c0c9bb06ab9f8e915b98b021166f31c1fa4c8ff6ac79b5a79be1545d1de766ba507b9ec53d569b7454af7e9e30bb3c0f30022077b62222aba2cea6ee8cbac659715770010b5d77d19b40e8768af1003e4f266f5f6ea99666df47909d12330457034314115ae4df06b64c3b13bc2412bc60eddb0cee83a62813ec41aef1e682dd10a08f80e3fc82756f4199ed19012b3aeda41e4bfc01b4d5902cc1a6385f2dc1237c3a1644e0fa96b8906ae8b21e1446a5a8d46715968c814a196f98fd22526d37ceafcf9d2e0005b9d4c45a4c4320977db2a5cd5a1b7266bf898444455a374ecc8ae252eb5ce3ce9ab73e02e96723102fc2119faf9b40d3bd944429f6f42b2fa150a89001df74164d723d0c4eb513a222330db9b0835c206cd390fb0055978adaf40d7d8f94ebc3241abafcdf362cb136bf2ad27631986ea0d33c82e8c714898a0531144d7734ab79d85d333d24041c836a404f4021a1c9cd492bdfb63eae81fdb24f92e65dbeacf08388d7e61b30cdbc6720e0e13a189d691831f0963be6111c5f79d97661fb746b2cc75b25d3294e5b5c824f11ef93e51302d95226f8f0fb696392d51b0609515a3267c987890b567ec12b559c82046103e9effedcd52b050afc33d4ea3ee6707c47e5a747403a09ba739bd7e54b2d34909ac277fc33c9a20acfc8d9d22bf290b89f76ee7118001f2b7b0acd0b8060a5387a4e8cbe5f2da634a486e69b5e3fa4c436cca458811ce152711ba1d203802fa68c5cedfdd132bb8ce7afd2d7efa52b466e12bc2f6f231c0f2163742cd7be86d473e2abec5daca31667dd9eb6b2d51a3ccd47c0d2a10434e13c5cffe91d01b3538807d9d50f6d8b14dbe5446f7c6c0844b17655d2300a0e786b702e4a49783091ce1a31b55dbb5efc24d97e448b60a991edb0ebfe4509c769b8dcf08789570613d3b12ec79e8458d3ebc530199837d4812baf86d1703146066d1efe081c36880a0a3fb6b47a8b2d475a572b90f18f629ef909cd07b52350e765c40cf6eb173402a7d31df4e267df211ebf3f2b9317a9f30d03c2c8a81f9f42957076599c7b251211efdbf2c76a4601ed606de5edc819ab7d614e39523280886a87d6bb2e4dba43005559edf6005d95b4750dae545ed5447816a01db600092ff9db34d47df16bf6d84079de9edcb9d38d9a78ffc4c308f6468acaf32e2780d0e5d688ff111107509eb314bdd436a7259d0258d4fd5b03887e5ce7ee29299c0cbdd49b80c62618efebe80d6ecc62506813df5e7f58e14c9040c84608ea1093d4fe61e86a882b9f03ef45781a019868977e0a625ce041a3d1d9ca1b196c00ba9e119d2622bdffcbf5cd7d49e9f93a93ba03bfb6ba82aa4174bdb90e60943f53752f9581877d0db52ad99aebc125c776f72beb003f4a19b68cdc26daae8c2f343e7177d730ba6df29bd0e5082671bd1c06b51f1707d6de4de2d644b3465235619ad80008a883b5f7fed06ea93694802361b30172996612689dcad7243bae1dab7d3cef9edc3835f7645f5288d8a580049dfd718d35162dd4ad24a00f89d42af1538711771bb4356c0b51264fc0a8e0d34714c380ec7ec3af10f1e5e0506606a66fca5ea0238c4a065eb08ba845011ea79e608edf03aec8da6c4abac695560a9e64114d48bbd3bcd84194f44798df39eb2ce87cc574b627b9fb1cd3e6791f2b5e8fe3f296650ca547865a7660186702306bff2f52b08609519c5025b0706c35ac4c02c88a79c89d78aa2b2a21252af5f92c1fb76e52f458c27e7a966f270a22e7cb8c6375635d25ce5c489fb91a758173395de463e024b438594396780d00320d1e4ac29b5d70108dca016544e85e8ba7bff7000767eb34f6e29a8041ea4f26063a6206f473eefc59d7aaae06cf0ef10454eef21cf247854c479df2c0293e350812180088fb03602b05cf4271e9134b8232f0ef3ba59c763ad98daa65d110223772165c36df0d07c964a3366e94f5e755536ebcde58037217ca2aa556d6f32f50e1488b80aea8f461f2bfb90ee9718940857b6cd6743d805379ccec9fc186041199097f3ce3bfa913f3a3e4b3b3b8040003ba7652b64f51a8e3987d8e0b9405d5d3375675445fea6fbef8c0e97593447b98d4e544df5ea218aabded4bc46d3e3b75606aa2110b0996cfdddbc32b5398b2267bb747c5781d0f3e674826ea9421a2461475e26eac855d4fff95dd7a23f858f4725c8199bd5228292fbc1bb1a317465716dd1a1d0a513f091be944f65675393fb108ed532e8cd967af046165383a7399276cde714ca2cbf560b4dddb47cbcbbd9b2c75e1223b36a8a34cc4f4130d03cd911c60c32b7837eebef591cac15d4e5e19997fc0ed28e88c6c44ffb6d839f9e1a7f90b5e3a64428aa575c84f1b4c6c71ef7e16221f57305fd71591ea9219ed7a696801e74372cff621b991709ead1d173365bc10973aa20ff83d3779ca314845de7d8e8d578f06284e1e1f4b1f96202b8da66af5d204514ef49aa0f2c10d86cc35ba5989019244fa94bd2fb84d10921a597a2c729585c9060ed2472b4306c55923577cec2dc2d3907e9ff1c5b681b876ce9e09fff3d340c4b6c87d913304f19cbd76e7d3e0c8982a039e63f9d5d7153f4d872e64da906eb78f1d084aff0cae5154c70192e3fc9092086f642e617afc440c4182e90d4ce285862d555112252bcb7bdb488a125ca3a886e356c75e95b3f46478080d22be09d9de643c24be2cf4033e9bca9ef021b0dd0709337899afbf082d261e1820c559d0d36c154fd614acc2b1a1afe2e4c1583e7cb145f85c699080b0db4f5130fde1443f0986dba734eb1defb418c6cb05b689f8571d0fd9a33f0f017410b076db4a0e463b2c831a23544fdeba7052622c72bef8ed8b6f646e9dff8336cc0246ea8d74bc8675ee122a2332f91343c62520d42bd12c084dd8c6c5ac3dd0eb0714476c5d144771b9291fe876e9a58dbd3feb701815ece242078595f3049ecea948f185936be5572ab11308244a588416fb82e23fd77f54ea6ad6093f50fc4dc2da72ead915f37b87a52d82516e8a712e4a2dc836f8be5ec7a7387a8a234a14bc127003c835ed64a3da2341a3a6c1691f89ece4813aaae39afe2a8b42723ecd0620337396e3889ad0e63b819c8a2ba89ec367a60986f86b05fca257ef4490baa9e79fffdfdb252181583cc1eda967de3dda06a9af82ac74b26fa7b619745f9554cf8e6d861f32190711184c875519a0cb8b599101801aa1a27ac41ca9c9c6e97fd672c7be4e5756aed2096ecf0c9df5454eda954e89c8030a427f322b45d6047d9994ee52ac41301b590227e34c6c05dfd16858acedba8f70d32b86655876ae0b8520ce81953ae65d622b7eba02756c04f8793fd4f344a1790b089b994f2f0326bfac70df741b9c6f1b212f2836e1f9f43080aa1ea5e7d11a71c9ff8604317cc8ac9be4c0cdc3b24aad385f1ffe738cf7313c67c75627713ab167bf44069f8506efff24443ace9aae4a25c037aa62d14187d4fc4a26dff5db5e84dc2f70915e0ccf75c0742f618e3cb020d3ec198a0ed2652e03f682a69d5e4369eaea6c5a84db7ff645335d1290d58838c03ecade99b520b5bee11b9f1037769c5cfca9ab8dec18e68cf375f7b557962b4f1f45e71a546b275880061e8163bdac15788f3e480babb97689f05ddce9180e8beff7976c55bb081a571f45f5070468b80d6ebfeda265dc869049a55def601188e40ef84679c1d70a719aaf6c478e9a36dae6334c97f0934964a1c5b285ab0234f2db90dcf25b09adc56342e51c6b66f876053d9dabc7a6101c859521b07e3bc18a7ba8f91fb47a430d0d45a870612f4d1103abbac132ed53507dfc4769b50ed0a16cbbb398e1e1856599d8e9a6fc05bacf5536a9cfa0c6bfebca32aad22c9d1b68ec12119543e9ef78f0a3815ed3346f0392a225fe775c66fb6f9da4399d197665b4aa2a5c575519bd712ae80d70260dbd7e1360fd07ab3120b18589b8780f9cb0a34fe94de5aff7676713ddfc6bf970ba1d2d3edd5f51baacefc4989e8b2eb926545298f8b0ca913e748f956ced89e40a30eaa334cf80492587102ab8f02557a0e998a1e676518c8da59800829654826da82931494192e88cd6c3eb6b4d3a913a4a7caa4f7df80a463231f8dab574cc0e473f1bd148f5def2971006f8eea016406349b3dadc9ab42ece4a7955560dfcff77c4b4fbdff50ccc2e13a4fc8e9ed80e15f700d6084cc0c31dec99346e2aa60c8d1cad40a10d63f10de675185e1c6f5164903cbc0565e570ead478dd8db11059a6e36f5f0560b0d45786ad099c9cc0c9086b03cde4cba1d5548e6b1d3a689a20b7e802354fcf442bb22e4b0ed73c8a15c8ecf0821f465d9749e4cf0542e9cf903310650d3594ecae636dfdd2a08fd51289e2823653d6fb6af82a0b68b671d043ba20731df4bd71f1b34b9af4cd80c52559a235235bec039cd50bc559297721b8ebafecdde2ef2a2df1ae54fd70b9f630b2ac4b0adc3582dd4e0ef5cff09880fbeebc2632eadabb3b7ed8a55d2cac45dd17ccf751c3fc876e090be6957cbd6c33bf459eb331bb29182a05e3c857be1f3fe04e70ede7df19333119419eeb1c4d19faf115de354e396f1603df73d2a44e58712252bdb93efeded4e3c61d2b8526f425c4cf126a264c780f9cadb49412addf3404f8448e99a508a8f90dbc6597a00fb585b0daf459dcdd787e4bac6400ff62161b3b3d519521f3ab45af780c2ffb4018ac080b56bb3a838828dd7e42383f99c201d30e6579dfe4dccfb1eda378c4dcdf93e200c2da170bc1e896c5048c8bec1cb50dc37370886e8768584b5169c2a89145cd1aa8436ade8c9b8db8b005025811d5b20bc87b7993715f939aa66d6ef1930203b05c0a2b36a0a64c2c4037ba4c757f1966629915b213618a8445c3ac22be3fc4de464d104013944d7c5d8d26a751614ffefe03ccb19ce00d27c0283390512cd947937926cc41bcbc60d98e1a1916da07bc9dce228816c7710551a40469efe5c06f4ef99408cbd2053fc896fdd7960bc370d3b785829eff288448ca5d4214a584a6870966ad241e8186eaad435d0c92f0354e957a840fb1548b334c4ee87a98002d65b1b5c5bd86a6575ba3f74e73976015051a4e632e07311b0651c6e2a4ebdf27b1f9ab8bf5d7baa50cb572e468200a6dae14c4fbc38aedaa2509e4f38cbb21c5c1affff857be9c40540311b8e38af6291c2ed6877f9e115f3eb64c9c7e32de1f6dd3679b5c0b42007531',
          bindingsSignature: 'ddb98d173a5ae2c5024437f1093b27c1060a712fee03db586acd88c4f79dcf99ecf85e7e3edbaffddb6e9a6704962a01c76e0146952f4e8f8db781e9b598ce03',
          coreFeePerByte: 1,
          pooling: 'Never',
          outputAddress: 'yW2SMhUSxjkLrz3wa6T2sStRYN1qKsLLXh',
          outputScript: '76a9146a79c6b7b8d6875fdb33b17fa74d2402606007f288ac',
          raw: '1300028ddf3dfe649fb1fb27ec3d6214336f8dc0122b9b29dad5be3c12a6d920df6b027747a32d7126918985d16daa1a99a9a6201d55954cd40b5c4903e08694a71ab1d19b16611c98b10daee744189b52fe46869bde4a0ea661cd3de7ed786df1fc30d8fa6c59f435fba7687f552254c7547f199e724910b751e12f4fdf600337a914a12e05045c876dbd553327e9232e6b658eb3e72573e50d2d63fcd9b8105decb727bf989a5b4eb6a236ebb9302bf3432deddc40658cb2640b7e332c7ba6ead4acdbf8058ac35413e922df1a873663b340347a104f1dc0504729c20ee22027a83802b026c2c76c12b2a4d0b997737daa78f7e206c0168c9e0ada1fea7e097a13946f493370ad564cc62dbcfbe32e479f9f28802333683c17a286e9fd57020ae6c0144ffea496cc1435fb2ad366557fc46a98024b4d8a60a5b53b8243eef5daa18bdd1d795698cc78cfc1979d9065d50cb818f47bf67610dc77145b79f8ed6c584b221b9dc0eab7a02e0d60fc387db6171cb70fa6d73b81244c07e9ff62b3345194149571e83c56db56bf2b5c523266ce8bd0602dc74e5d52f433c553475645640d02a764143acbe4d03546c3ab84501478b41d334b7e6e5f8727a8e9fbbfdc98edfc24baed6a6fd466c5b5dcc0f98d4d4d47580740270274de2dcd177d4118888e7a767b24944a66a332f9c5d4ff869f092718e7285d98a77111d8621f7bf59e4ddbcd869e19977024f035781e7b106d5fe8d04712da9755d619b0989a5476ffabcc2b5338596f1779021ed8f8a35736425083d17f20f47040275861141210b99b240241c15186b0c540afc6a0f6302159c39dd8ac4d5b3003e3956da8e1343ea952d7d62f2e989dba6f4a853a9c04cbd6a55476f7b46fc13423eef6c1537a0f1f65b379a231c59538889eb86e764a1511f7d0a9947e6154cc1875aff59a38464920e950ea263efc14ac8365c104d334428e0e2533cc261821d8070e6c03c692ae3d532a6fbbcb452c0fa79d380dcf49004825fa9846bc3095716a0907871f940636a9134642bc5d075d4b01d8086c0496f52422d486a529800a06400bc166918c503d33adc014c7519918a9ff8e859e5065a7a2800f321429e9c018713bdf1b20dcc5044de1782e773b1d811a46c029a4b224fc879ca9a0bb6408408f4bef0785af83e971af52e49723a750d7820d996f251c01017cc813fb1c606dc268049e8d054ba3616a2b8738894c83076f3a71ab5751ed6983f133d750b814cb68ba35557bb53d20772b5c8a5accc2e23f287bdc0c25d2065e08f11c420906a986ba6ff4f66767fa5d9871e016494a1a5a1b9ea90526cd2193436275c53c152914fb8a606492141f69c0d4a7a5abb2fc571a4dec6345ffcefcaaaaecd03d82f091c5574b952a9bab1b953a6bf7887e56cbca5ec0ae11692b3519a6dd3d307ec8c6deb59ddfa5393128fca427453a4dcd082264927729f22c71c98a8441a6d9cfe6c2cdfc2b3aee4bdefaa91f279e7cd60e89a3d220c2f678fed39b02fc272b776a4aa6a37b18ce304220089e1995ebc1a092a95742d924923a3ee4b4c6a82395e5e7e79fa64e864dab5644f46c26f48e07122f9f12d8e4c8f4c6dc71a9829764ee24add95363b1e72d354a3337dda34d87e8d199950d1a7da146b8f2559340768672ae079df4f133fd0496c0a268fd4a6c249e09bc0238d638fb043f358e323b6793f5e4a03e1d6bff2784fc232ca63b38efa276e8110d3aa1a2643cfe341243c507ab6218a10f2bce619403a16eb4a4497a5909327aa39b2025971f3eb9e54205e3db376b17ffca15f4704a65553b72192fab28f274f998e1d8bac1981190b312f804e59f98ab8928ce97c9ff4e7266e3792bd231a89f5b64360a03b0291067500b448bd921c91ca174a686b5abea2f6ff09a72054bf08ead4583150bba0ec3d095df9d17aa999580a2b58223b2017bdc5a1708c78941bf5f6e3df6b90060c9283013c5dfa049ff8c488a745f9123e5f9b03d896a4d75cf6c8e74e8a9205735d5692d65c64aabc8a2d121c6215ffef8886065771a42406d09401f7a2f9185bf90ecc0f0dcf0d040fd23a640792a1298ecb565004bdc8f35dd7bf113d9879aaf0ba4f67fea6ce4df9e1314eb21ef6337b62785a5e8016ce72db32c975f9596b87b27e7d1fae8dbc87e876507449dceb082ab81bd109d7df3e103b5e81d996978316d08a7bb1e1bb9ea7df7953458bf5df5349c28d625bf09a79f8362a28d75c01d85dae48f22145e9d2ab0dec707c78e6380fc572302eb537559215c623ab9e2949c53896bfbd5c928875f846647d1fca5d90c8b3bb4530a1e067d61033a917f36a0db626b9a5df27bcb234e8949b7416f191b3581f16284f9e1d9f15419bee67b80ca7f7bfd4ccf3adadf55f72ccb6765bbef203b22e6fa083f2603fb9e724af66d1df0b1b6eef35321ac61615c3803c52ca3e895137ac8b0eee1d5828bd5dcbf7d45375b55a371838d580d4ddc9a824601dca7082bf4612511307cff1e397aa2b17f0cc6c83bfdb6ec5f5e26513ad4e5facf235147f4cf1beca50dc317e977c411ea44a55cf3a5a3806a252dd713cb0f8acd95ad58de0ad3ef55cb4b10dce3f32a718e51db22032a0f17b4681bc171a0eeda4f42c0d6abddf94c8aab0c57c9e8c47b63666db011ca8bbec6c192eab29ea78107d5115b49c1b12ba7c2900de91d8d43149a983b9c277b2539584ce44ba1630d9568ff7626dd665d77feb55bc41c299272c0ec20a1a2f6f9780b5c2c7e4ac0178efc75c1eea4533530c780d6375b117f1aed99aae266b5608b90e0981a99be68011045d08274e92d1e18b1c69fd8005337c0f4557e69562af774e8aeccafd2c5720cb913cb66edbe5a5a8ebc5d2f38f09c41f9df6fbcf0b187f98970ce936f8f3991162444003219bbf70680be80330c02030c4eade3e40862443f674afaa55193aeecf2bde1d4f7d63db32c5891b6da78e2e8997cc389f27a546888795e37dc0a3055271c2510c120cd9624b46ed75cf9321550d3b7befb1dce813256824ab798cb2bb8b1bb85b6fa481ceaa08205cba86abce57a3ce472aeee953b34622bf221855cb4726ef0c69be886c459f4a49813eb7b4d62672efaf364f6a957f0b80417fc2f2fb7b3a6ab26483e4ce7d1b9cd620ba92649039ff9f31bb8c38141a1ffb1e68a12f2e33e2ab9428dcc90860c58151139b08d7e004866b1c61c5bfdffcd18a656c59f04dcd11dfb8d024ff419a639b888202799afa5f578e928d130321689f57d9ce238073f909cbd6d0f1c6c17827dade8ce920c2b4124b80ebcaf62a0b1449525ebdd94a103c20079d1ec78b8c4d8519ec78845c85b4c90fe5e6f6636b3a6d7b96e1fbe12cc863726f39164cc436bdc81b6fa59a6d03ce688a91678563ae96713caef8df3e2ee927a56783f236198a7dddb994a79d85824f8e9503773c2a37a115de84a0dc3233f6536d25886ee51f7cf60b11025219c11d876b385c2d2d14881d9ac137b0300be847ffa86b572a4db372765986d2bb2bc5674c055f070ab04f9b52d3a02b0df9a44889b40ff2bcb20ab8667dec410aab668cf95e06cf75870bf95d8c8dcfa4fb40908dfca2fd3b82421a59c55be18f192338cd4638ca1bec616b90f013f5d6e0b10c35b7917581d91306e5111fbdda7d8093186d711828b0c7ea199104961de0825d2147b4e6fe1c6e2cbe4de09212f006905000a5417f9d85b7da73d477907285690b47908b79967c876e45c8e617f862d0a27c006c3a5041a26c9b7636eaf0cdf6c7e3fc4b58a8ae22620390f01be0bcc55068b1146b34099c8f5d49f65963c3bf406bdfe083d70a63fb54065306e9379556b8a17ae8a7c660da67659a67d24c862070a4e48878c16b506a7f3fb4d55ebdb96d06f0e990c0934d352033362083454091b702b0b8f5c128336da4423e6eec95d91979efda99b477859df67e30225a6bedbd41721cc81d65beed95490aff9b7409d2cc521e5e213a973fe0aa8106c71507373d2a4cc5c52a6fcd3635e09f7da4fe62e5443b600c4fd99bf4c0622a3246d86e5e29d64166c1df19ff74d687b873a42d7b70dc083b37dbe76ef1414089804fe71222444febfd49f0d138061b835ab48421b1db6da4528f7c574b11276a6c1109670d9f4edd91481b231ea7ed7a11a9fec3af512f4198e866cab141940a6e702041c5b3e3fdfdcdefa95bef70cb2150a77bc4efa69f393f16162512b6cb2631d1be7a80a0832061a3984c71d0ed9a3136eee5ca638cb8851995f1d05522e6b740c217cfed8e6d60b2e8f8c9040751ecbb1832b5a029b8659b936ac2ef9701b1b86fc46c136142fbde9e7fc76e96b132586d3b9bbb23af9327ccc7c03bf6d631175b7880496a1f1f3b5a735c523816c6ada2b4d56037c746e4beb8718d3a8ff5a6bbca35212097b073304e9057e35d180b8a52999dddedae146f7f618239baefc8fba20b17863a81c63d1bad8cae1b91fcd8fa2a318ec66ae66aa0f3e45036d166acdffdff9dc67acad7092ee665815572df1de0a4e024b98d7569832142cc2c5c2e27aeeb4581218f2bf6cb825f4ba8a57a983220a925084a16ba62c5f8fd2d7ff838b357a17540078604245b93548e1d5d817d689136dfe2c96201eb5feb7bd680904b50cfd0af0d300f6991e293fb65d966c6514867ccf6b15db08144fda9fc4bbd15a0a96eb8025dcae069a489d81b81f2a91b1e864442e15282e1dc0e59f77338b87cfb0ce9d5170f89d144048289a9794567d21e5163d38cc33bf20f7409faee06f897d4c7d816151e4370bc71414d222d406a63986064b0911f8b1adce134b8dba2421c62e3dcb454d2b8beaf2390783c1415f4684ac81d61cf6fcd8591d2b32cae3778c3e1f5218133c330916764d6fb1ef8350e038165f0a3801665bba4c4d8031fa93587dd219aa51ee94227323d15ee4b8cd9db1cf3a04127c0232c6af964a8f68edcf041225c22092bee1ce04dbc3c3d309f000920339d99eb53be9f457e7bba3df00b9abdad39db4254de5a01b01fee14f5d1d83e62c9517fa9ffdcd670049f582d8bd4cdf907e6cb9350bcb26d04c3bd222bd651008cd4ee6d464a372bcc213fa5445b375c8dea7fee9000761b5bbb6dd9fc67c2c081c881c13847b2f42c97f50d4ef8c04c9c3125971890cfb11ccf2a805684c5436659196d6123e398799fb0580c0e5455a9ed66bce0ef6e5e498802b5d1fe3bb1f4276ae29ff564433471870d01f6411965875d024f129996bcc156a5d8f30af306d9f836c52f9ffa407e533c0755eaf6d10ed64d5c1a05ab4ca26ed3afdb3973a75ae407e123b70b7456ddb48cc6419b027666f807ee569ad1872b5c4bcf8d3299b7a080da1e0f84223e9888c745879be631fb70be4617a4d427b15f2a360ee0341b8c2e5ae3cdcbeb0f696473a4a4beadc011471e6cf8ebb8cf5e709d9d623044a8a574c13baed91c888e8548956527a90b4c56d170a4c13df400505d478660610ae16d6b95480bde73f016a039f3f6df579a8584ce9fd5e48b12ec37c6b842dc28a71f90acd78c784daeb6f689861903e1743bab45cda260f055cc4fe83ba1db9ed33fe9d555ba9ebb77509fa5ecc47d9cc4401e363e6c5e556ce9cfac677092aada5d96256781fd7ee65cc4594b56d1669d25d763a144d940b16317cdfd4145be26886807daceb6859ad0bf1d806ac66cacf547fcf4867664019fd940c0737222a77f1e5f2f74a3ec0722a0a9d4bde81191874f6b36ebda1cf87005d1695255a54aa573f51f793bd5f17a70fab0d4e46e18b619f0302669f085be38717953ffb4e8d0518f0feb91aab836979eb76e5576b0b36133bb35a4381588111974e26b5f75544007bf84c85f82ad80969c6b5e96bfa8add8d91e841a13924077ad503a540ccb0cd456d58a707c63f4547f8ecace461c9811b27d6f20bf20a2efaa504632a5567fb5be746cc063bc26050f2a30e38737410470e54baf191a57988aa364ef421175423ac36f695711025041688db0be7e1792beb05a02bd1194c7e233fdbdfc747bf754c6b89b606af91a0800054b0a8849ad851da2da5bb55bda4780597d8809762e72c5875816ed3aab93a2f15a7a617a16da4df942be6d9fd5c3417c18719638b345d00a5a8446d107e008085d0c3da37a4c55e31846d0bc50692052049f7d6bf1d137b7663dc48d3ca0d01d0c0c9bb06ab9f8e915b98b021166f31c1fa4c8ff6ac79b5a79be1545d1de766ba507b9ec53d569b7454af7e9e30bb3c0f30022077b62222aba2cea6ee8cbac659715770010b5d77d19b40e8768af1003e4f266f5f6ea99666df47909d12330457034314115ae4df06b64c3b13bc2412bc60eddb0cee83a62813ec41aef1e682dd10a08f80e3fc82756f4199ed19012b3aeda41e4bfc01b4d5902cc1a6385f2dc1237c3a1644e0fa96b8906ae8b21e1446a5a8d46715968c814a196f98fd22526d37ceafcf9d2e0005b9d4c45a4c4320977db2a5cd5a1b7266bf898444455a374ecc8ae252eb5ce3ce9ab73e02e96723102fc2119faf9b40d3bd944429f6f42b2fa150a89001df74164d723d0c4eb513a222330db9b0835c206cd390fb0055978adaf40d7d8f94ebc3241abafcdf362cb136bf2ad27631986ea0d33c82e8c714898a0531144d7734ab79d85d333d24041c836a404f4021a1c9cd492bdfb63eae81fdb24f92e65dbeacf08388d7e61b30cdbc6720e0e13a189d691831f0963be6111c5f79d97661fb746b2cc75b25d3294e5b5c824f11ef93e51302d95226f8f0fb696392d51b0609515a3267c987890b567ec12b559c82046103e9effedcd52b050afc33d4ea3ee6707c47e5a747403a09ba739bd7e54b2d34909ac277fc33c9a20acfc8d9d22bf290b89f76ee7118001f2b7b0acd0b8060a5387a4e8cbe5f2da634a486e69b5e3fa4c436cca458811ce152711ba1d203802fa68c5cedfdd132bb8ce7afd2d7efa52b466e12bc2f6f231c0f2163742cd7be86d473e2abec5daca31667dd9eb6b2d51a3ccd47c0d2a10434e13c5cffe91d01b3538807d9d50f6d8b14dbe5446f7c6c0844b17655d2300a0e786b702e4a49783091ce1a31b55dbb5efc24d97e448b60a991edb0ebfe4509c769b8dcf08789570613d3b12ec79e8458d3ebc530199837d4812baf86d1703146066d1efe081c36880a0a3fb6b47a8b2d475a572b90f18f629ef909cd07b52350e765c40cf6eb173402a7d31df4e267df211ebf3f2b9317a9f30d03c2c8a81f9f42957076599c7b251211efdbf2c76a4601ed606de5edc819ab7d614e39523280886a87d6bb2e4dba43005559edf6005d95b4750dae545ed5447816a01db600092ff9db34d47df16bf6d84079de9edcb9d38d9a78ffc4c308f6468acaf32e2780d0e5d688ff111107509eb314bdd436a7259d0258d4fd5b03887e5ce7ee29299c0cbdd49b80c62618efebe80d6ecc62506813df5e7f58e14c9040c84608ea1093d4fe61e86a882b9f03ef45781a019868977e0a625ce041a3d1d9ca1b196c00ba9e119d2622bdffcbf5cd7d49e9f93a93ba03bfb6ba82aa4174bdb90e60943f53752f9581877d0db52ad99aebc125c776f72beb003f4a19b68cdc26daae8c2f343e7177d730ba6df29bd0e5082671bd1c06b51f1707d6de4de2d644b3465235619ad80008a883b5f7fed06ea93694802361b30172996612689dcad7243bae1dab7d3cef9edc3835f7645f5288d8a580049dfd718d35162dd4ad24a00f89d42af1538711771bb4356c0b51264fc0a8e0d34714c380ec7ec3af10f1e5e0506606a66fca5ea0238c4a065eb08ba845011ea79e608edf03aec8da6c4abac695560a9e64114d48bbd3bcd84194f44798df39eb2ce87cc574b627b9fb1cd3e6791f2b5e8fe3f296650ca547865a7660186702306bff2f52b08609519c5025b0706c35ac4c02c88a79c89d78aa2b2a21252af5f92c1fb76e52f458c27e7a966f270a22e7cb8c6375635d25ce5c489fb91a758173395de463e024b438594396780d00320d1e4ac29b5d70108dca016544e85e8ba7bff7000767eb34f6e29a8041ea4f26063a6206f473eefc59d7aaae06cf0ef10454eef21cf247854c479df2c0293e350812180088fb03602b05cf4271e9134b8232f0ef3ba59c763ad98daa65d110223772165c36df0d07c964a3366e94f5e755536ebcde58037217ca2aa556d6f32f50e1488b80aea8f461f2bfb90ee9718940857b6cd6743d805379ccec9fc186041199097f3ce3bfa913f3a3e4b3b3b8040003ba7652b64f51a8e3987d8e0b9405d5d3375675445fea6fbef8c0e97593447b98d4e544df5ea218aabded4bc46d3e3b75606aa2110b0996cfdddbc32b5398b2267bb747c5781d0f3e674826ea9421a2461475e26eac855d4fff95dd7a23f858f4725c8199bd5228292fbc1bb1a317465716dd1a1d0a513f091be944f65675393fb108ed532e8cd967af046165383a7399276cde714ca2cbf560b4dddb47cbcbbd9b2c75e1223b36a8a34cc4f4130d03cd911c60c32b7837eebef591cac15d4e5e19997fc0ed28e88c6c44ffb6d839f9e1a7f90b5e3a64428aa575c84f1b4c6c71ef7e16221f57305fd71591ea9219ed7a696801e74372cff621b991709ead1d173365bc10973aa20ff83d3779ca314845de7d8e8d578f06284e1e1f4b1f96202b8da66af5d204514ef49aa0f2c10d86cc35ba5989019244fa94bd2fb84d10921a597a2c729585c9060ed2472b4306c55923577cec2dc2d3907e9ff1c5b681b876ce9e09fff3d340c4b6c87d913304f19cbd76e7d3e0c8982a039e63f9d5d7153f4d872e64da906eb78f1d084aff0cae5154c70192e3fc9092086f642e617afc440c4182e90d4ce285862d555112252bcb7bdb488a125ca3a886e356c75e95b3f46478080d22be09d9de643c24be2cf4033e9bca9ef021b0dd0709337899afbf082d261e1820c559d0d36c154fd614acc2b1a1afe2e4c1583e7cb145f85c699080b0db4f5130fde1443f0986dba734eb1defb418c6cb05b689f8571d0fd9a33f0f017410b076db4a0e463b2c831a23544fdeba7052622c72bef8ed8b6f646e9dff8336cc0246ea8d74bc8675ee122a2332f91343c62520d42bd12c084dd8c6c5ac3dd0eb0714476c5d144771b9291fe876e9a58dbd3feb701815ece242078595f3049ecea948f185936be5572ab11308244a588416fb82e23fd77f54ea6ad6093f50fc4dc2da72ead915f37b87a52d82516e8a712e4a2dc836f8be5ec7a7387a8a234a14bc127003c835ed64a3da2341a3a6c1691f89ece4813aaae39afe2a8b42723ecd0620337396e3889ad0e63b819c8a2ba89ec367a60986f86b05fca257ef4490baa9e79fffdfdb252181583cc1eda967de3dda06a9af82ac74b26fa7b619745f9554cf8e6d861f32190711184c875519a0cb8b599101801aa1a27ac41ca9c9c6e97fd672c7be4e5756aed2096ecf0c9df5454eda954e89c8030a427f322b45d6047d9994ee52ac41301b590227e34c6c05dfd16858acedba8f70d32b86655876ae0b8520ce81953ae65d622b7eba02756c04f8793fd4f344a1790b089b994f2f0326bfac70df741b9c6f1b212f2836e1f9f43080aa1ea5e7d11a71c9ff8604317cc8ac9be4c0cdc3b24aad385f1ffe738cf7313c67c75627713ab167bf44069f8506efff24443ace9aae4a25c037aa62d14187d4fc4a26dff5db5e84dc2f70915e0ccf75c0742f618e3cb020d3ec198a0ed2652e03f682a69d5e4369eaea6c5a84db7ff645335d1290d58838c03ecade99b520b5bee11b9f1037769c5cfca9ab8dec18e68cf375f7b557962b4f1f45e71a546b275880061e8163bdac15788f3e480babb97689f05ddce9180e8beff7976c55bb081a571f45f5070468b80d6ebfeda265dc869049a55def601188e40ef84679c1d70a719aaf6c478e9a36dae6334c97f0934964a1c5b285ab0234f2db90dcf25b09adc56342e51c6b66f876053d9dabc7a6101c859521b07e3bc18a7ba8f91fb47a430d0d45a870612f4d1103abbac132ed53507dfc4769b50ed0a16cbbb398e1e1856599d8e9a6fc05bacf5536a9cfa0c6bfebca32aad22c9d1b68ec12119543e9ef78f0a3815ed3346f0392a225fe775c66fb6f9da4399d197665b4aa2a5c575519bd712ae80d70260dbd7e1360fd07ab3120b18589b8780f9cb0a34fe94de5aff7676713ddfc6bf970ba1d2d3edd5f51baacefc4989e8b2eb926545298f8b0ca913e748f956ced89e40a30eaa334cf80492587102ab8f02557a0e998a1e676518c8da59800829654826da82931494192e88cd6c3eb6b4d3a913a4a7caa4f7df80a463231f8dab574cc0e473f1bd148f5def2971006f8eea016406349b3dadc9ab42ece4a7955560dfcff77c4b4fbdff50ccc2e13a4fc8e9ed80e15f700d6084cc0c31dec99346e2aa60c8d1cad40a10d63f10de675185e1c6f5164903cbc0565e570ead478dd8db11059a6e36f5f0560b0d45786ad099c9cc0c9086b03cde4cba1d5548e6b1d3a689a20b7e802354fcf442bb22e4b0ed73c8a15c8ecf0821f465d9749e4cf0542e9cf903310650d3594ecae636dfdd2a08fd51289e2823653d6fb6af82a0b68b671d043ba20731df4bd71f1b34b9af4cd80c52559a235235bec039cd50bc559297721b8ebafecdde2ef2a2df1ae54fd70b9f630b2ac4b0adc3582dd4e0ef5cff09880fbeebc2632eadabb3b7ed8a55d2cac45dd17ccf751c3fc876e090be6957cbd6c33bf459eb331bb29182a05e3c857be1f3fe04e70ede7df19333119419eeb1c4d19faf115de354e396f1603df73d2a44e58712252bdb93efeded4e3c61d2b8526f425c4cf126a264c780f9cadb49412addf3404f8448e99a508a8f90dbc6597a00fb585b0daf459dcdd787e4bac6400ff62161b3b3d519521f3ab45af780c2ffb4018ac080b56bb3a838828dd7e42383f99c201d30e6579dfe4dccfb1eda378c4dcdf93e200c2da170bc1e896c5048c8bec1cb50dc37370886e8768584b5169c2a89145cd1aa8436ade8c9b8db8b005025811d5b20bc87b7993715f939aa66d6ef1930203b05c0a2b36a0a64c2c4037ba4c757f1966629915b213618a8445c3ac22be3fc4de464d104013944d7c5d8d26a751614ffefe03ccb19ce00d27c0283390512cd947937926cc41bcbc60d98e1a1916da07bc9dce228816c7710551a40469efe5c06f4ef99408cbd2053fc896fdd7960bc370d3b785829eff288448ca5d4214a584a6870966ad241e8186eaad435d0c92f0354e957a840fb1548b334c4ee87a98002d65b1b5c5bd86a6575ba3f74e73976015051a4e632e07311b0651c6e2a4ebdf27b1f9ab8bf5d7baa50cb572e468200a6dae14c4fbc38aedaa2509e4f38cbb21c5c1affff857be9c40540311b8e38af6291c2ed6877f9e115f3eb64c9c7e32de1f6dd3679b5c0b42007531ddb98d173a5ae2c5024437f1093b27c1060a712fee03db586acd88c4f79dcf99ecf85e7e3edbaffddb6e9a6704962a01c76e0146952f4e8f8db781e9b598ce0301001976a9146a79c6b7b8d6875fdb33b17fa74d2402606007f288ac'
        }
      )
    })
  })

  describe('buildIndexBuffer()', () => {
    it('should build buffer for short value', async () => {
      const value = 'dash'

      const buildedValue = buildIndexBuffer(value).toString('base64')

      assert.deepEqual(buildedValue, 'EgRkYXNo')
    })

    it('should build buffer for long value', async () => {
      const value = 'qu1ntup1ec0asta1'

      const buildedValue = buildIndexBuffer(value).toString('base64')

      assert.deepEqual(buildedValue, 'EhBxdTFudHVwMWVjMGFzdGEx')
    })
  })
  describe('getAliasStateByVote()', () => {
    it('should return ok if our identifier equal to winner identifier', () => {
      const mockVote = {
        alias: 'pshenmic.dash',
        contestedState: {
          contendersList: [
            {
              identifier: new IdentifierWASM('BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp'),
              voteCount: 16,
              document: ''
            }
          ],
          abstainVoteTally: 0,
          lockVoteTally: 0,
          finishedVoteInfo: {
            finishedVoteOutcome: 0,
            wonByIdentityId: new IdentifierWASM('BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp'),
            finishedAtBlockHeight: 24407,
            finishedAtCoreBlockHeight: 2158202,
            finishedAtBlockTimeMs: 1729411671125,
            finishedAtEpoch: 5
          }
        }
      }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: mockVote.alias,
        timestamp: null
      }, 'BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: mockVote.alias,
        status: 'ok',
        contested: true,
        timestamp: null
      }))
    })

    it('should return ok if we not contested', () => {
      const mockVote = { contestedState: null }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: 'alias343',
        timestamp: null
      }, 'BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: 'alias343',
        status: 'ok',
        contested: false,
        timestamp: null
      }))
    })

    it('should return pending if we don\'t have winner', () => {
      const mockVote = {
        alias: 'pshenmic.dash',
        contestedState: {
          contendersList: [
            {
              identifier: 'n4ay5zy5fRyuqEYkMwlkmmIay6RP9mlhSjLeBK3puwM=',
              voteCount: 16,
              document: ''
            }
          ],
          abstainVoteTally: 0,
          lockVoteTally: 0
        }
      }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: mockVote.alias,
        timestamp: null
      }, 'BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: mockVote.alias,
        status: 'pending',
        contested: true,
        timestamp: null
      }))
    })

    it('should return locked if our identifier not equal to winner identifier', () => {
      const mockVote = {
        alias: 'pshenmic.dash',
        contestedState: {
          contendersList: [
            {
              identifier: new IdentifierWASM('BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp'),
              voteCount: 16,
              document: ''
            }
          ],
          abstainVoteTally: 0,
          lockVoteTally: 0,
          finishedVoteInfo: {
            finishedVoteOutcome: 0,
            wonByIdentityId: new IdentifierWASM('BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp'),
            finishedAtBlockHeight: 24407,
            finishedAtCoreBlockHeight: 2158202,
            finishedAtBlockTimeMs: 1729411671125,
            finishedAtEpoch: 5
          }
        }
      }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: mockVote.alias,
        timestamp: null
      }, 'AjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: mockVote.alias,
        status: 'locked',
        contested: true,
        timestamp: null
      }))
    })

    it('should return locked if winner identifier equal "" (empty string)', () => {
      const mockVote = {
        alias: 'pshenmic.dash',
        contestedState: {
          contendersList: [
            {
              identifier: new IdentifierWASM('BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp'),
              voteCount: 16,
              document: ''
            }
          ],
          abstainVoteTally: 0,
          lockVoteTally: 0,
          finishedVoteInfo: {
            finishedVoteOutcome: 0,
            wonByIdentityId: undefined,
            finishedAtBlockHeight: 24407,
            finishedAtCoreBlockHeight: 2158202,
            finishedAtBlockTimeMs: 1729411671125,
            finishedAtEpoch: 5
          }
        }
      }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: mockVote.alias,
        timestamp: null
      }, 'AjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: mockVote.alias,
        status: 'locked',
        contested: true,
        timestamp: null
      }))
    })
  })

  describe('getFinalPoSeBanHeight()', () => {
    before(() => {
      // the resolved state is cached permanently; keep every case independent
      mock.method(cache, 'get', () => undefined)
      mock.method(cache, 'set', () => {})

      mock.method(DashCoreRPC, 'getBlockCount', async () => 1000)
      mock.method(DashCoreRPC, 'getBlockHash', async () => 'blockHash')
    })

    it('should return the ban height of a validator banned before it left the list', async () => {
      mock.method(DashCoreRPC, 'getProTxInfo', async (proTxHash, blockHash, fallback = true) =>
        fallback
          ? { state: { registeredHeight: 100, PoSeBanHeight: -1 } }
          : { state: { PoSeBanHeight: 500 } })

      const result = await utils.getFinalPoSeBanHeight('bannedHash')

      assert.equal(result, 500)
    })

    it('should return -1 for a validator that cleanly retired', async () => {
      mock.method(DashCoreRPC, 'getProTxInfo', async (proTxHash, blockHash, fallback = true) =>
        fallback
          ? { state: { registeredHeight: 100, PoSeBanHeight: -1 } }
          : { state: { PoSeBanHeight: -1 } })

      const result = await utils.getFinalPoSeBanHeight('retiredHash')

      assert.equal(result, -1)
    })

    it('should treat the validator as banned when the final state cannot be resolved', async () => {
      mock.method(DashCoreRPC, 'getProTxInfo', async () => {
        throw new Error('service unavailable')
      })

      const result = await utils.getFinalPoSeBanHeight('unresolvableHash')

      assert.equal(result, 0)
    })
  })
})
