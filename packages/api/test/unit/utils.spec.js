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
        identityId: '7dwjL5frrkM69pv3BsKSQb4ELrMYmDeE11KNoDSefG6c',
        dataContractId: 'GbGD5YbS9GVh7FSZjz3uUJpbrXo9ctbdKycfTqqg3Cmn',
        type: 0
      })
    })

    it('should decode DocumentsBatch', async () => {
      const decoded = await utils.decodeStateTransition(client, documentsBatchMock.data)

      assert.deepEqual(decoded, {
        type: 1,
        transitions: [
          {
            action: 0,
            dataContractId: 'FhKAsUnPbqe7K4TZxgRdtPUrfSvNCtYV8iPsvjX7ZG58',
            id: '7TsrNHXDy14fYoRcoYjZHH14K4riMGU2VeHMwopG82DL',
            revision: 1
          }
        ]
      })
    })

    it('should decode CreateIdentity', async () => {
      const decoded = await utils.decodeStateTransition(client, createIdentityMock.data)

      assert.deepEqual(decoded, {
        identityId: '3B3pVgtqLyZx9tUYoSTubXQMs6BQN6kkLURvGG8ax8NJ',
        type: 2
      })
    })

    it('should decode IdentityTopUp', async () => {
      const decoded = await utils.decodeStateTransition(client, identityTopUpMock.data)

      assert.deepEqual(decoded, {
        identityId: '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF',
        type: 3,
        amount: 300000000
      })
    })

    it.only('should decode DataContractUpdate', async () => {
      const decoded = await utils.decodeStateTransition(client, dataContractUpdateMock.data)

      assert.deepEqual(decoded, {
        identityId: '7dwjL5frrkM69pv3BsKSQb4ELrMYmDeE11KNoDSefG6c',
        dataContractId: '8BzeH7dmyLHNzcCtG6DGowAkWyRgWEq15y88Zz2zBxVg',
        type: 4,
        version: 2
      })
    })

    it('should decode IdentityUpdate', async () => {
      const decoded = await utils.decodeStateTransition(client, identityUpdateMock.data)

      assert.deepEqual(decoded, {
        identityId: '4NGALjtX2t3AXE3ZCqJiSmYuiWEY3ZPQNUBxNWWRrRSp',
        type: 5,
        revision: 2
      })
    })

    it('should decode IdentityCreditTransfer', async () => {
      const decoded = await utils.decodeStateTransition(client, identityCreditTransfer.data)

      assert.deepEqual(decoded, {
        senderId: '4CpFVPyU95ZxNeDnRWfkpjUa9J72i3nZ4YPsTnpdUudu',
        recipientId: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
        amount: 9998363,
        type: 7
      })
    })

    it('should decode IdentityWithdrawal', async () => {
      const decoded = await utils.decodeStateTransition(client, identityWithdrawal.data)

      assert.deepEqual(decoded, {
        senderId: 'FvqzjDyub72Hk51pcmJvd1JUACuor7vA3aJawiVG7Z17',
        amount: 1000000,
        nonce: 1,
        outputScript: '76a9148dc5fd6be194390035cca6293a357bac8e3c35c588ac',
        coreFeePerByte: 2,
        type: 6
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
        indexName: 'parentNameAndLabel',
        documentType: 'domain',
        modifiedDataIds: [
          '2Ey6wdP5YYSqhq96KmU349CeSCsV4avrsNCaXqogGEr9'
        ],
        ownerId: '2Ey6wdP5YYSqhq96KmU349CeSCsV4avrsNCaXqogGEr9',
        signature: '1f6c69fa9201b57bb7e7c24b392de9056cce5a66bcf2154d57631419e9c68efa8e4d1ca11e81c35de31dd52321d0fbb25f6ff17f5ff69a9cf47fce54746ee72644',
        choice: 'TowardsIdentity(4VRAaVi8vq492FznoHKTsQd4odaXa7vDxdghpTSQBVSV)',
        proTxHash: 'DghTta8E4ySZsozAoF4WjnYxpADLw3i2B7trhYKQ2ovG',
        userFeeIncrease: 0,
        raw: '0800bc77a5a2cec455c79fb92fb683dbd87a2a92b663c9a46d0c50d11889b4aeb121126fac34e15653f82356cffd3d37c5cd84c1f634d4043340dbae781d93d6b87e000000e668c659af66aee1e72c186dde7b5b7e0a1d712a09c40d5721f622bf53c5315506646f6d61696e12706172656e744e616d65416e644c6162656c02120464617368120874657374303130300033daa5a3e330b61e5a4416ab224f0a45ef4e4cab1357b5f4a86fae9314717a561000411f6c69fa9201b57bb7e7c24b392de9056cce5a66bcf2154d57631419e9c68efa8e4d1ca11e81c35de31dd52321d0fbb25f6ff17f5ff69a9cf47fce54746ee72644'
      })
    })
  })
})
