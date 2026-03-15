const {describe, it, before, after, mock} = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const {getKnex} = require('../../src/utils')
const StateTransitionEnum = require("../../src/enums/StateTransitionEnum");
const {PlatformAddressesController} = require('dash-platform-sdk/src/platformAddresses')


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

      const block = await fixtures.block(knex, {height: i * 30 + 1})
      const stateTransition = await fixtures.transaction(knex, {
        block_height: block.height,
        block_hash: block.hash,
        type: StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK
      })
      const addressTransition = await fixtures.platformAddressTransition(knex, {
        recipient_id: address.id,
        state_transition_id: stateTransition.id,
        state_transition_type: StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK,
        amount: 10000000 * (i + 1),
      })

      transitions.push({block, stateTransition, addressTransition})

      for (let x = 1; x < 30; x++) {
        const block = await fixtures.block(knex, {height: i * 30 + 1 + x})
        const stateTransition = await fixtures.transaction(knex, {
          block_height: block.height,
          block_hash: block.hash,
          type: StateTransitionEnum.ADDRESS_FUNDS_TRANSFER
        })
        const addressTransition = await fixtures.platformAddressTransition(knex, {
          sender_id: address.id,
          state_transition_id: stateTransition.id,
          state_transition_type: StateTransitionEnum.ADDRESS_FUNDS_TRANSFER,
          amount: 100000,
        })

        transitions.push({block, stateTransition, addressTransition})
      }

      platformAddresses.push({
        address: {...address, nonce: i, balance: 10000000 * (i + 1) - 100000 * (transitions.length-1)},
        transitions
      })
    }

    mock.method(PlatformAddressesController.prototype, 'getAddressInfo', async (platformAddress) => {
      const [selectedAddress] = platformAddresses.filter(({address}) => address.bech32m_address === platformAddress)

      return {
        address: {
          toAddress: () => selectedAddress.address.address,
          toBech32m: () => selectedAddress.address.bech32m_address,
        },
        nonce: selectedAddress.address.nonce,
        balance: BigInt(selectedAddress.address.balance),
      }
    })

    mock.method(PlatformAddressesController.prototype, 'getAddressesInfos', async (addresses) => {
      const selectedAddresses = platformAddresses.filter(({address}) => addresses.includes(address.bech32m_address))

      return selectedAddresses.map(selectedAddress => ({
        address: {
          toAddress: () => selectedAddress.address.address,
          toBech32m: () => selectedAddress.address.bech32m_address,
        },
        nonce: selectedAddress.address.nonce,
        balance: BigInt(selectedAddress.address.balance),
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
      const {body} = await client.get(`/platform/address/${platformAddress.address.bech32m_address}/info`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedAddressInfo = {
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address,
        totalTxs: platformAddress.transitions.length,
        incomingTxs: platformAddress.transitions.filter(({addressTransition}) => addressTransition.recipient_id === platformAddress.address.id).length,
        outgoingTxs: platformAddress.transitions.filter(({addressTransition}) => addressTransition.sender_id === platformAddress.address.id).length,
        nonce: platformAddress.address.nonce,
        balance: platformAddress.address.balance.toString(),
        totalIncomingAmount: platformAddress.transitions.filter(({addressTransition}) => addressTransition.recipient_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString(),
        totalOutgoingAmount: platformAddress.transitions.filter(({addressTransition}) => addressTransition.sender_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString(),
      }

      assert.deepEqual(expectedAddressInfo, body)
    })

    it('should return address info by base58check', async () => {
      const [platformAddress] = platformAddresses
      const {body} = await client.get(`/platform/address/${platformAddress.address.address}/info`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedAddressInfo = {
        base58Address: platformAddress.address.address,
        bech32mAddress: platformAddress.address.bech32m_address,
        totalTxs: platformAddress.transitions.length,
        incomingTxs: platformAddress.transitions.filter(({addressTransition}) => addressTransition.recipient_id === platformAddress.address.id).length,
        outgoingTxs: platformAddress.transitions.filter(({addressTransition}) => addressTransition.sender_id === platformAddress.address.id).length,
        nonce: platformAddress.address.nonce,
        balance: platformAddress.address.balance.toString(),
        totalIncomingAmount: platformAddress.transitions.filter(({addressTransition}) => addressTransition.recipient_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString(),
        totalOutgoingAmount: platformAddress.transitions.filter(({addressTransition}) => addressTransition.sender_id === platformAddress.address.id).reduce((partialSum, a) => partialSum + a.addressTransition.amount, 0).toString(),
      }

      assert.deepEqual(expectedAddressInfo, body)
    })

    it('should return 404 if not found', async () => {
      await client.get(`/platform/address/asdkalalksksksksklallakla/info`)
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })
})
