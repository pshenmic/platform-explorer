const {describe, it, before} = require('node:test');
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

    describe('getIdentityByIdentifier()', async () => {
        it('should return identity by identifier', async () => {
            const {body} = await client.get('/identity/9zgY5RtP9z7yxFzp9yC7Eh26p7bvtp3o9P2EFHDxqXKd')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, '9zgY5RtP9z7yxFzp9yC7Eh26p7bvtp3o9P2EFHDxqXKd')
            assert.equal(body.revision, 2)
            assert.equal(body.balance, 300000000)
            assert.equal(body.totalTxs, '12')
            assert.equal(body.totalTransfers, '1')
            assert.equal(body.totalDocuments, '3')
            assert.equal(body.totalDataContracts, '4')
            assert.equal(body.txHash, '23A2C5C960F8F1C88C78CFD9F07AE8F33B3814B46EDC9924C8CB6E06BDA1838D')
            assert.equal(body.owner, '9zgY5RtP9z7yxFzp9yC7Eh26p7bvtp3o9P2EFHDxqXKd')
            assert.equal(body.isSystem, false)
        });

        it('should return identity with several receiving transfers', async () => {
            const {body} = await client.get('/identity/GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN')
            assert.equal(body.revision, 0)
            assert.equal(body.balance, 2099980458)
            assert.equal(body.totalTxs, '31')
            assert.equal(body.totalTransfers, '12')
            assert.equal(body.totalDocuments, '18')
            assert.equal(body.totalDataContracts, '8')
            assert.equal(body.txHash, '8101AE578BDE5CF871FA323BBE727802AE11A016BDB47EFA074B880C73493598')
            assert.equal(body.owner, 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN')
            assert.equal(body.isSystem, false)
        });

        it('should return identity with in/out transfers', async () => {
            const {body} = await client.get('/identity/Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, 'Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb')
            assert.equal(body.revision, 2)
            assert.equal(body.balance, 299999000)
            assert.equal(body.totalTxs, '18')
            assert.equal(body.totalTransfers, '2')
            assert.equal(body.totalDocuments, '6')
            assert.equal(body.totalDataContracts, '4')
            assert.equal(body.txHash, '6C276EA0DD20F8D69F9D65A10D480843477317D4A1B9CA705D577CF8E822A36A')
            assert.equal(body.owner, 'Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb')
            assert.equal(body.isSystem, false)
        });

        it('should return system identity', async () => {
            const {body} = await client.get('/identity/H9sjb2bHG8t7gq5SwNdqzMWG7KR6sf3CbziFzthCkDD6')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, 'H9sjb2bHG8t7gq5SwNdqzMWG7KR6sf3CbziFzthCkDD6')
            assert.equal(body.revision, 0)
            assert.equal(body.balance, 0)
            assert.equal(body.totalTxs, '0')
            assert.equal(body.totalTransfers, '0')
            assert.equal(body.totalDocuments, '0')
            assert.equal(body.totalDataContracts, '1')
            assert.equal(body.txHash, null)
            assert.equal(body.owner, 'H9sjb2bHG8t7gq5SwNdqzMWG7KR6sf3CbziFzthCkDD6')
            assert.equal(body.isSystem, true)
        });

        it('should return system identity with system document', async () => {
            const {body} = await client.get('/identity/4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF')
            assert.equal(body.revision, 0)
            assert.equal(body.balance, 300000000)
            assert.equal(body.totalTxs, '1')
            assert.equal(body.totalTransfers, '1')
            assert.equal(body.totalDocuments, '1')
            assert.equal(body.totalDataContracts, '1')
            assert.equal(body.txHash, null)
            assert.equal(body.owner, '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF')
            assert.equal(body.isSystem, true)
        });

        it('should return 404 when identity not found', async () => {
            await client.get('/identity/fake')
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8');
        });
    });

    describe('getIdentities()', async () => {
        it('should return default set of identities', async () => {
            const {body} = await client.get('/identities')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 67)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedIdentities = [
                {
                    identifier: 'CUjAw7eD64wmaznNrfC5sKdn4Lpr1wBvWKMjGLrmEs5h',
                    owner: 'CUjAw7eD64wmaznNrfC5sKdn4Lpr1wBvWKMjGLrmEs5h',
                    revision: 0,
                    txHash: null,
                    balance: null,
                    timestamp: null,
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: true,
                },
                {
                    identifier: 'BjDiho3ahEBT6w45YungawKrUcqCZ7q7p46FXwnoakXR',
                    owner: 'BjDiho3ahEBT6w45YungawKrUcqCZ7q7p46FXwnoakXR',
                    revision: 0,
                    txHash: null,
                    balance: null,
                    timestamp: null,
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: true,
                },
                {
                    identifier: 'H9sjb2bHG8t7gq5SwNdqzMWG7KR6sf3CbziFzthCkDD6',
                    owner: 'H9sjb2bHG8t7gq5SwNdqzMWG7KR6sf3CbziFzthCkDD6',
                    revision: 0,
                    txHash: null,
                    balance: null,
                    timestamp: null,
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: true,
                },
                {
                    identifier: '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF',
                    owner: '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF',
                    revision: 0,
                    txHash: null,
                    balance: null,
                    timestamp: null,
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: true,
                },
                {
                    identifier: '5PhRFRrWZc5Mj8NqtpHNXCmmEQkcZE8akyDkKhsUVD4k',
                    owner: '5PhRFRrWZc5Mj8NqtpHNXCmmEQkcZE8akyDkKhsUVD4k',
                    revision: 0,
                    txHash: null,
                    balance: null,
                    timestamp: null,
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: true,
                },
                {
                    identifier: '8wM2pBXBumR1wEsfskV1ydrvBApkujH5hHRkhsWaA4sB',
                    owner: '8wM2pBXBumR1wEsfskV1ydrvBApkujH5hHRkhsWaA4sB',
                    revision: 0,
                    txHash: 'A7B22B6B0F0A5099C1642035C22262576A117A3272746B111B9143183AE6B9F6',
                    balance: null,
                    timestamp: '2024-02-21T11:47:24.777Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'AXm63wKF5XobR575fGjjJF76jXnQw9cDkB68N5HFUFfi',
                    owner: 'AXm63wKF5XobR575fGjjJF76jXnQw9cDkB68N5HFUFfi',
                    revision: 0,
                    txHash: 'DBABC46F595ADE9D8594E9AA4F045B41C2A9C750901C849FD3C11BDB7235211C',
                    balance: null,
                    timestamp: '2024-02-21T11:48:56.561Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: '96fYGsTxJSqK8eDWYLZqeCQkkxJLsDJ5vxy1WLY1k8EP',
                    owner: '96fYGsTxJSqK8eDWYLZqeCQkkxJLsDJ5vxy1WLY1k8EP',
                    revision: 0,
                    txHash: 'B636CC2A10BE68EE7FF5C29A8EA4F3096A78677239D9C510653F236ECA45EA0D',
                    balance: null,
                    timestamp: '2024-02-21T11:49:27.953Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: '6o6VzJ8nfEN7j1wANmh99d3Qii6vgzQfFY378Vxu1j5g',
                    owner: '6o6VzJ8nfEN7j1wANmh99d3Qii6vgzQfFY378Vxu1j5g',
                    revision: 0,
                    txHash: '8FD45C4D6405F651203585906D403B9E8846B4B749E0C5EB9E42A29C99DE5171',
                    balance: null,
                    timestamp: '2024-02-21T11:50:14.307Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'JAg5S13VX1Emq1T4BjhbDhowth8UKtKNxFbV7uWgVsar',
                    owner: 'JAg5S13VX1Emq1T4BjhbDhowth8UKtKNxFbV7uWgVsar',
                    revision: 0,
                    txHash: 'D4A8894C736CFE79514AE62AEA21643447F40DD8C0A9B0E51B11D3210F5BFD7D',
                    balance: null,
                    timestamp: '2024-02-21T11:50:21.584Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
            ];


            assert.deepEqual(body.resultSet, expectedIdentities)
        });

        it('should allow walk through pages desc', async () => {
            const {body} = await client.get('/identities?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 67)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedIdentities = [
                {
                    identifier: '4NGALjtX2t3AXE3ZCqJiSmYuiWEY3ZPQNUBxNWWRrRSp',
                    owner: '4NGALjtX2t3AXE3ZCqJiSmYuiWEY3ZPQNUBxNWWRrRSp',
                    revision: 13,
                    txHash: 'C994CB2E31FE4294C74B90E38428119B51A0FAEC9568C9D6B4D53F1681767D67',
                    balance: null,
                    timestamp: '2024-02-27T07:00:12.981Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: '8cy9o4p3VCc6Y3WRYTnV15HHP6FMBS5YGtYZB4k53c12',
                    owner: '8cy9o4p3VCc6Y3WRYTnV15HHP6FMBS5YGtYZB4k53c12',
                    revision: 0,
                    txHash: 'CE9E5424E2BE0904B8F10016042F38B28758CAFDAE3DDAEAD8D2E1EAA0055CB0',
                    balance: null,
                    timestamp: '2024-02-27T05:20:57.928Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'DRJmTEw3LHkQkn8FYVZTvGhGFHmvZcBXScQFLYU9qWVR',
                    owner: 'DRJmTEw3LHkQkn8FYVZTvGhGFHmvZcBXScQFLYU9qWVR',
                    revision: 2,
                    txHash: '845F2CD59F89659DA5FD2BB0C0F33659331D314888975D944E58FCC1E1BE42D1',
                    balance: null,
                    timestamp: '2024-02-26T14:16:12.638Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'EWBpx3TFNdwkzG1VBuk12ZNGvNy82nnAWLS7szDgtq7Z',
                    owner: 'EWBpx3TFNdwkzG1VBuk12ZNGvNy82nnAWLS7szDgtq7Z',
                    revision: 2,
                    txHash: 'E08EBDD273E2615EAD1373CE4321C78F1E9634C126022F63014BC20B09AAE0AC',
                    balance: null,
                    timestamp: '2024-02-26T14:04:41.835Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb',
                    owner: 'Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb',
                    revision: 2,
                    txHash: '6C276EA0DD20F8D69F9D65A10D480843477317D4A1B9CA705D577CF8E822A36A',
                    balance: null,
                    timestamp: '2024-02-26T13:56:55.421Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'BFGgyMGDdqmKB9VMm3XJ3RSCimq9DGBUQQz8XGZr8KET',
                    owner: 'BFGgyMGDdqmKB9VMm3XJ3RSCimq9DGBUQQz8XGZr8KET',
                    revision: 2,
                    txHash: 'BD310AD3962CB802F68A9EFF3E4986D32B940CFE3910F56DCA533E10ABCC5C8A',
                    balance: null,
                    timestamp: '2024-02-26T13:51:25.960Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: '4AXSk7GrmVfhTSgK6yiEVUbZYQNPaazxEAW2KkkUxigW',
                    owner: '4AXSk7GrmVfhTSgK6yiEVUbZYQNPaazxEAW2KkkUxigW',
                    revision: 2,
                    txHash: 'C3435059787D0DA05A045386FF5C1C5CA33C03BA2E6A2A97530F7E4A14DD550A',
                    balance: null,
                    timestamp: '2024-02-26T12:56:34.693Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'DLoDjwGLBpWsVqLac8QVjYeXYoU8To8ZN846KmjCEwZL',
                    owner: 'DLoDjwGLBpWsVqLac8QVjYeXYoU8To8ZN846KmjCEwZL',
                    revision: 0,
                    txHash: '7B49DAC43750FE54FA7560A291F28CCE6A0C2DA6597B322A0BEF3883A5253325',
                    balance: null,
                    timestamp: '2024-02-26T12:42:35.711Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'ATDNdrSXFQutHb5Pyi27J5HUX7ZzkJsUS5XGwzrcX5zk',
                    owner: 'ATDNdrSXFQutHb5Pyi27J5HUX7ZzkJsUS5XGwzrcX5zk',
                    revision: 0,
                    txHash: '2C4C4BBEF4CC8F2E0B3986B15E2FF8477300C86F47141CEE86284CC641D4CA53',
                    balance: null,
                    timestamp: '2024-02-26T12:42:26.679Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'GUoTZ3mVz5QDSs9LmngYh1ADtKRMyyQTTWPUqaBPTdtN',
                    owner: 'GUoTZ3mVz5QDSs9LmngYh1ADtKRMyyQTTWPUqaBPTdtN',
                    revision: 0,
                    txHash: 'B827C028A30A1C32BE6B3CE15C7C37435C5295C0CEB8C7B2555D833F8191B168',
                    balance: null,
                    timestamp: '2024-02-26T12:42:17.711Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
            ];

            assert.deepEqual(body.resultSet, expectedIdentities)
        });


        it('should allow walk through pages', async () => {
            const {body} = await client.get('/identities?page=2&limit=5')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 5)
            assert.equal(body.pagination.total, 67)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 5)

            const expectedIdentities = [
                {
                    identifier: '8wM2pBXBumR1wEsfskV1ydrvBApkujH5hHRkhsWaA4sB',
                    owner: '8wM2pBXBumR1wEsfskV1ydrvBApkujH5hHRkhsWaA4sB',
                    revision: 0,
                    txHash: 'A7B22B6B0F0A5099C1642035C22262576A117A3272746B111B9143183AE6B9F6',
                    balance: null,
                    timestamp: '2024-02-21T11:47:24.777Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'AXm63wKF5XobR575fGjjJF76jXnQw9cDkB68N5HFUFfi',
                    owner: 'AXm63wKF5XobR575fGjjJF76jXnQw9cDkB68N5HFUFfi',
                    revision: 0,
                    txHash: 'DBABC46F595ADE9D8594E9AA4F045B41C2A9C750901C849FD3C11BDB7235211C',
                    balance: null,
                    timestamp: '2024-02-21T11:48:56.561Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: '96fYGsTxJSqK8eDWYLZqeCQkkxJLsDJ5vxy1WLY1k8EP',
                    owner: '96fYGsTxJSqK8eDWYLZqeCQkkxJLsDJ5vxy1WLY1k8EP',
                    revision: 0,
                    txHash: 'B636CC2A10BE68EE7FF5C29A8EA4F3096A78677239D9C510653F236ECA45EA0D',
                    balance: null,
                    timestamp: '2024-02-21T11:49:27.953Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: '6o6VzJ8nfEN7j1wANmh99d3Qii6vgzQfFY378Vxu1j5g',
                    owner: '6o6VzJ8nfEN7j1wANmh99d3Qii6vgzQfFY378Vxu1j5g',
                    revision: 0,
                    txHash: '8FD45C4D6405F651203585906D403B9E8846B4B749E0C5EB9E42A29C99DE5171',
                    balance: null,
                    timestamp: '2024-02-21T11:50:14.307Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
                {
                    identifier: 'JAg5S13VX1Emq1T4BjhbDhowth8UKtKNxFbV7uWgVsar',
                    owner: 'JAg5S13VX1Emq1T4BjhbDhowth8UKtKNxFbV7uWgVsar',
                    revision: 0,
                    txHash: 'D4A8894C736CFE79514AE62AEA21643447F40DD8C0A9B0E51B11D3210F5BFD7D',
                    balance: null,
                    timestamp: '2024-02-21T11:50:21.584Z',
                    totalTxs: null,
                    totalDocuments: null,
                    totalDataContracts: null,
                    totalTransfers: null,
                    isSystem: false,
                },
            ];


            assert.deepEqual(body.resultSet, expectedIdentities)
        });

    });

    describe('getDataContractsByIdentity()', async () => {
        it('should return default set of data contracts by identity', async () => {
            const {body} = await client.get('/identity/6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7/dataContracts')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 4)
            assert.equal(body.pagination.total, 4)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedDataContracts = [
                {
                    identifier: 'JDPL1pd4gkTNCaiQpUUSbk6Ckc5aVixwbArVNUNduJgW',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 2,
                    schema: null,
                    txHash: '9263C9CEA9E955BC2E366FD871E3132A5BFC288F1A9928F31970CD283F93FDC7',
                    timestamp: '2024-02-22T15:56:19.212Z',
                    isSystem: false
                },
                {
                    identifier: '7Lc5Dh53Maj6XTpLPym1bykSPufeL3ngbR8zDe8zuKx2',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 1,
                    schema: null,
                    txHash: 'F14BB1974C04CBC74BBCE1464B75F0F1428AB47E748A3C4776440F7024BA5D6A',
                    timestamp: '2024-02-22T15:56:22.813Z',
                    isSystem: false
                },
                {
                    identifier: '9R6kjxKVLvAkV63Hi915NyhWRWhGMuTNyGY2DuHj4SY3',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 1,
                    schema: null,
                    txHash: '8D0142306BCFB8CDA1E987EE74D212BDA2FB0E23209B51A4C86940CB7449EC78',
                    timestamp: '2024-02-22T15:56:26.594Z',
                    isSystem: false
                },
                {
                    identifier: '8VPogg8WSuvFYyq8KQH3ofNHs365ymwhRQZ2XELAVWMq',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 1,
                    schema: null,
                    txHash: '4A308170EDF36B1613CA3D7E3AA8D2EF78FC12953DF9C2F40B663A53C4B32A59',
                    timestamp: '2024-02-22T15:56:31.338Z',
                    isSystem: false
                }
            ]

            assert.deepEqual(body.resultSet, expectedDataContracts)
        });

        it('should return default set of data contracts by identity order desc', async () => {
            const {body} = await client.get('/identity/6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7/dataContracts?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 4)
            assert.equal(body.pagination.total, 4)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedDataContracts = [
                {
                    identifier: '8VPogg8WSuvFYyq8KQH3ofNHs365ymwhRQZ2XELAVWMq',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 1,
                    schema: null,
                    txHash: '4A308170EDF36B1613CA3D7E3AA8D2EF78FC12953DF9C2F40B663A53C4B32A59',
                    timestamp: '2024-02-22T15:56:31.338Z',
                    isSystem: false
                },
                {
                    identifier: '9R6kjxKVLvAkV63Hi915NyhWRWhGMuTNyGY2DuHj4SY3',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 1,
                    schema: null,
                    txHash: '8D0142306BCFB8CDA1E987EE74D212BDA2FB0E23209B51A4C86940CB7449EC78',
                    timestamp: '2024-02-22T15:56:26.594Z',
                    isSystem: false
                },
                {
                    identifier: '7Lc5Dh53Maj6XTpLPym1bykSPufeL3ngbR8zDe8zuKx2',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 1,
                    schema: null,
                    txHash: 'F14BB1974C04CBC74BBCE1464B75F0F1428AB47E748A3C4776440F7024BA5D6A',
                    timestamp: '2024-02-22T15:56:22.813Z',
                    isSystem: false
                },
                {
                    identifier: 'JDPL1pd4gkTNCaiQpUUSbk6Ckc5aVixwbArVNUNduJgW',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 2,
                    schema: null,
                    txHash: '9263C9CEA9E955BC2E366FD871E3132A5BFC288F1A9928F31970CD283F93FDC7',
                    timestamp: '2024-02-22T15:56:19.212Z',
                    isSystem: false
                },
            ]

            assert.deepEqual(body.resultSet, expectedDataContracts)
        });

        it('should allow to walk through pages', async () => {
            const {body} = await client.get('/identity/6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7/dataContracts?page=2&limit=1')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 1)
            assert.equal(body.pagination.total, 4)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 1)

            const expectedDataContracts = [
                {
                    identifier: '7Lc5Dh53Maj6XTpLPym1bykSPufeL3ngbR8zDe8zuKx2',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 1,
                    schema: null,
                    txHash: 'F14BB1974C04CBC74BBCE1464B75F0F1428AB47E748A3C4776440F7024BA5D6A',
                    timestamp: '2024-02-22T15:56:22.813Z',
                    isSystem: false
                }
            ]

            assert.deepEqual(body.resultSet, expectedDataContracts)
        });

        it('should allow to walk through pages desc', async () => {
            const {body} = await client.get('/identity/6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7/dataContracts?page=2&limit=1&order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 1)
            assert.equal(body.pagination.total, 4)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 1)

            const expectedDataContracts = [
                {
                    identifier: '9R6kjxKVLvAkV63Hi915NyhWRWhGMuTNyGY2DuHj4SY3',
                    owner: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    version: 1,
                    schema: null,
                    txHash: '8D0142306BCFB8CDA1E987EE74D212BDA2FB0E23209B51A4C86940CB7449EC78',
                    timestamp: '2024-02-22T15:56:26.594Z',
                    isSystem: false
                }
            ]

            assert.deepEqual(body.resultSet, expectedDataContracts)
        });
    });

    describe('getDocumentsByIdentity()', async () => {
        it('should return default set of data contracts by identity', async () => {
            const {body} = await client.get('/identity/FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT/documents')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 42)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedDocuments = [
                {
                    identifier: 'HAXKAECXvV9kMwh4jGYpjLq6aKm11CTqX7tnjpFt2V4A',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '5EE3298CDDC572770CDD77A3E252D3D2B4BF661FDAD591D265A8F5B45FCC1DA4',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:07:10.250Z',
                    isSystem: false
                },
                {
                    identifier: 'mEWb8oGXKLeFYrg6pQqAGADrAC5bsRHqRbtRJ23C1JS',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'C321757B6CB5F34A988143C706C5395F08E38ADA10E091CBD8036ECEF6329412',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:08:44.491Z',
                    isSystem: false
                },
                {
                    identifier: 'Chmijipcic5bVsP1a6V2NMvjQf6t9Jb9obxr9EEeCH3g',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'CB1E2D8D6130AF3D84F282337703DE5291098162E061921E81C1A1B0EFAE6559',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:09:53.453Z',
                    isSystem: false
                },
                {
                    identifier: '5TGQaShrtq24cYz6cQ9UyX5tPCXu54DNx1JyS6YofwqV',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '6002E1A6B1758CAD7552AEFBA762F9FEDAE1395DAD675B64376948CD32C589F0',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:10:43.224Z',
                    isSystem: false
                },
                {
                    identifier: '8EGn5n8KtatWNGdSF6y97uqjFnqmAwmpdf6fPDTUZ84U',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'ED04F3D023757ED85F1F67B43E62B9BD81798B7D86F2B6400AF1C7BA54025F67',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: '8KWUprkZ9rC6GFAzdwgS2XbBoJyfSP18YL3VvrpK2UkA',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '64660DD31D4719B472AB541C2F1742A47F55E07F1C472A07311D76E30494136A',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: '9C1pB6c6xzonBGtNm8WvRJn27K4xNBWwMNfN6K4gFN7S',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '532B09270DBF98E4FCAA446A6C36A89CDF8CFFF07A595542D86EE0961DF4A467',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: '233eev1tRqQxRePgb583Jw1CdGbioZFiZ7SFHUjTQsjs',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'A243D5A24EB1C70E5E71E4E49271D5841755B0DC1D6FA76CEED2CBFF16A7F1C3',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: 'C5WaZwoY9ABr6bPnAx3CWaeBMkoew2hR7vfYxs1GUDYu',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'BC3A28F4E5158EB6631563C5F020EFD80D98265948348E9407973AC5B55C1737',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: '5nixMveY9QUf6Lrvf112aAQsWnSMLY9TnwnSQKvt3wxL',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'B381347D2CC529D23154E4E4D30792B819E07305B631C55069FF7D07032AF712',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                }
            ]

            assert.deepEqual(body.resultSet, expectedDocuments)
        });

        it('should return default set of data contracts by identity desc', async () => {
            const {body} = await client.get('/identity/FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT/documents?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 42)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedDocuments = [
                {
                    identifier: 'EYpWAj5aKRWebCjPjbMstcdPFLM8jny6oCudxbJT3qw4',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'F87C6EB07E292D685E032C1D3B771129BAF771BE064FBFACA6582240242C0944',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '3nuki3LSaJNaBEocbLvpC716WeSyS2ebeYwtXHAP4GYc',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '3F6F8CD66D5B25D1BEA87FEED2ADA3F08E8535217F3EF930EFAB904B51F4D6F5',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '5zsQQfdtofhbAtKdC1ymTyqmFMrrLvczpfromTrrjHPJ',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'C34C92471C69468C944FF9EB48E16108CB7004BB0362C7FA174908A8589CA19F',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '6hARM3WK8QratwHW2LqUK52mmr3u6osYYCxDQUQJwowC',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '2BFD3A9D94F82A16E2E65D04BFF5DB2EDE07261A450BCF71019664DC4541365F',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: 'HHH7Qkmb57GA8SNhobckaHCpxceXZrGQAGyqvgYxpuPc',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '103BF81C0E6E4B6E141D1766574F6088E852351AFA8981F06DA22B56789067F7',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '2so9EYxGbvQ1dVnE73YPxKGj9eRTcih8pgcnpLRVTiqz',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '67F1A51E8978D2D71E0C9A06F07AADCE2F03E1F02967CB5D383C4969A15A9B9C',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: 'GR7HmrG91BDkaJ8hBPuZR77PPuW8SDLxrRv7g33TKUir',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'D2424B622FD9ABA3C6C3D0CE5449F1B8F780E0E453A9BAD509E4B5630EB094B7',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '7DJ49xjUmYPwvVVehwd8ErRX5VKJyZdvBp1BHfxGec7X',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '6EE8CA8123F9A672C079D403FD07E8965D5ABF5D94732C704570A39AF810E9C4',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '8pzeDsUzVZABAvM5Hx8oLRVTTFdBPtRR4pZT6qG4EHkw',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '13EC3A167E1A53D1AB7F944E26F24168DDD37A5F466D34A2FF40D5B889D58DD9',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '9A8S3w7HyRUyEZ5RK5iJRrAAVw65hECBgJwEiLR7rWzL',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '2E6699C31288BE088C0A1A1B884165BC65F8DD5E8BCDAC0CB0CA9E59EAE3E619',
                    deleted : false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                }
            ]

            assert.deepEqual(body.resultSet, expectedDocuments)
        });

        it('should be able to walk through pages', async () => {
            const {body} = await client.get('/identity/FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT/documents?&page=2&limit=7')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 7)
            assert.equal(body.pagination.total, 42)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 7)

            const expectedDocuments = [
                {
                    identifier: '233eev1tRqQxRePgb583Jw1CdGbioZFiZ7SFHUjTQsjs',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'A243D5A24EB1C70E5E71E4E49271D5841755B0DC1D6FA76CEED2CBFF16A7F1C3',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: 'C5WaZwoY9ABr6bPnAx3CWaeBMkoew2hR7vfYxs1GUDYu',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'BC3A28F4E5158EB6631563C5F020EFD80D98265948348E9407973AC5B55C1737',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: '5nixMveY9QUf6Lrvf112aAQsWnSMLY9TnwnSQKvt3wxL',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'B381347D2CC529D23154E4E4D30792B819E07305B631C55069FF7D07032AF712',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: 'EQXuy31aUFapTznW8v8ySvfn2C2sT6Jk6Um86w8kYMjv',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'AFA496140C81C9EEA135156A0FB18A1BD4819E73522BD434FFF3E41F4E9319FF',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: 'D2RLPp6J4d1W6UjjMhpWtJooG26ptPoHv9RFmLR1D4BF',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '34A771D8297D4E601C9BFBF0FC06D3B6D30823B31E94DDC74CE8FAFDCF3AA87E',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: '73vngq3aa29qNGCBY6X5xCUXUTsFStv5gHaiosDgGwhT',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '6E977BE128B3A410B9F7F165FA77B0F5BD666EAF61830F4C7D9CDF846B1BA43D',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                },
                {
                    identifier: '4tyW9F15hrxFxspVbAVLKUHnzG63YWV9RhqLuRXgDqy1',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '22B1B82CE73255125E7739058AAF221ED7824F41C9A847BD353C476FBC3B436F',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-21T14:10:48.721Z',
                    isSystem: false
                }
            ]

            assert.deepEqual(body.resultSet, expectedDocuments)
        });

        it('should be able to walk through pages desc', async () => {
            const {body} = await client.get('/identity/FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT/documents?&page=2&limit=7&order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 7)
            assert.equal(body.pagination.total, 42)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 7)

            const expectedDocuments = [
                {
                    identifier: '7DJ49xjUmYPwvVVehwd8ErRX5VKJyZdvBp1BHfxGec7X',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '6EE8CA8123F9A672C079D403FD07E8965D5ABF5D94732C704570A39AF810E9C4',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '8pzeDsUzVZABAvM5Hx8oLRVTTFdBPtRR4pZT6qG4EHkw',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '13EC3A167E1A53D1AB7F944E26F24168DDD37A5F466D34A2FF40D5B889D58DD9',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '9A8S3w7HyRUyEZ5RK5iJRrAAVw65hECBgJwEiLR7rWzL',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '2E6699C31288BE088C0A1A1B884165BC65F8DD5E8BCDAC0CB0CA9E59EAE3E619',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: 'BpVFAFcZX9dP3vJU65o8omCwHwrFbtS3KLnaXvdmayhY',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '705AA6A48FAF1D938D779DF9F01561686A7F87700A196BEBBC2759C42E6D654C',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: 'CkLQwH4Nc79oKxNVkoE5MKveFCmStdWEGCWeT4gFiVyw',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: 'B4C74B008935F1B4605ABA1BB3EBE1F258D199CCF86ABD41C2890613723E64C7',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: '8FuGKiSkBWipxNd6xFyqWxvRFXfuveWWfh9a7mp5TzBr',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '4A64638429E00FBE45C574FCA2C933273DF256AD100E8D603D07E54E45B219E4',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-22T00:34:02.991Z',
                    isSystem: false
                },
                {
                    identifier: 'CG2kDUXt6EP7sXBhaLtHGptjvJrvTZ6DreMmMv9A9m5y',
                    owner: 'FtejFCDrTKP4sc7EBJjFvZBATeS7yokeQ1MqhTKkdRJT',
                    dataContractIdentifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    revision: 0,
                    txHash: '38074910AF54ED3582574FCFF037E934A0FD46575D6B8D9E514C8929980B6E52',
                    deleted: false,
                    data: null,
                    timestamp: '2024-02-22T00:33:55.147Z',
                    isSystem: false
                }
            ]

            assert.deepEqual(body.resultSet, expectedDocuments)
        });
    });

    describe('getTransactionsByIdentity()', async () => {
        it('should return default set of transactions by identity', async () => {
            const {body} = await client.get('/identity/ATSMNGiUGoWJE2KtzqdoJWQJXVs9fb8Fa3jX4czTFh2L/transactions')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 4)
            assert.equal(body.pagination.total, 4)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedTransactions = [
                {
                    hash: '24F91393BA4B7409BFA260FDB7D52FFC9A976554FDA4F8AA22DBF0C12055F7EA',
                    index: 0,
                    blockHash: 'DE58D437836EEF9FA3610C2066CA3D842B80CCB07922512553BE8EDC50611F3D',
                    blockHeight: 695,
                    type: 2,
                    data: null,
                    timestamp: '2024-02-22T14:10:05.370Z'
                },
                {
                    hash: 'E67B04816C2451B91AEDC84A86884E016BFE18EE495D1922B6BA260D8EDA0D12',
                    index: 0,
                    blockHash: '5FCFDAB52EAC075CB00368E35C62D0FDA374FDBEE536790D2084F1077FF1FCE5',
                    blockHeight: 696,
                    type: 0,
                    data: null,
                    timestamp: '2024-02-22T14:10:09.677Z'
                },
                {
                    hash: '3EA0B0AD9F4BAB47DC570D6F046326220BEFDADC8F577D64C84CD7677F4D39AD',
                    index: 0,
                    blockHash: '0AB0198DABBA53A39FAA6638024BE52884CC6FE720CE9B3EABBEA0D379B09B5C',
                    blockHeight: 697,
                    type: 4,
                    data: null,
                    timestamp: '2024-02-22T14:10:14.256Z'
                },
                {
                    hash: '7B1EE9855A308A9A684159FA6982DF51EFC775708387E753420182DE83460AD1',
                    index: 0,
                    blockHash: 'DADE0837DF28FEEE1B04EACACC4A5D6EA52B284093E1089B67A8FD5A3F8669EB',
                    blockHeight: 698,
                    type: 0,
                    data: null,
                    timestamp: '2024-02-22T14:11:28.205Z'
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransactions)
        });

        it('should return default set of transactions by identity desc', async () => {
            const {body} = await client.get('/identity/ATSMNGiUGoWJE2KtzqdoJWQJXVs9fb8Fa3jX4czTFh2L/transactions?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 4)
            assert.equal(body.pagination.total, 4)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedTransactions = [
                {
                    hash: '7B1EE9855A308A9A684159FA6982DF51EFC775708387E753420182DE83460AD1',
                    index: 0,
                    blockHash: 'DADE0837DF28FEEE1B04EACACC4A5D6EA52B284093E1089B67A8FD5A3F8669EB',
                    blockHeight: 698,
                    type: 0,
                    data: null,
                    timestamp: '2024-02-22T14:11:28.205Z'
                },
                {
                    hash: '3EA0B0AD9F4BAB47DC570D6F046326220BEFDADC8F577D64C84CD7677F4D39AD',
                    index: 0,
                    blockHash: '0AB0198DABBA53A39FAA6638024BE52884CC6FE720CE9B3EABBEA0D379B09B5C',
                    blockHeight: 697,
                    type: 4,
                    data: null,
                    timestamp: '2024-02-22T14:10:14.256Z'
                },
                {
                    hash: 'E67B04816C2451B91AEDC84A86884E016BFE18EE495D1922B6BA260D8EDA0D12',
                    index: 0,
                    blockHash: '5FCFDAB52EAC075CB00368E35C62D0FDA374FDBEE536790D2084F1077FF1FCE5',
                    blockHeight: 696,
                    type: 0,
                    data: null,
                    timestamp: '2024-02-22T14:10:09.677Z'
                },
                {
                    hash: '24F91393BA4B7409BFA260FDB7D52FFC9A976554FDA4F8AA22DBF0C12055F7EA',
                    index: 0,
                    blockHash: 'DE58D437836EEF9FA3610C2066CA3D842B80CCB07922512553BE8EDC50611F3D',
                    blockHeight: 695,
                    type: 2,
                    data: null,
                    timestamp: '2024-02-22T14:10:05.370Z'
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransactions)
        });

        it('should be able to walk through pages', async () => {
            const {body} = await client.get('/identity/ATSMNGiUGoWJE2KtzqdoJWQJXVs9fb8Fa3jX4czTFh2L/transactions?page=2&limit=1')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 1)
            assert.equal(body.pagination.total, 4)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 1)

            const expectedTransactions = [
                {
                    hash: 'E67B04816C2451B91AEDC84A86884E016BFE18EE495D1922B6BA260D8EDA0D12',
                    index: 0,
                    blockHash: '5FCFDAB52EAC075CB00368E35C62D0FDA374FDBEE536790D2084F1077FF1FCE5',
                    blockHeight: 696,
                    type: 0,
                    data: null,
                    timestamp: '2024-02-22T14:10:09.677Z'
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransactions)
        });

        it('should be able to walk through pages desc', async () => {
            const {body} = await client.get('/identity/ATSMNGiUGoWJE2KtzqdoJWQJXVs9fb8Fa3jX4czTFh2L/transactions?page=2&limit=2&order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 2)
            assert.equal(body.pagination.total, 4)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 2)

            const expectedTransactions = [
                {
                    hash: 'E67B04816C2451B91AEDC84A86884E016BFE18EE495D1922B6BA260D8EDA0D12',
                    index: 0,
                    blockHash: '5FCFDAB52EAC075CB00368E35C62D0FDA374FDBEE536790D2084F1077FF1FCE5',
                    blockHeight: 696,
                    type: 0,
                    data: null,
                    timestamp: '2024-02-22T14:10:09.677Z'
                },
                {
                    hash: '24F91393BA4B7409BFA260FDB7D52FFC9A976554FDA4F8AA22DBF0C12055F7EA',
                    index: 0,
                    blockHash: 'DE58D437836EEF9FA3610C2066CA3D842B80CCB07922512553BE8EDC50611F3D',
                    blockHeight: 695,
                    type: 2,
                    data: null,
                    timestamp: '2024-02-22T14:10:05.370Z'
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransactions)
        });
    });

    describe('getTransferByIdentity()', async () => {
        it('should return default set of transfers by identity', async () => {
            const {body} = await client.get('/identity/3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm/transfers')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 9)
            assert.equal(body.pagination.total, 9)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedTransfers = [
                {
                    amount: '300000000',
                    sender: null,
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T11:56:06.708Z',
                },
                {
                    amount: '1000',
                    sender: '4aKyDA1kLNUon39ddbdtHtrvq38DeGNPyK7p4EL1r8cr',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T13:36:26.802Z',
                },
                {
                    amount: '1000',
                    sender: '4uhLPSpMwkRPTimUi2qJ1r5FuWF6GW2tT8JoG3vpZYd',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T14:03:15.849Z',
                },
                {
                    amount: '1000',
                    sender: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T15:55:01.925Z',
                },
                {
                    amount: '1000',
                    sender: 'B8PJngFxUmXKvruwKNtGPGPW31Sx1UdYtnxGu6DfqYmt',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T16:04:53.816Z',
                },
                {
                    amount: '1000',
                    sender: '6R3DxxgKNJf1wFDeXFi6BbKsNdgMVbk8sj3f5cHhM2Cs',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T16:47:51.961Z',
                },
                {
                    amount: '1000',
                    sender: 'BFGgyMGDdqmKB9VMm3XJ3RSCimq9DGBUQQz8XGZr8KET',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-26T13:51:33.601Z',
                },
                {
                    amount: '1000',
                    sender: 'Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-26T13:57:00.323Z',
                },
                {
                    amount: '1000',
                    sender: 'DRJmTEw3LHkQkn8FYVZTvGhGFHmvZcBXScQFLYU9qWVR',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-26T14:16:17.275Z',
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransfers)
        });

        it('should return default set of transfers by identity desc', async () => {
            const {body} = await client.get('/identity/3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm/transfers?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 9)
            assert.equal(body.pagination.total, 9)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedTransfers = [
                {
                    amount: '1000',
                    sender: 'DRJmTEw3LHkQkn8FYVZTvGhGFHmvZcBXScQFLYU9qWVR',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-26T14:16:17.275Z',
                },
                {
                    amount: '1000',
                    sender: 'Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-26T13:57:00.323Z',
                },
                {
                    amount: '1000',
                    sender: 'BFGgyMGDdqmKB9VMm3XJ3RSCimq9DGBUQQz8XGZr8KET',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-26T13:51:33.601Z',
                },
                {
                    amount: '1000',
                    sender: '6R3DxxgKNJf1wFDeXFi6BbKsNdgMVbk8sj3f5cHhM2Cs',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T16:47:51.961Z',
                },
                {
                    amount: '1000',
                    sender: 'B8PJngFxUmXKvruwKNtGPGPW31Sx1UdYtnxGu6DfqYmt',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T16:04:53.816Z',
                },
                {
                    amount: '1000',
                    sender: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T15:55:01.925Z',
                },
                {
                    amount: '1000',
                    sender: '4uhLPSpMwkRPTimUi2qJ1r5FuWF6GW2tT8JoG3vpZYd',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T14:03:15.849Z',
                },
                {
                    amount: '1000',
                    sender: '4aKyDA1kLNUon39ddbdtHtrvq38DeGNPyK7p4EL1r8cr',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T13:36:26.802Z',
                },
                {
                    amount: '300000000',
                    sender: null,
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T11:56:06.708Z',
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransfers)
        });


        it('should be able to walk through pages', async () => {
            const {body} = await client.get('/identity/3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm/transfers?page=2&limit=3')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 3)
            assert.equal(body.pagination.total, 9)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 3)

            const expectedTransfers = [
                {
                    amount: '1000',
                    sender: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T15:55:01.925Z',
                },
                {
                    amount: '1000',
                    sender: 'B8PJngFxUmXKvruwKNtGPGPW31Sx1UdYtnxGu6DfqYmt',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T16:04:53.816Z',
                },
                {
                    amount: '1000',
                    sender: '6R3DxxgKNJf1wFDeXFi6BbKsNdgMVbk8sj3f5cHhM2Cs',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T16:47:51.961Z',
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransfers)
        });

        it('should be able to walk through pages desc', async () => {
            const {body} = await client.get('/identity/3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm/transfers?page=2&limit=3&order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 3)
            assert.equal(body.pagination.total, 9)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 3)

            const expectedTransfers = [
                {
                    amount: '1000',
                    sender: '6R3DxxgKNJf1wFDeXFi6BbKsNdgMVbk8sj3f5cHhM2Cs',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T16:47:51.961Z',
                },
                {
                    amount: '1000',
                    sender: 'B8PJngFxUmXKvruwKNtGPGPW31Sx1UdYtnxGu6DfqYmt',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T16:04:53.816Z',
                },
                {
                    amount: '1000',
                    sender: '6C28sMLEQRkf1CGqorXxCMWFtNBpvdmFxc9rcr6zGbp7',
                    recipient: '3p5kskYiVqT5bEBYCPb5QcAxAb6XePyivJYKchogyLwm',
                    timestamp: '2024-02-22T15:55:01.925Z',
                },
            ]

            assert.deepEqual(body.resultSet, expectedTransfers)
        });

    });
});
