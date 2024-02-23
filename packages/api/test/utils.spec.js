const {describe, it, before} = require('node:test');
const assert = require('node:assert').strict;
const utils = require('../src/utils')
const createIdentityMock = require('./mocks/create_identity.json')
const dataContractCreateMock = require('./mocks/data_contract_create.json')
const documentsBatchMock = require('./mocks/documents_batch.json')
const identityTopUpMock = require('./mocks/identity_top_up.json')
const data_contract_update = require('./mocks/data_contract_update.json')
const identityUpdateMock = require('./mocks/identity_update.json')
const identityCreditTransfer = require('./mocks/identity_credit_transfer.json')
const Dash = require("dash");


describe('Utils', () => {
    let client

    before(async () => {
        client = new Dash.Client()
        await client.platform.initialize()
    })

    describe('decodeStateTransition()', () => {
        it('should decode DataContractCreate', async () => {
            const decoded = await utils.decodeStateTransition(client, dataContractCreateMock.data)

            assert.deepEqual(decoded, {
                identityId: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                dataContractId: '5UFe5yoixK7BPs1FGoAoryP2PCpF2MD3EjGPGeiC5htJ',
                type: 0
            });
        });

        it('should decode DocumentsBatch', async () => {
            const decoded = await utils.decodeStateTransition(client, documentsBatchMock.data)

            assert.deepEqual(decoded, {
                type: 1,
                transitions: [
                    {
                        action: 1,
                        createdAt: null,
                        dataContractId: '7YYHis22sL45AhD8FHXopGSqeKLFNtRBvcXCFmVtypi2',
                        id: 'Ep9bPJniRnkeq3ea7jZZb5tEnjrwQC5txhmEniqzaXZY',
                        revision: 3,
                        updatedAt: new Date("2024-02-22T05:04:03.203Z")
                    }
                ]
            })
        });

        it('should decode CreateIdentity', async () => {
            const decoded = await utils.decodeStateTransition(client, createIdentityMock.data)

            assert.deepEqual(decoded, {
                identityId: '8wM2pBXBumR1wEsfskV1ydrvBApkujH5hHRkhsWaA4sB',
                type: 2
            });
        });

        it('should decode IdentityTopUp', async () => {
            const decoded = await utils.decodeStateTransition(client, identityTopUpMock.data)

            assert.deepEqual(decoded, {
                identityId: '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF',
                type: 3,
                amount: 300000000,
            });
        });

        it.only('should decode DataContractUpdate', async () => {
            const decoded = await utils.decodeStateTransition(client, data_contract_update.data)

            assert.deepEqual(decoded, {
                identityId: '5TPKmPh6xUzsX5SQRapC2tLyNt9PRWhzwkKVALtqsNrw',
                dataContractId: 'Hj8bgkwKh7ABwy9okNQNpA2tw3ekxTehBRLuDzFqRpYu',
                type: 4,
                version: 2
            });
        });

        it('should decode IdentityUpdate', async () => {
            const decoded = await utils.decodeStateTransition(client, identityUpdateMock.data)

            assert.deepEqual(decoded, {
                identityId: '4NGALjtX2t3AXE3ZCqJiSmYuiWEY3ZPQNUBxNWWRrRSp',
                type: 5,
                revision: 2
            });
        });

        it('should decode IdentityCreditTransfer', async () => {
            const decoded = await utils.decodeStateTransition(client, identityCreditTransfer.data)

            assert.deepEqual(decoded, {
                senderId: '4CpFVPyU95ZxNeDnRWfkpjUa9J72i3nZ4YPsTnpdUudu',
                recipientId: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                amount: 9998363,
                type: 7
            });
        });
    });
});
