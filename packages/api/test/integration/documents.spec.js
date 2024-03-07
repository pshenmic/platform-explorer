const {describe, it, before, after} = require('node:test');
const assert = require('node:assert').strict;
const supertest = require('supertest')
const server = require('../../src/server')


describe('Identities routes', () => {
    let app
    let client

    before(async () => {
        app = await server.start()
        client = supertest(app.server)
    })

    after(async () => {
        await server.stop()
    })

    describe('getDocumentByIdentifier()', async () => {
        it('should return document by identifier', async () => {
            const {body} = await client.get('/document/6MTkkFBatHrvKrDpnRXp22Ym7b7yX4eTFWXkinjLufm2')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, '6MTkkFBatHrvKrDpnRXp22Ym7b7yX4eTFWXkinjLufm2')
            assert.equal(body.dataContractIdentifier, '3KhmjY3vVKU8r5nuzdfifJ49TdS6heasFaFG13vLgX5G')
            assert.equal(body.revision, 2)
            assert.equal(body.txHash, '9101AE58085AD0729287AC67B1B5A14A555FC39CABBDE748427BA9D7D798FAA4')
            assert.equal(body.deleted, false)
            assert.deepEqual(body.data, {
                "toU": "DASH",
                "toMe": "USD",
                "active": true,
                "exRate": 2954,
                "maxAmt": 10000,
                "minAmt": 100,
                "toUVia": "wallet",
                "myStore": false,
                "toMeVia": "venmo",
                "toMeHandle": "DashMoney@TEST",
                "instruction": "*** This is a test DO NOT SEND ME ANYTHING**** \n\nThe handle is not real also."
            })
            assert.equal(body.timestamp, '2024-02-23T18:42:56.329Z')
            assert.equal(body.isSystem, false)
            assert.equal(body.owner, 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN')
        });

        it('should return 404 if document not found', async () => {
            await client.get('/document/fake')
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8');
        });
    });

    describe('getDocumentsByDataContract()', async () => {
        it('should return default set of documents', async () => {
            const {body} = await client.get('/dataContract/Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3/documents')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');


            assert.equal(body.resultSet.length, 5)
            assert.equal(body.pagination.total, 5)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedDocuments = [
                {
                    identifier: 'CupY6LFtbzLjDvSAExx3wyc4LTBAyytvByb26EqUFN8r',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: '205A07669CA840C9395602D4A5AED1EEED037A499AFC4BC5AD137E3644F63BF0',
                    deleted: false,
                    data: {"dgt": "self", "toId": "GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN", "group": "DashMoon"},
                    timestamp: '2024-02-21T22:04:57.233Z',
                    isSystem: false
                },
                {
                    identifier: 'BRk7JXEqv3uLgF1i5dHkrkhR4NJ85bHD1Jk1h5sWLmes',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: 'AB7AD9F825E308A02CA71CF7AE46EC0D974958A1EBD987B0542558BB21D38E1C',
                    deleted: false,
                    data: {
                        "group": "DashMoon",
                        "message": "Welcome to DashMoon, it was a tough decision between WenEvo and DashMoon."
                    },
                    timestamp: '2024-02-21T22:06:10.605Z',
                    isSystem: false
                },
                {
                    identifier: '7cpeBxABVwATWoMfuqAJVFDASnm8MynS9vcQrv2id6uG',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: '36B104755445FD62FE4C7FE1D192B0CCF393E23C6AE461DF0BD69EE0913B78C3',
                    deleted: false,
                    timestamp: '2024-02-21T22:17:43.203Z',
                    data: {"group": "Easy Day", "message": "Test"},
                    isSystem: false
                },
                {
                    identifier: '3kBYJaH1tdUCGrc8q7zgZVeZNQ3riecY5WVPT4w3M5EV',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: '34F6A70341E4657D87E4BB242FD83A3EA41C2F6AC3CEADA0DFDF9CE775257ABB',
                    deleted: false,
                    timestamp: "2024-02-22T02:35:29.877Z",
                    data: {
                        "dgt": "self", "toId": "GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN",
                        "group": "Dash Platform Update"
                    },
                    isSystem: false
                },
                {
                    identifier: '5hMYrBX5qrRv9Qeo4mLxaPVG6boP4W16nQU9Wb4HQCgh',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: 'DD3568A54068C2B8B5C0D6238FBAF9464D9162D5FC14066A00A86E23BC569285',
                    deleted: true,
                    timestamp: "2024-02-22T02:35:58.499Z",
                    data: null,
                    isSystem: false
                }
            ]

            assert.deepEqual(body.resultSet, expectedDocuments)
        });
        it('should return default set of documents desc', async () => {
            const {body} = await client.get('/dataContract/Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3/documents?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');


            assert.equal(body.resultSet.length, 5)
            assert.equal(body.pagination.total, 5)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedDocuments = [{
                identifier: '5hMYrBX5qrRv9Qeo4mLxaPVG6boP4W16nQU9Wb4HQCgh',
                owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                revision: 0,
                txHash: 'DD3568A54068C2B8B5C0D6238FBAF9464D9162D5FC14066A00A86E23BC569285',
                deleted: true,
                timestamp: "2024-02-22T02:35:58.499Z",
                data: null,
                isSystem: false
            }, {
                identifier: '3kBYJaH1tdUCGrc8q7zgZVeZNQ3riecY5WVPT4w3M5EV',
                owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                revision: 0,
                txHash: '34F6A70341E4657D87E4BB242FD83A3EA41C2F6AC3CEADA0DFDF9CE775257ABB',
                deleted: false,
                timestamp: "2024-02-22T02:35:29.877Z",
                data: {
                    "dgt": "self",
                    "toId": "GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN",
                    "group": "Dash Platform Update"
                },
                isSystem: false
            }, {
                identifier: '7cpeBxABVwATWoMfuqAJVFDASnm8MynS9vcQrv2id6uG',
                owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                revision: 0,
                txHash: '36B104755445FD62FE4C7FE1D192B0CCF393E23C6AE461DF0BD69EE0913B78C3',
                deleted: false,
                timestamp: '2024-02-21T22:17:43.203Z',
                data: {"group": "Easy Day", "message": "Test"},
                isSystem: false
            }, {
                identifier: 'BRk7JXEqv3uLgF1i5dHkrkhR4NJ85bHD1Jk1h5sWLmes',
                owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                revision: 0,
                txHash: 'AB7AD9F825E308A02CA71CF7AE46EC0D974958A1EBD987B0542558BB21D38E1C',
                deleted: false,
                data: {
                    "group": "DashMoon",
                    "message": "Welcome to DashMoon, it was a tough decision between WenEvo and DashMoon."
                },
                timestamp: '2024-02-21T22:06:10.605Z',
                isSystem: false
            }, {
                identifier: 'CupY6LFtbzLjDvSAExx3wyc4LTBAyytvByb26EqUFN8r',
                owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                revision: 0,
                txHash: '205A07669CA840C9395602D4A5AED1EEED037A499AFC4BC5AD137E3644F63BF0',
                deleted: false,
                data: {"dgt": "self", "toId": "GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN", "group": "DashMoon"},
                timestamp: '2024-02-21T22:04:57.233Z',
                isSystem: false
            }]

            assert.deepEqual(body.resultSet, expectedDocuments)
        });

        it('should be able to walk through pages', async () => {
            const {body} = await client.get('/dataContract/Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3/documents?page=2&limit=2')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 2)
            assert.equal(body.pagination.total, 5)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 2)

            const expectedDocuments = [
                {
                    identifier: '7cpeBxABVwATWoMfuqAJVFDASnm8MynS9vcQrv2id6uG',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: '36B104755445FD62FE4C7FE1D192B0CCF393E23C6AE461DF0BD69EE0913B78C3',
                    deleted: false,
                    timestamp: '2024-02-21T22:17:43.203Z',
                    data: {"group": "Easy Day", "message": "Test"},
                    isSystem: false
                },
                {
                    identifier: '3kBYJaH1tdUCGrc8q7zgZVeZNQ3riecY5WVPT4w3M5EV',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: '34F6A70341E4657D87E4BB242FD83A3EA41C2F6AC3CEADA0DFDF9CE775257ABB',
                    deleted: false,
                    timestamp: "2024-02-22T02:35:29.877Z",
                    data: {
                        "dgt": "self", "toId": "GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN",
                        "group": "Dash Platform Update"
                    },
                    isSystem: false
                },
            ]

            assert.deepEqual(body.resultSet, expectedDocuments)
        });

        it('should be able to walk through pages desc', async () => {
            const {body} = await client.get('/dataContract/Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3/documents?page=2&limit=2')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 2)
            assert.equal(body.pagination.total, 5)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 2)

            const expectedDocuments = [
                {
                    identifier: '7cpeBxABVwATWoMfuqAJVFDASnm8MynS9vcQrv2id6uG',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: '36B104755445FD62FE4C7FE1D192B0CCF393E23C6AE461DF0BD69EE0913B78C3',
                    deleted: false,
                    timestamp: '2024-02-21T22:17:43.203Z',
                    data: {"group": "Easy Day", "message": "Test"},
                    isSystem: false
                },
                {
                    identifier: '3kBYJaH1tdUCGrc8q7zgZVeZNQ3riecY5WVPT4w3M5EV',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    dataContractIdentifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    revision: 0,
                    txHash: '34F6A70341E4657D87E4BB242FD83A3EA41C2F6AC3CEADA0DFDF9CE775257ABB',
                    deleted: false,
                    timestamp: "2024-02-22T02:35:29.877Z",
                    data: {
                        "dgt": "self", "toId": "GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN",
                        "group": "Dash Platform Update"
                    },
                    isSystem: false
                },
            ]

            assert.deepEqual(body.resultSet, expectedDocuments)
        });
    });

});
