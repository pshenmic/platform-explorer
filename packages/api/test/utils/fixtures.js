/* eslint-disable camelcase */

const { base58 } = require('@scure/base')
const crypto = require('crypto')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')

const generateHash = () => (crypto.randomBytes(32)).toString('hex').toUpperCase()
const generateIdentifier = () => base58.encode(crypto.randomBytes(32))
const fixtures = {
  identifier: () => generateIdentifier(),
  block: async (knex, { hash, height, timestamp, block_version, app_version, l1_locked_height, validator } = {}) => {
    const row = {
      hash: hash ?? generateHash(),
      height: height ?? 1,
      timestamp: timestamp ?? new Date(),
      block_version: block_version ?? 13,
      app_version: app_version ?? 1,
      l1_locked_height: l1_locked_height ?? 1337,
      validator: validator ?? (await fixtures.validator(knex)).pro_tx_hash
    }

    await knex('blocks').insert(row)

    return row
  },
  transaction: async (knex, { hash, data, type, index, block_hash, owner, gas_used, status, error } = {}) => {
    if (!block_hash) {
      throw new Error('block_hash must be provided for transaction fixture')
    }

    if (!type && type !== 0) {
      throw new Error('type must be provided for transaction fixture')
    }

    if (!owner) {
      throw new Error('owner must be provided for transaction fixture')
    }

    const row = {
      block_hash,
      type,
      owner,
      hash: hash ?? generateHash(),
      data: data ?? {},
      index: index ?? 0,
      gas_used: gas_used ?? 0,
      status: status ?? 'SUCCESS',
      error: error ?? null
    }

    const [result] = await knex('state_transitions').insert(row).returning('id')

    return { ...row, id: result.id }
  },
  identity: async (knex, { identifier, block_hash, state_transition_hash, revision, owner, is_system } = {}) => {
    if (!identifier) {
      identifier = generateIdentifier()
    }

    if (!block_hash) {
      throw Error('Block hash must be provided')
    }

    let transaction

    if (!state_transition_hash) {
      transaction = await fixtures.transaction(knex, {
        block_hash,
        owner: identifier,
        type: StateTransitionEnum.IDENTITY_CREATE
      })
    }

    const row = {
      identifier,
      revision: revision ?? 0,
      state_transition_hash: state_transition_hash ?? transaction.hash,
      owner: owner ?? identifier,
      is_system: is_system ?? false
    }

    const result = await knex('identities').insert(row).returning('id')

    return { ...row, txHash: state_transition_hash ?? transaction.hash, id: result[0].id, transaction }
  },

  identity_alias: async (knex, { alias, identity, block_hash, state_transition_hash } = {}) => {
    if (!identity) {
      identity = this.identity(knex, { block_hash })
    }

    const row = {
      identity_identifier: identity.identifier,
      alias,
      state_transition_hash
    }

    await knex('identity_aliases').insert(row).returning('id')

    return { ...row }
  },
  dataContract: async (knex, { identifier, name, schema, version, state_transition_hash, owner, is_system, documents = [] } = {}) => {
    if (!identifier) {
      identifier = generateIdentifier()
    }

    if (!owner) {
      throw new Error('owner must be provided for dataContract fixture')
    }

    const row = {
      owner,
      identifier,
      name: name ?? null,
      state_transition_hash,
      schema: schema ?? {},
      version: version ?? 0,
      is_system: is_system === true
    }

    const result = await knex('data_contracts').insert(row).returning('id')

    return { ...row, id: result[0].id, documents }
  },
  document: async (knex, {
    identifier,
    revision,
    data,
    deleted,
    state_transition_hash,
    data_contract_id,
    owner,
    is_system
  }) => {
    if (!identifier) {
      identifier = generateIdentifier()
    }

    if (!owner) {
      throw new Error('owner must be provided for document fixture')
    }

    if (!data_contract_id) {
      throw new Error('data_contract_id must be provided for document fixture')
    }

    const row = {
      identifier,
      state_transition_hash,
      revision: revision ?? 0,
      data: data ?? {},
      deleted: deleted ?? false,
      data_contract_id,
      owner,
      is_system: is_system ?? false
    }

    const result = await knex('documents').insert(row).returning('id')

    return { ...row, id: result[0].id }
  },
  transfer: async (knex, {
    amount,
    sender,
    recipient,
    state_transition_hash
  }) => {
    if (!amount) {
      throw new Error('amount must be provided for transfer fixture')
    }
    if (!state_transition_hash) {
      throw new Error('state_transition_hash must be provided for transfer fixture')
    }

    const row = {
      amount,
      sender,
      recipient,
      state_transition_hash
    }

    const result = await knex('transfers').insert(row).returning('id')

    return { ...row, id: result[0].id }
  },
  validator: async (knex, {
    pro_tx_hash
  } = {}) => {
    const row = {
      pro_tx_hash: pro_tx_hash ?? generateHash()
    }

    const [result] = await knex('validators').insert(row).returning('id')

    return { ...row, id: result.id }
  },
  cleanup: async (knex) => {
    await knex.raw('DELETE FROM identities')
    await knex.raw('DELETE FROM identity_aliases')
    await knex.raw('DELETE FROM documents')
    await knex.raw('DELETE FROM data_contracts')
    await knex.raw('DELETE FROM transfers')
    await knex.raw('DELETE FROM state_transitions')
    await knex.raw('DELETE FROM blocks')
    await knex.raw('DELETE FROM validators')
  }
}

module.exports = fixtures
