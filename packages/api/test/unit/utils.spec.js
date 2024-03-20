const {describe, it, before} = require('node:test');
const assert = require('node:assert').strict;
const utils = require('../../src/utils')
const createIdentityMock = require('./mocks/create_identity.json')
const dataContractCreateMock = require('./mocks/data_contract_create.json')
const documentsBatchMock = require('./mocks/documents_batch.json')
const identityTopUpMock = require('./mocks/identity_top_up.json')
const data_contract_update = require('./mocks/data_contract_update.json')
const identityUpdateMock = require('./mocks/identity_update.json')
const identityCreditTransfer = require('./mocks/identity_credit_transfer.json')
const identityWithdrawal = require('./mocks/identity_withdrawal.json')
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
                identityId: 'CYYsxRfqPQefANY7yjsSLVHtr4wNxW1zM6Ygmu2aKvCq',
                dataContractId: 'J1rzMRxi2RqFZjpBCS93N3PSYtdMNaPNpNty9k3GtYRy',
                type: 0
            });
        });

        it('should decode DocumentsBatch', async () => {
            const decoded = await utils.decodeStateTransition(client, "AgCrhZtAwveRrwo9QITiR9MqJcHQHFHPUS0ewKXF/s/aogEAAAAb4QihbPKQQmYJ0J+5i90c2y+1HTU6QkLOH0g3pMmIyQEIcHJlb3JkZXLmaMZZr2au4ecsGG3ee1t+Ch1xKgnEDVch9iK/U8UxVfCoJzXeOElnkW/7iiSHA9PCSsQ86oIcaa7sYXNXFSW1ARBzYWx0ZWREb21haW5IYXNoCiBJjPigm6iNZsJXABN4cnRUdXCdvwHjgrKFV8L5kAgQZwABQR9Fti5v8aobfhQTmxxAAUmJrV2WNJKqnWsXasr63DHUqA2/o2QWYJs1hq7MDw6aNTZnKdHfoJGXgbxuRRcnenSp")

            assert.deepEqual(decoded, {
                type: 1,
                transitions: [
                    {
                        action: 0,
                        dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                        id: '2sq2fsVgNrrNKFyRgcLvT8SSVFmCLoMTUfNBY3yEdyeQ',
                        revision: 1
                    }
                ]
            })
        });

        it('should decode CreateIdentity', async () => {
            const decoded = await utils.decodeStateTransition(client, createIdentityMock.data)

            assert.deepEqual(decoded, {
                identityId: '3B3pVgtqLyZx9tUYoSTubXQMs6BQN6kkLURvGG8ax8NJ',
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

        it('should decode IdentityWithdrawal', async () => {
            const decoded = await utils.decodeStateTransition(client, identityWithdrawal.data)

            assert.deepEqual(decoded, {
                senderId: 'FvqzjDyub72Hk51pcmJvd1JUACuor7vA3aJawiVG7Z17',
                amount: 1000000,
                nonce: 1,
                outputScript: '76a9148dc5fd6be194390035cca6293a357bac8e3c35c588ac',
                coreFeePerByte: 2,
                type: 6
            });
        });
    });
});
