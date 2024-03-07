const {describe, it, before, after} = require('node:test');
const assert = require('node:assert').strict;
const supertest = require('supertest')
const server = require('../../src/server')


describe('Transaction routes', () => {
    let app
    let client

    before(async () => {
        app = await server.start()
        client = supertest(app.server)
    })

    after(async () => {
        await server.stop()
    })

    // describe('getTransactionByHash()', async () => {
    //     it('should return transaction', async () => {
    //         const {body} = await client.get('/transaction/9C1FDEBBBE17F030C94CC8A6D9BA175650216DB75D47796A569BD182B38D7D90')
    //             .expect(200)
    //             .expect('Content-Type', 'application/json; charset=utf-8');
    //
    //         const transaction = {
    //             blockHash: '621F8745BF1061C2A3939B338D5249A80CDFECD8370EE3430604533EC485974E',
    //             blockHeight: 85,
    //             data: 'AgDtH24cRBIX1QTPTl4rR1SJBWPNRBDdoTHP0pc/A6z/3wEAAADjLhFl1E9upY8YpcHNcMpQ4EXhHpKZZHxfqK4dn36oqAIIcHJlb3JkZXLmaMZZr2au4ecsGG3ee1t+Ch1xKgnEDVch9iK/U8UxVTopHbTIJ3SfjMBDjVCEQMQPXYCafzwrvJeaVwJCLXfKAAABEHNhbHRlZERvbWFpbkhhc2gKICNyp5y3GXKYq2OgZzxLa0U4IgSrkdl4D7yN82e+WPiTAUEgA/daLTaz154CalNTTwoBWj/lZx9U6vdps8UYwDX55nEqrfLzOQKHc3DqdSvERDCO1Pchj9bM3vuyEybPIpWxAQ==',
    //             hash: '9C1FDEBBBE17F030C94CC8A6D9BA175650216DB75D47796A569BD182B38D7D90',
    //             index: 0,
    //             timestamp: '2024-02-21T15:13:28.655Z',
    //             type: 1
    //         }
    //
    //         assert.deepEqual(transaction, body)
    //     });
    //
    //     it('should return 404 if transaction not found', async () => {
    //         await client.get('/transaction/fake')
    //             .expect(404)
    //             .expect('Content-Type', 'application/json; charset=utf-8');
    //     });
    // });

    describe('getTransactions()', async () => {
        it('should return default set of transactions', async () => {
            const {body} = await client.get('/transactions')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 746)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)


            const expectedTransactions = [{
                "hash": "A7B22B6B0F0A5099C1642035C22262576A117A3272746B111B9143183AE6B9F6",
                "index": 0,
                "blockHeight": 3,
                "type": 2,
                "data": "AwADAAAAAAAAACEDSKamM4UPPIOgyzCp/O67qjuas/kj8SPZJyjO8jQXbcVBIEIYaj3sUr/pok7he5itxe/LwKCmusvJYn8UBepeG7euK7lKJwNjQAlpZp6YhKuZZ2Wemg2N50ZO58R1UsjLDpkAAQAAAgAAIQNCeLDX9ebZAuxaMK5cZWk3oDI73IE+hR64otah0jxRz0Efuw0Ltj0mwNW24fS4wO6+9NJWxOiqkzostr1rLYquVFIVMSkkx91ByWMHHizP4hh6hoTZPFUGPLRf3QPnY0TWpAACAAABAAAhAkXDsPAyPdu53fEj+Tm/Nylq9POPpImq1yLFBIZXXNj0QSBAE9zKEzeLgg5Azx2ner44ZiVG7wowRUXePDWEW4OnrUtCBRwrNTnJGBs/DLP7S8lw24lmPGvWyhRoVopivqp1AMYBAQoz23UgI3O910qvKMzh6cqfRjlqYGfejoPAOgLi6TlIAAAAAB2trGvF7kIpi6OJSY31XWaBPmBDcHPZPNoYJb5M3Yn8lA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACFeK4IFeDNrC5ujEwBcOJdCkkII+LjXtUTiZ1xg+BNrT8d35EIcsBHof4xeGoprOUZ10jsB1bHEtn3hm9C76oil7sb1dFGNBZ5jCugjJzoypAXmYqm9XQBQxhQ0xeMKyrwAwAIAAEKM9t1ICNzvddKryjM4enKn0Y5amBn3o6DwDoC4uk5SAAAAABrSDBFAiEAob55DS47XFpJWMkxnw7RGBxiqdapLNheRmhpTLMgN8ACIAucWpsACZq7fSQ17gcdXDG4j5WT+KrI48wxF/KYYp9HASECm5LppdM7/zH24nTQYVlWfEzgnHB972uP5HiKB3nbSF//////AoDDyQEAAAAAAmoAWEdMAAAAAAAZdqkU/eEW+vOF4YOV1PZWvUrwv7b3kDiIrAAAAAAkAQGAw8kBAAAAABl2qRTF3AYdSltmIbut+4DRzITajN6EvIisAEEfixSuaLtT05tuSHA+4SWNfPUdOsVF+CkOx++5RNNEcCBKXoddT5tw88nbyyRUPg+CzfvFoY8wNpU3x3jCiHoXwnXt0lRhk42CrZBJJblfQd+eJxSi7fpelM6xE+a0eTfi",
                "timestamp": "2024-02-21T11:47:24.777Z",
                "blockHash": "E9B764F40F08B0A3ADF403F2FC63666D8540FBE4593E2DE670FD93AED039053B"
            }, {
                "hash": "DBABC46F595ADE9D8594E9AA4F045B41C2A9C750901C849FD3C11BDB7235211C",
                "index": 0,
                "blockHeight": 4,
                "type": 2,
                "data": "AwADAAAAAAAAACEC/uoz1LebC5vJCr7xmta6tKIBgOOkV6dEhJNOHVVD5hVBIOAsm58kw1H54KU35MFkKELHAvmsYhOE3zq24UH3zi5QTPkZeqKseV5vX9/HspTmSOpiLDjCKQzGTLlqrMZhr6UAAQAAAgAAIQIvwOa5A7RUIfsJ0YwhGbUUA+kYcRoE515/5WhrvUmHVEEg6Jj3F7U0DYkQgN6NoBLMYaRFyprGUpjXzAX9Wdb4+G4FG2G8TM+onFr0jld8NG2zn6yJ3cTSCUwDtE9STMnemgACAAABAAAhAyvt2a0OH8lSs0T5Gu4QdPir3HQvW2koLLN+RctkvgAYQR8TgHqsod+w5OqhBoniirJAGA5siVj2XSwWUISKLljBwTNDolcN7HNMJIfOSAI9fueAyh7p6AWp4nCb6g3vgnhRAMYBASTlXP5yFTh+5s1ulz14Qw8yPPWjkwXzbVJuyeICtDfMAAAAANsbjIXWtyG/1UMGwx4gvqMcNC7Ahy+CtwlYam4bqmKMlA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACDrrRA1j1SW+cslDd1MyFOqI7WenfCX3gQHVGPJvqqqHRHdl6B+tMUDewYXlHFaS0VYtqm6gWm+s9kMqe0ilDkxOfWi8Ihh/OLo8F7YZQDOIVen21rNWBr5KYG0Le/jx/vAwAIAAEk5Vz+chU4fubNbpc9eEMPMjz1o5MF821SbsniArQ3zAAAAABqRzBEAiAFV8wmS4P836EQSUvweItLtMSJOILInc/hQQmZtT+6UAIgXULe96FH8z3U7DHAAT7GJp7Ou4FtddNazKsag81dtkIBIQKEOUySagCeA61w/ZvAHRrQc0XrHimFrbJjUZ7Vn2LMGf////8CQEIPAAAAAAACagAoIwAAAAAAABl2qRRmWtfZvBF0n8ZnzUv7AuUx7vP0VYisAAAAACQBAUBCDwAAAAAAGXapFP4H/qCsxu3ugSNU/KwBmPlQ88HqiKwAQSAYCwN4/JsvQ1OBwm7Txm3Ys9qmU0O42t5ORfgi20dEjQJ4B9Tor/aiPh2tqFRujAHIuRJiwTXDkz6J9+3ncGMWjZp0vlkP+wSFXe839BM2EBWHxvOX8y8Bq3P1DD79ElU=",
                "timestamp": "2024-02-21T11:48:56.561Z",
                "blockHash": "C0F6BC8FB9E38193366B13B106627A128CBFFC66726FE27E8FF75F032F085596"
            }, {
                "hash": "B636CC2A10BE68EE7FF5C29A8EA4F3096A78677239D9C510653F236ECA45EA0D",
                "index": 0,
                "blockHeight": 5,
                "type": 2,
                "data": "AwADAAAAAAAAACEC7HUSoQ1gT7HsNeNXiflKy/+dEMEp7BeRIZJyZcMMn3tBH8f3S9Able8GUBhEcCLE93GWXcbrTMtMrdAySq9heW9yIJYCCYvehJ0FSiBjnvi1XxQYAG7KnGZm2LzX/UloAZcAAQAAAgAAIQO7lU5HoMNg6O7QCGTFrYtvL2MZMdacp21xnn/rCfW54kEgLxyBWfz/AF6DKpy3a8LzAPTu+RLChxKOfebadYI+01lTnfnYRx9IMgLuhGKakNc7fP/ijThTZgBPEwGtbXhPvgACAAABAAAhA7KuQ097UYTUPA2v+tySR4BV30/Xa0r4MP5xGuelcomMQSBKZuUp0LCbU6lxdttAskisxaqBnTuCGL70PAzH4fFBaDJ3SDJeU7mBoKwK8tM9acLYkOpjO9wNcKsBylmzpbgAAMYBAVchdkMRxt4dTfe3O0XIt6n/1YIURInG/w8iqfY+Sf5qAAAAAMab75Nl77HG63fhQgRTDLRnuFUsoT3o7JP28WjEFSg5lA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACIKZTxM8VzUx0ZPJPRvYGK29h4M/qmf0MdgVhR5X3yk3/P2gh5CaePOSvZMLkNz5YHJz3tc9wPIyeeKDT/fAhZS6jVmSTu7BmhfymzcUZizs0Trj+f8jTonYAbrJDDkiLwAwAIAAFXIXZDEcbeHU33tztFyLep/9WCFESJxv8PIqn2Pkn+agAAAABrSDBFAiEA9eBQ5QvN3OY+3xdMMi/72ZSK95Pvcjtkv4ebqP6g914CIB2aa3B8iuPA0tS33Ty8+wpfJ4lQDt34g9zTJO26k7HxASECpJP3XPRKMH4yLJ1yMNDomGEgqXe+bgxeFzZ0fVYlDn3/////AvBJAgAAAAAAAmoASFMFAAAAAAAZdqkUaP7iaZ1IY9x5DnqJXcgZ9QcuC7eIrAAAAAAkAQHwSQIAAAAAABl2qRTNtjEDBHeqUnwFeatkyy8yENGK2IisAEEg1O0Ba+QtqVU2vNQs34arKsCo6KOltDrRAoSzf/E4hZhZWelk/zo7fwGXe3kIaPlbOVP+Oe3rnud2OT4xmn/WbnhQ+dKMz+FtPAQqA0iLxyjOzOUaMXMe1KTOuT0TKx1c",
                "timestamp": "2024-02-21T11:49:27.953Z",
                "blockHash": "16F98C6C2BB3D6DBB3211F744D6508E465720E788406C89A4173864213524597"
            }, {
                "hash": "8FD45C4D6405F651203585906D403B9E8846B4B749E0C5EB9E42A29C99DE5171",
                "index": 0,
                "blockHeight": 6,
                "type": 2,
                "data": "AwADAAAAAAAAACEClkesLwi6uZGMHKkTyRN+i08Ud1NHzJOpz/VS3S2t3NdBIE3PQl+X+uO0VOalqsXVyp8OjECRTUJZxtYy27SRRgopBaYqlHC8HX8EVyhbQ3KYCoRjWybhp/AKYYoNoh5eqe0AAQAAAgAAIQLanyzI71bLCSvjP9SqXySJBB0nFSby7BmVj+oju72LT0EghdTprft2IKg1Zctb/n73bwtWvb5+dswGiPMO4VZYyhR103cS57eLXf3cbab8FW3EFVuxWb+uJCdg4gGIOwtnYwACAAABAAAhAivYflEFh3CtDFocfWMjvw660dQk4nJ2S3zhFrwXHgXGQSBiFyfZA2Jxu0JcxesGI43bZUf/yF38SGM6SBrnAzNCs2zkuMeyuvyswyJVJOVDbvY6mOMTr2ZJDXveWcrw1+ZMAMYBAcab75Nl77HG63fhQgRTDLRnuFUsoT3o7JP28WjEFSg5AQAAAA2Pbh27xaTEQGMZorsB6qpJamw4xN0E0I8P89t7um0RlA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACFYLfDTNZBp9c7nHsXf6nofrf66OdXKm9PReWb/hfIyNdBJwkPQw6v/jyqvh77yq4CpOtFxAKzryFBkj2fxPW4IhHDFK5Sl/grX2+6tFhIHMNQcCSe5xT57BvpNvypYpPwAwAIAAHGm++TZe+xxut34UIEUwy0Z7hVLKE96OyT9vFoxBUoOQEAAABrSDBFAiEA8/aGQzPdACD6L7g5NEpthfriAi0noKp56f2twf/Oq6sCICe6dTIgZiivNH3YRiVsjH0G1/LbSwJR9SkefOJWmEe6ASED9peLgKvoWBxwdf4LhzWtsVyvyDbpnCePHUDrgXgntQv/////AvBJAgAAAAAAAmoAcAUDAAAAAAAZdqkUAcAZpXkG4pTXy9o3BOJh3iL6WiaIrAAAAAAkAQHwSQIAAAAAABl2qRQdpar8KFsYv4HsORkmgpGkVGsEVYisAEEf0rT/8Q2pHbQJeDpNcRfpI1g+jQr5WAu6tjYdsK/bvkA3vQiR36Swj24VByaLwZDsH2kf5YTGU7QtwjwIa5rfxlYZXtfsLH7wWZZJI4RD5J0vbepE5Iu2BKe/4xF/LvQX",
                "timestamp": "2024-02-21T11:50:14.307Z",
                "blockHash": "3D7627AB604192BFFC403F8DA305FC2D7659823E35ED3FB5E7855F386FF0415B"
            }, {
                "hash": "D4A8894C736CFE79514AE62AEA21643447F40DD8C0A9B0E51B11D3210F5BFD7D",
                "index": 0,
                "blockHeight": 7,
                "type": 2,
                "data": "AwADAAAAAAAAACEDXWJqjUw1nO/YHpgKQdXjXYxajhiArIbiEb7UCu/jjo9BIPY/3ubpNhztGTtkcxkFYmq4YzsooDe0t2ZVPk6VL7I4eKGCj+g2iOWZWpZjPFi3Gp84fXlNT0bXX3Ib3t9Qrs4AAQAAAgAAIQNM9lLPiklHgtvE16WagDhsQxMNHAg50MkDUTa7YO4pvEEgGIwAQ4MBpQUabpllAcsoHe/RFB6POLirDrAa0PWiiDRu4HXnBGCNos0ZB/n+hltr37go0Z+HTENBTvLB1PV0FwACAAABAAAhAwcGqlaLhuduSxg6J3CfnCieLoYEWWIitTtgZVDIINN1QSBUamUMYk1ANYnq/HG9JzF8NJz9biHjA5kw+HEp4JDv8h89SQDkrslR9V8N+tg+8qqPIFLsdOAYmT1ubMn7jBqlAMYBAQ2Pbh27xaTEQGMZorsB6qpJamw4xN0E0I8P89t7um0RAQAAAA3hvKzuaQoqYQ44bFywFqBnS46QaRYa7wHh6K4XmZhGlA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACiDeUAw0wqx6HUvCEMWSOMijDnSyWimAJZvWt+IAzBS0HtsBj7X2Uaplyj+ffj6rUGabxrq7PlvBuWYOJSqAylStrt2+cdEJI/5avQwMEigPom5r1SZLIE4KQQenPQAmzvAwAIAAENj24du8WkxEBjGaK7AeqqSWpsOMTdBNCPD/Pbe7ptEQEAAABqRzBEAiAjiENnGnEg5HxumtokHwl/ZbiOX5YSpwfYifFsTu7faQIgXkNBFwLUKA56wiFJUtvnuZxtdqoLVM+KLDuNtyT1PS4BIQPkxV8CGbvmL/8d2Xer+xIG/DpQm1ItYmgx9zdCqfwY3v////8C8EkCAAAAAAACagCYtwAAAAAAABl2qRQmPrhl3WCUwCHCtXgUtYCJHSPBtoisAAAAACQBAfBJAgAAAAAAGXapFGDGFuSQdxS6fe5QeKL8VfpOpnCJiKwAQSBQpp/r6R1gU1ywImareqoqiAk22Yjee9EpUkIqMdMMFWiEPn+oBQ2mTRJM4Gk7kGcN0q2bTVA1scUdchVA9/o7/xEWvxJyy4iMAcylxNu+crKwcyQpde4+p3+7iXXx2aM=",
                "timestamp": "2024-02-21T11:50:21.584Z",
                "blockHash": "A127BCC2B6087C0C05FF0A3796F4927BBE3082D68048D1A47D71C8DC55F37153"
            }, {
                "hash": "90E77B0266A27194ECF8DE6AC738C32357B3BC40EEFA4AB79508A16F7F04390F",
                "index": 0,
                "blockHeight": 8,
                "type": 2,
                "data": "AwADAAAAAAAAACEC1zcooNKIFd1ZiGgcClvUx2QWxHQhsIZsAF64GEd98PpBH3xodPOHM4GdFvOjdMknsw8J0N+Hx+3zAlcSf0DptW+ZFjXr0gH4v2XO1sqHPbA22uJXI8hExfKsb4L9yEXac20AAQAAAgAAIQMbm3b9SocjvUP4VvnGNimljzVWXkNtujRX2sFCSHVE2kEfWEYum/1KkbK3qGQ/yoCP+sF+NUPGr84RPCkJxq9LhQp9nf3k1iUIno8Y1gNWTh8JJthCN+hnpc/DFtbwzuYSuAACAAABAAAhAhbt0I4MU68uR50KOYVIawcRgKPSfF3M9TwzggWGWFd3QR8rlvETvkm365llXCb6gGpyHYKNG37Rg6KiX4OUbCraJS9214McbGUPsSxut1gwwRPNRO3677opZ7rGZKERTKB+AMYBAV86qlN+DYwwlkCifg6RlR3paZjQQAT5sT0iL2p0dFduAAAAAOxUzHQegpnJ9EzxE1N+5/fXKphRSHoOqmaK+TxgY7ptlA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACKBiVLize2nLK/chqUYD5v0NAUnnY7967YmdJS22rI7gA9z7yi8+NBM3WtOctjGOkQg/KF82x2x6Sy7zjPStdWaOU8OVkEZEwHewcXaF/LtMD/h/RLwK325TDi0i94m8TwAwAIAAFfOqpTfg2MMJZAon4OkZUd6WmY0EAE+bE9Ii9qdHRXbgAAAABrSDBFAiEAxCw1XITX8kwVzChiXVSGag8xJZjcctmjN73PtF4lvjkCIHDL75cpG490a6921MOiVXvzqH5ZvRCjZU/gtnGQnjI7ASEDemob9i+c4O75V06ebfC91wNqaU/qLJR4GnY4uAybTqf/////AuCTBAAAAAAAAmoAuIIBAAAAAAAZdqkUL3vc2y7gJXKQeUkVpFeXuA93U7uIrAAAAAAkAQHgkwQAAAAAABl2qRSYRgWVjvub6M3k6EBg+syeWE0XdoisAEEfc4foCwfeZYSIA0/bKuWx1Wv3bEPVJN/tQ+RJxRVnmapQ0x/APQ5ldD6h6uWo7waBZPSxgGyvDz+WAETdG+ie4iH9p6qcD3lG3ERwLiF621YpTO39OFRppaqgp46HxqPw",
                "timestamp": "2024-02-21T11:50:36.857Z",
                "blockHash": "4AF4A0F1F29C35F5E278CF7E152734EE2A5415BB6D8461EB15F2D325EB7E7B8D"
            }, {
                "hash": "4D091D84FC1318DED59777E01644D7B32425DBFA1681B7CCD561C929236B8FA6",
                "index": 0,
                "blockHeight": 9,
                "type": 2,
                "data": "AwADAAAAAAAAACEDjkucaZKpLTOOUEzrj7rMkU5tfQzHzMZ3TZwPRW3hX49BIDnQs4qIrg9exjBrqO95WsDACZ2D/D/Cxhjt5GXkbcKNVa80opr5Dms3/TdVjZ/+dnH7fjK0qhbKCsFFGoOK498AAQAAAgAAIQMZMizTwc000sl04ZwLqpJFrUrNSQdc0/J3oeNFHmvRMkEfIyyu+53gYI7y64hhdH0aBpXhJ3jluFvylx6+ID5dbrk4gT28i/UbZUM8d2yCU9DIe/1bCViUKNKSTWQIqCK4IQACAAABAAAhAwY3cUecsSAKevi3zTGylQqVNNvzJMOSjW7PBjjXQLeuQR+hjfXz6gelS/+F5n1pbb9Qx2t+NuRffjfopMvyKkvsNQSWK5EloTWx3j24mwU47WpUENIavKmQV5lfRln5LDHfAMYBAWvzUijBt26hLLHyzok9ux8PeXxbX2p1k3HyOnRC46rfAAAAAPNTTnpXnPRq727IjukLB7quuUnANdhc9VOinSch17DylA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACXrLe8aPrznr3cbPM2aSlY3Jpi7izXLUTRNMCR0kvc0Dm9eCujBwN7FnM/fcwNo4sVxcEQxmxyN2UZBrsOtMVm0vLGv3JQg39xE7o/AnXyFnvHxNwjtqowOj5nXKtiAsfvAwAIAAFr81IowbduoSyx8s6JPbsfD3l8W19qdZNx8jp0QuOq3wAAAABqRzBEAiAkD5LNUhxnAc/4OznxVGf/sKbH4Ik32rTVAstoRop5ZgIgP0yh457sDOKTcGchZNInaenYwRenqj1iwAiYGL/l2eQBIQMuMc/uIsJjHs+hYi6V5cBH1L+fIkpQHLfrtIbyes5X3v////8C4JMEAAAAAAACagBYCQMAAAAAABl2qRTCy0qM/QQJpnSHEGveqqgM8hBMeYisAAAAACQBAeCTBAAAAAAAGXapFBYdsIF5lCGJUvz6emH504U+028XiKwAQSCwF8ot2mudpMlOaiQZIGHtG/v/YPjZCwSDD9+7zamGHzBw80TLRRgTPEZp8IX1sUGj3laBE4WcqpwoqSCKg+aiZEmwWY0Lj249wy9jLNNBJMQCbjiqEa9eh6PmricNiho=",
                "timestamp": "2024-02-21T11:51:05.723Z",
                "blockHash": "F0DA8C6DDF1A4EC28EB4EC29758EA5D49466489EF8EEFADC44A368B028089A9A"
            }, {
                "hash": "D478EDAE19CBF73D6577157CB728B37C8096EA4E33F68AF9E43C1147AB293118",
                "index": 0,
                "blockHeight": 10,
                "type": 3,
                "data": "BAAAxgEB7NawMUd/NCgG31dAtw+TuKPpJbvy2Q2Xml7RYqjX1WYAAAAAZOoXc8LDiPg8IlgDoF0GE6FP7KXgcDD3ZJ+1xZj0NHeUD+PcjpNLienpepbPQpjaPvsj2KF9UsdZVhGU0wAAAKXoFZfpRVhhi/FGSAEYjsvAnHoS5zSJIlxjaEJZ8HX4eqPUfqm7vh+cMUCG3cNabRizD/T+V5hVd5+SaLi/XHl2DH2MVtNBY5MfAWwuMDaFLdM6a2Q91Z3IxUGZ8049Le8DAAgAAezWsDFHfzQoBt9XQLcPk7ij6SW78tkNl5pe0WKo19VmAAAAAGpHMEQCIDOdTYlOsv+cGTvYwzzbMDCovhjdvzDZg+gobAjGxMfZAiAYF0HZ7tOBTsB3AwwmwLn/9jue8Q4ebKHIcGmyYbASegEhA0lRu9XQ1QCUJCZQfUuE5tiEBjAO2CAJqNsIf0kwF3hq/////wLgkwQAAAAAAAJqAHiqCgAAAAAAGXapFHBttdHo+1+SXG22QQT0t38Mi3PUiKwAAAAAJAEB4JMEAAAAAAAZdqkUdKUJtPO4DOgYRl3A+fZuIQPZF4uIrAAwEsGbmOwAM63bNs1kt/UQZw8qNRpDBLX2mUFEKG79rEEfgQzQv+AhBDYpQdNb0F/fgs3FDDvIUQB3v6YtR7aHEFsP2yNueYLMfPeL+Du+/kEzAcndc5JMc17oablX97OVgQ==",
                "timestamp": "2024-02-21T11:51:31.479Z",
                "blockHash": "ABE1A1F8DC1A8BFBBCBE41130643C918EAD2E98DD4988B1967DE2FF70049AED2"
            }, {
                "hash": "079B5612223D935E56B9AFF9D2DC09D971FAD3EFF51BA2F527927BBF51FFA55B",
                "index": 0,
                "blockHeight": 11,
                "type": 2,
                "data": "AwADAAAAAAAAACEC45ppexoGKGJegodaS52+bSeHOm8VzS04wwhMx6cWfcdBHzMwG6TI5S2xoJJat4wL1mTd5Ie3qz/e5sqpW6bIXbjHOkY+2FzaAAhrf0P4BupEMqYZrOMvcmyewhxRP7zh6EcAAQAAAgAAIQLfboVdN6EHegxdQqV+JG8NGLqLaCJfqB7BZwAX5kcZa0EgVjTfZ5KPL2+SFbIez+qRGo5gvtZEVyMA5/obkWKwg25AWNZv0XDSF1J/5QpjdZ1xEPfBondXpscRta48d1hEugACAAABAAAhA+tVDbfO18W9fbBA8lkQlnlzev5L8PaCnp3YxYMYeHkXQR89yFv5IuH5Dt3AaKaJSGfl+eqfA+OQ7QAAwOeCzq2Z3wJCtlG19ksZ7xMW638xWrN3TZ6p3FdXgUZtxEOFD6vsAMYBAWTqF3PCw4j4PCJYA6BdBhOhT+yl4HAw92SftcWY9DR3AQAAADLZJn6SZfjq2L30NlQDIKwJLueATVp2ar989FD3kA/ulA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACXyHE3NeKkaDuUSOosmKkrH9dXJsK/SOSRfXPpc6RSdz24KTvo6dnQbvSmcBeIh0gMnz0soULarDVfPwgkpxM2oLjVzcaSTlcqZEBdBMF/4INrgIMII2pQkJLF+j1g7PLwAwAIAAFk6hdzwsOI+DwiWAOgXQYToU/speBwMPdkn7XFmPQ0dwEAAABrSDBFAiEAxy98lhFuRYuEGsZbBOK2070S0GLu573yEhUaIfb2iQQCIBJ5cpBsTDg8YGF1xihij6jxpT2hqi9YDNoAtBgzNHDjASECFCtu+a/yrPn7JMFypRrRkgfjvOuigqyjITT9jmhu6M7/////AsAnCQAAAAAAAmoA0H4BAAAAAAAZdqkUhLRPG2Q9KZXRfRhj6SbSAPutEviIrAAAAAAkAQHAJwkAAAAAABl2qRSvDRM4xGfviF251TiQsLVaTkCUB4isAEEf32JJ8dTLBg60FXDmXMk7mt4BK8OW2/O/aZBTHuRFBIg1Wb5Ivnj59gALCUJepYj1/5DlVkyM1ojjKdZ2WQVr+qDNQIhHz7ncp69JWrPEEK2I/NAvJzEudDixsZG4Roww",
                "timestamp": "2024-02-21T11:51:43.270Z",
                "blockHash": "A539CC1C937587A55D23827737D143330C713335E16D6011399BA32FF04CA499"
            }, {
                "hash": "E4947847855D0651E9B0D58281FDECF42CBE4BD6B9B1022E7B70901CD0ED09EC",
                "index": 0,
                "blockHeight": 48,
                "type": 2,
                "data": "AwADAAAAAAAAACECHCdT6TyLlEJYo9ObwuuguNQostyT+I4j0Wf3i8A6dJhBHxC4dnRXpXpmR1JIuy9lrFUwUslFHHQw7PsyXPD0UFGUIR7znT0345lcGwjRZBrws/BSVTcU52vnkC/Kj2kExa4AAQAAAgAAIQMGf4nznqOOpi/SHnR49RBXsVSsMhHLrsMAZtPebVSpYkEfzCReFX01VQGGL6giisW+CPFE7C/gXHdqlhGeF2skWyN+JV52JwlPlt2B9FeYDQTsHvV2EHjHRZCFP5niXdPJLgACAAABAAAhA069EtsIcSrK9GjRlbSo+VycO+BaO/KxnLdkuw6Vo+yKQR8seaoLPHW68g8neTojzHrmzUKuImKMShl39AWMkTYoTFTDjr4qmjYRYmV6qSOd0cz5rgIrNsI4qituEl1iNHmhAMYBAdhhWdFom2DeG1yWk6WGvnpCLx+xjQ5fbFDCNzo8Fra/AAAAAC7xjk0gjHXuL/Q9AhXEtJs/ulj3ZM2hPnNV2t1dVb4rlA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACBPjnyQVwrYskPWuuYB1nM3NY70STyVrgfNEEjbQrLwIhIvzn451kHVkHCuNZXTWYEjTp+O/SyNP3jVyyiTZT1bEBlYS2nVuSBCVU08JwyFZhMZZQIZEwE9MtU9TL0r1/vAwAIAAHYYVnRaJtg3htclpOlhr56Qi8fsY0OX2xQwjc6PBa2vwAAAABqRzBEAiABLESExRdN/xzs9N61dsZk30aZYkULJi0EbCHm1iSNVQIgRK8DpgSKZ1oTC+jtcFekcd+ZAbJxBvX5KOztwH8PRIYBIQKcOLb9wjJjY5dyO8qfuSOZQ36rHSQzvDmZrHL0aO8ul/////8CgBoGAAAAAAACagCYDisBAAAAABl2qRTOjip+31gTJjggoXz7Z6UTUOU33oisAAAAACQBAYAaBgAAAAAAGXapFHz948Yn0cKUb7Y7GgPrFMCnvnpxiKwAQSA70XvCkWVwMhFGAI83AXaCmLjCmyPv7l1buXQqbP0Q1RCWMKJTVwC5VbspOQD4g9/182LMbHgoqgLpIMM2QxogaFegbZkq2Uu8P37a0Kbu2L1fTBoUUAlbXVfyIMl8CgI=",
                "timestamp": "2024-02-21T13:47:56.238Z",
                "blockHash": "F480702C32BAAA2C5F00879D4755A0C47650FD1394BF8A78A48815BEB4B70716"
            }]

            assert.deepEqual(body.resultSet, expectedTransactions)
        })

        it('should return default set of transactions desc', async () => {
            const {body} = await client.get('/transactions?order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 10)
            assert.equal(body.pagination.total, 746)
            assert.equal(body.pagination.page, 1)
            assert.equal(body.pagination.limit, 10)

            const expectedTransactions = [
                {
                    "hash": "11F872EC9CF2060472D5D46F2A4363B15DF16A15B0BBAECA383DDD6FAC3E80B9",
                    "index": 0,
                    "blockHeight": 3243,
                    "type": 6,
                    "data": "BQAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQfwAD0JAAQAXqRQaRYWg/aAHc/J35fjv7ZDhNvkHpocLAkEf+YCb/Ye+UZoGL3o82HJhHbrWTfPifeGGY0zRLBTdFOdf75mYIf/xtf9RrchmQZ78pWmO1QoK+nRQXHAL6GVPfg==",
                    "timestamp": "2024-02-27T09:00:16.642Z",
                    "blockHash": "7F7219D89141AF98460B9BEF1AA05990134EE586E67D16A0FAC92613B9E9379B"
                },
                {
                    "hash": "743FA11103348FEC33960BF9659CE8FF1F61946A27A2321989ECB0F8A772BCD2",
                    "index": 0,
                    "blockHeight": 3242,
                    "type": 0,
                    "data": "AAAAouj7em6KZhHk/2qhQu//wTpqLsB6+eub671xcCIAMekAAAAAAAEAAAAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQADC2NvbnRhY3RJbmZvFgUSBHR5cGUSBm9iamVjdBIHaW5kaWNlcxUCFgMSBG5hbWUSEW93bmVySWRLZXlJbmRleGVzEgpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEhZyb290RW5jcnlwdGlvbktleUluZGV4EgNhc2MWARIcZGVyaXZhdGlvbkVuY3J5cHRpb25LZXlJbmRleBIDYXNjEgZ1bmlxdWUTARYCEgRuYW1lEg1vd25lcl91cGRhdGVkEgpwcm9wZXJ0aWVzFQIWARIIJG93bmVySWQSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MSCnByb3BlcnRpZXMWBBILZW5jVG9Vc2VySWQWBRIEdHlwZRIFYXJyYXkSCWJ5dGVBcnJheRMBEghtaW5JdGVtcwIgEghtYXhJdGVtcwIgEghwb3NpdGlvbgIAEhZyb290RW5jcnlwdGlvbktleUluZGV4FgISBHR5cGUSB2ludGVnZXISCHBvc2l0aW9uAgESHGRlcml2YXRpb25FbmNyeXB0aW9uS2V5SW5kZXgWAhIEdHlwZRIHaW50ZWdlchIIcG9zaXRpb24CAhILcHJpdmF0ZURhdGEWBhIEdHlwZRIFYXJyYXkSCWJ5dGVBcnJheRMBEghtaW5JdGVtcwIwEghtYXhJdGVtcwL7CAASCHBvc2l0aW9uAgMSC2Rlc2NyaXB0aW9uElxUaGlzIGlzIHRoZSBlbmNyeXB0ZWQgdmFsdWVzIG9mIGFsaWFzTmFtZSArIG5vdGUgKyBkaXNwbGF5SGlkZGVuIGVuY29kZWQgYXMgYW4gYXJyYXkgaW4gY2JvchIIcmVxdWlyZWQVBhIKJGNyZWF0ZWRBdBIKJHVwZGF0ZWRBdBILZW5jVG9Vc2VySWQSC3ByaXZhdGVEYXRhEhZyb290RW5jcnlwdGlvbktleUluZGV4EhxkZXJpdmF0aW9uRW5jcnlwdGlvbktleUluZGV4EhRhZGRpdGlvbmFsUHJvcGVydGllcxMADmNvbnRhY3RSZXF1ZXN0FgcSJHJlcXVpcmVzSWRlbnRpdHlFbmNyeXB0aW9uQm91bmRlZEtleQICEiRyZXF1aXJlc0lkZW50aXR5RGVjcnlwdGlvbkJvdW5kZWRLZXkCAhIEdHlwZRIGb2JqZWN0EgdpbmRpY2VzFQQWAxIEbmFtZRIOb3duZXJfdXNlcl9yZWYSCnByb3BlcnRpZXMVAxYBEggkb3duZXJJZBIDYXNjFgESCHRvVXNlcklkEgNhc2MWARIQYWNjb3VudFJlZmVyZW5jZRIDYXNjEgZ1bmlxdWUTARYCEgRuYW1lEhBvd25lcklkX3RvVXNlcklkEgpwcm9wZXJ0aWVzFQIWARIIJG93bmVySWQSA2FzYxYBEgh0b1VzZXJJZBIDYXNjFgISBG5hbWUSE3RvVXNlcklkXyRjcmVhdGVkQXQSCnByb3BlcnRpZXMVAhYBEgh0b1VzZXJJZBIDYXNjFgESCiRjcmVhdGVkQXQSA2FzYxYCEgRuYW1lEhMkb3duZXJJZF8kY3JlYXRlZEF0Egpwcm9wZXJ0aWVzFQIWARIIJG93bmVySWQSA2FzYxYBEgokY3JlYXRlZEF0EgNhc2MSCnByb3BlcnRpZXMWBhIIdG9Vc2VySWQWBRIEdHlwZRIFYXJyYXkSCWJ5dGVBcnJheRMBEghtaW5JdGVtcwIgEghtYXhJdGVtcwIgEghwb3NpdGlvbgIAEhJlbmNyeXB0ZWRQdWJsaWNLZXkWBRIEdHlwZRIFYXJyYXkSCWJ5dGVBcnJheRMBEghtaW5JdGVtcwJgEghtYXhJdGVtcwJgEghwb3NpdGlvbgIBEg5zZW5kZXJLZXlJbmRleBYCEgR0eXBlEgdpbnRlZ2VyEghwb3NpdGlvbgICEhFyZWNpcGllbnRLZXlJbmRleBYCEgR0eXBlEgdpbnRlZ2VyEghwb3NpdGlvbgIDEhBhY2NvdW50UmVmZXJlbmNlFgISBHR5cGUSB2ludGVnZXISCHBvc2l0aW9uAgQSFWVuY3J5cHRlZEFjY291bnRMYWJlbBYFEgR0eXBlEgVhcnJheRIJYnl0ZUFycmF5EwESCG1pbkl0ZW1zAjASCG1heEl0ZW1zAlASCHBvc2l0aW9uAgUSCHJlcXVpcmVkFQYSCiRjcmVhdGVkQXQSCHRvVXNlcklkEhJlbmNyeXB0ZWRQdWJsaWNLZXkSDnNlbmRlcktleUluZGV4EhFyZWNpcGllbnRLZXlJbmRleBIQYWNjb3VudFJlZmVyZW5jZRIUYWRkaXRpb25hbFByb3BlcnRpZXMTAAdwcm9maWxlFgUSBHR5cGUSBm9iamVjdBIHaW5kaWNlcxUCFgMSBG5hbWUSB293bmVySWQSCnByb3BlcnRpZXMVARYBEggkb3duZXJJZBIDYXNjEgZ1bmlxdWUTARYCEgRuYW1lEhBvd25lcklkVXBkYXRlZEF0Egpwcm9wZXJ0aWVzFQIWARIIJG93bmVySWQSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MSCnByb3BlcnRpZXMWAxIJYXZhdGFyVXJsFgQSBHR5cGUSBnN0cmluZxIGZm9ybWF0EgN1cmkSCW1heExlbmd0aAL7CAASCHBvc2l0aW9uAgASDXB1YmxpY01lc3NhZ2UWAxIEdHlwZRIGc3RyaW5nEgltYXhMZW5ndGgCjBIIcG9zaXRpb24CARILZGlzcGxheU5hbWUWAxIEdHlwZRIGc3RyaW5nEgltYXhMZW5ndGgCGRIIcG9zaXRpb24CAhIIcmVxdWlyZWQVAhIKJGNyZWF0ZWRBdBIKJHVwZGF0ZWRBdBIUYWRkaXRpb25hbFByb3BlcnRpZXMTAK7gqkvekuVPpbb0jkmryVlSEnpCakE6osFBax57fpAXAkEggtp8gc6bgs1NvpnGDUCjNznmTMHR6nt1Y9Wdj4d9M8YjkVKummIQ3hhPiWRV1F5dZAicJFN7SSNCQx7BLDRQXw==",
                    "timestamp": "2024-02-27T08:59:53.703Z",
                    "blockHash": "15C58CFA14DCE5D9B25FB35648AEB82EB2B3EFB180AFEC1250824096229F4052"
                },
                {
                    "hash": "C994CB2E31FE4294C74B90E38428119B51A0FAEC9568C9D6B4D53F1681767D67",
                    "index": 0,
                    "blockHeight": 3203,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQ0PAgAbAAAAAAAhA/RYIkNqmTfZfmOHQsdxGcp1xCETFN1g1tEHHCHSn+8xQSBGeGUuGA4AWGU6hm4yFKbn1JcISyQ7eYECanghuTdu9Fhoa8MQCsdSkpTwWC8EKBnpu8vEIOPgyfwi5WTeqxmxABwBAAIAADCG91nqEKYAz8jSmVqHdZXmJPnppcc2Y5plDSVD93d/KQmCMYDF7vU1Dxmo4CKRmetgpM4ZTleBr3bRBdLJTRb4eRHP1Vnd7hPiML+u0H82ny4M4Du9tbHwUCOP4MtDdljMC+yD3psb4wLJHndRG3eHqdDRq2a4/k4VyOU6rA1uhl6qiiROHiksWRAbKhqRWyjMAAAAQR9iXvzp+70zGhfswwFPBIdozChPHqS5xR46l8cF76Doshi8WSyvyDJS1wEiNmjfvpNPOVB7ExCXXUNB/pLLICml",
                    "timestamp": "2024-02-27T07:00:12.981Z",
                    "blockHash": "2B9F25D20E4B023DA2FCB3FE930AED400049D9A5667AB48EA27DEF73AEF698A1"
                },
                {
                    "hash": "95D8FE43211CE0214B400D79EDF2551F73BBF407BEF648BADD8407D06E7D6E9D",
                    "index": 0,
                    "blockHeight": 3202,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQwOAgAZAQACAAAwoY+6D9rHQDOmIv5vZ7ul6xgiIFuypTeEpfgLveuDQS+GEfO2T5YdwCRmD0q3fRVNYLfs0xSTBpweANdcAgpFfIoA4H/x6a5RgySow5zNLaIHWQCWNBg5VbUz3AKa93SNhwJhzByLxm8Qdb2K0658SjsihV8qhwYsdeDOf9IovnU21MRhqZHbHb4nTnbchwZs0wAaAgAAAAAUHtnXE3Y2xtp8osKw0dgSp5aC4FcAAAAAQR/S8YbKXWFIWFe+fATbl9lkM9wTNF/GwOYOtn0YTXby/CnDiaF9bV5aoM8f3NJwI/EOxJH9wBLjiUEzJtyDauGP",
                    "timestamp": "2024-02-27T07:00:08.216Z",
                    "blockHash": "C36D7E00DE64B3E116F063FADF76E4CD8F911D2F8DCF7EB710794787B590508F"
                },
                {
                    "hash": "6639E3B744DEFEF1E687702C0B498F1EFC8BFFD3B6D88CB06DE0484B5C9D65BF",
                    "index": 0,
                    "blockHeight": 3201,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQsNAgAXAQACAAAwhFTSP5hovKrhxHWJNbaXr9WcyfmqsH1nPY6Bs/e3zcdS1WPQzOyy/f7hw/8s77VOYKkjGYc6IA2UhFVEc9CG0npvV/iQYjKMmPWJ6yx9PNu/sLkx1McNPX5GSaYPvkkvtg3m44LEZgayWrWO1J4q3hyHH9G2mu+yNRL4D+1xO6FqTjP4r+YNqdkq8+IGJ+n0+gAYAgADAAAUT7UEUDnIn3+JiNXirVQjIUrAADUAAAAAQSBj5JKu4Ys4I5SgKlgqHGfAhLJu6JPoPoTWg1EQgoLZjGD6x2dfku+i7XJa1CE8CIw8i0qVP4Er2ljARUFElLL/",
                    "timestamp": "2024-02-27T07:00:00.730Z",
                    "blockHash": "CA365814CD5D1EDC9DB1083705FA1F55C2E2985E5DF534A50D701A88367B077E"
                },
                {
                    "hash": "02C9A07E5570B204284F3AAB6A4186F07C4FAABE5061CE5FC73A1D60E87A5020",
                    "index": 0,
                    "blockHeight": 3200,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQoMAgAVAgADAAAUXcIBQHZBS6qAN88uyzkd3N9R+7sAABYCAAMAABSoHy/t57adx0J4zQu8q0M4FY4CmgAAAABBH9Be+GwdHRdzz8zbKxXcfNaTvYFHGV8/ETwStWCrnG9iEe/Rn/vejBaWmT7TfK9HcvjVYwsy5MAdy/9UpcArnjE=",
                    "timestamp": "2024-02-27T06:59:21.818Z",
                    "blockHash": "64879FB993F902095F55884322F343534D7914F24A2D9BA6CAF9CDC72FD1D4A3"
                },
                {
                    "hash": "F59E3951E067D2D9D1F9BDA55292714E134B3756598F79AFAF01093FEFF80E66",
                    "index": 0,
                    "blockHeight": 3199,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQkLAgATAQADAAAwt1v2Xm2P+voRtmgEqILWwt902Pf53e9fQSn/Kqmif7M8f6ZG8Jx8pJn2MbV9yW9JYIMvr14bs7RBnH2TghKXejwuD3b+ojgoOuUITd4TRlSM44dJ6N913666V5e7eVZeaRGZynn0mjrb0EgdBfWS2jn6oCR+Y7FRYOBcNApL9472YG47lR2YqtDEHBy9ItHrOwAUAAACAAAhAooegO86x+n/Avt66hSXjv9Rh2EKw8xl5nILus7jUQvQQR8GN6WmH7V+tT4v/dnhY+zztelN89lkm+fINCo8U6ue4gUmb/1iphhZd0wCAC/o+19TN83BgQ2zhFu/qH6AnTl7AAAAQR+dDUu0OLXa9LV6HMeE8f9tF3PFhmZqFuxXHWaSYU7KITNGjdVNnbInw8TVXxZwMbjyE6P/mRgPn3KolGQSr0Vw",
                    "timestamp": "2024-02-27T06:59:16.692Z",
                    "blockHash": "FA0B147CD21FF6F5B683FCA2FF49EAF522669CB308F64955E057BBFA57A34A03"
                },
                {
                    "hash": "A9DC804F988C1E6EB79ABA72056B3A479B22CEB12E8184E855C574D32A4AE3A9",
                    "index": 0,
                    "blockHeight": 3190,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQkKAgARAAAAAAAhAwUxutmEXr7pU4ay1PD/jdrmZGXVSzZTQHP6gyMSisEDQR9KLPCwfUqi8n1P3unhAuA+Dp2wn1mKEolfKg9x+Q+jukhsNjWm6G0jHgUN4feYWcLxVPDpqB7vW7Upxmu2h+q+ABIBAAIAADCNJ+MsuNlCy/I68dFkGlMU9hYKLD25bmALvOpjyYGxNwNZLLon5J/9obGeEU+bJQVgkD2pqrhs3IheOpl8AB6cbO194xUOPmInPE5xT4T25r7PuVoNn/DX7tqVa4bgLNRvES0mw1/Wcn1aYdJtn0ulnHNRZI6JtgdvDK2gnAMHqBfYLv7tHRoS2WWGEVP6uKwYAAAAQR/HEqL+ee++ui8uVzzYwDE85OvPFB4um8ouCsrHe72+Rjs5YryQYACjX6fMY9H2z4K/ENNf/dfLsYeVTrYyqilS",
                    "timestamp": "2024-02-27T06:31:01.492Z",
                    "blockHash": "F89D3829826C6BE639E9010E0660034E11D327690FB51D9A29E22546A1C9F1FC"
                },
                {
                    "hash": "CD3C5558434496D453AB07730C4D958508A2157013EBED8F475CFBCA09C97162",
                    "index": 0,
                    "blockHeight": 3189,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQgJAgARAgACAAAUoEOMv9y1io6wwIS63gQnTWDEbikAABIBAAAAADCg75AHA/vCJYhO3BgesPaaEiQYltGzAg8qpygE3nfCjbOSspDUZPg4QeR2FkkWMhhgooOij/Vm5/OQiUrBRSivFsOw/RdXHmVEzyksS41CIZYszs4bfvz3IkoECuVyeNfLESowJZIs1QO3hUV/qBvCjcWwECK0ZHNl4uQZ4qmOZwfdSKBXrMCeY9XvswsbrfclAAAAQR90LTJpXhqj6uk2dI0911gdB0lPCYcimn6hDITAKFh92iPZrawQQdXsBB/AADXcJGzMK+bnIT2JYt/IS1qwr5GI",
                    "timestamp": "2024-02-27T06:30:57.004Z",
                    "blockHash": "97C7598B5B7A3C2B372BA67C9E19FFC6C02D31D3DDB095DFA5C50A6496A64783"
                },
                {
                    "hash": "64646D06B66DF935FA964BD2E3EFE870DC32B0C73A098038D1748B9AEFC871DC",
                    "index": 0,
                    "blockHeight": 3171,
                    "type": 1,
                    "data": "AgBxOKCtcwaxbBPtzlr1Vglyg6jwNZPkB8EUw/nHiXQsHQEAAAA7S/kYzPhX/kepz37qAi/qWht1t4S50RWKJEVB/QO3gAIHZGdwaXRlbUfsLEyfI3Q/97cwLUR85oL4SJkAQRKmjB+PRLkGDSl9OwhBGp73K2t0TVsyYOdb3HQa0+9tMlRKuOfl+EQ3HSAB/QAAAY3ptAyPAf0AAAGN6bQMjwUFYXZhaWwTAQhjYXRlZ29yeRIAC2Rlc2NyaXB0aW9uEmtzb21ldGhpbmcgaXMgdGhlcmUsIHRoZSBpbnN0cnVtZW50cyBub3RpY2UgdGhlIGdyYXZpdGF0aW9uYWwgcHVsbC4uLmJ1dCBub3RoaW5nIHRvIHNlZSwgbm90aGluZyB0byB0b3VjaC4uLgRuYW1lEgtkYXJrIG1hdHRlcgVwcmljZQL8AJiWgAFBIOoihWE4I1+rXOYWKd1gSjvWF8pRkvIy21PS5sWnzGjoWYsyxiF2/fvDKoFShmpqbqPqeRBb4AVBxHl9F5AcOf0=",
                    "timestamp": "2024-02-27T05:35:18.988Z",
                    "blockHash": "BE6BF6CEF02A0619B86FC986E2886B627C07B7113EDE1A772DD6452F567CC34D"
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransactions)
        })

        it('should return be able to walk through pages', async () => {
            const {body} = await client.get('/transactions?page=2&limit=3')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 3)
            assert.equal(body.pagination.total, 746)
            assert.equal(body.pagination.page, 2)
            assert.equal(body.pagination.limit, 3)

            const expectedTransactions = [
                {
                    "hash": "8FD45C4D6405F651203585906D403B9E8846B4B749E0C5EB9E42A29C99DE5171",
                    "index": 0,
                    "blockHeight": 6,
                    "type": 2,
                    "data": "AwADAAAAAAAAACEClkesLwi6uZGMHKkTyRN+i08Ud1NHzJOpz/VS3S2t3NdBIE3PQl+X+uO0VOalqsXVyp8OjECRTUJZxtYy27SRRgopBaYqlHC8HX8EVyhbQ3KYCoRjWybhp/AKYYoNoh5eqe0AAQAAAgAAIQLanyzI71bLCSvjP9SqXySJBB0nFSby7BmVj+oju72LT0EghdTprft2IKg1Zctb/n73bwtWvb5+dswGiPMO4VZYyhR103cS57eLXf3cbab8FW3EFVuxWb+uJCdg4gGIOwtnYwACAAABAAAhAivYflEFh3CtDFocfWMjvw660dQk4nJ2S3zhFrwXHgXGQSBiFyfZA2Jxu0JcxesGI43bZUf/yF38SGM6SBrnAzNCs2zkuMeyuvyswyJVJOVDbvY6mOMTr2ZJDXveWcrw1+ZMAMYBAcab75Nl77HG63fhQgRTDLRnuFUsoT3o7JP28WjEFSg5AQAAAA2Pbh27xaTEQGMZorsB6qpJamw4xN0E0I8P89t7um0RlA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACFYLfDTNZBp9c7nHsXf6nofrf66OdXKm9PReWb/hfIyNdBJwkPQw6v/jyqvh77yq4CpOtFxAKzryFBkj2fxPW4IhHDFK5Sl/grX2+6tFhIHMNQcCSe5xT57BvpNvypYpPwAwAIAAHGm++TZe+xxut34UIEUwy0Z7hVLKE96OyT9vFoxBUoOQEAAABrSDBFAiEA8/aGQzPdACD6L7g5NEpthfriAi0noKp56f2twf/Oq6sCICe6dTIgZiivNH3YRiVsjH0G1/LbSwJR9SkefOJWmEe6ASED9peLgKvoWBxwdf4LhzWtsVyvyDbpnCePHUDrgXgntQv/////AvBJAgAAAAAAAmoAcAUDAAAAAAAZdqkUAcAZpXkG4pTXy9o3BOJh3iL6WiaIrAAAAAAkAQHwSQIAAAAAABl2qRQdpar8KFsYv4HsORkmgpGkVGsEVYisAEEf0rT/8Q2pHbQJeDpNcRfpI1g+jQr5WAu6tjYdsK/bvkA3vQiR36Swj24VByaLwZDsH2kf5YTGU7QtwjwIa5rfxlYZXtfsLH7wWZZJI4RD5J0vbepE5Iu2BKe/4xF/LvQX",
                    "timestamp": "2024-02-21T11:50:14.307Z",
                    "blockHash": "3D7627AB604192BFFC403F8DA305FC2D7659823E35ED3FB5E7855F386FF0415B"
                }, {
                    "hash": "D4A8894C736CFE79514AE62AEA21643447F40DD8C0A9B0E51B11D3210F5BFD7D",
                    "index": 0,
                    "blockHeight": 7,
                    "type": 2,
                    "data": "AwADAAAAAAAAACEDXWJqjUw1nO/YHpgKQdXjXYxajhiArIbiEb7UCu/jjo9BIPY/3ubpNhztGTtkcxkFYmq4YzsooDe0t2ZVPk6VL7I4eKGCj+g2iOWZWpZjPFi3Gp84fXlNT0bXX3Ib3t9Qrs4AAQAAAgAAIQNM9lLPiklHgtvE16WagDhsQxMNHAg50MkDUTa7YO4pvEEgGIwAQ4MBpQUabpllAcsoHe/RFB6POLirDrAa0PWiiDRu4HXnBGCNos0ZB/n+hltr37go0Z+HTENBTvLB1PV0FwACAAABAAAhAwcGqlaLhuduSxg6J3CfnCieLoYEWWIitTtgZVDIINN1QSBUamUMYk1ANYnq/HG9JzF8NJz9biHjA5kw+HEp4JDv8h89SQDkrslR9V8N+tg+8qqPIFLsdOAYmT1ubMn7jBqlAMYBAQ2Pbh27xaTEQGMZorsB6qpJamw4xN0E0I8P89t7um0RAQAAAA3hvKzuaQoqYQ44bFywFqBnS46QaRYa7wHh6K4XmZhGlA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACiDeUAw0wqx6HUvCEMWSOMijDnSyWimAJZvWt+IAzBS0HtsBj7X2Uaplyj+ffj6rUGabxrq7PlvBuWYOJSqAylStrt2+cdEJI/5avQwMEigPom5r1SZLIE4KQQenPQAmzvAwAIAAENj24du8WkxEBjGaK7AeqqSWpsOMTdBNCPD/Pbe7ptEQEAAABqRzBEAiAjiENnGnEg5HxumtokHwl/ZbiOX5YSpwfYifFsTu7faQIgXkNBFwLUKA56wiFJUtvnuZxtdqoLVM+KLDuNtyT1PS4BIQPkxV8CGbvmL/8d2Xer+xIG/DpQm1ItYmgx9zdCqfwY3v////8C8EkCAAAAAAACagCYtwAAAAAAABl2qRQmPrhl3WCUwCHCtXgUtYCJHSPBtoisAAAAACQBAfBJAgAAAAAAGXapFGDGFuSQdxS6fe5QeKL8VfpOpnCJiKwAQSBQpp/r6R1gU1ywImareqoqiAk22Yjee9EpUkIqMdMMFWiEPn+oBQ2mTRJM4Gk7kGcN0q2bTVA1scUdchVA9/o7/xEWvxJyy4iMAcylxNu+crKwcyQpde4+p3+7iXXx2aM=",
                    "timestamp": "2024-02-21T11:50:21.584Z",
                    "blockHash": "A127BCC2B6087C0C05FF0A3796F4927BBE3082D68048D1A47D71C8DC55F37153"
                }, {
                    "hash": "90E77B0266A27194ECF8DE6AC738C32357B3BC40EEFA4AB79508A16F7F04390F",
                    "index": 0,
                    "blockHeight": 8,
                    "type": 2,
                    "data": "AwADAAAAAAAAACEC1zcooNKIFd1ZiGgcClvUx2QWxHQhsIZsAF64GEd98PpBH3xodPOHM4GdFvOjdMknsw8J0N+Hx+3zAlcSf0DptW+ZFjXr0gH4v2XO1sqHPbA22uJXI8hExfKsb4L9yEXac20AAQAAAgAAIQMbm3b9SocjvUP4VvnGNimljzVWXkNtujRX2sFCSHVE2kEfWEYum/1KkbK3qGQ/yoCP+sF+NUPGr84RPCkJxq9LhQp9nf3k1iUIno8Y1gNWTh8JJthCN+hnpc/DFtbwzuYSuAACAAABAAAhAhbt0I4MU68uR50KOYVIawcRgKPSfF3M9TwzggWGWFd3QR8rlvETvkm365llXCb6gGpyHYKNG37Rg6KiX4OUbCraJS9214McbGUPsSxut1gwwRPNRO3677opZ7rGZKERTKB+AMYBAV86qlN+DYwwlkCifg6RlR3paZjQQAT5sT0iL2p0dFduAAAAAOxUzHQegpnJ9EzxE1N+5/fXKphRSHoOqmaK+TxgY7ptlA/j3I6TS4np6XqWz0KY2j77I9ihfVLHWVYRlNMAAACKBiVLize2nLK/chqUYD5v0NAUnnY7967YmdJS22rI7gA9z7yi8+NBM3WtOctjGOkQg/KF82x2x6Sy7zjPStdWaOU8OVkEZEwHewcXaF/LtMD/h/RLwK325TDi0i94m8TwAwAIAAFfOqpTfg2MMJZAon4OkZUd6WmY0EAE+bE9Ii9qdHRXbgAAAABrSDBFAiEAxCw1XITX8kwVzChiXVSGag8xJZjcctmjN73PtF4lvjkCIHDL75cpG490a6921MOiVXvzqH5ZvRCjZU/gtnGQnjI7ASEDemob9i+c4O75V06ebfC91wNqaU/qLJR4GnY4uAybTqf/////AuCTBAAAAAAAAmoAuIIBAAAAAAAZdqkUL3vc2y7gJXKQeUkVpFeXuA93U7uIrAAAAAAkAQHgkwQAAAAAABl2qRSYRgWVjvub6M3k6EBg+syeWE0XdoisAEEfc4foCwfeZYSIA0/bKuWx1Wv3bEPVJN/tQ+RJxRVnmapQ0x/APQ5ldD6h6uWo7waBZPSxgGyvDz+WAETdG+ie4iH9p6qcD3lG3ERwLiF621YpTO39OFRppaqgp46HxqPw",
                    "timestamp": "2024-02-21T11:50:36.857Z",
                    "blockHash": "4AF4A0F1F29C35F5E278CF7E152734EE2A5415BB6D8461EB15F2D325EB7E7B8D"
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransactions)

        })

        it('should return be able to walk through pages desc', async () => {
            const {body} = await client.get('/transactions?page=3&limit=3&order=desc')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8');

            assert.equal(body.resultSet.length, 3)
            assert.equal(body.pagination.total, 746)
            assert.equal(body.pagination.page, 3)
            assert.equal(body.pagination.limit, 3)

            const expectedTransactions = [
                {
                    "hash": "F59E3951E067D2D9D1F9BDA55292714E134B3756598F79AFAF01093FEFF80E66",
                    "index": 0,
                    "blockHeight": 3199,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQkLAgATAQADAAAwt1v2Xm2P+voRtmgEqILWwt902Pf53e9fQSn/Kqmif7M8f6ZG8Jx8pJn2MbV9yW9JYIMvr14bs7RBnH2TghKXejwuD3b+ojgoOuUITd4TRlSM44dJ6N913666V5e7eVZeaRGZynn0mjrb0EgdBfWS2jn6oCR+Y7FRYOBcNApL9472YG47lR2YqtDEHBy9ItHrOwAUAAACAAAhAooegO86x+n/Avt66hSXjv9Rh2EKw8xl5nILus7jUQvQQR8GN6WmH7V+tT4v/dnhY+zztelN89lkm+fINCo8U6ue4gUmb/1iphhZd0wCAC/o+19TN83BgQ2zhFu/qH6AnTl7AAAAQR+dDUu0OLXa9LV6HMeE8f9tF3PFhmZqFuxXHWaSYU7KITNGjdVNnbInw8TVXxZwMbjyE6P/mRgPn3KolGQSr0Vw",
                    "timestamp": "2024-02-27T06:59:16.692Z",
                    "blockHash": "FA0B147CD21FF6F5B683FCA2FF49EAF522669CB308F64955E057BBFA57A34A03"
                },
                {
                    "hash": "A9DC804F988C1E6EB79ABA72056B3A479B22CEB12E8184E855C574D32A4AE3A9",
                    "index": 0,
                    "blockHeight": 3190,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQkKAgARAAAAAAAhAwUxutmEXr7pU4ay1PD/jdrmZGXVSzZTQHP6gyMSisEDQR9KLPCwfUqi8n1P3unhAuA+Dp2wn1mKEolfKg9x+Q+jukhsNjWm6G0jHgUN4feYWcLxVPDpqB7vW7Upxmu2h+q+ABIBAAIAADCNJ+MsuNlCy/I68dFkGlMU9hYKLD25bmALvOpjyYGxNwNZLLon5J/9obGeEU+bJQVgkD2pqrhs3IheOpl8AB6cbO194xUOPmInPE5xT4T25r7PuVoNn/DX7tqVa4bgLNRvES0mw1/Wcn1aYdJtn0ulnHNRZI6JtgdvDK2gnAMHqBfYLv7tHRoS2WWGEVP6uKwYAAAAQR/HEqL+ee++ui8uVzzYwDE85OvPFB4um8ouCsrHe72+Rjs5YryQYACjX6fMY9H2z4K/ENNf/dfLsYeVTrYyqilS",
                    "timestamp": "2024-02-27T06:31:01.492Z",
                    "blockHash": "F89D3829826C6BE639E9010E0660034E11D327690FB51D9A29E22546A1C9F1FC"
                },
                {
                    "hash": "CD3C5558434496D453AB07730C4D958508A2157013EBED8F475CFBCA09C97162",
                    "index": 0,
                    "blockHeight": 3189,
                    "type": 5,
                    "data": "BgAyBWaBbzZoA1F6frRNMxzLDkQvq2OW89asYxsQaargQQgJAgARAgACAAAUoEOMv9y1io6wwIS63gQnTWDEbikAABIBAAAAADCg75AHA/vCJYhO3BgesPaaEiQYltGzAg8qpygE3nfCjbOSspDUZPg4QeR2FkkWMhhgooOij/Vm5/OQiUrBRSivFsOw/RdXHmVEzyksS41CIZYszs4bfvz3IkoECuVyeNfLESowJZIs1QO3hUV/qBvCjcWwECK0ZHNl4uQZ4qmOZwfdSKBXrMCeY9XvswsbrfclAAAAQR90LTJpXhqj6uk2dI0911gdB0lPCYcimn6hDITAKFh92iPZrawQQdXsBB/AADXcJGzMK+bnIT2JYt/IS1qwr5GI",
                    "timestamp": "2024-02-27T06:30:57.004Z",
                    "blockHash": "97C7598B5B7A3C2B372BA67C9E19FFC6C02D31D3DDB095DFA5C50A6496A64783"
                }
            ]

            assert.deepEqual(body.resultSet, expectedTransactions)

        })
    });

})
