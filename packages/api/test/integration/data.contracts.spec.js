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

    describe('getDataContracts()', async () => {
        it('should return default set of contracts', async () => {
            const {body} = await client.get('/dataContracts')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedDataContracts = [
                {
                    identifier: '4fJLR2GYTPFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6',
                    owner: 'CUjAw7eD64wmaznNrfC5sKdn4Lpr1wBvWKMjGLrmEs5h',
                    schema: null,
                    version: 0,
                    txHash: null,
                    isSystem: true,
                },
                {
                    identifier: 'rUnsWrFu3PKyRMGk2mxmZVBPbQuZx2qtHeFjURoQevX',
                    owner: 'BjDiho3ahEBT6w45YungawKrUcqCZ7q7p46FXwnoakXR',
                    schema: null,
                    version: 0,
                    txHash: null,
                    isSystem: true,
                },
                {
                    identifier: 'HY1keaRK5bcDmujNCQq5pxNyvAiHHpoHQgLN5ppiu4kh',
                    owner: 'H9sjb2bHG8t7gq5SwNdqzMWG7KR6sf3CbziFzthCkDD6',
                    schema: null,
                    version: 0,
                    txHash: null,
                    isSystem: true,
                },
                {
                    identifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
                    owner: '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF',
                    schema: null,
                    version: 0,
                    txHash: null,
                    isSystem: true,
                },
                {
                    identifier: 'Bwr4WHCPz5rFVAD87RqTs3izo4zpzwsEdKPWUT1NS1C7',
                    owner: '5PhRFRrWZc5Mj8NqtpHNXCmmEQkcZE8akyDkKhsUVD4k',
                    schema: null,
                    version: 0,
                    txHash: null,
                    isSystem: true,
                },
                {
                    identifier: '5UFe5yoixK7BPs1FGoAoryP2PCpF2MD3EjGPGeiC5htJ',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: '6F67732596400AB9B80161626F31EAF475202D76169CFC773A3E4BF6916CE6B4',
                    isSystem: false,
                },
                {
                    identifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: '95C634BAFDF5CBED59B14D8807DD11D8A5628AA1D33869106C08A6733EF006CF',
                    isSystem: false,
                },
                {
                    identifier: 'Hiq9SJL3HjGci8XU7mHGhY1wgkVLG7HhijAjVwv6ozau',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: '51D4C58E0DC8BDD5D1E062990022CE7FEF1B154C7D989A0EA566E288AC5F1C1E',
                    isSystem: false,
                },
                {
                    identifier: '5qkpWiZmfSgnmwusByRVpmLFdRyxuuV8s5KxNxh6bW7n',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: 'B3BDD9A6E757414292B6EF2205ECFFEBC11212515820AB72A262F51B39731160',
                    isSystem: false,
                },
                {
                    identifier: '8jB2zPwsnhydCXrWk3QMMENhYbgh7M5F28oZhC4AnMFV',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: 'BD47CD7F0ABCB8335AC4B5F96A0576CDB0F51DB9F239970E2516AB9DCCDC2D67',
                    isSystem: false,
                }
            ]

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 75)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            assert.deepEqual(body.resultSet.map(({identifier, owner, schema, version, txHash, isSystem}) =>
                ({identifier, owner, schema, version, txHash, isSystem})), expectedDataContracts)
        });

        it('should return default set of contracts desc', async () => {
            const {body} = await client.get('/dataContracts?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedDataContracts = [
                {
                    identifier: 'Bxw6fzQCME3ESZgM6iUS6LK339bsgi1DTGejhSHgcEJL',
                    owner: '4NGALjtX2t3AXE3ZCqJiSmYuiWEY3ZPQNUBxNWWRrRSp',
                    schema: null,
                    version: 0,
                    txHash: '743FA11103348FEC33960BF9659CE8FF1F61946A27A2321989ECB0F8A772BCD2',
                    isSystem: false,
                },
                {
                    identifier: '57iCs3V5fG2N1JdaZVox8gEBzAgtJx4snFn9HEFi8dKQ',
                    owner: 'DRJmTEw3LHkQkn8FYVZTvGhGFHmvZcBXScQFLYU9qWVR',
                    schema: null,
                    version: 1,
                    txHash: '780FD0E3A8D73C0700AAD82C03EC78D3ACC40D581C9F02B606B6C154C6CCE014',
                    isSystem: false,
                },
                {
                    identifier: '3XMKwbBSThqi5Y12B5UFvX43AmwEGNUMMEyWPz4pEr7e',
                    owner: 'DRJmTEw3LHkQkn8FYVZTvGhGFHmvZcBXScQFLYU9qWVR',
                    schema: null,
                    version: 1,
                    txHash: '7CE2B0E43CDEBC62CBBEF56249F56402A879F19A67F14D1C9F54342260A7F4BA',
                    isSystem: false,
                },
                {
                    identifier: '5oyjD2SXaHmsStEntx5Y5FYcxyb3yyiYkHVW4mhmQ3YS',
                    owner: 'DRJmTEw3LHkQkn8FYVZTvGhGFHmvZcBXScQFLYU9qWVR',
                    schema: null,
                    version: 1,
                    txHash: '0372C7BAE288BC2544FC9F784FE042DC9717BB4175401819A92888693552A4B1',
                    isSystem: false,
                },
                {
                    identifier: 'HfWRVnAhei8UveEK8mrKs7AiwTxCrVhJEDqCxKa6dXv4',
                    owner: 'DRJmTEw3LHkQkn8FYVZTvGhGFHmvZcBXScQFLYU9qWVR',
                    schema: null,
                    version: 2,
                    txHash: '4A9D971F67394D06BC8DD235F0293CBA412265160A21F70B3F3893681DEF7B98',
                    isSystem: false,
                },
                {
                    identifier: 'ES4TrjMnnrYAJ86qXManE6u8Mv75LDT37rUMZQRjpTnv',
                    owner: 'EWBpx3TFNdwkzG1VBuk12ZNGvNy82nnAWLS7szDgtq7Z',
                    schema: null,
                    version: 1,
                    txHash: '28DDE46789CAB3E158C52643D7AD6FA7E75E4FF5378D2E08573521C46FB138AB',
                    isSystem: false,
                },
                {
                    identifier: '4JwrR36i869xc3bR7hJWfrAfGE7r1yD1b41MqQ1Pfi2j',
                    owner: 'EWBpx3TFNdwkzG1VBuk12ZNGvNy82nnAWLS7szDgtq7Z',
                    schema: null,
                    version: 1,
                    txHash: 'E9915C1FB1659BACCA08412EB2762567E6FB20FF14897B49E735655588552D7A',
                    isSystem: false,
                },
                {
                    identifier: 'DvYBSU6EKERkQwvCERCVJQeGVxxE5uhx5gBGhrg79MZ8',
                    owner: 'EWBpx3TFNdwkzG1VBuk12ZNGvNy82nnAWLS7szDgtq7Z',
                    schema: null,
                    version: 1,
                    txHash: '715ACAC5606A1CFD3698759E6C517C3A3D19C53C1A61E4BDEB7E6B000458846A',
                    isSystem: false,
                },
                {
                    identifier: 'Hj1DMNNUTscVA6rA4L32KVWiJEV3p7yFiQQYhLw8rrjs',
                    owner: 'EWBpx3TFNdwkzG1VBuk12ZNGvNy82nnAWLS7szDgtq7Z',
                    schema: null,
                    version: 2,
                    txHash: '570674ACF4B3B4185DA75FEEF838EAE57FE545695DFCAB4CF8B511F61C344A5A',
                    isSystem: false,
                },
                {
                    identifier: 'TjpNKpznkjZZ9VvzkpefR699CXtPc15rqPuBWZ6P1qr',
                    owner: 'Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb',
                    schema: null,
                    version: 1,
                    txHash: '4A1D8EE42450B7231E7B1FA186FE806C4557DD83599688159FFAB511971BE992',
                    isSystem: false,
                }
            ]

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 75)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            assert.deepEqual(body.resultSet.map(({identifier, owner, schema, version, txHash, isSystem}) =>
                ({identifier, owner, schema, version, txHash, isSystem})), expectedDataContracts)
        });

        it('should allow to walk through pages', async () => {
            const {body} = await client.get('/dataContracts?page=2&limit=6')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedDataContracts = [
                {
                    identifier: 'Po1uVkjb7V5WyzqdXvosa7LZ9SvXbyaWUV8jfnPUew3',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: '95C634BAFDF5CBED59B14D8807DD11D8A5628AA1D33869106C08A6733EF006CF',
                    isSystem: false,
                },
                {
                    identifier: 'Hiq9SJL3HjGci8XU7mHGhY1wgkVLG7HhijAjVwv6ozau',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: '51D4C58E0DC8BDD5D1E062990022CE7FEF1B154C7D989A0EA566E288AC5F1C1E',
                    isSystem: false,
                },
                {
                    identifier: '5qkpWiZmfSgnmwusByRVpmLFdRyxuuV8s5KxNxh6bW7n',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: 'B3BDD9A6E757414292B6EF2205ECFFEBC11212515820AB72A262F51B39731160',
                    isSystem: false,
                },
                {
                    identifier: '8jB2zPwsnhydCXrWk3QMMENhYbgh7M5F28oZhC4AnMFV',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: 'BD47CD7F0ABCB8335AC4B5F96A0576CDB0F51DB9F239970E2516AB9DCCDC2D67',
                    isSystem: false,
                },
                {
                    identifier: '7YYHis22sL45AhD8FHXopGSqeKLFNtRBvcXCFmVtypi2',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: 'C5744E20E988D74286497BD48BB0FCCF426080E6CBE3E8F86244392D676338AA',
                    isSystem: false,
                },
                {
                    identifier: 'Hn9LJMPA3mrWUQ7nzKhyT6TiiTzejwVXH8hoV7oV7qqP',
                    owner: 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN',
                    schema: null,
                    version: 1,
                    txHash: 'DAF0746E611B1063301DDF3718074D5906BA5FFBA21EA87BB14E43C068DF9578',
                    isSystem: false,
                }
            ]

            assert.equal(body.resultSet.length, 6)
            assert.equal(body.pagination.total, 75)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 6)

            assert.deepEqual(body.resultSet.map(({identifier, owner, schema, version, txHash, isSystem}) =>
                ({identifier, owner, schema, version, txHash, isSystem})), expectedDataContracts)
        });

        it('should allow to walk through pages desc', async () => {
            const {body} = await client.get('/dataContracts?page=3&limit=6&order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedDataContracts = [
                {
                    identifier: 'AW7z9DAQjTWqqYmkGdAmAfeAR34ZEdvdAQFA6vntvBtU',
                    owner: 'Ex1seeExLGunyTGrr5beTDkWxVwQqdLKHLqWNy4mhFVb',
                    schema: null,
                    version: 2,
                    txHash: 'FC22497B34780B691B37E91BEC837F2904FE27E2A40496271EC07D0EF6575DEB',
                    isSystem: false,
                },
                {
                    identifier: 'CL9khsH6in3WmkhQWEuiCoAZDy3GWrRxQTDNSnkM8PyX',
                    owner: 'BFGgyMGDdqmKB9VMm3XJ3RSCimq9DGBUQQz8XGZr8KET',
                    schema: null,
                    version: 1,
                    txHash: 'D9B0A17947F42301CEBA5EE2A2155B2FF8DD70D312C7E221685EC9366A219DA5',
                    isSystem: false,
                },
                {
                    identifier: '5RTPwJHW3iUwgz5rjKjCVzwyMUvkxgw48VmHfvf1s8ys',
                    owner: 'BFGgyMGDdqmKB9VMm3XJ3RSCimq9DGBUQQz8XGZr8KET',
                    schema: null,
                    version: 1,
                    txHash: 'B3F2112C272EC63906373A8DDD7AED93C14F9C3D5D9C112C97AFD6BA9BD99988',
                    isSystem: false,
                },
                {
                    identifier: 'HjnksxgVxvcsygtuqtLvdMQPtn7BGb7E2taKPY4PEqZP',
                    owner: 'BFGgyMGDdqmKB9VMm3XJ3RSCimq9DGBUQQz8XGZr8KET',
                    schema: null,
                    version: 1,
                    txHash: 'CCCCFBCAF595253816B4982C39B4E5B5B27AC38C66042045CC0CE4B982D61729',
                    isSystem: false,
                },
                {
                    identifier: '7wnm4v1d4Vj65jzPyUZHeYhsMmfaaBYPYcc9BoPapVEY',
                    owner: 'BFGgyMGDdqmKB9VMm3XJ3RSCimq9DGBUQQz8XGZr8KET',
                    schema: null,
                    version: 2,
                    txHash: '6A036DD3AA3EC0A97662B275BA77AECCBEBFAA49B320BC94437A7388A7FFA9E3',
                    isSystem: false,
                },
                {
                    identifier: 'C6F9fBuZjJBwwTt274J85Lw5ZJvGCr3dMRcRAC9JyRdY',
                    owner: '4AXSk7GrmVfhTSgK6yiEVUbZYQNPaazxEAW2KkkUxigW',
                    schema: null,
                    version: 1,
                    txHash: '66C2671F0C11B44C5DB47173F7178F4096151E570E3521847A9388D24635B2AD',
                    isSystem: false,
                }
            ]

            assert.equal(body.resultSet.length, 6)
            assert.equal(body.pagination.total, 75)
            assert.equal(body.pagination.page, 3)
            assert.equal(body.pagination.limit, 6)

            assert.deepEqual(body.resultSet.map(({identifier, owner, schema, version, txHash, isSystem}) =>
                ({identifier, owner, schema, version, txHash, isSystem})), expectedDataContracts)
        });
    });

    describe('getDataContractByIdentifier()', async () => {
        it('should return data contract by identifier', async () => {
           const {body} =  await client.get('/dataContract/3KhmjY3vVKU8r5nuzdfifJ49TdS6heasFaFG13vLgX5G')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, '3KhmjY3vVKU8r5nuzdfifJ49TdS6heasFaFG13vLgX5G')
            assert.equal(body.txHash, '701B82AB505335C5523A3D17C3D77C008BC8B5C4800D4501DB527E543308D0F3')
            assert.equal(body.owner, 'GxdRSLivPDeACYU8Z6JSNvtrRPX7QG715JoumnctbwWN')
            assert.equal(body.version, 1)
            assert.equal(body.timestamp, '2024-02-21T21:31:02.701Z')
            assert.equal(body.isSystem, false)
        });

        it('should return system data contract by identifier', async () => {
           const {body} =  await client.get('/dataContract/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec')
            assert.equal(body.txHash, null)
            assert.equal(body.owner, '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF')
            assert.equal(body.version, 0)
            assert.equal(body.timestamp, null)
            assert.equal(body.isSystem, true)
        });

        it('should return last revision of data contract by identifier', async () => {
           const {body} =  await client.get('/dataContract/Gc7HqRGqmA4ZSafQ6zXeKH8Rh4AjNjjWsztotJDLpMXa')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.identifier, 'Gc7HqRGqmA4ZSafQ6zXeKH8Rh4AjNjjWsztotJDLpMXa')
            assert.equal(body.txHash, '4107CE20DB3BE2B2A3B3F3ABA9F68438428E734E4ACF39D4F6D03B0F9B187829')
            assert.equal(body.owner, 'FRMXvU2vRqk9xTya3MTB58ieBt27izpPyoX3fVLf3HuA')
            assert.equal(body.version, 2)
            assert.equal(body.timestamp, '2024-02-22T14:23:57.592Z')
        });

        it('should return 404 if data contract not found', async () => {
            await client.get('/dataContract/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8');
        });
    });

});
