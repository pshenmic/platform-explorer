const {describe, it, before} = require('node:test');
const assert = require('node:assert').strict;
const supertest = require('supertest')
const server = require('../../src/server')

const TOTAL_BLOCKS_COUNT = 3243

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
           const {body} = await client.get('/blocks')
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
            assert.equal(body.pagination.total, TOTAL_BLOCKS_COUNT)
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
                '7F7219D89141AF98460B9BEF1AA05990134EE586E67D16A0FAC92613B9E9379B',
                '15C58CFA14DCE5D9B25FB35648AEB82EB2B3EFB180AFEC1250824096229F4052',
                'CCE17308441B515620E283A0B6DEF228487090BA1D4D6ACBFBA574E8675C869F',
                'DA4D2694C92BED84795D244514069C0FF6CB786088DEBB7425F49CBB2E3D69EF',
                'E3D48931B900CAD53CBE01856C63A0D515D00EA098ED62088D259D79A4BC951E',
                '5AC5566BFD929C59FBBC07866D60B8E71F062924A94D86B0AD9DF9A57870B9CF',
                '2A3306DB5F0FDFC3DCA41CD12C62135E985391B27B3956F74124C8292B3A2C15',
                '5204547B53FECE583773CB7CADE5BB2AAEBE55BC91C4E8D2820733E52D7CFE38',
                '007D8194D86E72EEDFFC20B08374CADBA8EDC4140774296D20789334FC407E79',
                '138FEF8EA987CD4F286488C01AC9DAC97D5279FD5EDFFDA0E85D9A88997EF9CB'
            ]

            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)
            assert.equal(body.pagination.total, TOTAL_BLOCKS_COUNT)
            assert.equal(body.resultSet.length, 10)

            assert.deepEqual(body.resultSet.map(e => e.header.hash), expectedBlockHashes)
            assert.deepEqual(body.resultSet.map(e => e.header.height),
                Array.from({length: 10}, (_, i) => Math.abs(i - TOTAL_BLOCKS_COUNT)))
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
            assert.equal(body.pagination.total, TOTAL_BLOCKS_COUNT)
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
            assert.equal(body.pagination.total, TOTAL_BLOCKS_COUNT)
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
            assert.equal(body.pagination.total, TOTAL_BLOCKS_COUNT)
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
                '0A284B9FD0D8537BE26DCF1FF8FE0F919A7062DFCDD7CB703C0756DBB9602E37',
                '7FF07C707CCB67B4AA70836A9A28CC1A1A2130EDC63F7D09B10473CE0CB1CFF9',
                '590A591CA8129A5FBF256F40B779C16F77AECD259004DD57A66FB55773110AAC',
                '211B9C8A85B1042C213E7B4BBC3118EA69EA72622A0E4984BCBEC9F682B29010',
                '9662FB7409983BE989E8DE7947B51955E8EC561201274819C7E1785730E8F75B',
                'F71354E75EEF54DF19D5503C90F5085ED4C7D64AB463937263AABC75E9EB4C4F',
                'BDC5C60C3003F20FB7186DD8B0719DD9A46C1A37C449F2D18E0D71BB51BDA86C'
            ]

            assert.equal(body.pagination.page, 4)
            assert.equal(body.pagination.limit, 7)
            assert.equal(body.pagination.total, TOTAL_BLOCKS_COUNT)
            assert.equal(body.resultSet.length, 7)

            assert.deepEqual(body.resultSet.map(e => e.header.hash), expectedBlockHashes)
            assert.deepEqual(body.resultSet.map(e => e.header.height),
                Array.from({length: 7}, (_, i) =>
                    Math.abs(i - TOTAL_BLOCKS_COUNT + (body.pagination.limit * (body.pagination.page - 1)))))
        });
    });
});
