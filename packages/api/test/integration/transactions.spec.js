const {describe, it, before, after} = require('node:test');
const assert = require('node:assert').strict;
const supertest = require('supertest')
const server = require('../../src/server')
const {getKnex} = require("../../src/utils");
const fixtures = require("../utils/fixtures");
const {StateTransitionEnum} = require("../../src/constants");


describe('Transaction routes', () => {
    let app
    let client
    let knex

    let identity
    let block
    let transactions

    before(async () => {
        app = await server.start()
        client = supertest(app.server)
        knex = getKnex()

        await fixtures.cleanup(knex);

        identity = await fixtures.identity(knex)

        transactions = []

        for (let i = 0; i < 30; i++) {
            const block = await fixtures.block(knex, {height: i + 1})

            const transaction = await fixtures.transaction(knex, {
                block_hash: block.hash,
                data: 'mock_base64',
                type: StateTransitionEnum.DATA_CONTRACT_CREATE,
                owner: identity.identifier
            })

            transactions.push({transaction, block})
        }

    })

    after(async () => {
        await server.stop()
        await knex.destroy()
    })

    describe('getTransactionByHash()', async () => {
        it('should return transaction', async () => {
            const [transaction] = transactions
            const {body} = await client.get(`/transaction/${transaction.transaction.hash}`)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedTransaction = {
                blockHash: transaction.block.hash,
                blockHeight: transaction.block.height,
                data: 'mock_base64',
                hash: transaction.transaction.hash,
                index: transaction.transaction.index,
                timestamp: transaction.block.timestamp.toISOString(),
                type: transaction.transaction.type
            }

            assert.deepEqual(expectedTransaction, body)
        });

        it('should return 404 if transaction not found', async () => {
            await client.get('/transaction/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8');
        });
    });

    describe('getTransactions()', async () => {
        it('should return default set of transactions', async () => {
            const {body} = await client.get('/transactions')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 30)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)


            const expectedTransactions = transactions
                .slice(0, 10)
                .map(transaction => ({
                blockHash: transaction.block.hash,
                blockHeight: transaction.block.height,
                data: 'mock_base64',
                hash: transaction.transaction.hash,
                index: transaction.transaction.index,
                timestamp: transaction.block.timestamp.toISOString(),
                type: transaction.transaction.type
            }))

            assert.deepEqual(expectedTransactions, body.resultSet)
        })

        it('should return default set of transactions desc', async () => {
            const {body} = await client.get('/transactions?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 30)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)


            const expectedTransactions = transactions
                .sort((a, b) => b.block.height - a.block.height)
                .slice(0, 10)
                .map(transaction => ({
                    blockHash: transaction.block.hash,
                    blockHeight: transaction.block.height,
                    data: 'mock_base64',
                    hash: transaction.transaction.hash,
                    index: transaction.transaction.index,
                    timestamp: transaction.block.timestamp.toISOString(),
                    type: transaction.transaction.type
                }))

            assert.deepEqual(expectedTransactions, body.resultSet)
        })

        it('should return be able to walk through pages desc', async () => {
            const {body} = await client.get('/transactions?page=3&limit=3&order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 3)
            assert.equal(body.pagination.total, 30)
            assert.equal(body.pagination.page, 3)
            assert.equal(body.pagination.limit, 3)

            const expectedTransactions = transactions
                .sort((a, b) => b.block.height - a.block.height)
                .slice(6, 9)
                .map(transaction => ({
                    blockHash: transaction.block.hash,
                    blockHeight: transaction.block.height,
                    data: 'mock_base64',
                    hash: transaction.transaction.hash,
                    index: transaction.transaction.index,
                    timestamp: transaction.block.timestamp.toISOString(),
                    type: transaction.transaction.type
                }))

            assert.deepEqual(expectedTransactions, body.resultSet)

        })

        it('should return be able to walk through pages desc', async () => {
            const {body} = await client.get('/transactions?page=3&limit=3')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 3)
            assert.equal(body.pagination.total, 30)
            assert.equal(body.pagination.page, 3)
            assert.equal(body.pagination.limit, 3)

            const expectedTransactions = transactions
                .sort((a, b) => a.block.height - b.block.height)
                .slice(6, 9)
                .map(transaction => ({
                    blockHash: transaction.block.hash,
                    blockHeight: transaction.block.height,
                    data: 'mock_base64',
                    hash: transaction.transaction.hash,
                    index: transaction.transaction.index,
                    timestamp: transaction.block.timestamp.toISOString(),
                    type: transaction.transaction.type
                }))

            assert.deepEqual(expectedTransactions, body.resultSet)

        })
    });

})
