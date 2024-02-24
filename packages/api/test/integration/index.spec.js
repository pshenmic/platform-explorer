const {describe, it, before} = require('node:test');
const assert = require('node:assert').strict;
const supertest = require('supertest')
const server = require('../../src/server')


describe('Index route', () => {
    let app
    let client

    before(async () => {
        app = await server.start()
        client = supertest(app.server)
    })

    it('should return 404', async () => {
        await client.get('/')
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8');
    });
});
