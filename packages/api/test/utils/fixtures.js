const Block = require("../../src/models/Block");
const BlockHeader = require("../../src/models/BlockHeader");
const Transaction = require("../../src/models/Transaction");
const data = Uint8Array.from([1, 2, 3]);
const {base58} = require('@scure/base')
const crypto = require('crypto')

const generateHash = () => (crypto.randomBytes(32)).toString('hex').toUpperCase();
const generateIdentifier = () => base58.encode(crypto.randomBytes(32))


const fixtures = {
    identifier: () => generateIdentifier(),
    block: async (knex, {hash, height, timestamp, block_version, app_version, l1_locked_height} = {}) => {
        if (!height) {
            const maxHeight = await knex('blocks').max('height');

            height = parseInt(maxHeight[0].max || 0) + 1
        }

        const row = {
            hash: hash ?? generateHash(),
            height,
            timestamp: timestamp ?? new Date(),
            block_version: block_version ?? 13,
            app_version: app_version ?? 1,
            l1_locked_height: l1_locked_height ?? 1337
        }

        await knex('blocks').insert(row)

        return row
    },
    transaction: async (knex, {hash, data, type, index, block_hash, owner} = {}) => {
        if (!block_hash) {
            throw new Error("block_hash must be provided for transaction fixture")
        }

        if (!type && type !== 0) {
            throw new Error("type must be provided for transaction fixture")
        }

        if (!owner) {
            throw new Error("owner must be provided for transaction fixture")
        }

        const row = {
            block_hash,
            type,
            owner,
            hash: hash ?? generateHash(),
            data: data ?? {},
            index: index ?? 0
        }

        await knex('state_transitions').insert(row)

        return row
    },
    identity: async (knex, {identifier, state_transition_hash, revision, owner, is_system} = {}) => {
        if (!identifier) {
            identifier = generateIdentifier()
        }

        const row = {
            identifier: identifier,
            revision: revision ?? 0,
            state_transition_hash,
            owner: owner ?? identifier,
            is_system: is_system ?? false,
        }

        await knex('identities').insert(row)

        return row
    },
    dataContract: async (knex, {identifier, schema, version, state_transition_hash, owner, is_system} = {}) => {
        if (!identifier) {
            identifier = generateIdentifier()
        }

        if (!state_transition_hash) {
            throw new Error("state_transition_hash must be provided for dataContract fixture")
        }

        if (!owner) {
            throw new Error("owner must be provided for dataContract fixture")
        }

        const row = {
            owner,
            identifier,
            state_transition_hash,
            schema: schema ?? {},
            version: version ?? 0,
            is_system: is_system ?? false
        }

        const result = await knex('data_contracts').insert(row).returning('id')

        return {...row, id: result[0].id}
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

        if (!state_transition_hash) {
            throw new Error("state_transition_hash must be provided for document fixture")
        }

        if (!owner) {
            throw new Error("owner must be provided for document fixture")
        }

        if (!data_contract_id) {
            throw new Error("data_contract_id must be provided for document fixture")
        }

        const row = {
            identifier,
            state_transition_hash,
            revision: revision ?? 0,
            data : data ?? {},
            deleted: deleted ?? false,
            data_contract_id,
            owner,
            is_system: is_system ?? false
        }


        await knex('documents').insert(row).returning('id')

        return row
    },
    cleanup: async (knex) => {
        await knex.raw(`DELETE FROM identities`)
        await knex.raw(`DELETE FROM documents`)
        await knex.raw(`DELETE FROM data_contracts`)
        await knex.raw(`DELETE FROM transfers`)
        await knex.raw(`DELETE FROM state_transitions`)
        await knex.raw(`DELETE FROM blocks`)
    }
}


module.exports = fixtures
