/* eslint-disable camelcase */

const { base58 } = require('@scure/base')
const crypto = require('crypto')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')

const generateHash = () => (crypto.randomBytes(32)).toString('hex').toUpperCase()
const generateIdentifier = () => base58.encode(crypto.randomBytes(32))
const fixtures = {
  identifier: () => generateIdentifier(),
  getDataContract: async (knex, { identifier, id }) => {
    if (!identifier && !id) {
      throw new Error('identifier or id must be provided')
    }

    const eqValue = identifier ?? id
    const eqField = identifier ? 'identifier' : 'id'

    const rows = await knex('data_contracts')
      .where(eqField, eqValue)

    const [row] = rows

    return row
  },
  getValidator: async (knex, { pro_tx_hash }) => {
    if (!pro_tx_hash) {
      throw new Error('pro_tx_hash must be provided')
    }

    const rows = await knex('validators')
      .where('pro_tx_hash', pro_tx_hash)

    const [row] = rows

    return row
  },
  getStateTransition: async (knex, { hash, id }) => {
    if (!hash && !id) {
      throw new Error('hash or id must be provided')
    }

    const eqValue = hash ?? id
    const eqField = hash ? 'hash' : 'id'

    const rows = await knex('state_transitions')
      .where(eqField, eqValue)

    const [row] = rows

    return row
  },
  getToken: async (knex, { identifier }) => {
    if (!identifier) {
      throw new Error('identifier must be provided')
    }

    const [row] = await knex('tokens')
      .where('identifier', identifier)
      .limit(1)

    return row
  },
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
    const validatorObject = validator
      ? await fixtures.getValidator(knex, { pro_tx_hash: validator })
      : await fixtures.validator(knex)
    const row = {
      hash: hash ?? generateHash(),
      height: height ?? 1,
      timestamp: timestamp ?? new Date(),
      block_version: block_version ?? 13,
      app_version: app_version ?? 1,
      l1_locked_height: l1_locked_height ?? 1337,
      validator: validatorObject.pro_tx_hash,
      validator_id: validatorObject.id,
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
    block_height,
    owner,
    gas_used,
    status,
    error
  } = {}) => {
    if (!block_hash) {
      throw new Error('block_hash must be provided for transaction fixture')
    }

    if (!block_height) {
      throw new Error('block_height must be provided for transaction fixture')
    }

    if (!type && type !== 0) {
      throw new Error('type must be provided for transaction fixture')
    }

    if (!owner) {
      throw new Error('owner must be provided for transaction fixture')
    }

    const row = {
      block_hash,
      block_height,
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
  identity: async function (knex, {
    identifier,
    block_hash,
    block_height,
    state_transition_hash,
    revision,
    owner,
    is_system
  } = {}) {
    if (!identifier) {
      identifier = generateIdentifier()
    }

    if (!block_hash) {
      throw Error('Block hash must be provided')
    }

    if (!block_height) {
      throw Error('Block height must be provided')
    }

    let transaction
    let temp

    if (!state_transition_hash) {
      transaction = await fixtures.transaction(knex, {
        block_hash,
        block_height,
        owner: identifier,
        type: StateTransitionEnum.IDENTITY_CREATE
      })
    } else {
      temp = await fixtures.getStateTransition(knex, { hash: state_transition_hash })
    }

    const row = {
      identifier,
      revision: revision ?? 0,
      state_transition_hash: state_transition_hash ?? transaction.hash,
      state_transition_id: transaction?.id ?? temp?.id,
      owner: owner ?? identifier,
      is_system: is_system ?? false
    }

    const result = await knex('identities').insert(row).returning('id')

    return { ...row, txHash: state_transition_hash ?? transaction.hash, id: result[0].id, transaction }
  },

  identity_alias: async function (knex, { alias, identity, block_hash, state_transition_hash } = {}) {
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
  dataContractTransition: async (knex, {
    data_contract_id,
    data_contract_identifier,
    state_transition_id
  }) => {
    if (!data_contract_id) {
      throw new Error('data contract id must be provided for dataContractTransitions fixture')
    }
    if (!data_contract_identifier) {
      throw new Error('data contract identifier must be provided for dataContractTransitions fixture')
    }

    const row = {
      data_contract_id,
      data_contract_identifier,
      state_transition_id
    }

    const result = await knex('data_contract_transitions').insert(row).returning('id')

    return { ...row, id: result[0].id }
  },
  dataContract: async function (knex, {
    identifier,
    name,
    schema,
    version,
    state_transition_hash,
    owner,
    is_system,
    documents = []
  } = {}) {
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

    const st = state_transition_hash ? await this.getStateTransition(knex, { hash: state_transition_hash }) : null

    const transition = await this.dataContractTransition(knex, {
      data_contract_id: result[0].id,
      data_contract_identifier: identifier,
      state_transition_id: st?.id
    })

    return { ...row, id: result[0].id, documents, transition }
  },
  document: async function (knex, {
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
  }) {
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

    const dataContract = await this.getDataContract(knex, {
      id: data_contract_id
    })

    const st = state_transition_hash ? await this.getStateTransition(knex, { hash: state_transition_hash }) : undefined

    const transition = await this.dataContractTransition(knex, {
      data_contract_id,
      data_contract_identifier: dataContract.identifier,
      state_transition_id: st?.id
    })

    return { ...row, id: result[0].id, transition }
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
  tokenHolder: async (knex, {
    holder,
    token_id
  }) => {
    const row = {
      token_id,
      holder
    }

    const [result] = await knex('token_holders').insert(row).returning('id')

    return { ...row, id: result.id }
  },
  token: async function (knex, {
    position,
    identifier,
    owner,
    data_contract_id,
    decimals,
    max_supply,
    base_supply,
    localizations,
    name,
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
    allowed_emergency_actions,
    state_transition_hash,
    description
  }) {
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
      state_transition_hash,
      description,
      name,
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

    await this.tokenHolder(knex, { holder: owner, token_id: result.id })

    return { ...row, id: result.id }
  },
  tokeTransition: async function (knex, {
    token_identifier,
    owner,
    action,
    amount,
    public_note,
    state_transition_hash,
    token_contract_position,
    data_contract_id,
    recipient
  }) {
    if (token_identifier === undefined) {
      throw new Error('token_identifier must be provided')
    }
    if (owner === undefined) {
      throw new Error('owner must be provided')
    }
    if (action === undefined) {
      throw new Error('action must be provided')
    }
    if (state_transition_hash === undefined) {
      throw new Error('state_transition_hash must be provided')
    }
    if (token_contract_position === undefined) {
      throw new Error('token_contract_position must be provided')
    }
    if (data_contract_id === undefined) {
      throw new Error('data_contract_id must be provided')
    }

    const row = {
      token_identifier,
      owner,
      action,
      amount: amount ?? null,
      public_note: public_note ?? null,
      state_transition_hash,
      token_contract_position,
      data_contract_id,
      recipient: recipient ?? null
    }

    const [result] = await knex('token_transitions').insert(row).returning('id')

    const dataContract = await this.getDataContract(knex, {
      id: data_contract_id
    })

    const st = await this.getStateTransition(knex, { hash: state_transition_hash })

    const transition = await this.dataContractTransition(knex, {
      data_contract_id,
      data_contract_identifier: dataContract.identifier,
      state_transition_id: st.id
    })

    const token = await this.getToken(knex, { identifier: token_identifier })

    await this.tokenHolder(knex, { holder: owner, token_id: token.id })

    if (recipient) {
      await this.tokenHolder(knex, { holder: recipient, token_id: token.id })
    }

    return { ...row, id: result.id, transition }
  },
  cleanup: async (knex) => {
    await knex.raw('DELETE FROM token_holders')
    await knex.raw('DELETE FROM data_contract_transitions')
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
