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
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions`)
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
        type: StateTransitionEnum[transition.stateTransition.type],
        batchType: null,
        data: '{}',
        timestamp: transition.block.timestamp.toISOString(),
        gasUsed: transition.stateTransition.gasUsed ?? 0,
        incoming: transition.addressTransition.recipient_id === platformAddress.address.id,
        amount: String(transition.addressTransition.recipient_id === platformAddress.address.id
          ? transition.addressTransition.amount
          : -transition.addressTransition.amount),
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

    it('should return only the transitions of the requested type', async () => {
      const [platformAddress] = platformAddresses
      const [funding] = platformAddress.transitions

      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions?limit=100&transaction_type=${StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      // the count follows the filter, so a wallet can page the filtered set
      assert.equal(body.pagination.total, 1)
      assert.equal(body.resultSet.length, 1)

      const [transaction] = body.resultSet

      assert.equal(transaction.hash, funding.stateTransition.hash)
      assert.equal(transaction.type, 'ADDRESS_FUNDING_FROM_ASSET_LOCK')
      assert.equal(transaction.incoming, true)
      assert.equal(transaction.amount, String(funding.addressTransition.amount))
    })

    it('should accept the type by name and more than one of them', async () => {
      const [platformAddress] = platformAddresses

      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions?limit=100&transaction_type=ADDRESS_FUNDS_TRANSFER`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddress.transitions.length - 1)
      assert.deepEqual([...new Set(body.resultSet.map(({ type }) => type))], ['ADDRESS_FUNDS_TRANSFER'])

      const { body: bothTypes } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions?limit=100&transaction_type=ADDRESS_FUNDS_TRANSFER&transaction_type=${StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(bothTypes.pagination.total, platformAddress.transitions.length)
    })

    it('should return an empty set for a type the address has never seen', async () => {
      const [platformAddress] = platformAddresses

      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions?limit=100&transaction_type=SHIELD`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      // an empty page carries the -1 total every paged endpoint here uses
      assert.equal(body.pagination.total, -1)
      assert.deepEqual(body.resultSet, [])
    })

    it('should return set of address transitions with custom limit', async () => {
      const [platformAddress] = platformAddresses
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions?limit=7`)
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
        type: StateTransitionEnum[transition.stateTransition.type],
        batchType: null,
        data: '{}',
        timestamp: transition.block.timestamp.toISOString(),
        gasUsed: transition.stateTransition.gasUsed ?? 0,
        incoming: transition.addressTransition.recipient_id === platformAddress.address.id,
        amount: String(transition.addressTransition.recipient_id === platformAddress.address.id
          ? transition.addressTransition.amount
          : -transition.addressTransition.amount),
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
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions?limit=7&page=3`)
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
        type: StateTransitionEnum[transition.stateTransition.type],
        batchType: null,
        data: '{}',
        timestamp: transition.block.timestamp.toISOString(),
        gasUsed: transition.stateTransition.gasUsed ?? 0,
        incoming: transition.addressTransition.recipient_id === platformAddress.address.id,
        amount: String(transition.addressTransition.recipient_id === platformAddress.address.id
          ? transition.addressTransition.amount
          : -transition.addressTransition.amount),
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
      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions?limit=7&page=3&order=desc`)
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
        type: StateTransitionEnum[transition.stateTransition.type],
        batchType: null,
        data: '{}',
        timestamp: transition.block.timestamp.toISOString(),
        gasUsed: transition.stateTransition.gasUsed ?? 0,
        incoming: transition.addressTransition.recipient_id === platformAddress.address.id,
        amount: String(transition.addressTransition.recipient_id === platformAddress.address.id
          ? transition.addressTransition.amount
          : -transition.addressTransition.amount),
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

    it('should fold input and change output of one transition into a single row', async () => {
      const platformAddress = platformAddresses[platformAddresses.length - 1]
      const [, spentTransition] = platformAddress.transitions

      // the indexer writes one row per input and one per output, so spending with change
      // back to the same address leaves two rows behind for a single state transition
      await fixtures.platformAddressTransition(knex, {
        recipient_id: platformAddress.address.id,
        state_transition_id: spentTransition.stateTransition.id,
        state_transition_type: StateTransitionEnum.ADDRESS_FUNDS_TRANSFER,
        amount: 30000
      })

      const { body } = await client.get(`/platformAddress/${platformAddress.address.bech32m_address}/transactions?limit=100`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, platformAddress.transitions.length)
      assert.equal(body.resultSet.length, platformAddress.transitions.length)

      const [transaction] = body.resultSet.filter(({ hash }) => hash === spentTransition.stateTransition.hash)

      assert.equal(transaction.incoming, false)
      assert.equal(transaction.amount, String(30000 - spentTransition.addressTransition.amount))
    })
  })

  describe('getAddressesInfo()', () => {
    it('should return info for a set of addresses', async () => {
      const selected = platformAddresses.slice(0, 3)

      const { body } = await client.post('/platformAddresses/info')
        .send({ addresses: selected.map(({ address }) => address.bech32m_address) })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expected = selected.map(platformAddress => ({
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address,
        totalTxs: platformAddress.transitions.length,
        incomingTxs: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.recipient_id === platformAddress.address.id).length,
        outgoingTxs: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.sender_id === platformAddress.address.id).length,
        nonce: platformAddress.address.nonce,
        balance: platformAddress.address.balance.toString(),
        totalIncomingAmount: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.recipient_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString(),
        totalOutgoingAmount: platformAddress.transitions.filter(({ addressTransition }) => addressTransition.sender_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString()
      }))

      assert.deepEqual(expected, body)
    })

    it('should accept base58 and bech32m in the same set', async () => {
      const [first, second] = platformAddresses

      const { body } = await client.post('/platformAddresses/info')
        .send({ addresses: [first.address.address, second.address.bech32m_address] })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.map(({ base58Address }) => base58Address),
        [first.address.address, second.address.address])
    })

    it('should skip addresses that were never seen', async () => {
      const [first] = platformAddresses

      const { body } = await client.post('/platformAddresses/info')
        .send({ addresses: [first.address.address, 'yfMwEBHUZAsHSJcgnfCVSN1mFEeoPzUZAM'] })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 1)
      assert.equal(body[0].base58Address, first.address.address)
    })

    it('should not accept more than 100 addresses', async () => {
      const [first] = platformAddresses

      const { body, status } = await client.post('/platformAddresses/info')
        .send({ addresses: new Array(101).fill(first.address.address) })

      assert.notEqual(status, 200)
      assert.match(body.error, /must NOT have more than 100 items/)
    })
  })

  describe('getAddressesTransitions()', () => {
    it('should return one merged page across a set of addresses', async () => {
      const [first, second] = platformAddresses

      const { body } = await client.post('/platformAddresses/transactions?limit=100')
        .send({ addresses: [first.address.bech32m_address, second.address.address] })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.total, first.transitions.length + second.transitions.length)
      assert.equal(body.resultSet.length, first.transitions.length + second.transitions.length)

      // paged on chain order, not on insertion order
      const expected = [...first.transitions, ...second.transitions]
        .sort((a, b) => a.block.height - b.block.height)
        .map(({ stateTransition }) => stateTransition.hash)

      assert.deepEqual(body.resultSet.map(({ hash }) => hash), expected)

      // every transition here belongs to exactly one of the two, so it still names its address
      const addresses = new Set(body.resultSet.map(({ base58Address }) => base58Address))
      assert.deepEqual([...addresses].sort(), [first.address.address, second.address.address].sort())
    })

    it('should page and order the merged set by block height', async () => {
      const [first, second] = platformAddresses

      const { body } = await client.post('/platformAddresses/transactions?limit=7&page=3&order=desc')
        .send({ addresses: [first.address.address, second.address.address] })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, first.transitions.length + second.transitions.length)

      const expected = [...first.transitions, ...second.transitions]
        .sort((a, b) => b.block.height - a.block.height)
        .slice(14, 21)
        .map(({ stateTransition }) => stateTransition.hash)

      assert.deepEqual(body.resultSet.map(({ hash }) => hash), expected)
    })

    it('should return one row when a transition touches several of the addresses', async () => {
      const sender = platformAddresses[26]
      const recipient = platformAddresses[27]
      const [, sharedTransition] = sender.transitions

      await fixtures.platformAddressTransition(knex, {
        recipient_id: recipient.address.id,
        state_transition_id: sharedTransition.stateTransition.id,
        state_transition_type: StateTransitionEnum.ADDRESS_FUNDS_TRANSFER,
        amount: 40000
      })

      const { body } = await client.post('/platformAddresses/transactions?limit=100')
        .send({ addresses: [sender.address.address, recipient.address.address] })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const merged = body.resultSet.filter(({ hash }) => hash === sharedTransition.stateTransition.hash)

      // the shared transition is listed once, not once per address that owns a row in it
      assert.equal(merged.length, 1)
      assert.equal(body.pagination.total, sender.transitions.length + recipient.transitions.length)

      const [transaction] = merged

      assert.equal(transaction.amount, String(40000 - sharedTransition.addressTransition.amount))
      assert.equal(transaction.incoming, false)
      // no single address of the set describes the row
      assert.equal(transaction.base58Address, null)
      assert.equal(transaction.bech32mAddress, null)
    })

    it('should filter the merged set by type', async () => {
      const [first, second] = platformAddresses

      const { body } = await client.post(`/platformAddresses/transactions?limit=100&transaction_type=${StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK}`)
        .send({ addresses: [first.address.bech32m_address, second.address.address] })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      // one funding transition each, the transfers are filtered out
      assert.equal(body.pagination.total, 2)
      assert.deepEqual(
        body.resultSet.map(({ hash }) => hash),
        [first, second].map(({ transitions: [funding] }) => funding.stateTransition.hash)
      )
    })

    it('should not accept more than 100 addresses', async () => {
      const [first] = platformAddresses

      const { body, status } = await client.post('/platformAddresses/transactions')
        .send({ addresses: new Array(101).fill(first.address.address) })

      assert.notEqual(status, 200)
      assert.match(body.error, /must NOT have more than 100 items/)
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

  describe('one sided address', () => {
    it('should return 0 for the side the address has never moved credits on', async () => {
      const address = await fixtures.platformAddress(knex, {})

      const block = await fixtures.block(knex, { height: 100000 })
      const stateTransition = await fixtures.transaction(knex, {
        block_height: block.height,
        block_hash: block.hash,
        type: StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK
      })
      await fixtures.platformAddressTransition(knex, {
        recipient_id: address.id,
        state_transition_id: stateTransition.id,
        state_transition_type: StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK,
        amount: 700000
      })

      // the sdk mock reads the fixture set, and nothing below this point reads it back
      platformAddresses.push({ address: { ...address, nonce: 0, balance: 700000 }, transitions: [] })

      const { body } = await client.get(`/platformAddress/${address.bech32m_address}/info`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.totalIncomingAmount, '700000')
      assert.equal(body.outgoingTxs, 0)
      // no outgoing transition is zero credits out, not an unknown amount
      assert.equal(body.totalOutgoingAmount, '0')
    })
  })
})
