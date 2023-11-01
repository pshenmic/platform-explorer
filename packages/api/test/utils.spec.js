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
                dataContractId: '4xYD4cASeif5e1auCerLhXR8jvDAwshWUdspk3WiBwhE',
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
                        dataContractId: '3sdL7s2mLtNmczbQWGP6NZQy3HS43UKQHL1YGLDmPXhj',
                        id: '4K3Kqdb4zsfVUCb6Tc4FjChK9CBU6NNAhQ7f1NMUeyqB',
                        revision: 3,
                        updatedAt: new Date("2023-10-23T15:44:48.781Z")
                    }
                ]
            })
        });

        it('should decode CreateIdentity', async () => {
            const decoded = await utils.decodeStateTransition(client, createIdentityMock.data)

            assert.deepEqual(decoded, {
                identityId: '7Gw32yK4vhKw926wWmwVDdzQjqxBvXyLK4FbpibYxUwa',
                type: 2
            });
        });

        it('should decode IdentityTopUp', async () => {
            const decoded = await utils.decodeStateTransition(client, identityTopUpMock.data)

            assert.deepEqual(decoded, {
                identityId: 'CuB1Qf2ArA1gGFXyp1muQDcKhdMmrx5yAduZWwqHHKji',
                type: 3,
                amount: 12345678000
            });
        });

        it('should decode DataContractUpdate', async () => {
            const decoded = await utils.decodeStateTransition(client, data_contract_update.data)

            assert.deepEqual(decoded, {
                identityId: 'Dxjkf7du87BbHjiYASdwnCwEhuCbECM6MDiqQY3HHJd9',
                dataContractId: '6jcciCBHZPTuoXEGdyakBkaumsyJRHMEJFyZt25emNML',
                type: 4,
                version: 2
            });
        });

        it('should decode IdentityUpdate', async () => {
            const decoded = await utils.decodeStateTransition(client, identityUpdateMock.data)

            assert.deepEqual(decoded, {
                identityId: 'JCHZE1TDEWJbP9uPCJfv7GneD1y15KiAfda81DLTW1Ce',
                type: 5,
                revision: 1
            });
        });

        it('should decode IdentityCreditWithdrawal', async () => {
            const decoded = await utils.decodeStateTransition(client, identityCreditTransfer.data)

            assert.deepEqual(decoded, {
                senderId: 'HjPEFAs47nKW31zDRpP42dizumjmNAZJX5aAS2PbZo3k',
                recipientId: '5bmapJVccVuNZuEacC2nPBuVkzG7PzzZrJPFFurQhHjv',
                amount: 300000,
                type: 7
            });
        });
    });
});
