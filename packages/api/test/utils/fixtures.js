/* eslint-disable camelcase */

const { base58 } = require('@scure/base')
const crypto = require('crypto')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')

const generateHash = () => (crypto.randomBytes(32)).toString('hex').toUpperCase()
const generateIdentifier = () => base58.encode(crypto.randomBytes(32))
const fixtures = {
  identifier: () => generateIdentifier(),
  block: async (knex, {
    hash,
    height,
    timestamp,
    block_version,
    app_version,
    l1_locked_height,
    validator,
    app_hash
  } = {}) => {
    const row = {
      hash: hash ?? generateHash(),
      height: height ?? 1,
      timestamp: timestamp ?? new Date(),
      block_version: block_version ?? 13,
      app_version: app_version ?? 1,
      l1_locked_height: l1_locked_height ?? 1337,
      validator: validator ?? (await fixtures.validator(knex)).pro_tx_hash,
      app_hash: app_hash ?? generateHash()
    }

    await knex('blocks').insert(row)

    return row
  },
  transaction: async (knex, {
    hash,
    data,
    type,
    batch_type = null,
    index,
    block_hash,
    owner,
    gas_used,
    status,
    error
  } = {}) => {
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
      batch_type,
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
  dataContract: async (knex, {
    identifier,
    name,
    schema,
    version,
    state_transition_hash,
    owner,
    is_system,
    documents = []
  } = {}) => {
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
    is_system,
    transition_type,
    document_type_name,
    prefunded_voting_balance
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
      revision: revision ?? 1,
      data: data ?? {},
      deleted: deleted ?? false,
      data_contract_id,
      owner,
      is_system: is_system ?? false,
      transition_type: transition_type ?? 0,
      document_type_name: document_type_name ?? 'type_name',
      prefunded_voting_balance
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
  masternodeVote: async (knex, {
    pro_tx_hash,
    state_transition_hash,
    voter_identity_id,
    choice,
    towards_identity_identifier,
    data_contract_id,
    document_type_name,
    index_name,
    index_values,
    power
  } = {}) => {
    if (!state_transition_hash) {
      throw new Error('state_transition_hash must be provided for masternodeVote fixture')
    }

    if (!voter_identity_id) {
      throw new Error('voter_identity_id must be provided for masternodeVote fixture')
    }

    if (!data_contract_id) {
      throw new Error('data_contract_id must be provided for masternodeVote fixture')
    }

    const row = {
      pro_tx_hash: pro_tx_hash ?? generateHash(),
      state_transition_hash,
      voter_identity_id,
      choice: choice ?? 0,
      towards_identity_identifier: towards_identity_identifier ?? null,
      data_contract_id,
      document_type_name: document_type_name ?? 'type_name',
      index_name: index_name ?? 'default_index',
      index_values: index_values ?? '[]',
      power: power ?? 1
    }

    const [result] = await knex('masternode_votes').insert(row).returning('id')

    return { ...row, id: result.id }
  },
  token: async (knex, {
    position,
    identifier,
    owner,
    data_contract_id,
    decimals,
    max_supply,
    base_supply,
    localizations,
    keeps_transfer_history,
    keeps_freezing_history,
    keeps_minting_history,
    keeps_burning_history,
    keeps_direct_pricing_history,
    keeps_direct_purchase_history,
    distribution_rules,
    mintable,
    burnable,
    freezable,
    unfreezable,
    destroyable,
    allowed_emergency_actions
  }) => {
    if (position === undefined) {
      throw new Error('position must be provided')
    }
    if (!identifier) {
      identifier = generateIdentifier()
    }
    if (!owner) {
      throw new Error('owner must be provided')
    }
    if (!data_contract_id) {
      throw new Error('data_contract_id must be provided')
    }
    if (decimals === undefined) {
      throw new Error('decimals must be provided')
    }
    if (!base_supply) {
      throw new Error('base_supply must be provided')
    }

    const row = {
      position,
      identifier,
      owner,
      data_contract_id,
      decimals,
      max_supply,
      base_supply,
      localizations,
      keeps_transfer_history: keeps_transfer_history ?? true,
      keeps_freezing_history: keeps_freezing_history ?? true,
      keeps_minting_history: keeps_minting_history ?? true,
      keeps_burning_history: keeps_burning_history ?? true,
      keeps_direct_pricing_history: keeps_direct_pricing_history ?? true,
      keeps_direct_purchase_history: keeps_direct_purchase_history ?? true,
      distribution_rules,
      mintable: mintable ?? true,
      burnable: burnable ?? true,
      freezable: freezable ?? true,
      unfreezable: unfreezable ?? true,
      destroyable: destroyable ?? true,
      allowed_emergency_actions: allowed_emergency_actions ?? true
    }

    const [result] = await knex('tokens').insert(row).returning('id')

    return { ...row, id: result.id }
  },
  cleanup: async (knex) => {
    await knex.raw('DELETE FROM token_transitions')
    await knex.raw('DELETE FROM tokens')
    await knex.raw('DELETE FROM masternode_votes')
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
