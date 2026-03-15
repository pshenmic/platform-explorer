const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const { PlatformAddressesController } = require('dash-platform-sdk/src/platformAddresses')

describe('Platform Addresses routes', () => {
  let app
  let client
  let knex

  let platformAddresses

  before(async () => {
    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()
    await fixtures.cleanup(knex)

    platformAddresses = []

    for (let i = 0; i < 30; i++) {
      const address = await fixtures.platformAddress(knex, {})

      const transitions = []

      const block = await fixtures.block(knex, { height: i * 30 + 1 })
      const stateTransition = await fixtures.transaction(knex, {
        block_height: block.height,
        block_hash: block.hash,
        type: StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK
      })
      const addressTransition = await fixtures.platformAddressTransition(knex, {
        recipient_id: address.id,
        state_transition_id: stateTransition.id,
        state_transition_type: StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK,
        amount: 10000000 * (i + 1)
      })

      transitions.push({ block, stateTransition, addressTransition })

      for (let x = 1; x < 30; x++) {
        const block = await fixtures.block(knex, { height: i * 30 + 1 + x })
        const stateTransition = await fixtures.transaction(knex, {
          block_height: block.height,
          block_hash: block.hash,
          type: StateTransitionEnum.ADDRESS_FUNDS_TRANSFER
        })
        const addressTransition = await fixtures.platformAddressTransition(knex, {
          sender_id: address.id,
          state_transition_id: stateTransition.id,
          state_transition_type: StateTransitionEnum.ADDRESS_FUNDS_TRANSFER,
          amount: 100000
        })

        transitions.push({ block, stateTransition, addressTransition })
      }

      platformAddresses.push({
        address: { ...address, nonce: i, balance: 10000000 * (i + 1) - 100000 * (transitions.length - 1) },
        transitions
      })
    }

    mock.method(PlatformAddressesController.prototype, 'getAddressInfo', async (platformAddress) => {
      const [selectedAddress] = platformAddresses.filter(({ address }) => address.bech32m_address === platformAddress)

      return {
        address: {
          toAddress: () => selectedAddress.address.address,
          toBech32m: () => selectedAddress.address.bech32m_address
        },
        nonce: selectedAddress.address.nonce,
        balance: BigInt(selectedAddress.address.balance)
      }
    })

    mock.method(PlatformAddressesController.prototype, 'getAddressesInfos', async (addresses) => {
      const selectedAddresses = platformAddresses.filter(({ address }) => addresses.includes(address.bech32m_address))

      return selectedAddresses.map(selectedAddress => ({
        address: {
          toAddress: () => selectedAddress.address.address,
          toBech32m: () => selectedAddress.address.bech32m_address
        },
        nonce: selectedAddress.address.nonce,
        balance: BigInt(selectedAddress.address.balance)
      }))
    })
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getAddressInfo()', () => {
    it('should return address info by bech32m', async () => {
      const [platformAddress] = platformAddresses
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/info`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedAddressInfo = {
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address,
        totalTxs: platformAddress.transitions.length,
        incomingTxs: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.recipient_id === platformAddress.address.id).length,
        outgoingTxs: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.sender_id === platformAddress.address.id).length,
        nonce: platformAddress.address.nonce,
        balance: platformAddress.address.balance.toString(),
        totalIncomingAmount: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.recipient_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString(),
        totalOutgoingAmount: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.sender_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString()
      }

      assert.deepEqual(expectedAddressInfo, body)
    })

    it('should return address info by base58check', async () => {
      const [platformAddress] = platformAddresses
      const { body } = await client.get(`/platformAddress/${platformAddress.address.address}/info`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedAddressInfo = {
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address,
        totalTxs: platformAddress.transitions.length,
        incomingTxs: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.recipient_id === platformAddress.address.id).length,
        outgoingTxs: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.sender_id === platformAddress.address.id).length,
        nonce: platformAddress.address.nonce,
        balance: platformAddress.address.balance.toString(),
        totalIncomingAmount: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.recipient_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString(),
        totalOutgoingAmount: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.sender_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString()
      }

      assert.deepEqual(expectedAddressInfo, body)
    })

    it('should return 404 if not found', async () => {
      await client.get('/platformAddress/asdkalalksksksksklallakla/info')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getAddressTransitions()', () => {
    it('should return default set of address transitions', async () => {
      const [platformAddress] = platformAddresses
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transitions`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddresses.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedAddressTransitions = platformAddress.transitions.map(transition => ({
        hash: transition.stateTransition.hash,
        index: transition.stateTransition.index,
        blockHash: transition.stateTransition.block_hash,
        blockHeight: transition.stateTransition.block_height,
        type: transition.stateTransition.type,
        batchType: null,
        data: '{}',
        timestamp: transition.block.timestamp.toISOString(),
        gasUsed: transition.stateTransition.gasUsed ?? 0,
        incoming: transition.addressTransition.recipient_id === platformAddress.address.id,
        status: transition.stateTransition.status,
        error: transition.stateTransition.error,
        owner: {
          identifier: null,
          aliases: []
        },
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address
      }))
        .sort((a, b) => a.height - b.height)
        .slice(0, 10)

      assert.deepEqual(expectedAddressTransitions, body.resultSet)
    })

    it('should return set of address transitions with custom limit', async () => {
      const [platformAddress] = platformAddresses
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transitions?limit=7`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddresses.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 7)

      const expectedAddressTransitions = platformAddress.transitions.map(transition => ({
        hash: transition.stateTransition.hash,
        index: transition.stateTransition.index,
        blockHash: transition.stateTransition.block_hash,
        blockHeight: transition.stateTransition.block_height,
        type: transition.stateTransition.type,
        batchType: null,
        data: '{}',
        timestamp: transition.block.timestamp.toISOString(),
        gasUsed: transition.stateTransition.gasUsed ?? 0,
        incoming: transition.addressTransition.recipient_id === platformAddress.address.id,
        status: transition.stateTransition.status,
        error: transition.stateTransition.error,
        owner: {
          identifier: null,
          aliases: []
        },
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address
      }))
        .sort((a, b) => a.blockHeight - b.blockHeight)
        .slice(0, 7)

      assert.deepEqual(expectedAddressTransitions, body.resultSet)
    })

    it('should return set of address transitions with custom limit and page', async () => {
      const [platformAddress] = platformAddresses
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transitions?limit=7&page=3`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddresses.length)
      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 7)

      const expectedAddressTransitions = platformAddress.transitions.map(transition => ({
        hash: transition.stateTransition.hash,
        index: transition.stateTransition.index,
        blockHash: transition.stateTransition.block_hash,
        blockHeight: transition.stateTransition.block_height,
        type: transition.stateTransition.type,
        batchType: null,
        data: '{}',
        timestamp: transition.block.timestamp.toISOString(),
        gasUsed: transition.stateTransition.gasUsed ?? 0,
        incoming: transition.addressTransition.recipient_id === platformAddress.address.id,
        status: transition.stateTransition.status,
        error: transition.stateTransition.error,
        owner: {
          identifier: null,
          aliases: []
        },
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address
      }))
        .sort((a, b) => a.blockHeight - b.blockHeight)
        .slice(14, 21)

      assert.deepEqual(expectedAddressTransitions, body.resultSet)
    })

    it('should return set of address transitions with custom limit, page and order', async () => {
      const [platformAddress] = platformAddresses
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transitions?limit=7&page=3&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddresses.length)
      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 7)

      const expectedAddressTransitions = platformAddress.transitions.map(transition => ({
        hash: transition.stateTransition.hash,
        index: transition.stateTransition.index,
        blockHash: transition.stateTransition.block_hash,
        blockHeight: transition.stateTransition.block_height,
        type: transition.stateTransition.type,
        batchType: null,
        data: '{}',
        timestamp: transition.block.timestamp.toISOString(),
        gasUsed: transition.stateTransition.gasUsed ?? 0,
        incoming: transition.addressTransition.recipient_id === platformAddress.address.id,
        status: transition.stateTransition.status,
        error: transition.stateTransition.error,
        owner: {
          identifier: null,
          aliases: []
        },
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address
      }))
        .sort((a, b) => b.blockHeight - a.blockHeight)
        .slice(14, 21)

      assert.deepEqual(expectedAddressTransitions, body.resultSet)
    })
  })

  describe('getAddresses()', () => {
    it('should return default set of platform addresses', async () => {
      const { body } = await client.get('/platformAddresses')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddresses.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedResultSet = platformAddresses
        .sort((a, b) => a.address.id - b.address.id)
        .slice(0, 10)
        .map(platformAddress => ({
          base58Address: platformAddress.address.address,
          bech32mAddress: platformAddress.address.bech32m_address,
          totalTxs: null,
          incomingTxs: null,
          outgoingTxs: null,
          nonce: platformAddress.address.nonce,
          balance: platformAddress.address.balance.toString(),
          totalIncomingAmount: null,
          totalOutgoingAmount: null
        }))

      assert.deepEqual(expectedResultSet, body.resultSet)
    })

    it('should return set of platform addresses with custom limit', async () => {
      const { body } = await client.get('/platformAddresses?limit=7')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddresses.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 7)

      const expectedResultSet = platformAddresses
        .sort((a, b) => a.address.id - b.address.id)
        .slice(0, 7)
        .map(platformAddress => ({
          base58Address: platformAddress.address.address,
          bech32mAddress: platformAddress.address.bech32m_address,
          totalTxs: null,
          incomingTxs: null,
          outgoingTxs: null,
          nonce: platformAddress.address.nonce,
          balance: platformAddress.address.balance.toString(),
          totalIncomingAmount: null,
          totalOutgoingAmount: null
        }))

      assert.deepEqual(expectedResultSet, body.resultSet)
    })

    it('should return set of platform addresses with custom limit and page', async () => {
      const { body } = await client.get('/platformAddresses?limit=7&page=2')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddresses.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)

      const expectedResultSet = platformAddresses
        .sort((a, b) => a.address.id - b.address.id)
        .slice(7, 14)
        .map(platformAddress => ({
          base58Address: platformAddress.address.address,
          bech32mAddress: platformAddress.address.bech32m_address,
          totalTxs: null,
          incomingTxs: null,
          outgoingTxs: null,
          nonce: platformAddress.address.nonce,
          balance: platformAddress.address.balance.toString(),
          totalIncomingAmount: null,
          totalOutgoingAmount: null
        }))

      assert.deepEqual(expectedResultSet, body.resultSet)
    })

    it('should return set of platform addresses with custom limit, page and order', async () => {
      const { body } = await client.get('/platformAddresses?limit=7&page=2&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddresses.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)

      const expectedResultSet = platformAddresses
        .sort((a, b) => b.address.id - a.address.id)
        .slice(7, 14)
        .map(platformAddress => ({
          base58Address: platformAddress.address.address,
          bech32mAddress: platformAddress.address.bech32m_address,
          totalTxs: null,
          incomingTxs: null,
          outgoingTxs: null,
          nonce: platformAddress.address.nonce,
          balance: platformAddress.address.balance.toString(),
          totalIncomingAmount: null,
          totalOutgoingAmount: null
        }))

      assert.deepEqual(expectedResultSet, body.resultSet)
    })
  })
})
