const {describe, it, before} = require('node:test');
const assert = require('node:assert').strict;
const supertest = require('supertest')
const server = require('../../src/server')


describe('DataContracts routes', () => {
    let app
    let client

    before(async () => {
        app = await server.start()
        client = supertest(app.server)
    })

    describe('getDataContractByIdentifier()', async () => {
        it('should return data contract by identifier', async () => {
           const {body} =  await client.get('/dataContract/3KhmjY3vVKU8r5nuzdfifJ49TdS6heasFaFG13vLgX5G')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, '3KhmjY3vVKU8r5nuzdfifJ49TdS6heasFaFG13vLgX5G')
            assert.equal(body.txHash, '701B82AB505335C5523A3D17C3D77C008BC8B5C4800D4501DB527E543308D0F3')
            assert.equal(body.version, 1)
            assert.equal(body.timestamp, '2024-02-21T21:31:02.701Z')
        });

        it('should return last revision of data contract by identifier', async () => {
           const {body} =  await client.get('/dataContract/Gc7HqRGqmA4ZSafQ6zXeKH8Rh4AjNjjWsztotJDLpMXa')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, 'Gc7HqRGqmA4ZSafQ6zXeKH8Rh4AjNjjWsztotJDLpMXa')
            assert.equal(body.txHash, '4107CE20DB3BE2B2A3B3F3ABA9F68438428E734E4ACF39D4F6D03B0F9B187829')
            assert.equal(body.version, 2)
            assert.equal(body.timestamp, '2024-02-22T14:23:57.592Z')
        });

        it('should return 404 if data contract not found', async () => {
            await client.get('/dataContract/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8');
        });
    });

    describe('getDataContracts()', async () => {
        it('should return data contracts', async () => {
            const {body} = await client.get('/dataContracts')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 75)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)
        });
    });
});
