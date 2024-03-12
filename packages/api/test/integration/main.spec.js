const {describe, it, before, after} = require('node:test');
const assert = require('node:assert').strict;
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require("../utils/fixtures");
const {StateTransitionEnum} = require("../../src/constants");

describe('Other routes', () => {
    let app
    let client
    let knex

    let block
    let identityTransaction
    let identity
    let dataContractTransaction
    let dataContract
    let documentTransaction
    let document

    before(async () => {
        app = await server.start()
        client = supertest(app.server)

        knex = require('knex')({
            client: 'pg',
            connection: {
                host: process.env["POSTGRES_HOST"],
                port: process.env["POSTGRES_PORT"],
                user: process.env["POSTGRES_USER"],
                database: process.env["POSTGRES_DB"],
                password: process.env["POSTGRES_PASS"],
                ssl: process.env["POSTGRES_SSL"] ? {rejectUnauthorized: false} : false,
            }
        });

        await fixtures.cleanup(knex)

        // Prepare an identity with data contract and document
        // 3 tx in one block
        // for the search() test

        const identityIdentifier = fixtures.identifier()
        block = await fixtures.block(knex)

        identityTransaction = await fixtures.transaction(knex, {
            block_hash: block.hash,
            type: StateTransitionEnum.IDENTITY_CREATE,
            owner: identityIdentifier
        })
        identity = await fixtures.identity(knex, {
            identifier: identityIdentifier,
            state_transition_hash: identityTransaction.hash
        })

        dataContractTransaction = await fixtures.transaction(knex, {
            block_hash: block.hash,
            type: StateTransitionEnum.DATA_CONTRACT_CREATE,
            owner: identity.identifier
        })
        dataContract = await fixtures.dataContract(knex, {
            state_transition_hash: dataContractTransaction.hash,
            owner: identity.identifier
        })

        documentTransaction = await fixtures.transaction(knex, {
            block_hash: block.hash,
            type: StateTransitionEnum.DOCUMENTS_BATCH,
            owner: identity.identifier
        })
        document = await fixtures.document(knex, {
            state_transition_hash: documentTransaction.hash,
            owner: identity.identifier,
            data_contract_id: dataContract.id
        })


        // prepare for get status

        for (let i = 1; i < 10; i++) {
            await fixtures.block(knex, {timestamp: new Date(block.timestamp.getTime() + 3000 * i)})
        }
    })

    after(async () => {
        await server.stop()
        await fixtures.cleanup(knex)
        await knex.destroy()
    })

    describe('search()', async () => {
        it('should search block by hash', async () => {
            const {body} = await client.get(`/search?query=${block.hash}`)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedBlock = {
                header: {
                    hash: block.hash,
                    height: block.height,
                    timestamp: block.timestamp.toISOString(),
                    blockVersion: block.block_version,
                    appVersion: block.app_version,
                    l1LockedHeight: block.l1_locked_height
                },
                txs: [identityTransaction.hash, dataContractTransaction.hash, documentTransaction.hash]
            }

            assert.deepEqual({block: expectedBlock}, body)
        });

        it('should search transaction by hash', async () => {
            const {body} = await client.get(`/search?query=${dataContractTransaction.hash}`)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedTransaction = {
                hash: dataContractTransaction.hash,
                index: dataContractTransaction.index,
                blockHash: dataContractTransaction.block_hash,
                blockHeight: block.height,
                type: dataContractTransaction.type,
                data: JSON.stringify(dataContractTransaction.data),
                timestamp: block.timestamp.toISOString()
            }

            assert.deepEqual({transaction: expectedTransaction}, body)
        });

        it('should search block by height', async () => {
            const {body} = await client.get(`/search?query=${block.height}`)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedBlock = {
                header: {
                    hash: block.hash,
                    height: block.height,
                    timestamp: block.timestamp.toISOString(),
                    blockVersion: block.block_version,
                    appVersion: block.app_version,
                    l1LockedHeight: block.l1_locked_height
                },
                txs: [identityTransaction.hash, dataContractTransaction.hash, documentTransaction.hash]
            }

            assert.deepEqual({block: expectedBlock}, body)
        });

        it('should search by data contract', async () => {
            const {body} = await client.get(`/search?query=${dataContract.identifier}`)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedDataContract = {
                identifier: dataContract.identifier,
                owner: identity.identifier.trim(),
                schema: dataContract.schema,
                version: 0,
                txHash: dataContractTransaction.hash,
                timestamp: block.timestamp.toISOString(),
                isSystem: false
            }

            assert.deepEqual({dataContract: expectedDataContract}, body)
        });

        it('should search by identity', async () => {
            const {body} = await client.get(`/search?query=${identity.identifier}`)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedIdentity = {
                identifier: identity.identifier,
                revision: 0,
                balance: 0,
                timestamp: block.timestamp.toISOString(),
                txHash: identityTransaction.hash,
                totalTxs: 3,
                totalTransfers: 0,
                totalDocuments: 1,
                totalDataContracts: 1,
                isSystem: false,
                owner: identity.identifier
            }

            assert.deepEqual({identity: expectedIdentity}, body)
        });
    });

    describe('getStatus()', async () => {
        it('should return status', async () => {
            const {body} = await client.get('/status')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedStats = {
                appVersion: block.app_version,
                blockVersion: block.block_version,
                blocksCount: 10,
                blockTimeAverage: 3,
                txCount: 3,
                transfersCount: 0,
                dataContractsCount: 1,
                documentsCount: 1,
                network: null,
                tenderdashVersion: null
            }

            assert.deepEqual(body, expectedStats)
        });
    });
});
