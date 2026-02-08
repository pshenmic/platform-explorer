const { describe, it } = require('node:test')
const assert = require('node:assert').strict
const utils = require('../../src/utils')
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
            address: 'yZZkv2xhfqoXMgWEDvog9U65c17RzZLrbV',
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
        pooling: 0,
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
            address: 'yTdAgPuFgiByksqV1Hhwgxbw3EdJRKQBwb',
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
            address: 'yRpNvoc3hd66c3rNrPRGubVd9vGUoAVpZV',
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
            address: 'yLRvYtK1GKU3V96igCuENoDNZTDqMueSq5',
            credits: '1000000'
          },
          {
            address: 'yLy3FKiUN2h1NtJr8D4Cb85KEfQVkgCxBV',
            credits: '1000000'
          },
          {
            address: 'yMEyWias3eQEyZJjFXov2hddgHckxf4Vz5',
            credits: '1000000'
          },
          {
            address: 'yMGBpsFMpe8jheCwAbLNCTr4XJHRFstFQb',
            credits: '1000000'
          },
          {
            address: 'yMMqB5R21PtheP7AAgKAniZxzzy5z3prjT',
            credits: '1000000'
          },
          {
            address: 'yMScsdSb8fEEHsEYHCGWNuAyRvY6QtJGfV',
            credits: '1000000'
          },
          {
            address: 'yMVSAUDBTtgX1tDVgaQDprXgtRVHGSN3wY',
            credits: '1000000'
          },
          {
            address: 'yMYxWfJvp7JvvDeaXyFmKhzZMNdZ2jZ4tE',
            credits: '1000000'
          },
          {
            address: 'yMZ6UKi2VWLPkP7aab7mSRj7w46KVntvu7',
            credits: '1000000'
          },
          {
            address: 'yMancpJ2cEGhAALrLQsbPLbH3fgoXBHnxg',
            credits: '1000000'
          },
          {
            address: 'yMjVb7NhnfGoJaoMmDoMwZJb4AL1eQiCa6',
            credits: '1000000'
          },
          {
            address: 'yMokTBpjJ7hwiYbWxt3foP8sjHorgg93FY',
            credits: '1000000'
          },
          {
            address: 'yMwYsfEeiZToU2JovbKZqnQZqkTZxdhGg2',
            credits: '1000000'
          },
          {
            address: 'yNZ1cyWUarwRWJNGiEE7s8uesV328i6iLR',
            credits: '1000000'
          },
          {
            address: 'yNZ6Tu7BYiR8jh6kRJexYAXbzvLYQeS7K1',
            credits: '1000000'
          },
          {
            address: 'yNadMm4hfU1tPBp29uJfzC8oxd1GcPPUBv',
            credits: '1000000'
          },
          {
            address: 'yP4pqSqYeGtWSjZaBfAsKynNgAbDtNQf63',
            credits: '1000000'
          },
          {
            address: 'yP8182D7K9NxmQBrvbxy398jN9KM3rNiaf',
            credits: '1000000'
          },
          {
            address: 'yP9htGD6Zvc1UpDMh4xASFqMXYVAhM6HHF',
            credits: '1000000'
          },
          {
            address: 'yQDfWfdoU6JBma525GuuSZu1xo35oPqt7f',
            credits: '1000000'
          },
          {
            address: 'yQMLwDt3QgDK4s4t7nehYXQQZqY83p2ctM',
            credits: '1000000'
          },
          {
            address: 'yQSdsMLDJWVbiVzmiB4nAwSgT2cRZ9gYdX',
            credits: '1000000'
          },
          {
            address: 'yQWXsMMs9ATvRqzzeoV6K4QR4K9hqfTcLb',
            credits: '1000000'
          },
          {
            address: 'yRHZpq4qVQcbwyqwTUhTD3xGgASP1Q7uMh',
            credits: '1000000'
          },
          {
            address: 'yRLDkUcUnhCkaTumhRjLf9uCnDbXXN7Ui9',
            credits: '1000000'
          },
          {
            address: 'yRRd5NBguXFNp3mcGWUY3TyaU2WVMVDFyR',
            credits: '1000000'
          },
          {
            address: 'yRiRVUS5SSApuqk9tpo3iHAMqeASj1Awoz',
            credits: '1000000'
          },
          {
            address: 'yRk5uXAFoQU1a1KYq1i4yzmUC2bqweiZmV',
            credits: '1000000'
          },
          {
            address: 'ySceoSJ3Gwoy2qfiXShiP3YpwWBLE6f36F',
            credits: '1000000'
          },
          {
            address: 'ySv2CLogbYUBnHVDey6MTYX7mpAM6J1cGZ',
            credits: '1000000'
          },
          {
            address: 'yT1jGGpp22NsvFKS75KNca67BH3E87k88L',
            credits: '1000000'
          },
          {
            address: 'yT7V5riT1BTLHWPvWKqVacrAgCmUoQQ53J',
            credits: '1000000'
          },
          {
            address: 'yT9BLtjQcVJrah76hJbjHMbWPfEUmJkvee',
            credits: '1000000'
          },
          {
            address: 'yTUc6sZGwPGEQTmuX22fpK6xWnaNLGK9zC',
            credits: '1000000'
          },
          {
            address: 'yTVozH4Trw5ZEEzZjpsGXCKxsr1AQqk4rg',
            credits: '1000000'
          },
          {
            address: 'yTxA1HarqB1mk1jkAzCwDgqePjviuvqcVa',
            credits: '1000000'
          },
          {
            address: 'yUm6NVpuRLtbL2zCU2XkwoUBxquuVU4Gum',
            credits: '1000000'
          },
          {
            address: 'yUqYfyabEh4YhBdzDNFvjonDfUayWRDCJX',
            credits: '1000000'
          },
          {
            address: 'yV8xieK8YMgNCMDiSCurBuFEKkfEqwW4Yi',
            credits: '1000000'
          },
          {
            address: 'yVMpAbWhUWMbK7HwM2rjDgmmhysXnQJEmD',
            credits: '1000000'
          },
          {
            address: 'yVWMZMZUsxr1ag2HpVLBYzWQHjuW7sWDNx',
            credits: '1000000'
          },
          {
            address: 'yVwq9cWArNRmvzDaLwdgYhUpxwJSLmBgza',
            credits: '1000000'
          },
          {
            address: 'yW3rHfmHtA8GQxYAC6vS3y4RAs3umdfB4V',
            credits: '1000000'
          },
          {
            address: 'yW6qq9g9GN8WcMmRtvqrpX7UFRJzXfyLhe',
            credits: '1000000'
          },
          {
            address: 'yWfmjfCPToQMyt6sJmE65mwQgHQHSXpvti',
            credits: '1000000'
          },
          {
            address: 'yWo2mo7P4S7GkoQamwCERfXHGAVc8BSWJ3',
            credits: '1000000'
          },
          {
            address: 'yWxhMyQ9kKvnYSk86fbJtmVAQZ5BpotNti',
            credits: '1000000'
          },
          {
            address: 'yX1nE18Wvnn1vnG8FphtrsMzPJJEct6UGH',
            credits: '1000000'
          },
          {
            address: 'yXMKz81VvXebQRWD13Gb3Hn44vph2DcbSy',
            credits: '1000000'
          },
          {
            address: 'yXZx4VDFobvosk3pMmG7ESDC1R9DgtG8Gq',
            credits: '1000000'
          },
          {
            address: 'yXhxMuGneNWTpE7vXhKX98tvazPCiNsEEX',
            credits: '1000000'
          },
          {
            address: 'yY69u7ciejdH1f4BGNAMkZQfPAnsGP7egZ',
            credits: '1000000'
          },
          {
            address: 'yYkQibAJLyoAkH9dzYdfxb79ZJL21B9JAN',
            credits: '1000000'
          },
          {
            address: 'yYmifT5tpKiMa59mBZMw4qL1s8KdVfrJPv',
            credits: '1000000'
          },
          {
            address: 'yZH5jHKaY7UcNTtbAiU95Kvdrta8iWtuuN',
            credits: '1000000'
          },
          {
            address: 'yZjdPezWkG1izgiy6iJ7gruvf96UFhKeTW',
            credits: '1000000'
          },
          {
            address: 'yaJwJcb5RVcunVecj5S3aSJk72iJW5Z7Rb',
            credits: '1000000'
          },
          {
            address: 'yaLJxDuPKcp5w6wA5Vfn37bgmAVrxjS7P7',
            credits: '1000000'
          },
          {
            address: 'yakXR5Gv5hgYPcctDrXhpS1hVb6z1THTP1',
            credits: '1000000'
          },
          {
            address: 'yb6VemqRsVQqfrykp59YayUdMXmJKTLNec',
            credits: '1000000'
          },
          {
            address: 'ybSAidoYahDGajCeHCFciQM4TdnRJYuSHY',
            credits: '1000000'
          },
          {
            address: 'ybShKQAjTMRCwiLHCWu9hkpYfoBtXwhDVJ',
            credits: '1000000'
          },
          {
            address: 'ybadnE5pXBDmSdgymzag53MRCVproTiFy3',
            credits: '1000000'
          },
          {
            address: 'ybpbqxMkyk6iVgFBcgvQ89YnvHxrJKzHQv',
            credits: '1000000'
          },
          {
            address: 'ycDXm8wZUVeV6JSAgXbwSWT7BG4tWPPDBt',
            credits: '1000000'
          },
          {
            address: 'ycDpHouARkGcYhbWhH2a4wyCdVzsqseLeR',
            credits: '1000000'
          },
          {
            address: 'ycSmc4A4unM2q28x2yX9qCw85B8oCxVCw8',
            credits: '1000000'
          },
          {
            address: 'ycTk8aj9kKTVeJwHYjzQnkebSyKCAwh7Xz',
            credits: '1000000'
          },
          {
            address: 'ycYMMYJLePGGcbJdVYBKiHGKypHHcYW7tp',
            credits: '1000000'
          },
          {
            address: 'ydVTpMEcEXp649wKQ7iDhkoxwewc7SzJAR',
            credits: '1000000'
          },
          {
            address: 'ydc2GTd7TeBsiaMU6PDmA2P6PLwBNwy5HT',
            credits: '1000000'
          },
          {
            address: 'ydmW8n953aMJXHDhaEsRbHZfB5sSpaKVis',
            credits: '1000000'
          },
          {
            address: 'yeTNj7UYKtbzG4YrMrbF3GpQXevaM5TagS',
            credits: '1000000'
          },
          {
            address: 'yebRhQKtHp7iTrZ6r1tKL6Wsv9Z6imFVjg',
            credits: '1000000'
          },
          {
            address: 'yebjGGqvWkVBz7c7zpFJz9PjH4db2GwAiR',
            credits: '1000000'
          },
          {
            address: 'yewgoHb5qLavZu2fttmaoCQLqPU77uQGJy',
            credits: '1000000'
          },
          {
            address: 'yf5Z5eBatRAq3i9dBNTeveBEBp5AoGWt5T',
            credits: '1000000'
          },
          {
            address: 'yfGL5bmuU8Y1F7GQKjScRuKBra6CF8hWfT',
            credits: '1000000'
          },
          {
            address: 'yfK9cZ2PQnconkFsaHMybapd6cK878M7eq',
            credits: '1000000'
          },
          {
            address: 'yfPFhWXgA1Tst26BpYK987PVK7ZMC6vN2r',
            credits: '1000000'
          },
          {
            address: 'yfhjXoef2BTVGBmRVeLf28HwN87bhCs2PT',
            credits: '1000000'
          },
          {
            address: 'yfqZ94mpizRaCb2SxDPVAN1CowV2Nf3VSa',
            credits: '1000000'
          },
          {
            address: 'yfvqMykpEAVL4Qf71gWmkxtEtjGYcBTGPy',
            credits: '1000000'
          },
          {
            address: 'yg1PfyFgGyNQmbMGHMFpzqU6bg9kBh8kHy',
            credits: '1000000'
          },
          {
            address: 'yg2Z7YWoDaqt3rUiKRrMKeJYRDvL1SGAA7',
            credits: '1000000'
          },
          {
            address: 'ygako22ivy56mNfcVMBpyomXDruKYoXvHs',
            credits: '1000000'
          },
          {
            address: 'ygi43dcsk4rq6fUNHRWR5ZLcbgezFQKRyu',
            credits: '1000000'
          },
          {
            address: 'ygxTk4iCmeybuZjsHoGJMupNNMogX5PjvU',
            credits: '1000000'
          },
          {
            address: 'yh96RHPCHe2MWRAcpK8weVNZACrwbYSPzv',
            credits: '1000000'
          },
          {
            address: 'yhp9w9RCnNSms4Tz9qBGuWVEYsyJHSDFru',
            credits: '1000000'
          },
          {
            address: 'yiBWcJBvUeKYeTYCCeGAxatjFNZnzWrPwS',
            credits: '1000000'
          },
          {
            address: 'yiXVMYTDuxowjJYCR2CNtShMNc6VGQZ26j',
            credits: '1000000'
          },
          {
            address: 'yiYYsCnWWQGJmy6qExnuc2CCS8sRRKi6Rr',
            credits: '1000000'
          },
          {
            address: 'yieZW4dNtt1KGboTPhuS8XCNDoMzg2RFCJ',
            credits: '1000000'
          },
          {
            address: 'yigRT5xmcG3FNBV2tooXEE4HEfQCybjo7i',
            credits: '1000000'
          },
          {
            address: 'yisEgEhYEVrbcMA9PWE6GM4fxASMLSqkFU',
            credits: '1000000'
          },
          {
            address: 'yisxcvx58QP8p2WMF4VJLsj4ady9iG88yW',
            credits: '1000000'
          },
          {
            address: 'yizbrqY3wP8ih72aq4B2EYmboYMNfxTXe8',
            credits: '1000000'
          },
          {
            address: 'yj2uK3j6cSKAVCELpWy5ScQHkXS7jN11XL',
            credits: '1000000'
          },
          {
            address: 'yj86W4svnFKBuVrXRTiW7i6HdFmcSYoZ4t',
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
})
