const { describe, it, before } = require('node:test')
const assert = require('node:assert').strict
const utils = require('../../src/utils')
const createIdentityMock = require('./mocks/create_identity.json')
const dataContractCreateMock = require('./mocks/data_contract_create.json')
const documentsBatchMock = require('./mocks/documents_batch.json')
const identityTopUpMock = require('./mocks/identity_top_up.json')
const dataContractUpdateMock = require('./mocks/data_contract_update.json')
const identityUpdateMock = require('./mocks/identity_update.json')
const identityCreditTransfer = require('./mocks/identity_credit_transfer.json')
const identityWithdrawal = require('./mocks/identity_withdrawal.json')
const masternodeVote = require('./mocks/masternode_vote.json')
const Dash = require('dash')
const Alias = require('../../src/models/Alias')

describe('Utils', () => {
  let client

  before(async () => {
    client = new Dash.Client()
    await client.platform.initialize()
  })

  describe('decodeStateTransition()', () => {
    it('should decode DataContractCreate', async () => {
      const decoded = await utils.decodeStateTransition(client, dataContractCreateMock.data)

      assert.deepEqual(decoded, {
        type: 0,
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
        identityNonce: 10,
        dataContractId: 'GbGD5YbS9GVh7FSZjz3uUJpbrXo9ctbdKycfTqqg3Cmn',
        ownerId: '7dwjL5frrkM69pv3BsKSQb4ELrMYmDeE11KNoDSefG6c',
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

    it('should decode DocumentsBatch', async () => {
      const decoded = await utils.decodeStateTransition(client, documentsBatchMock.data)

      assert.deepEqual(decoded, {
        type: 1,
        transitions: [
          {
            id: '7TsrNHXDy14fYoRcoYjZHH14K4riMGU2VeHMwopG82DL',
            dataContractId: 'FhKAsUnPbqe7K4TZxgRdtPUrfSvNCtYV8iPsvjX7ZG58',
            revision: 1,
            prefundedBalance: null,
            type: 'note',
            entropy: 'f09a3ceacaa2f12b9879ba223d5b8c66c3106efe58edc511556f31ee9676412b',
            action: 0,
            nonce: 2,
            data: {
              message: 'Tutorial CI Test @ Thu, 08 Aug 2024 20:25:03 GMT'
            }
          }
        ],
        userFeeIncrease: 0,
        signature: '1f2ed46b4eb1d77694fd3f3a783dc362295d779e701802aae5d30dca7d623c411e5fed34de9f437ae99514ed1ec0a1757c925888c15aa9c62095c0285b8765e261',
        signaturePublicKeyId: 1,
        ownerId: 'woTQprzGS4bLqqbAhY2heG8QfD58Doo2UhDbiVVrLKG',
        raw: '02000e09e4140f8b7777810be56c47f0ab5cbd9bed1e773abd9f9fdf2fe67a669ff7010000006008b85d9826e770ad21b6d585f010f1dfb3b3f2adc6492329bbef8fdec1b1d702046e6f7465da5764f89025e9a5f680633909db58f6f7f6d3582c445393f15aad58821c9f2bf09a3ceacaa2f12b9879ba223d5b8c66c3106efe58edc511556f31ee9676412b01076d65737361676512305475746f7269616c20434920546573742040205468752c2030382041756720323032342032303a32353a303320474d54000001411f2ed46b4eb1d77694fd3f3a783dc362295d779e701802aae5d30dca7d623c411e5fed34de9f437ae99514ed1ec0a1757c925888c15aa9c62095c0285b8765e261'
      })
    })

    it('should decode CreateIdentity', async () => {
      const decoded = await utils.decodeStateTransition(client, createIdentityMock.data)

      assert.deepEqual(decoded, {
        type: 2,
        assetLockProof: {
          coreChainLockedHeight: null,
          type: 'instantSend',
          fundingAmount: 30000000,
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
            type: 'ECDSA_SECP256K1',
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
            type: 'ECDSA_SECP256K1',
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
            type: 'ECDSA_SECP256K1',
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
      const decoded = await utils.decodeStateTransition(client, identityTopUpMock.data)

      assert.deepEqual(decoded, {
        type: 3,
        assetLockProof: {
          coreChainLockedHeight: null,
          type: 'instantSend',
          fundingAmount: 300000,
          vout: 0,
          fundingCoreTx: '7734f498c5b59f64f73070e0a5ec4fa113065da00358223cf888c3c27317ea64'
        },
        identityId: '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF',
        amount: 300000000,
        signature: '810cd0bfe02104362941d35bd05fdf82cdc50c3bc8510077bfa62d47b68710',
        raw: '040000c60101ecd6b031477f342806df5740b70f93b8a3e925bbf2d90d979a5ed162a8d7d5660000000064ea1773c2c388f83c225803a05d0613a14feca5e07030f7649fb5c598f43477940fe3dc8e934b89e9e97a96cf4298da3efb23d8a17d52c759561194d3000000a5e81597e94558618bf1464801188ecbc09c7a12e73489225c63684259f075f87aa3d47ea9bbbe1f9c314086ddc35a6d18b30ff4fe579855779f9268b8bf5c79760c7d8c56d34163931f016c2e3036852dd33a6b643dd59dc8c54199f34e3d2def0300080001ecd6b031477f342806df5740b70f93b8a3e925bbf2d90d979a5ed162a8d7d566000000006a4730440220339d4d894eb2ff9c193bd8c33cdb3030a8be18ddbf30d983e8286c08c6c4c7d90220181741d9eed3814ec077030c26c0b9fff63b9ef10e1e6ca1c87069b261b0127a0121034951bbd5d0d500942426507d4b84e6d88406300ed82009a8db087f493017786affffffff02e093040000000000026a0078aa0a00000000001976a914706db5d1e8fb5f925c6db64104f4b77f0c8b73d488ac00000000240101e0930400000000001976a91474a509b4f3b80ce818465dc0f9f66e2103d9178b88ac003012c19b98ec0033addb36cd64b7f510670f2a351a4304b5f6994144286efdac411f810cd0bfe02104362941d35bd05fdf82cdc50c3bc8510077bfa62d47b68710'
      })
    })

    it.only('should decode DataContractUpdate', async () => {
      const decoded = await utils.decodeStateTransition(client, dataContractUpdateMock.data)

      assert.deepEqual(decoded, {
        type: 4,
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
        identityContractNonce: 4,
        signaturePublicKeyId: 2,
        signature: '204b16deb1faf827d76dddb4228c717c09baa153b9a6c82952439191d7dddd3a171385ef31482ef7c7950a95605fc4b7096ff50d8c4aceb24f259276979f16b188',
        userFeeIncrease: 0,
        ownerId: '7dwjL5frrkM69pv3BsKSQb4ELrMYmDeE11KNoDSefG6c',
        dataContractId: '8BzeH7dmyLHNzcCtG6DGowAkWyRgWEq15y88Zz2zBxVg',
        dataContractNonce: 0,
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
      const decoded = await utils.decodeStateTransition(client, identityUpdateMock.data)

      assert.deepEqual(decoded, {
        type: 5,
        identityContractNonce: 2,
        userFeeIncrease: 0,
        identityId: 'AGQc1dwAc46Js6fvSBSqV2Zi7fCq2YvoAwEb1SmYtXuM',
        revision: 1,
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
        setPublicKeyIdsToDisable: [],
        signature: '1f2aed7dde98c36f35e1a58faac11b4ec6f84f72cf1529425f30822a09f227216719fe576a1c30361b1cc86a149dfd2eff30f3fd5890dc8d1c8f7789f8ade0b5e5',
        signaturePublicKeyId: 0,
        raw: '060089ab954c07d311e0956d0ae1920e0787e5ce9c17bb2b8476d9a17605c36b28bc010202000500010301012183d7c08fb0c9bf280d0cd299fcdf2359db9bc3048b1648ec3775f190e1c7bd07636f6e746163740021023b63a7e2321db63f5dbd26e08e3aa1da974404fd6b9303903195be10fe12e2b0411f58d5c8ee4e87e6d6fffcfebcaadc030599cc4e18e41f3d7f78bd993666e146973beb1ca57e0366eceef0510e3b55a97db765110d4ff07b9653db237d8a021d51000600020301012183d7c08fb0c9bf280d0cd299fcdf2359db9bc3048b1648ec3775f190e1c7bd07636f6e746163740021026e9189c76f667c774da971d5eacee575acfd747c3ea6ca8af3636f93ac871f73411fd753dbf431f8be55fe5545678c05ca81a1b3cfb676ff85fe22caf0042b2ad84b437c203bf16ead8d3f62f74d832d6ca8a492804340d356f1d003856ca50f170a000000411f2aed7dde98c36f35e1a58faac11b4ec6f84f72cf1529425f30822a09f227216719fe576a1c30361b1cc86a149dfd2eff30f3fd5890dc8d1c8f7789f8ade0b5e5'
      })
    })

    it('should decode IdentityCreditTransfer', async () => {
      const decoded = await utils.decodeStateTransition(client, identityCreditTransfer.data)

      assert.deepEqual(decoded, {
        type: 7,
        nonce: 3,
        userFeeIncrease: 2,
        senderId: '4CpFVPyU95ZxNeDnRWfkpjUa9J72i3nZ4YPsTnpdUudu',
        recipientId: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
        amount: 9998363,
        signaturePublicKeyId: 65,
        signature: 'ca8aaa0ee3861da3579129ada28d1f2bdcbd847dd2dc1ddc9897fba3ba8c5060',
        raw: '07002f99e00e7f82a904c3fbf60ae6b5329ef77444436d022fb0aeb068c35bc7b0c4ed1f6e1c441217d504cf4e5e2b4754890563cd4410dda131cfd2973f03acffdffc0098901b03024120ca8aaa0ee3861da3579129ada28d1f2bdcbd847dd2dc1ddc9897fba3ba8c5060'
      })
    })

    it('should decode IdentityWithdrawal', async () => {
      const decoded = await utils.decodeStateTransition(client, identityWithdrawal.data)

      assert.deepEqual(decoded, {
        type: 6,
        outputAddress: 'yZF5JqEgS9xT1xSkhhUQACdLLDbqSixL8i',
        userFeeIncrease: 2,
        senderId: 'FvqzjDyub72Hk51pcmJvd1JUACuor7vA3aJawiVG7Z17',
        amount: 1000000,
        nonce: 1,
        outputScript: '76a9148dc5fd6be194390035cca6293a357bac8e3c35c588ac',
        coreFeePerByte: 2,
        signature: '8422df782b5e51b8a53ae46fe9b7a9280df4de575f031e58ed527e7a17c1e9',
        signaturePublicKeyId: 65,
        pooling: 'Standard',
        raw: '0500ddcecc8cd40dfc1d88a7135a3f29834ca8788f844bca10349140507905f09926fc000f424002001976a9148dc5fd6be194390035cca6293a357bac8e3c35c588ac0102411f8422df782b5e51b8a53ae46fe9b7a9280df4de575f031e58ed527e7a17c1e9'
      })
    })

    it('should decode MasternodeVote', async () => {
      const decoded = await utils.decodeStateTransition(client, masternodeVote.data)

      assert.deepEqual(decoded, {
        type: 8,
        contestedResourcesVotePoll: [
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
        nonce: 16
      })
    })
  })
  describe('getAliasStateByVote()', () => {
    it('should return ok if our identifier equal to winner identifier', () => {
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
          lockVoteTally: 0,
          finishedVoteInfo: {
            finishedVoteOutcome: 0,
            wonByIdentityId: 'n4ay5zy5fRyuqEYkMwlkmmIay6RP9mlhSjLeBK3puwM=',
            finishedAtBlockHeight: 24407,
            finishedAtCoreBlockHeight: 2158202,
            finishedAtBlockTimeMs: 1729411671125,
            finishedAtEpoch: 5
          }
        }
      }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: mockVote.alias,
        timestamp: ''
      }, 'BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: mockVote.alias,
        status: 'ok',
        contested: true,
        timestamp: ''
      }))
    })

    it('should return ok if we not contested', () => {
      const mockVote = { contestedState: null }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: 'alias343',
        timestamp: ''
      }, 'BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: 'alias343',
        status: 'ok',
        contested: false,
        timestamp: ''
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
        timestamp: ''
      }, 'BjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: mockVote.alias,
        status: 'pending',
        contested: true,
        timestamp: ''
      }))
    })

    it('should return locked if our identifier not equal to winner identifier', () => {
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
          lockVoteTally: 0,
          finishedVoteInfo: {
            finishedVoteOutcome: 0,
            wonByIdentityId: 'n4ay5zy5fRyuqEYkMwlkmmIay6RP9mlhSjLeBK3puwM=',
            finishedAtBlockHeight: 24407,
            finishedAtCoreBlockHeight: 2158202,
            finishedAtBlockTimeMs: 1729411671125,
            finishedAtEpoch: 5
          }
        }
      }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: mockVote.alias,
        timestamp: ''
      }, 'AjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: mockVote.alias,
        status: 'locked',
        contested: true,
        timestamp: ''
      }))
    })

    it('should return locked if winner identifier equal "" (empty string)', () => {
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
          lockVoteTally: 0,
          finishedVoteInfo: {
            finishedVoteOutcome: 0,
            wonByIdentityId: '',
            finishedAtBlockHeight: 24407,
            finishedAtCoreBlockHeight: 2158202,
            finishedAtBlockTimeMs: 1729411671125,
            finishedAtEpoch: 5
          }
        }
      }

      const info = utils.getAliasStateByVote(mockVote, {
        alias: mockVote.alias,
        timestamp: ''
      }, 'AjixEUbqeUZK7BRdqtLgjzwFBovx4BRwS2iwhMriiYqp')

      assert.deepEqual(info, Alias.fromObject({
        alias: mockVote.alias,
        status: 'locked',
        contested: true,
        timestamp: ''
      }))
    })
  })
})
