const {describe, it, before} = require('node:test');
const assert = require('node:assert').strict;
const supertest = require('supertest')
const server = require('../../src/server')


describe('Blocks routes', () => {
    let app
    let client

    before(async () => {
        app = await server.start()
        client = supertest(app.server)
    })

    describe('getBlockByHash()', async () => {
        it('should return block by hash', async () => {
           const {body} =  await client.get('/block/F0DA8C6DDF1A4EC28EB4EC29758EA5D49466489EF8EEFADC44A368B028089A9A')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

           assert.equal(body.header.hash, 'F0DA8C6DDF1A4EC28EB4EC29758EA5D49466489EF8EEFADC44A368B028089A9A')
           assert.equal(body.header.height, 9)
           assert.equal(body.header.timestamp, '2024-02-21T11:51:05.723Z')
           assert.equal(body.header.blockVersion, 13)
           assert.equal(body.header.appVersion, 1)
           assert.equal(body.header.l1LockedHeight, 974445)

           assert.deepEqual(body.txs, ['4D091D84FC1318DED59777E01644D7B32425DBFA1681B7CCD561C929236B8FA6'])
        });

        it('should return 404 if block not found', async () => {
            await client.get('/block/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8');
        });
    });

    describe('getBlocks()', async () => {
        it('should return default set of blocks', async () => {
           const {body} =  await client.get('/blocks')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedBlockHashes = [
                '17FF93AECEA0CB427C9A8B63F615617183C0DD493AD8803AD2B643D7676D896C',
                '3D443B12A12558784BC366A1D96C9F1A62DF7A203F5E111970AFCFD6C50C6F5C',
                'E9B764F40F08B0A3ADF403F2FC63666D8540FBE4593E2DE670FD93AED039053B',
                'C0F6BC8FB9E38193366B13B106627A128CBFFC66726FE27E8FF75F032F085596',
                '16F98C6C2BB3D6DBB3211F744D6508E465720E788406C89A4173864213524597',
                '3D7627AB604192BFFC403F8DA305FC2D7659823E35ED3FB5E7855F386FF0415B',
                'A127BCC2B6087C0C05FF0A3796F4927BBE3082D68048D1A47D71C8DC55F37153',
                '4AF4A0F1F29C35F5E278CF7E152734EE2A5415BB6D8461EB15F2D325EB7E7B8D',
                'F0DA8C6DDF1A4EC28EB4EC29758EA5D49466489EF8EEFADC44A368B028089A9A',
                'ABE1A1F8DC1A8BFBBCBE41130643C918EAD2E98DD4988B1967DE2FF70049AED2'
            ]

            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)
            assert.equal(body.pagination.total, 1922)
            assert.equal(body.resultSet.length, 10)

            assert.deepEqual(body.resultSet.map(e => e.header.hash), expectedBlockHashes)
            assert.deepEqual(body.resultSet.map(e => e.header.height),
                Array.from({length: 10}, (_, i) => i + 1))
        });

        it('should return default set of blocks order desc', async () => {
           const {body} =  await client.get('/blocks?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedBlockHashes = [
                '692377011E01272735379494C15F87E3E0D6C3D77AB01A12CCDCFE64BF847EC8',
                'CDC0CB55A84F16775AA9423519FC5F412EE1FE09300BA37D6FB6B32BB1ACB39B',
                '7CA4AF52A4B3404C798F8706A589E457DA03155A4847A0017CEA3FCB882444E9',
                '617EF27A274FFCACCA4CDB848CB071516AF22DD5F295CB970CC74AD33A76D4CA',
                'E723FBFE5E1C5DB156F7B77BA7E832544E2F41C9273C2330C3BC95D00D98035C',
                '8A9B5022E72507DE090D13E9521719030DA000785C0FEBD0B48733916229F00A',
                '8CFD0171F09D80FFB685260B55A8F328F3CBF1761101691E56E0B3E15574DCC6',
                'EF224BDF1248837795F5A926796B947741AC8E2ABE7F4515646A1959C3D36172',
                'BDA6A692D4E02F7BA41003B5AA859566135BBA4556117C6BA96292F5BE057E88',
                'BB6DF0ECA819051AD2930A639D6ED0EF669069FBE41A9ECB3AE3A163F1B1042F',
            ]

            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)
            assert.equal(body.pagination.total, 1922)
            assert.equal(body.resultSet.length, 10)

            assert.deepEqual(body.resultSet.map(e => e.header.hash), expectedBlockHashes)
            assert.deepEqual(body.resultSet.map(e => e.header.height),
                Array.from({length: 10}, (_, i) => Math.abs(i - 1922)))
        });

        it('should allow to walk through pages', async () => {
            const {body} =  await client.get('/blocks?page=3')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedBlockHashes = [
                'FBC612A22B7F8DF062D668BC5542ACFAAEED1CA94BF5D9291BCA1B9BAE6AC220',
                '9DFE41D71792C6415BCF9AA560D374A9E460AC8CB4A83B23ACD7461F1B258C8E',
                'B799375719F0F497876B3F5866B9C063C3219DA0075D1DEA064559E1CE053039',
                '85A6BE62E6FF5485EB418164A34A43A2D6DDCB19C11F547D671A1FD45C3739B8',
                '0762E91D4C62EA242832C393CF9F7E60C9EB8F8075EDDD1ECD64909BC7D86B5F',
                'E29019C30D5892881E84D4EA15D9601E807F8CAC2C63C5A8CADCFF30AC60533A',
                '5039779C620BEAD7805E71027D8209F424354D9624640E34680C41D3415FC707',
                'E3C8147FA52A0037DC9EB5206B7234FFF585B91AAD742B0434F3318CAD3D7E05',
                '480313F47CFBA7AB4081798BC8B5DBFE74DEA8A576B2681113A68A067FBB0A03',
                'A67584AAF02D8FF463DAEE2769A041EAC500F2519179A81613AA78EFF8009345'
            ]

            assert.equal(body.pagination.page, 3)
            assert.equal(body.pagination.limit, 10)
            assert.equal(body.pagination.total, 1922)
            assert.equal(body.resultSet.length, 10)

            assert.deepEqual(body.resultSet.map(e => e.header.hash), expectedBlockHashes)
            assert.deepEqual(body.resultSet.map(e => e.header.height),
                Array.from({length: 10}, (_, i) => i + 21))
        });

        it('should return custom page size', async () => {
           const {body} =  await client.get('/blocks?limit=7')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedBlockHashes = [
                '17FF93AECEA0CB427C9A8B63F615617183C0DD493AD8803AD2B643D7676D896C',
                '3D443B12A12558784BC366A1D96C9F1A62DF7A203F5E111970AFCFD6C50C6F5C',
                'E9B764F40F08B0A3ADF403F2FC63666D8540FBE4593E2DE670FD93AED039053B',
                'C0F6BC8FB9E38193366B13B106627A128CBFFC66726FE27E8FF75F032F085596',
                '16F98C6C2BB3D6DBB3211F744D6508E465720E788406C89A4173864213524597',
                '3D7627AB604192BFFC403F8DA305FC2D7659823E35ED3FB5E7855F386FF0415B',
                'A127BCC2B6087C0C05FF0A3796F4927BBE3082D68048D1A47D71C8DC55F37153'
            ]

            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 7)
            assert.equal(body.pagination.total, 1922)
            assert.equal(body.resultSet.length, 7)

            assert.deepEqual(body.resultSet.map(e => e.header.hash), expectedBlockHashes)
            assert.deepEqual(body.resultSet.map(e => e.header.height),
                Array.from({length: 7}, (_, i) => i + 1))
        });

        it('should return allow to walk through pages with custom page size', async () => {
           const {body} =  await client.get('/blocks?limit=7&page=4')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedBlockHashes = [
                '9DFE41D71792C6415BCF9AA560D374A9E460AC8CB4A83B23ACD7461F1B258C8E',
                'B799375719F0F497876B3F5866B9C063C3219DA0075D1DEA064559E1CE053039',
                '85A6BE62E6FF5485EB418164A34A43A2D6DDCB19C11F547D671A1FD45C3739B8',
                '0762E91D4C62EA242832C393CF9F7E60C9EB8F8075EDDD1ECD64909BC7D86B5F',
                'E29019C30D5892881E84D4EA15D9601E807F8CAC2C63C5A8CADCFF30AC60533A',
                '5039779C620BEAD7805E71027D8209F424354D9624640E34680C41D3415FC707',
                'E3C8147FA52A0037DC9EB5206B7234FFF585B91AAD742B0434F3318CAD3D7E05'
            ]

            assert.equal(body.pagination.page, 4)
            assert.equal(body.pagination.limit, 7)
            assert.equal(body.pagination.total, 1922)
            assert.equal(body.resultSet.length, 7)

            assert.deepEqual(body.resultSet.map(e => e.header.hash), expectedBlockHashes)
            assert.deepEqual(body.resultSet.map(e => e.header.height),
                Array.from({length: 7}, (_, i) => i + 22))
        });

        it('should return allow to walk through pages with custom page size desc', async () => {
           const {body} =  await client.get('/blocks?limit=7&page=4&order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            const expectedBlockHashes = [
                'B330C098C763EB768AC614B2A147A638BD9D6712D5F47FA6E8A6580FC73071B8',
                'A34B24F3368D95BCDE158DC243BA41BA25F75B387CFCBB69EEA2634932999CEE',
                'FFF87DF79E3C7D22A5D90F666559016AB2525A360ABA7F54A440C0B31E47EAFF',
                '05676BC16E03A425802428870CF9BA4AD2ABC67CC0E402B71382AA03791FE54B',
                'BF4EDC4853DFB576A9A428CEA565714C7CFD0DCF50234F93122C6B2407949DAD',
                '141D72F15B49EFCA5CB39AA3B31899EE5ACBA84CBFD9BC18428C740925920C23',
                'D499D646A5C7698230C3C5B109CE46A89DF3D79122726FA4B2A7E7A1BDA9A55E'
            ]

            assert.equal(body.pagination.page, 4)
            assert.equal(body.pagination.limit, 7)
            assert.equal(body.pagination.total, 1922)
            assert.equal(body.resultSet.length, 7)

            assert.deepEqual(body.resultSet.map(e => e.header.hash), expectedBlockHashes)
            assert.deepEqual(body.resultSet.map(e => e.header.height),
                Array.from({length: 7}, (_, i) => Math.abs(i - 1901)))
        });
    });
});
