const { describe, it, before, after } = require('node:test')
const assert = require('node:assert').strict
const utils = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const createIdentityMock = require('./mocks/create_identity.json')
const dataContractCreateMock = require('./mocks/data_contract_create.json')
const documentsBatchMock = require('./mocks/documents_batch.json')
const identityTopUpMock = require('./mocks/identity_top_up.json')
const dataContractUpdateMock = require('./mocks/data_contract_update.json')
const identityUpdateMock = require('./mocks/identity_update.json')
const identityCreditTransfer = require('./mocks/identity_credit_transfer.json')
const identityWithdrawal = require('./mocks/identity_withdrawal.json')
const Dash = require('dash')

describe('Utils', () => {
  let client

  let knex
  let block

  before(async () => {
    client = new Dash.Client()
    await client.platform.initialize()

    knex = utils.getKnex()

    await fixtures.cleanup(knex)

    block = await fixtures.block(knex, { height: 1 })
  })

  after(async () => {
    await knex.destroy()
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
            dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
            id: '2sq2fsVgNrrNKFyRgcLvT8SSVFmCLoMTUfNBY3yEdyeQ',
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
  })

  describe('calculateEpoch()', () => {
    it('should calculate last epoch', async () => {
      const genesisTime = new Date(0).getTime()
      const epochChangeTime = Number(process.env.EPOCH_CHANGE_TIME)
      const currentBlocktime = block.timestamp.getTime()
      const epochIndex = Math.floor((currentBlocktime - genesisTime) / epochChangeTime)
      const startEpochTime = Math.floor(genesisTime + epochChangeTime * epochIndex)

      const currentEpoch = utils.calculateEpoch({ genesisTime, currentBlock: block })

      assert.deepEqual(currentEpoch, {
        endTime: new Date(Math.floor(startEpochTime + epochChangeTime)),
        index: epochIndex,
        startTime: new Date(Math.floor(genesisTime + epochChangeTime * epochIndex))
      })
    })

    it('should calculate custom epoch', async () => {
      const genesisTime = new Date(0).getTime()

      const epochChangeTime = Number(process.env.EPOCH_CHANGE_TIME)
      const currentBlocktime = block.timestamp.getTime()
      const epochIndex = Math.floor((currentBlocktime - genesisTime) / epochChangeTime) - 1
      const startEpochTime = Math.floor(genesisTime + epochChangeTime * epochIndex)

      const currentEpoch = utils.calculateEpoch({ index: epochIndex, genesisTime, currentBlock: block })

      assert.deepEqual(currentEpoch, {
        endTime: new Date(Math.floor(startEpochTime + epochChangeTime)),
        index: epochIndex,
        startTime: new Date(Math.floor(genesisTime + epochChangeTime * epochIndex))
      })
    })
  })
})
