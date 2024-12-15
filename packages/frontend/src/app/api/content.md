## HTTP API

Platform Explorer HTTP API allow you to query and see platform blockchain data programmatically with a REST interface via HTTP calls. You can use it to build, test, or improve your applications.

API is still under ongoing development, so refer to this page or repo documentation for the most up-to-date latest specification.

Production (testnet) live URL is [https://platform-explorer.pshenmic.dev](https://platform-explorer.pshenmic.dev)

Reference:

* [Status](#status)
* [Epoch info](#epoch-info)
* [Block by hash](#block-by-hash)
* [Blocks by validator](#blocks-by-validator)
* [Blocks](#blocks)
* [Validators](#validators)
* [Validator by ProTxHash](#validator-by-protxhash)
* [Validator by Masternode Identifier](#validator-by-masternode-identifier)
* [Validator Blocks Statistic](#validator-stats-by-protxhash)
* [Validator Rewards Statistic](#validator-rewards-stats-by-protxhash)
* [Transaction by hash](#transaction-by-hash)
* [Transactions](#transactions)
* [Data Contract By Identifier](#data-contract-by-identifier)
* [Data Contracts](#data-contracts)
* [Document by Identifier](#document-by-identifier)
* [Documents by Data Contract](#documents-by-data-contract)
* [Identity by Identifier](#identity-by-identifier)
* [Identity by DPNS](#identity-by-dpns)
* [Identity Withdrawals](#identity-withdrawals)
* [Identities](#identities)
* [Data Contracts by Identity](#data-contracts-by-identity)
* [Documents by Identity](#documents-by-identity)
* [Transactions By Identity](#transactions-by-identity)
* [Transfers by Identity](#transfers-by-identity)
* [Transactions history](#transactions-history)
* [Transactions gas history](#transactions-gas-history)
* [Rate](#rate)
* [Search](#search)
* [Decode Raw Transaction](#decode-raw-transaction)

### Status
Returns basic stats and epoch info

* apiHeight - current height available in the API
* maPeerHeight - max peer height seen in the network
* tenderdashChainHeight - current blockchain height on the node


```
HTTP /status

{
    epoch: {
        number: 1145,
        firstBlockHeight: 5380,
        firstCoreBlockHeight: 1096730,
        startTime: 1725475350064,
        feeMultiplier: 1,
        endTime: 1725478950064
    },
    identitiesCount: 12,
    totalCredits: 100000,
    totalCollectedFeesDay: 167703567170,
    transactionsCount: 3,
    transfersCount: 0,
    dataContractsCount: 1,
    documentsCount: 1,
    network: "dash-testnet-40",
    api: {
        version: "1.0.0",
        block: {
            height: 20153,
            hash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
            timestamp: "2024-06-06T21:50:20.949Z"
        }
    }
    platform: {
        version: "1.0.0-dev.12"
    },
    tenderdash: {
        version: "0.14.0-dev.6",
        block: {
            height: 20154,
            hash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
            timestamp: "2024-06-06T21:53:27.947Z"
         }
    }     
}
```
---
### Epoch Info
Returns info about epoch by specific index

* tps - Transactions per second
* totalCollectedFees - total number or fees spent per epoch
* bestValidator - validator with most validated blocks


```
HTTP /epoch/0

{
    epoch: {
        number: 0,
        firstBlockHeight: 1,
        firstCoreBlockHeight: 1090319,
        startTime: 1721353209000,
        feeMultiplier: 1,
        endTime: 1721356809000
    },
    tps: 0.01666666666,
    totalCollectedFees: 30,
    bestValidator: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0"
}
```
---
### Block by hash
Get a block by hash
```
GET /block/12E5592208322B5A3598C98C1811FCDD403DF40F522511D7A965DDE1D96C97C7

{
  "block": {
    "header": {
      "hash": "12E5592208322B5A3598C98C1811FCDD403DF40F522511D7A965DDE1D96C97C7",
      "height": 70565,
      "timestamp": "2024-12-14T01:30:09.847Z",
      "blockVersion": 14,
      "appVersion": 6,
      "l1LockedHeight": 1158282,
      "validator": "6D1B185BA036EFCD44A77E05A9AAF69A0C4E40976AEC00B04773E52863320966",
      "totalGasUsed": 46821100
    },
    "txs": [
      {
        "hash": "5517F421003E0CB8996F589BE72EA7DEB9AA43551C971A1CD4FF16A253D180E6",
        "index": 0,
        "blockHash": "12E5592208322B5A3598C98C1811FCDD403DF40F522511D7A965DDE1D96C97C7",
        "blockHeight": null,
        "type": 1,
        "data": "AgCxs+8LeHUz7Fs2jgGvfJz6qUsoX2WboZonZXgh5/x4wQEAAADZAZoaHQB/PNiJr83QV1vOFwRf6c4ZemiqLJ45UP8LkgsLdHhfbWV0YWRhdGGfCkD1ODprciI20XhvfS2OI1dX4hhz6ODezDLTqlizMDf4nnO3kBwqTNWXh4sDqGM5BSfCH3jDxgIJXFY8DDMEAxFlbmNyeXB0ZWRNZXRhZGF0YQr7AWCvJxNt0KNyffpwQKeDtF0507lUwIkG8QCNc/5VOeedyUhO7EfIhyksbs3TUYb40mIAKbQyvE+33cneO1t9DNugH9ETtz5te3YXysx4EWLh3uiL0Xlo9PnthXxUH87hSt1jnw3Q9vM8SJxWXuOT8aAn3C+yHOPn8lBfB89iWDbCRuY91jtfd6b3+5ma8WCFtX4UyPt7Nj0xT4XhIW3xCsEeM4A3wScjzJD5PauX/btJxf5sl76NdOint8/ZVZykVbIdBQp39IEgwKMvXzY393WvUG6/l0zRX8nkbl80P0jqBokOntoQOuGisVZKtj4Z6gSSPsGBBlX38t6pOqVeFcb4LRityyxZOXr7XGu+kDpmrllDRoUl98Muj9he50Ax3KJoAgMYEpo7EpMcQlHDa47hdiix3K4gV3vJKqvWy3OOlyIUxfKWGQjD81DOTgdZJttQBz0vFag6Ycxl120Lga+3EmVuY3J5cHRpb25LZXlJbmRleAMACGtleUluZGV4AwIAAAFBHzdEml1PfuYb0KHR1d+7rj9QSCafJu93jopzP+mBGHtzb6rlFL5i1y+G473ebo+sugMPL5UcFoY12VIaRp/vD7U=",
        "timestamp": "2024-12-14T01:30:09.847Z",
        "gasUsed": 46821100,
        "status": "SUCCESS",
        "error": null,
        "owner": {
          "identifier": "CxgJDaEz4HsxuHdThYFiLKf4Pk9Pb1XufeRvTkmBRyKn",
          "aliases": [
            {
              "alias": "z-test-001.dash",
              "status": "ok",
              "contested": false
            }
          ]
        }
      }
    ],
    "appHash": "206BF1F0D61261D7CA63A48DBF50A4BAC8432584E461BDFE5CB43AEAE00A68EC"
  },
  "quorum": {
    "creationHeight": 1157976,
    "minedBlockHash": "000000b12c65bf9429890d962f7e96a311a23524d90c8cc69c73c0d52435af4d",
    "numValidMembers": 50,
    "healthRatio": "1.00",
    "type": "llmq_50_60",
    "quorumHash": "000000e64f89cc3d56790d210d603ee612f3311fe363bc6b34cb07e5816aea1f",
    "quorumIndex": 0,
    "quorumPublicKey": "ab04f183011ac2fe90d0d333f9b8c10a8f66d56148ea912b431412eb54249d43df08f8b3f2ed35d500abb8bb066e113c",
    "previousConsecutiveDKGFailures": null,
    "members": [
      {
        "proTxHash": "c0aae8ab24aab988cc84385d16af7ffcfd365d0e016f5799759e0525a435a617",
        "service": "52.32.118.225:19999",
        "pubKeyOperator": "892a3de6fe305d39d81ecc9dbc7c85bc6eb57434618903f45ac8996aecfa9a7945e2cc48c40c1540172096229780519e",
        "valid": true
      },
      {
        "proTxHash": "5d906997d8b370d37f813ed55c664457fc98acabfbf5e5602952f710b54bd4e5",
        "service": "35.87.238.118:19999",
        "pubKeyOperator": "155b2a1aa71cbb3b5fc81b00242805a6d573826679a2b6a5c49bec714829322efe8af0c1640ba3b59811c70e17b488a5",
        "valid": true
      },
      {
        "proTxHash": "b3b5748571b60fe9ad112715d6a51725d6e5a52a9c3af5fd36a1724cf50d862f",
        "service": "52.43.13.92:19999",
        "pubKeyOperator": "816ab3f50007333bcb40445130cd0e82139f8c68b592001cd686efc15e303206491fada6cf90af8f24a28b81a9b59ccf",
        "valid": true
      },
      {
        "proTxHash": "8e0c95f8f71cd450abe7495077ecb431068da7821ca4e38af735565ec630deeb",
        "service": "54.190.131.8:19999",
        "pubKeyOperator": "94a0bd3671bf20ef2a75c2e1723eda50a4d7566ceb0f5e018af7c576e11b1320b4b370e703afd4a7220a7c5688414040",
        "valid": true
      },
      {
        "proTxHash": "edc1fe5456b869747a4f41f92ab8bb8b10c1f43bbbd97957a16698783baa0d2a",
        "service": "34.220.155.3:19999",
        "pubKeyOperator": "06e81b2ac08c3ba6308868ced5075f366013ee8598961bc84150d8dfe9085fdceafc082fd18d3a7bb1338b74584048fc",
        "valid": true
      },
      {
        "proTxHash": "cc02c1be8ef00540856c769f77bca1afc593d3c40cdaf5ca033e462f1c43fc52",
        "service": "35.161.222.74:19999",
        "pubKeyOperator": "13146b3252f408f1cffc875b12b61f56c1ae02113b24c0b5aaedcda4a9b509332c8c4587450074f3e0906aaf3ceca754",
        "valid": true
      },
      {
        "proTxHash": "1d0adeaf787ed8f6f73fa936c6313ddfa2dd33ea693a2de22bc346c1b73a4a02",
        "service": "34.220.175.29:19999",
        "pubKeyOperator": "8b7c76ec03f7ae0dc9be41fb9168906ef0d0d4de74f0ad8c5cf0a30483879b5203ae5d7c6aeee5b92998444bc10f68ec",
        "valid": true
      },
      {
        "proTxHash": "91bbce94c34ebde0d099c0a2cb7635c0c31425ebabcec644f4f1a0854bfa605d",
        "service": "52.40.219.41:19999",
        "pubKeyOperator": "81ad0f9be5a88ae62ff54fe938dfceea71be03bd4c6a7aebf75896e8d495d310acc4146aa4820bc0e5f5b06579dedea5",
        "valid": true
      },
      {
        "proTxHash": "bb889ccdc43531f927eee1dbf095a5367ea314eb44818be2277476617af7d35a",
        "service": "147.93.132.7:19999",
        "pubKeyOperator": "b529e500f236ee90a3e7c274dd51ad91310561f10d066560b0f28922634fbf67f50660e317f3f4c06441fa5ca98775d9",
        "valid": true
      },
      {
        "proTxHash": "9cb04f271ba050132c00cc5838fb69e77bc55b5689f9d2d850dc528935f8145c",
        "service": "34.214.48.68:19999",
        "pubKeyOperator": "b6ee48c7a71a9d8e0813e68ca09846245fa155285f24a62b0ce9cb0102b1994ec58af8ba2a01c09363bdcc395d41f3df",
        "valid": true
      },
      {
        "proTxHash": "617d72f6941af02ef5f2ceaa2ac0315ed5db0979c45391398f74b0fadc100ca6",
        "service": "35.88.122.202:19999",
        "pubKeyOperator": "067ec5f7cb5511ba2bf10aa09eac4107d76fd53edeb2fd94edef4555171dbe3ed7dc6cfe37b087390af61a6aa269182b",
        "valid": true
      },
      {
        "proTxHash": "b9fab136129b05d86ccfeee5298f207ab2d76131af41987baccf55fea5efb4c1",
        "service": "35.162.18.116:19999",
        "pubKeyOperator": "0fa5377eb256323aace31b45c3e48ea110404b053cb80e8043bd1e44de1705130548e4ab28738816251ea57a7fc10324",
        "valid": true
      },
      {
        "proTxHash": "8e11eb784883d3dc9d0d74a74633f067dc61c408dfdee49b8f93bb161f2916c0",
        "service": "52.89.154.48:19999",
        "pubKeyOperator": "8160877a911d8bb7d1e75e2320e98cc3233c1f6972cb642424bfcec7c182c56d2c0ebb59e45f788f4d5dbfa2ebff3e3a",
        "valid": true
      },
      {
        "proTxHash": "42f67134f85223da03fd3a670e68802d959ec1236fc6317b855d7133df4ee594",
        "service": "52.36.20.123:19999",
        "pubKeyOperator": "0bde30ce81e7c6396e334eb1bd788b683535eefe9911286bb42662c46e3712ddb5c7c24d7998118ae089e804e14efee5",
        "valid": true
      },
      {
        "proTxHash": "2e48651a2e9c0cb4f2fb7ab874061aa4af0cd28b59695631e6a35af3950ef6fb",
        "service": "54.149.33.167:19999",
        "pubKeyOperator": "943a88959611417f9e8ce4e664e1d9c6a839daae14f54ae8e78bc5ef6ec1524d116efca49ecd5c57dce31d90015a51ff",
        "valid": true
      },
      {
        "proTxHash": "6cca50b04c9816b07a8a831ebec34866f1f0fe836047890dce4f1c46f9e8a3c0",
        "service": "54.188.69.89:19999",
        "pubKeyOperator": "0ad4f577d067630f6fd15f4d2aefdb9456d648b71cb7253d47511acc81dd5ddb69a03c848322aa11e5242f66afde5a2a",
        "valid": true
      },
      {
        "proTxHash": "7ace7f64afc3f78ba5dcabc7f384a1a01ebd4d147f8ef629a968df09885db277",
        "service": "54.212.89.127:19999",
        "pubKeyOperator": "826fc7f30c49215b98d5cb47a350f888a306c52fa42c77e765b55288e622f03859273cae7e1cac99e67f7a9a96a6aa2c",
        "valid": true
      },
      {
        "proTxHash": "520c7377bf695cde36a0dc0ddd9aea060ce4a4cdce59022e7d74f501e5fa71c0",
        "service": "54.191.146.137:19999",
        "pubKeyOperator": "842d732a03847819b1e2675ac48b9af4a1c92b310ecacc42c428ff902099cc47d08ecd4616da55d185463855aee99f79",
        "valid": true
      },
      {
        "proTxHash": "ae01f108739eb76671f5fe8f67361827d55944c115fdce6dcfdba25e32a73d61",
        "service": "139.60.95.71:19999",
        "pubKeyOperator": "93dd670bb8e78f365b13163ed86f37e1e794c5238b216d02e8335a07a6a30da5065fdd4219909b37c8349fce149c17ec",
        "valid": true
      },
      {
        "proTxHash": "fb1f0a8cd13a1ed6e11d83d906cf3cd42114e36a762e214e04f6f0bfa698dbc2",
        "service": "34.211.192.129:19999",
        "pubKeyOperator": "02ce863d0843ca66b4a64d94c0d84ec15980ea04e4444ac4d4188f38cc0da4d6d2360b8a2046725b682862255af6a48c",
        "valid": true
      },
      {
        "proTxHash": "0cee39f44c73a6e829fe53ee34a37ee4358ae31c2bbbae2877949ae872927602",
        "service": "54.189.125.235:19999",
        "pubKeyOperator": "880f24b5e040dcbf86c3f468dd28bf45d9e41fbcd127fad56669d9afe358dcdc26e42f0f8b19997b1741dbb99c553aa6",
        "valid": true
      },
      {
        "proTxHash": "87075234ac47353b42bb97ce46330cb67cd4648c01f0b2393d7e729b0d678918",
        "service": "35.167.145.149:19999",
        "pubKeyOperator": "a7afe7674de986aff5e2e0a173be8c29abed8b5d6f878389ea18be0d43c62ad1ba66a59e9e8d8453aa0ed1a696976758",
        "valid": true
      },
      {
        "proTxHash": "aedce7a4ed26b9f1975d071c46d6b8792c96e618215b1e3086da5d94543f2ad6",
        "service": "35.89.195.175:19999",
        "pubKeyOperator": "007b1f3f16835ebfba6f505f43c6de757bb22ecf27a89703e90e43aedafea3df353a5bd1915b27e8db397d53f0a23f60",
        "valid": true
      },
      {
        "proTxHash": "dc2e02ac95ce4ccc9843c38de7bdaf32f2a1d5966c054127a3f4ca4f4bbd5991",
        "service": "35.87.105.3:19999",
        "pubKeyOperator": "0db85a27cd589d225beff9977aa0ac32551d15bd906a899bc1ef33458d7c979118f92bf1de4ddb55144acc2f7cf6d854",
        "valid": true
      },
      {
        "proTxHash": "7718edad371e46d20fad30086e4acf4a05c2b660df6ae5f2a684aebdf1be4290",
        "service": "44.227.137.77:19999",
        "pubKeyOperator": "b675a1940be872b6a0d4e1696bb39ea38179933a1bae02ae1eaf4b47f625bd939482f8791eb38925af47f73be027a64c",
        "valid": true
      },
      {
        "proTxHash": "8eca4bcbb3a124ab283afd42dad3bdb2077b3809659788a0f1daffce5b9f001f",
        "service": "54.68.235.201:19999",
        "pubKeyOperator": "b942e2e50c5cf9d9fe81119cc5379057c05fe15134f85847356b5d1f6a21f29f4a53f61f03338d056edc15a8c63fbbe8",
        "valid": true
      },
      {
        "proTxHash": "900618389dd73377e2b33b021d2e8b0e7c51f8f5c1d871af15886e3cd6e6d6ae",
        "service": "34.220.194.253:19999",
        "pubKeyOperator": "0dc75e865b89e96560b38fae96f1d0a5438795778e68b705a506046245ca5dbbedb09e2379eea4c9bde0d0fd4fe05080",
        "valid": true
      },
      {
        "proTxHash": "044b879c7014a715eb1bd98c79e6137f45011a0cfe3d21b24edee3c1650eabd9",
        "service": "35.165.156.159:19999",
        "pubKeyOperator": "002a2e19ac4b986e20f55ddb19cdfa69cbd5f76c5e2d66ac6d9c8418aa1f0836e61b643bf48eeb004ccf3f3f0f03b82a",
        "valid": true
      },
      {
        "proTxHash": "fbdcb8ebb8b7b0536b8af0bd89b5f973fedb880b51d03434767eaf9ea7443bb6",
        "service": "54.202.231.195:19999",
        "pubKeyOperator": "17f2a4f37de1f78a0d356835de99c7639d8daf824b0d432b2a7c01a921f6a8cd4028272e2962f7d04abf9bfd5a77ab8e",
        "valid": true
      },
      {
        "proTxHash": "06a45723cb72c6dac0d839223ffb9a9ebba95d257a92537dcb7baada7fa744b3",
        "service": "35.90.193.169:19999",
        "pubKeyOperator": "0e9855b2ee991f988e446b60dcd637f33a782baf1e755785ca058f0398133bf3a95e4e77d4168c13c47d7e3fb1e3ecfc",
        "valid": true
      },
      {
        "proTxHash": "bc77a5a2cec455c79fb92fb683dbd87a2a92b663c9a46d0c50d11889b4aeb121",
        "service": "54.213.94.216:19999",
        "pubKeyOperator": "174de56654f2bb6417e15ff06361ea0becc00bd72a3eba0f83b60feac860570769fbf28482a706f10906a1e96dae4a8f",
        "valid": true
      },
      {
        "proTxHash": "da0a60d91a09d34a39ba34e4175d2efca738ebb409e3fbb0546d41a24e83a722",
        "service": "54.68.48.149:19999",
        "pubKeyOperator": "1099dcddc6560d1039b0edb91bd700e5deae0cba43163fa289a80c2bd22335b5b0e7a1fb8f5494c0e6360e73a12fe0a8",
        "valid": true
      },
      {
        "proTxHash": "66ff9b0dce36d62349a1bc3fa30ee841cf162ad17acc6c0192a2c8a12059f357",
        "service": "158.160.18.56:19999",
        "pubKeyOperator": "8c2d2fdcabe70bfa6dc5fecddac62cf29a8864543efe198e21ed99ed09d2b7a023ad675d9b7f4ea2005da649533eb1a1",
        "valid": true
      },
      {
        "proTxHash": "4292028ae9eb69f51d35a8a0f1cdd625f6dfee2a9ebc7bd4d9b7cb99ecc43f9b",
        "service": "35.90.252.3:19999",
        "pubKeyOperator": "8f70ff352844250e267b31c0ddb83dffd4cac43532194bd47cbabf410ca29fa7f1ecec08c8fde8c0d13910e903016d5a",
        "valid": true
      },
      {
        "proTxHash": "20107ec50e81880dca18178bb7e53e2d0449c0734106a607253b9af2ffea006c",
        "service": "35.85.21.179:19999",
        "pubKeyOperator": "b6e979f20241cbb73de7451779e8e059d9cb75a74b72ea6862d7ac703dc2ac07d86cec39b6e8923b55fd54dbc6177c3a",
        "valid": true
      },
      {
        "proTxHash": "b4ef45b7d0b716ffa761809326697a6420365e1d137b52d7d275e7f326280ac1",
        "service": "80.209.232.96:19999",
        "pubKeyOperator": "0450dbbbe82df6808151b83a46f8c531cb240eccfe65f8f0b49f3717056da7268c14e45f0dd14fff8daed28fd353c1b4",
        "valid": true
      },
      {
        "proTxHash": "39741ad83dd791e1e738f19edae82d6c0322972e6a455981424da3769b3dbd4a",
        "service": "35.163.144.230:19999",
        "pubKeyOperator": "b6693296894820bdc3c0ae76f357e544847f10a68f0046f53745370dbe861d57e194ddaf7ff7d5e73cc3f240515c448e",
        "valid": true
      },
      {
        "proTxHash": "72ee70fa75262781a17d1eb69a6c3e97328208be98b59d5530164f31e481d3aa",
        "service": "35.91.208.56:19999",
        "pubKeyOperator": "91f9052f62561db112ddca7df3d914d546866b130124eccb2ae1e8419563e51f239b2efec3d1b3fd388072610939d694",
        "valid": true
      },
      {
        "proTxHash": "05b687978344fa2433b2aa99d41f643e2d8581a789cdc23084889ceca5244ea8",
        "service": "52.24.124.162:19999",
        "pubKeyOperator": "80f8efb42f65ed9650078785be5d13e6e90eb9df87a99261d4de34df2b4b79a9c9b8c5e1aec7ac068ebef14636ceac4c",
        "valid": true
      },
      {
        "proTxHash": "3ada735b7fb780232ed20e0a96d293385a0793ab7c5c360dd356c98192cc290a",
        "service": "35.91.157.30:19999",
        "pubKeyOperator": "8c290b31d2e878c2d7235efb0c61f423aa37742a31318e61f8bb0bd6c110a892dc244512fec12a8b0fe7cbb08e12be28",
        "valid": true
      },
      {
        "proTxHash": "5f8457a7640a8e99840193865a971146d9e25a97d8dfd6f0f1f73b18fd962c44",
        "service": "147.93.132.9:19999",
        "pubKeyOperator": "97d5f022c3b6c314bde5171ead1616e4c27f0e9a48a9a9dc3a7227a62d42213b93c8a4c32af18bd8ff931b7732782e09",
        "valid": true
      },
      {
        "proTxHash": "9712e85d660fa2f761f980ef5812c225f33f336f285728803dcd421937d3df54",
        "service": "35.82.197.197:19999",
        "pubKeyOperator": "a8dbccb130522909dc710a65728006732c18441757f12a338cf4a6d8cbd5baf1a484537a6a0542f51bb686e6e546f1a0",
        "valid": true
      },
      {
        "proTxHash": "0e5ed7d2e33f2e0b221648c3f99735afd6762270ff6a35978df389a7f82976d9",
        "service": "54.212.138.75:19999",
        "pubKeyOperator": "01f24418ec73b09b00514dba8fb18d6d8af1dc2ff93d594bf987911f3b98d659eb43286cd450b7e1ee5978b361660d73",
        "valid": true
      },
      {
        "proTxHash": "3b056202a743c16d86aff2f8ef6cf5d402e312f70740b9ae20ae92e47f1de174",
        "service": "34.222.21.14:19999",
        "pubKeyOperator": "0d9ee7b7e66124c4b047e1f93aed5a764ed7384292737ea17f3a7e429ce3f24d602d54b97f72d181b6f093da9b3ad3f5",
        "valid": true
      },
      {
        "proTxHash": "ce09b01abb1fdadc8c04db6f8e9141187b034ae536776134e01156196fd595ed",
        "service": "34.217.191.164:19999",
        "pubKeyOperator": "068631f31e13e1c29c739619b2cb58adf73724dd8c6227ab1b8f45c08c5d6934338365ed45c795e4117ddf79f1e50370",
        "valid": true
      },
      {
        "proTxHash": "4d5fe9da329316db465fb3f4925cd5604dd61335c32f0b7d79bdcc98e71880d2",
        "service": "52.34.250.214:19999",
        "pubKeyOperator": "87be789e5b798cf3a40ff5dc22b0384dc690acadd614067c0f7e6a933b8f0c72c67b3f4b3e666e6fc48369a8161b04e6",
        "valid": true
      },
      {
        "proTxHash": "6d1b185ba036efcd44a77e05a9aaf69a0c4e40976aec00b04773e52863320966",
        "service": "44.228.242.181:19999",
        "pubKeyOperator": "b8a2161c64bfdc7d621df51de569911a219f718bad4d6058dcca9bddf6696d43ddc4c1e3cf91640c93f820e5680efac3",
        "valid": true
      },
      {
        "proTxHash": "aab7b2ed5bc2fa962dca591440e22b47ce41bcd2b79394d53dfac5173a3f97bc",
        "service": "34.220.243.24:19999",
        "pubKeyOperator": "018a6d23ae53d6231f7dd73a058f125340e92f6e97897f017d9d9d4e6671bbd92241170dfcdd5a4ab8ef47ef12ddcad5",
        "valid": true
      },
      {
        "proTxHash": "8917bb546318f3410d1a7901c7b846a73446311b5164b45a03f0e613f208f234",
        "service": "52.13.132.146:19999",
        "pubKeyOperator": "87d25769002af2a4f050127c73fff03a24935e48f34fecaacd69410787d0e6384b345c78e81b1cb397b43dcd635568b6",
        "valid": true
      },
      {
        "proTxHash": "88251bd4b124efeb87537deabeec54f6c8f575f4df81f10cf5e8eea073092b6f",
        "service": "52.33.28.47:19999",
        "pubKeyOperator": "af9cd8567923fea3f6e6bbf5e1b3a76bf772f6a3c72b41be15c257af50533b32cc3923cebdeda9fce7a6bc9659123d53",
        "valid": true
      }
    ]
  }
}
```
---
### Blocks by validator
Return all blocks proposed by the specific validators
* `limit` cannot be more then 100
```
GET /validator/B8F90A4F07D9E59C061D41CC8E775093141492A5FD59AB3BBC4241238BB28A18/blocks

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        header: {
            hash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
            height: 1337,
            timestamp: "2024-03-18T10:13:54.150Z",
            blockVersion: 13,
            appVersion: 1,
            validator: "B8F90A4F07D9E59C061D41CC8E775093141492A5FD59AB3BBC4241238BB28A18",
            l1LockedHeight: 1337
        },
        txs: ["DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF"]
    }, ...
    ]
}
```
---
### Blocks
Return all blocks with pagination info
* `limit` cannot be more then 100
```
GET /blocks

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        header: {
            hash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
            height: 1337,
            timestamp: "2024-03-18T10:13:54.150Z",
            blockVersion: 13,
            appVersion: 1,
            l1LockedHeight: 1337
        },
        txs: ["DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF"]
    }, ...
    ]
}
```
---
### Validators
Return all validators with pagination info.
* `lastProposedBlockHeader` field is nullable
* `?isActive=true` boolean can be supplied in the query params to filter by isActive field
* `limit` cannot be more then 100 (0 = all validators)
```
GET /validators

{
  resultSet: [
    {
      proTxHash: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
      isActive: true,
      proposedBlocksAmount: 5,
      lastProposedBlockHeader: {
        height: 5,
        timestamp: "2024-06-23T13:51:44.154Z",
        hash: "7253F441FF6AEAC847F9E03672B9386E35FC8CBCFC4A7CC67557FCA10E342904",
        l1LockedHeight: 1337,
        appVersion: 1,
        blockVersion: 13
        validator: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0"
      },
      proTxInfo: {
        type: "Evo",
        collateralHash: "6ce8545e25d4f03aba1527062d9583ae01827c65b234bd979aca5954c6ae3a59",
        collateralIndex: 19,
        collateralAddress: "yYK3Kiq36Xmf1ButkTUYb1iCNtJfSSM4KH",
        operatorReward: 0,
        confirmations: 214424,
        state: {
            version: 2,
            service: "35.164.23.245:19999",
            registeredHeight: 850334,
            lastPaidHeight: 1064721,
            consecutivePayments: 0,
            PoSePenalty: 0,
            PoSeRevivedHeight: 1027671,
            PoSeBanHeight: -1,
            revocationReason: 0,
            ownerAddress: "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
            votingAddress: "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
            platformNodeID: "b5f25f8f70cf8d05c2d2970bdf186c994431d84e",
            platformP2PPort: 36656,
            platformHTTPPort: 1443,
            payoutAddress: "yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A",
            pubKeyOperator: "b928fa4e127214ccb2b5de1660b5e371d2f3c9845077bc3900fc6aabe82ddd2e61530be3765cea15752e30fc761ab730"
        }
      },
      identity: "8tsWRSwsTM5AXv4ViCF9gu39kzjbtfFDM6rCyL2RcFzd",
      identityBalance: 0,
      epochInfo: {
        number: 1982,
        firstBlockHeight: 31976,
        firstCoreBlockHeight: 1118131,
        startTime: 1728488466559,
        feeMultiplier: 1,
        endTime: 1728492066559
      },
      totalReward: 0,
      epochReward: 0,
      withdrawalsCount: null,
      lastWithdrawal: null,
      lastWithdrawalTime: null,
      endpoints: null
    }, ...
  ],
  pagination: { 
    page: 1, 
    limit: 10, 
    total: 30 
  }
}
```
---
### Validator by ProTxHash
Get validator by ProTxHash.
* `lastProposedBlockHeader` field is nullable
```
GET /validator/F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0

{
  proTxHash: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
  isActive: true,
  proposedBlocksAmount: 5,
  lastProposedBlockHeader: {
    height: 5,
    timestamp: "2024-06-23T13:51:44.154Z",
    hash: "7253F441FF6AEAC847F9E03672B9386E35FC8CBCFC4A7CC67557FCA10E342904",
    l1LockedHeight: 1337,
    appVersion: 1,
    blockVersion: 13,
    validator: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0"
  },
  proTxInfo: {
    type: "Evo",
    collateralHash: "6ce8545e25d4f03aba1527062d9583ae01827c65b234bd979aca5954c6ae3a59",
    collateralIndex: 19,
    collateralAddress: "yYK3Kiq36Xmf1ButkTUYb1iCNtJfSSM4KH",
    operatorReward: 0,
    confirmations: 214424,
    state: {
      version: 2,
      service: "35.164.23.245:19999",
      registeredHeight: 850334,
      lastPaidHeight: 1064721,
      consecutivePayments: 0,
      PoSePenalty: 0,
      PoSeRevivedHeight: 1027671,
      PoSeBanHeight: -1,
      revocationReason: 0,
      ownerAddress: "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
      votingAddress: "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
      platformNodeID: "b5f25f8f70cf8d05c2d2970bdf186c994431d84e",
      platformP2PPort: 36656,
      platformHTTPPort: 1443,
      payoutAddress: "yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A",
      pubKeyOperator: "b928fa4e127214ccb2b5de1660b5e371d2f3c9845077bc3900fc6aabe82ddd2e61530be3765cea15752e30fc761ab730",
    }
  },
  identity: "8tsWRSwsTM5AXv4ViCF9gu39kzjbtfFDM6rCyL2RcFzd",
  identityBalance: 0,
  epochInfo: {
    number: 1982,
    firstBlockHeight: 31976,
    firstCoreBlockHeight: 1118131,
    startTime: 1728488466559,
    feeMultiplier: 1,
    endTime: 1728492066559
  },
  totalReward: 0,
  epochReward: 0,
  withdrawalsCount: 1,
  lastWithdrawal: "01FE1F00379C66C6E3BFD81A088E57E17613EC36E4FF812458535A8ABCB84047",
  lastWithdrawalTime: "2024-10-12T03:15:19.257Z",
  endpoints: {
    coreP2PPortStatus: {
      host: '52.33.28.41',
      port: 19999,
      status: 'ERROR',
      message: null
    },
    platformP2PPortStatus: {
      host: '52.33.28.41',
      port: 36656,
      status: 'ERROR',
      message: null
    },
    platformGrpcPortStatus: {
      host: '52.33.28.41',
      port: 1443,
      status: 'ERROR',
      message: null
    }
  }
}
```
---
### Validator by Masternode Identifier
Get validator by Masternode Identity.
* `lastProposedBlockHeader` field is nullable
```
GET /validator/identity/8tsWRSwsTM5AXv4ViCF9gu39kzjbtfFDM6rCyL2RcFzd

{
  proTxHash: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
  isActive: true,
  proposedBlocksAmount: 5,
  lastProposedBlockHeader: {
    height: 5,
    timestamp: "2024-06-23T13:51:44.154Z",
    hash: "7253F441FF6AEAC847F9E03672B9386E35FC8CBCFC4A7CC67557FCA10E342904",
    l1LockedHeight: 1337,
    appVersion: 1,
    blockVersion: 13,
    validator: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0"
  },
  proTxInfo: {
    type: "Evo",
    collateralHash: "6ce8545e25d4f03aba1527062d9583ae01827c65b234bd979aca5954c6ae3a59",
    collateralIndex: 19,
    collateralAddress: "yYK3Kiq36Xmf1ButkTUYb1iCNtJfSSM4KH",
    operatorReward: 0,
    confirmations: 214424,
    state: {
      version: 2,
      service: "35.164.23.245:19999",
      registeredHeight: 850334,
      lastPaidHeight: 1064721,
      consecutivePayments: 0,
      PoSePenalty: 0,
      PoSeRevivedHeight: 1027671,
      PoSeBanHeight: -1,
      revocationReason: 0,
      ownerAddress: "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
      votingAddress: "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
      platformNodeID: "b5f25f8f70cf8d05c2d2970bdf186c994431d84e",
      platformP2PPort: 36656,
      platformHTTPPort: 1443,
      payoutAddress: "yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A",
      pubKeyOperator: "b928fa4e127214ccb2b5de1660b5e371d2f3c9845077bc3900fc6aabe82ddd2e61530be3765cea15752e30fc761ab730",
    }
  },
  identity: "8tsWRSwsTM5AXv4ViCF9gu39kzjbtfFDM6rCyL2RcFzd",
  identityBalance: 0,
  epochInfo: {
    number: 1982,
    firstBlockHeight: 31976,
    firstCoreBlockHeight: 1118131,
    startTime: 1728488466559,
    feeMultiplier: 1,
    endTime: 1728492066559
  },
  totalReward: 0,
  epochReward: 0,
  withdrawalsCount: 1,
  lastWithdrawal: "01FE1F00379C66C6E3BFD81A088E57E17613EC36E4FF812458535A8ABCB84047",
  lastWithdrawalTime: "2024-10-12T03:15:19.257Z",
  endpoints: {
    coreP2PPortStatus: {
      host: '52.33.28.41',
      port: 19999,
      status: 'ERROR',
      message: null
    },
    platformP2PPortStatus: {
      host: '52.33.28.41',
      port: 36656,
      status: 'ERROR',
      message: null
    },
    platformGrpcPortStatus: {
      host: '52.33.28.41',
      port: 1443,
      status: 'ERROR',
      message: null
    }
  }
}
```
---
### Validator rewards stats by ProTxHash
Return a series data for the reward from proposed blocks by validator chart with

* `start` lower interval threshold in ISO string ( _optional_ )
* `end` upper interval threshold in ISO string ( _optional_ )


```
GET /validator/F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0/reward/stats?start=2024-01-01T00:00:00&end=2025-01-01T00:00:00
[
    {
        timestamp: "2024-06-23T13:51:44.154Z",
        data: {
            reward: 34000000
        }
    },...
]
```
---
### Validator stats by ProTxHash
Return a series data for the amount of proposed blocks by validator chart with

* `start` lower interval threshold in ISO string ( _optional_ )
* `end` upper interval threshold in ISO string ( _optional_ )
* `intervalsCount` intervals count in response ( _optional_ )

```
GET /validator/F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0/stats?start=2024-01-01T00:00:00&end=2025-01-01T00:00:00
[
    {
        timestamp: "2024-06-23T13:51:44.154Z",
        data: {
            blocksCount: 2
        }
    },...
]
```
---
### Transaction by hash
Get a transaction (state transition) by hash

Status can be either `SUCCESS` or `FAIL`. In case of error tx, message will appear in the `error` field as Base64 string

```
GET /transaction/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF

{
    blockHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
    blockHeight: 1337,
    data: "{}",
    hash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
    index: 0,
    timestamp: "2024-03-18T10:13:54.150Z",
    type: 0,
    gasUsed: 1337000,
    status: "SUCCESS",
    error: null,
    owner: {
      identifier: "6q9RFbeea73tE31LGMBLFZhtBUX3wZL3TcNynqE18Zgs",
      aliases: [
        {
          alias: "alias.dash",
          status: "locked",
          contested: true
        }
      ]
    }
}
```

Response codes:
```
200: OK
404: Not found
500: Internal Server Error
```
---
### Transactions
Return transaction set paged

Status can be either `SUCCESS` or `FAIL`. In case of error tx, message will appear in the `error` field as Base64 string

* `limit` cannot be more then 100
* `owner` Identity identifier
* `status` can be `SUCCESS`, `FAIL` or `ALL`
* `transaction_type` number of tx type. Can be set multiple times
* `gas_min` number of min `gas_used`
* `gas_max` number of max `gas_used`

```
GET /transactions?=1&limit=10&order=asc&owner=6q9RFbeea73tE31LGMBLFZhtBUX3wZL3TcNynqE18Zgs&transaction_type=0&transaction_type=1&status=ALL&gas_min=0&gas_max=9999999

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        blockHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        blockHeight: 1337,
        data: "{}",
        hash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        index: 0,
        timestamp: "2024-03-18T10:13:54.150Z",
        type: 0,
        gasUsed: 1337000,
        status: "SUCCESS",
        error: null,
        owner: {
          identifier: "6q9RFbeea73tE31LGMBLFZhtBUX3wZL3TcNynqE18Zgs",
          aliases: [
            {
              alias: "alias.dash",
              status: "locked",
              contested: true
            }
          ]
        }
    }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Data Contract by Identifier
Return data contract by given identifier

* `name` field is nullable

```
GET /dataContract/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec

{
    identifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
    name: "DPNS",
    owner: "4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF",
    schema: "{}",
    version: 0,
    txHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
    timestamp: "2024-03-18T10:13:54.150Z",
    isSystem: false,
    documentsCount: 1337
}
```
Response codes:
```
200: OK
404: Not found
500: Internal Server Error
```
---
### Data Contracts
Return dataContracts set paged and order by block height or documents count.

* Valid `order_by` values are `block_height` or `documents_count`
* `name` field is nullable
* `limit` cannot be more then 100

```
GET /dataContracts?page=1&limit=10&order=asc&order_by=block_height

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        identifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        name: "DPNS",
        owner: "4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF",
        schema: "{}",
        version: 0,
        txHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        timestamp: "2024-03-18T10:13:54.150Z",
        isSystem: false,
        documentsCount: 1337
    }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Document by Identifier
Return last revision of the document by given identifier
```
GET /dataContract/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec

{
    identifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
    dataContractIdentifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
    revision: 0,
    txHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
    deleted: false
    data: "{}",
    timestamp: "2024-03-18T10:13:54.150Z",
    owner: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
    isSystem: false
}
```
Response codes:
```
200: OK
404: Not found
500: Internal Server Error
```
---
### Documents by Data Contract
Return all documents by the given data contract identifier
* `limit` cannot be more then 100
```
GET /dataContract/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/documents?page=1&limit=10&order=asc

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        identifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        dataContractIdentifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        revision: 0,
        txHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        deleted: false
        data: "{}",
        timestamp: "2024-03-18T10:13:54.150Z",
        owner: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        isSystem: false
    }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Identity by Identifier
Return identity by given identifier
```
GET /identity/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec

{
  "identifier": "3igSMtXaaS9iRQHbWU1w4hHveKdxixwMpgmhLzjVhFZJ",
  "revision": 0,
  "balance": 49989647300,
  "timestamp": "2024-10-12T18:51:44.592Z",
  "txHash": "32FB988D87E4122A2FE030B5014A59A05786C1501FD97D765E2329F89A8AD01D",
  "totalTxs": 13,
  "totalTransfers": 7,
  "totalDocuments": 5,
  "totalDataContracts": 0,
  "isSystem": false,
  "aliases": [
    {
      "alias": "owl352.dash",
      "status": "ok",
      "contested": false
    }
  ],
  "totalGasSpent": 310352700,
  "averageGasSpent": 23873285,
  "topUpsGasSpent": 46350660,
  "withdrawalsGasSpent": 0,
  "lastWithdrawalHash": null,
  "publicKeys": [
    {
      "keyId": 0,
      "type": 0,
      "data": "0386067dea94b1cfb23bf252084a2020a4a6712df7e4ac16c211558a1dbb66904a",
      "purpose": 0,
      "securityLevel": 0,
      "isReadOnly": false,
      "isMaster": true,
      "hash": "5501114f5842004d1ff6c7d04512c438afe0cb11",
      "contractBounds": null
    },
    {
      "keyId": 1,
      "type": 0,
      "data": "038a09509830d2d04685294e920aa29c96d51f9bd81044e2f934a4c198b934b102",
      "purpose": 0,
      "securityLevel": 2,
      "isReadOnly": false,
      "isMaster": false,
      "hash": "c563c11128b9e457ad3b7220315b4bf53c8af443",
      "contractBounds": null
    },
    {
      "keyId": 2,
      "type": 0,
      "data": "027734bd9b8864964eb7504a77a986782e9d620e4c6d23e2bd80359e1e81790a1c",
      "purpose": 0,
      "securityLevel": 1,
      "isReadOnly": false,
      "isMaster": false,
      "hash": "4bd1a43ea0cf7c18c1f90d1d9c0f08c63743ff1d",
      "contractBounds": null
    },
    {
      "keyId": 3,
      "type": 0,
      "data": "03083620dea1216b47568aead0c7cb6302ae3ca8beaa40c51e25b20f1f02ae06d4",
      "purpose": 3,
      "securityLevel": 1,
      "isReadOnly": false,
      "isMaster": false,
      "hash": "f6d941f2d7aa4bc9d90b90bc103bd583c5943af9",
      "contractBounds": null
    }
  ],
  "fundingCoreTx": "68d77e0d2da31e9cf2758d8f97547c1bc98b75c4e2cebe64dbcaae3bb5cb8a9c",
  "owner": "3igSMtXaaS9iRQHbWU1w4hHveKdxixwMpgmhLzjVhFZJ"
}
```
Response codes:
```
200: OK
404: Not found
500: Internal Server Error
```
---
### Identity by DPNS
Return identity by given DPNS/alias
```
GET /dpns/identity?dpns=canuseethat2.dash

[
  {
    "identity_identifier": "8eTDkBhpQjHeqgbVeriwLeZr1tCa6yBGw76SckvD1cwc",
    "alias": "canuseethat2.dash",
    "status": {
      "alias": "canuseethat2.dash",
      "contested": false,
      "status": "ok"
    }
  }
]
```
Response codes:
```
200: OK
404: Not found
500: Internal Server Error
```
---
### Identities
Return all identities paged and order by block height, tx count or balance.

* Valid `order_by` values are `block_height`, `tx_count` or `balance`
* `limit` cannot be more then 100
```
GET /identities?page=1&limit=10&order=asc&order_by=block_height

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
      {
          identifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
          owner: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
          revision: 1,
          balance: 1000000,
          timestamp: "2024-03-18T10:13:54.150Z",
          txHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
          totalTxs: 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false,
          aliases: [
            {
              alias: "alias.dash",
              status: "locked",
              contested: true
            }
          ]
      }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Identity Withdrawals
Return all withdrawals for identity

_Note: this request does not contain any pagination data in the response_

* `limit` cannot be more then 100
* returns 404 `not found` if identity don't have withdrawals
* Pagination always `null`
```
GET /identity/A1rgGVjRGuznRThdAA316VEEpKuVQ7mV8mBK1BFJvXnb/withdrawals?limit=5

{
  pagination: {
    limit: null,
    page: null,
    total: null
  },
  resultSet: [
    {
      "document": "95eiiqMotMvH23f6cv3BPC4ykcHFWTy2g3baCTWZANAs",
      "sender": "A1rgGVjRGuznRThdAA316VEEpKuVQ7mV8mBK1BFJvXnb",
      "status": "COMPLETE",
      "amount": 200000,
      "timestamp": 1729096625509,
      "withdrawalAddress": "yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A",
      "hash": "113F86F4D1F48159B0D6690F3C5F8F33E39243086C041CF016454A66AD63F025"
    },
    ...
  ]
}
```
Response codes:
```
200: OK
404: Not Found
500: Internal Server Error
```
---
### Data contracts by Identity
Return all data contracts by the given identity

* `name` field is nullable
* `limit` cannot be more then 100
```
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/dataContracts?page=1&limit=10&order=asc

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        identifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        name: "DPNS",
        owner: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        version: 0,
        schema: null,
        txHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        timestamp: "2024-03-18T10:13:54.150Z",
        isSystem: false
        documentsCount: 1337
    }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Documents by Identity
Return all documents by the given identity
* `limit` cannot be more then 100
```
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/documents?page=1&limit=10&order=asc

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        identifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        owner: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        dataContractIdentifier: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        revision: 0,
        txHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        deleted: false,
        data: null,
        timestamp: "2024-03-18T10:13:54.150Z",
        isSystem: false
    }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Transactions by Identity
Return all transactions made by the given identity

Status can be either `SUCCESS` or `FAIL`. In case of error tx, message will appear in the `error` field as Base64 string
* `limit` cannot be more then 100

```
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/transactions?page=1&limit=10&order=asc

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        hash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        index: 0,
        blockHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF,
        blockHeight: 1337,
        type: 0,
        data: null,
        timestamp: "2024-03-18T10:13:54.150Z",
        gasUsed: 1337000,
        status: "SUCCESS",
        error: null,
        owner: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec"
    }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Transfers by Identity
Return all transfers made by the given identity
* `limit` cannot be more then 100
```
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/transfers?page=1&limit=10&order=asc&type=1

{
    pagination: {
        page: 1,
        limit: 10,
        total: 10
    },
    resultSet: [
    {
        amount: 100000,
        sender: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        recipient: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        timestamp: "2024-03-18T10:13:54.150Z",
        txHash: "445E6F081DEE877867816AD3EF492E2C0BD1DDCCDC9C793B23DDDAF8AEA23118",
        type: 6,
        blockHash: "73171E0A8DCC10C6DA501E1C70A9C1E0BD6F1F8F834C2A1E787AF19B1F361D5E"
    }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Search
This endpoint allows search any types of data

* `query` required and must contains data for search
* Response may contain array for Identity and Data Contract when searching by part of field

#### Can be found:
* Block
  * Full `height`
  * Full `hash`
* Transaction
  * Full `hash`
* Validator
  * Full `proTxHash`
  * Full `Identifier` of Masternode Identity
* Identity
  * Full `Identifier`
  * Part `alias`
* Data Contract
  * Full `Identifier`
  * Part `name`
* Document
  * Full `Identifier`

```
GET /search?query=xyz

{
  "identities": [
    {
      "identifier": "36LGwPSXef8q8wpdnx4EdDeVNuqCYNAE9boDu5bxytsm",
      "alias": "xyz.dash",
      "status": {
        "alias": "xyz.dash",
        "status": "ok",
        "contested": true
      }
    },
    {
      "identifier": "5bUPV8KGgL42ZBS9fsmmKU3wweQbVeHHsiVrG3YMHyG5",
      "alias": "xyz.dash",
      "status": {
        "alias": "xyz.dash",
        "status": "locked",
        "contested": true
      }
    }
  ]
}
```

```
GET /search?query=36LGwPSXef8q8wpdnx4EdDeVNuqCYNAE9boDu5bxytsm

{
  "identity": {
    "identifier": "36LGwPSXef8q8wpdnx4EdDeVNuqCYNAE9boDu5bxytsm",
    "alias": "xyz.dash",
    "status": {
      "alias": "xyz.dash",
      "status": "ok",
      "contested": true
    }
  }
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
### Transactions history
Return a series data for the amount of transactions chart

* `start` lower interval threshold in ISO string ( _optional_ )
* `end` upper interval threshold in ISO string ( _optional_ )
* `intervalsCount` intervals count in response ( _optional_ )

```
GET /transactions/history?start=2024-01-01T00:00:00&end=2025-01-01T00:00:00
[
    {
        timestamp: "2024-04-22T08:45:20.911Z",
        data: {
          txs: 5
          blockHeight: 2,
          blockHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF"
        }
    },
    {
        timestamp: "2024-04-22T08:50:20.911Z",
        data: {
          txs: 13,
          blockHeight: 7,
          blockHash: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF"
        }
    }, ...
]
```
Response codes:
```
200: OK
400: Invalid input, check start/end values
500: Internal Server Error
```
### Transactions Gas history
Return a series data for the used gas of transactions chart

* `start` lower interval threshold in ISO string ( _optional_ )
* `end` upper interval threshold in ISO string ( _optional_ )
* `intervalsCount` intervals count in response ( _optional_ )

```
GET /transactions/gas/history?start=2024-01-01T00:00:00&end=2025-01-01T00:00:00
[
    {
        timestamp: "2024-04-22T08:45:20.911Z",
        "data": {
          "gas": 772831320,
          "blockHeight": 64060,
          "blockHash": "4A1F6B5238032DDAC55009A28797D909DB4288D5B5EC14B86DEC6EA8F25EC71A"
        }
    },
    {
        timestamp: "2024-04-22T08:50:20.911Z",
        "data": {
          "gas": 14108752440,
          "blockHeight": 64333,
          "blockHash": "507659D9BE2FF76A031F4219061F3D2D39475A7FA4B24F25AEFDB34CD4DF2A57"
        }
    }, ...
]
```
Response codes:
```
200: OK
400: Invalid input, check start/end values
500: Internal Server Error
```
### Rate
Return a rate DASH to USD
```
GET /rate
{
    usd: 24.45,
    source: "Kucoin"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
### Decode Raw Transaction
Return a decoded State Transition

Available transactions type for decode

| Transition type              | type index |
|------------------------------|------------|
| `DATA_CONTRACT_CREATE`       | 0          |
| `DOCUMENTS_BATCH`            | 1          |
| `IDENTITY_CREATE`            | 2          |
| `IDENTITY_TOP_UP`            | 3          |
| `DATA_CONTRACT_UPDATE`       | 4          |
| `IDENTITY_UPDATE`            | 5          |
| `IDENTITY_CREDIT_WITHDRAWAL` | 6          |
| `IDENTITY_CREDIT_TRANSFER`   | 7          |
| `MASTERNODE_VOTE`            | 8          |

- `fundingAddress` can be null
- `prefundedBalance` can be null
- `contractBounds` always null

```
POST /transaction/decode

{
    "base64": "AAAA56Y/VzBp5vlrJR8JRCPSDLlaZjngwyM50w8dQAmAe3EAAAAAAAEBAAABYpzp8+tOQ8j6k24W7FXjqo7zZmMZcybMIDLw7VfLT0EAAQZsYWJsZXIWBBIEdHlwZRIGb2JqZWN0Egpwcm9wZXJ0aWVzFgISCmNvbnRyYWN0SWQWBBIEdHlwZRIGc3RyaW5nEgltaW5MZW5ndGgDVhIJbWF4TGVuZ3RoA1gSCHBvc2l0aW9uAwASCXNob3J0TmFtZRYEEgR0eXBlEgZzdHJpbmcSCW1heExlbmd0aANAEgltaW5MZW5ndGgDBhIIcG9zaXRpb24DAhIIcmVxdWlyZWQVAhIJc2hvcnROYW1lEgpjb250cmFjdElkEhRhZGRpdGlvbmFsUHJvcGVydGllcxMACgACQR8AOrSAQ3S/emVWILS8WyHcMA97CtY5rH7dB4DSjAm/0x6DZdZcm8jyGIdIuuTUALR8/N724YhxwhOQHqUm5ipN"
}
```
#### Responses:
```
{
    "type": 0,
    "internalConfig": {
        "canBeDeleted": false,
        "readonly": false,
        "keepsHistory": false,
        "documentsKeepHistoryContractDefault": false,
        "documentsMutableContractDefault": true,
        "documentsCanBeDeletedContractDefault": true,
        "requiresIdentityDecryptionBoundedKey": null,
        "requiresIdentityEncryptionBoundedKey": null
    },
    "userFeeIncrease": 0,
    "identityNonce": 7,
    "dataContractId": "4PenkX3rPnwvBNvCwRTXaduxym7XG4yJWQNfiruWwM2N",
    "ownerId": "7Yowk46VwwHqmD5yZyyygggh937aP6h2UW7aQWBdWpM5",
    "schema": {
        "identityVerify": {
            "documentsMutable": true,
            "canBeDeleted": true,
            "type": "object",
            "properties": {
                "normalizedLabel": {
                    "position": 0,
                    "type": "string",
                    "pattern": "^[a-hj-km-np-z0-9][a-hj-km-np-z0-9-]{0,61}[a-hj-km-np-z0-9]$",
                    "maxLength": 63,
                    "description": "Domain label converted to lowercase for case-insensitive uniqueness validation. \"o\", \"i\" and \"l\" replaced with \"0\" and \"1\" to mitigate homograph attack. e.g. 'b0b'",
                    "$comment": "Must match a domain document to provide further information. Must be equal to the label in lowercase. \"o\", \"i\" and \"l\" must be replaced with \"0\" and \"1\"."
                },
                "normalizedParentDomainName": {
                    "type": "string",
                    "pattern": "^$|^[a-hj-km-np-z0-9][a-hj-km-np-z0-9-\\.]{0,61}[a-hj-km-np-z0-9]$",
                    "minLength": 0,
                    "maxLength": 63,
                    "position": 1,
                    "description": "A parent domain name in lowercase for case-insensitive uniqueness validation. \"o\", \"i\" and \"l\" replaced with \"0\" and \"1\" to mitigate homograph attack. e.g. 'dash'",
                    "$comment": "Must either be equal to an existing domain or empty to create a top level domain. \"o\", \"i\" and \"l\" must be replaced with \"0\" and \"1\". Only the data contract owner can create top level domains."
                },
                "url": {
                    "position": 2,
                    "type": "string",
                    "description": "The identity verification URL to be stored.",
                    "maxLength": 128,
                    "pattern": "^https?://.*",
                    "format": "uri"
                }
            },
            "indices": [
                {
                    "name": "ownerId",
                    "properties": [
                        {
                            "$ownerId": "asc"
                        }
                    ]
                },
                {
                    "name": "ownerId_NormDomainName_NormLabel",
                    "properties": [
                        {
                            "$ownerId": "asc"
                        },
                        {
                            "normalizedParentDomainName": "asc"
                        },
                        {
                            "normalizedLabel": "asc"
                        }
                    ]
                },
                {
                    "name": "uniqueUsernameIndex",
                    "properties": [
                        {
                            "normalizedLabel": "asc"
                        }
                    ]
                }
            ],
            "required": [
                "url",
                "normalizedLabel",
                "normalizedParentDomainName"
            ],
            "additionalProperties": false
        },
        "tx_metadata": {
            "type": "object",
            "indices": [
                {
                    "name": "ownerId",
                    "properties": [
                        {
                            "$ownerId": "asc"
                        }
                    ]
                },
                {
                    "name": "ownerIdAndCreatedAt",
                    "properties": [
                        {
                            "$ownerId": "asc"
                        },
                        {
                            "$createdAt": "asc"
                        }
                    ]
                }
            ],
            "properties": {
                "keyIndex": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "The index of the owners identity public key used to derive the encryption key.",
                    "position": 0
                },
                "encryptionKeyIndex": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "The secondary index used to derive the encryption key that is used to encrypt and decrypt encryptedData.",
                    "position": 1
                },
                "encryptedMetadata": {
                    "type": "array",
                    "byteArray": true,
                    "minItems": 32,
                    "maxItems": 4096,
                    "description": "encrypted metadata using AES-CBC-256",
                    "position": 2
                }
            },
            "required": [
                "keyIndex",
                "encryptionKeyIndex",
                "encryptedMetadata",
                "$createdAt"
            ],
            "additionalProperties": false
        }
    },
    "signature": "1ff784ded3a1177d0c6194fadfaf3a3722cb4ef41c1ae3fa7bdeca2f0bd5a19cdc7d95d2286990e4e8a9308043261c4ed7fdb5676d4d5629ef26d26a79a19a0f3a",
    "signaturePublicKeyId": 1,
    "raw": "00000032609106c20cd642005b3c1ed00dde5cb5fde5f40baaa4184aebbafc560b679f00000000000101000001614c34c98bc3f0a618951f0e61310598a0ad8ec225007f1f001fddf7e7b292f000020e6964656e7469747956657269667916071210646f63756d656e74734d757461626c651301120c63616e426544656c65746564130112047479706512066f626a656374120a70726f706572746965731603120f6e6f726d616c697a65644c6162656c16061208706f736974696f6e02001204747970651206737472696e6712077061747465726e123c5e5b612d686a2d6b6d2d6e702d7a302d395d5b612d686a2d6b6d2d6e702d7a302d392d5d7b302c36317d5b612d686a2d6b6d2d6e702d7a302d395d2412096d61784c656e677468023f120b6465736372697074696f6e12a3446f6d61696e206c6162656c20636f6e76657274656420746f206c6f7765726361736520666f7220636173652d696e73656e73697469766520756e697175656e6573732076616c69646174696f6e2e20226f222c2022692220616e6420226c22207265706c6163656420776974682022302220616e642022312220746f206d6974696761746520686f6d6f67726170682061747461636b2e20652e672e202762306227120824636f6d6d656e7412994d757374206d61746368206120646f6d61696e20646f63756d656e7420746f2070726f76696465206675727468657220696e666f726d6174696f6e2e204d75737420626520657175616c20746f20746865206c6162656c20696e206c6f776572636173652e20226f222c2022692220616e6420226c22206d757374206265207265706c6163656420776974682022302220616e64202231222e121a6e6f726d616c697a6564506172656e74446f6d61696e4e616d6516071204747970651206737472696e6712077061747465726e12415e247c5e5b612d686a2d6b6d2d6e702d7a302d395d5b612d686a2d6b6d2d6e702d7a302d392d5c2e5d7b302c36317d5b612d686a2d6b6d2d6e702d7a302d395d2412096d696e4c656e677468020012096d61784c656e677468023f1208706f736974696f6e0201120b6465736372697074696f6e12a24120706172656e7420646f6d61696e206e616d6520696e206c6f7765726361736520666f7220636173652d696e73656e73697469766520756e697175656e6573732076616c69646174696f6e2e20226f222c2022692220616e6420226c22207265706c6163656420776974682022302220616e642022312220746f206d6974696761746520686f6d6f67726170682061747461636b2e20652e672e20276461736827120824636f6d6d656e7412c04d7573742065697468657220626520657175616c20746f20616e206578697374696e6720646f6d61696e206f7220656d70747920746f20637265617465206120746f70206c6576656c20646f6d61696e2e20226f222c2022692220616e6420226c22206d757374206265207265706c6163656420776974682022302220616e64202231222e204f6e6c7920746865206461746120636f6e7472616374206f776e65722063616e2063726561746520746f70206c6576656c20646f6d61696e732e120375726c16061208706f736974696f6e02021204747970651206737472696e67120b6465736372697074696f6e122b546865206964656e7469747920766572696669636174696f6e2055524c20746f2062652073746f7265642e12096d61784c656e677468028012077061747465726e120c5e68747470733f3a2f2f2e2a1206666f726d617412037572691207696e64696365731503160212046e616d6512076f776e65724964120a70726f70657274696573150116011208246f776e657249641203617363160212046e616d6512206f776e657249645f4e6f726d446f6d61696e4e616d655f4e6f726d4c6162656c120a70726f70657274696573150316011208246f776e6572496412036173631601121a6e6f726d616c697a6564506172656e74446f6d61696e4e616d6512036173631601120f6e6f726d616c697a65644c6162656c1203617363160212046e616d651213756e69717565557365726e616d65496e646578120a70726f7065727469657315011601120f6e6f726d616c697a65644c6162656c1203617363120872657175697265641503120375726c120f6e6f726d616c697a65644c6162656c121a6e6f726d616c697a6564506172656e74446f6d61696e4e616d6512146164646974696f6e616c50726f7065727469657313000b74785f6d65746164617461160512047479706512066f626a6563741207696e64696365731502160212046e616d6512076f776e65724964120a70726f70657274696573150116011208246f776e657249641203617363160212046e616d6512136f776e65724964416e64437265617465644174120a70726f70657274696573150216011208246f776e6572496412036173631601120a246372656174656441741203617363120a70726f70657274696573160312086b6579496e64657816041204747970651207696e746567657212076d696e696d756d0200120b6465736372697074696f6e124e54686520696e646578206f6620746865206f776e657273206964656e74697479207075626c6963206b6579207573656420746f206465726976652074686520656e6372797074696f6e206b65792e1208706f736974696f6e02001212656e6372797074696f6e4b6579496e64657816041204747970651207696e746567657212076d696e696d756d0200120b6465736372697074696f6e1268546865207365636f6e6461727920696e646578207573656420746f206465726976652074686520656e6372797074696f6e206b65792074686174206973207573656420746f20656e637279707420616e64206465637279707420656e63727970746564446174612e1208706f736974696f6e02011211656e637279707465644d657461646174611606120474797065120561727261791209627974654172726179130112086d696e4974656d73022012086d61784974656d7302fb1000120b6465736372697074696f6e1224656e63727970746564206d65746164617461207573696e67204145532d4342432d3235361208706f736974696f6e020212087265717569726564150412086b6579496e6465781212656e6372797074696f6e4b6579496e6465781211656e637279707465644d65746164617461120a2463726561746564417412146164646974696f6e616c50726f706572746965731300070001411ff784ded3a1177d0c6194fadfaf3a3722cb4ef41c1ae3fa7bdeca2f0bd5a19cdc7d95d2286990e4e8a9308043261c4ed7fdb5676d4d5629ef26d26a79a19a0f3a"
}
```
```
{
    "type": 1,
    "transitions": [
        {
            "id": "Fwvkm4ktZVJEHN34RWm4s3fbNXoC3vNj9MB49LwLdavM",
            "dataContractId": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
            "revision": 1,
            "type": "domain",
            "action": 0,
            "data": {
                "label": "Microsoft",
                "normalizedLabel": "m1cr0s0ft",
                "normalizedParentDomainName": "dash",
                "parentDomainName": "dash",
                "preorderSalt": "+nE4I9leD/ua1WdxrrZ4gWQWglNUPwRRjgULjvqGOCs=",
                "records": {
                    "identity": "HVfqSPfdmiHsrajx7EmErGnV597uYdH3JGhvwpVDcdAT"
                },
                "subdomainRules": {
                    "allowSubdomains": false
                }
            },
            "prefundedBalance": {
                "parentNameAndLabel": 20000000000
            }
        }
    ],
    "userFeeIncrease": 0,
    "signature": "2056f7e8fafc7328ed3026466f90cc0d50ad04714c30d3bc4dc7228440adc2b7974091f27b51dc23de470b5e235741c2a852f74c8ab73d7e83469fe24dcffbe425",
    "signaturePublicKeyId": 2,
    "ownerId": "HVfqSPfdmiHsrajx7EmErGnV597uYdH3JGhvwpVDcdAT",
    "raw": "0200f5132a1cc9642bdab3d06533a91a4f8813129c9a27a73ed53e577e747c9a4eac01000000de15c2d39a27cbe01395094153e58ded53c7cf9fabfe6723810b56e6ee35f50a0706646f6d61696ee668c659af66aee1e72c186dde7b5b7e0a1d712a09c40d5721f622bf53c53155a1a2c90b886fe21aa4d646b03e0d2775df9a16f06157130247dd435334fc051f07056c6162656c12094d6963726f736f66740f6e6f726d616c697a65644c6162656c12096d31637230733066741a6e6f726d616c697a6564506172656e74446f6d61696e4e616d6512046461736810706172656e74446f6d61696e4e616d651204646173680c7072656f7264657253616c740cfa713823d95e0ffb9ad56771aeb6788164168253543f04518e050b8efa86382b077265636f726473160112086964656e7469747910f5132a1cc9642bdab3d06533a91a4f8813129c9a27a73ed53e577e747c9a4eac0e737562646f6d61696e52756c65731601120f616c6c6f77537562646f6d61696e7313000112706172656e744e616d65416e644c6162656cfd00000004a817c8000002412056f7e8fafc7328ed3026466f90cc0d50ad04714c30d3bc4dc7228440adc2b7974091f27b51dc23de470b5e235741c2a852f74c8ab73d7e83469fe24dcffbe425"
}
```
```
IDENTITY_CREATE with chainLock

{
    "type": 2,
    "fundingAddress": null,
    "assetLockProof": {
      coreChainLockedHeight: 1138871,
      type: "chainLock",
      fundingAmount: null,
      txid: "fc89dd4cbe2518da3cd9737043603e81665df58d4989a38b2942eec56bacad1d",
      vout: 0,
      fundingAddress: null,
      instantLock: null
    },
    "userFeeIncrease": 0,
    "identityId": "awCc9STLEgw8pJozBq24QzGK5Th9mow7V3EjjY9M7aG",
    "signature": "2015bf50b422df6ccfdc4bcdcae76a11106c8f6c627a284f37d2591184e413249350a722926c8899b5514fd94603598031358bc2a0ac031fb402ecc5b8025f2141",
    "raw": "0300010000020000000014b23f76cac0218f7637c924e45212bb260cff29250001fc001160b72021007051d2207c45d7592bb7e3e5b4b006a29cfe1899aea8abf00c50ee8a40860000412015bf50b422df6ccfdc4bcdcae76a11106c8f6c627a284f37d2591184e413249350a722926c8899b5514fd94603598031358bc2a0ac031fb402ecc5b8025f214108b1737186062205ee3a5f7e19454121b648e0806c7bc1e8bc073c38217a28e1",
    "publicKeys": [
        {
            contractBounds: null,
            id: 0,
            type: "ECDSA_SECP256K1",
            data: "0348a6a633850f3c83a0cb30a9fceebbaa3b9ab3f923f123d92728cef234176dc5",
            publicKeyHash: "07630dddc55729c043de7bdeb145ee0d44feae3b",
            purpose: "AUTHENTICATION",
            securityLevel: "MASTER",
            readOnly: false,
            signature: "2042186a3dec52bfe9a24ee17b98adc5efcbc0a0a6bacbc9627f1405ea5e1bb7ae2bb94a270363400969669e9884ab9967659e9a0d8de7464ee7c47552c8cb0e99"
        },
        {
            contractBounds: null,
            id: 1,
            type: "ECDSA_SECP256K1",
            data: "034278b0d7f5e6d902ec5a30ae5c656937a0323bdc813e851eb8a2d6a1d23c51cf",
            publicKeyHash: "e2615c5ef3f910ebe5ada7930e7b2c04a7ffbb23",
            purpose: "AUTHENTICATION",
            securityLevel: "HIGH",
            readOnly: false,
            signature: "1fbb0d0bb63d26c0d5b6e1f4b8c0eebef4d256c4e8aa933a2cb6bd6b2d8aae545215312924c7dd41c963071e2ccfe2187a8684d93c55063cb45fdd03e76344d6a4"
        },
        {
            contractBounds: null,
            id: 2,
            type: "ECDSA_SECP256K1",
            data: "0245c3b0f0323ddbb9ddf123f939bf37296af4f38fa489aad722c50486575cd8f4",
            publicKeyHash: "d53ee3b3518fee80816ab26af98a34ea60ae9af7",
            purpose: "AUTHENTICATION",
            securityLevel: "CRITICAL",
            readOnly: false,
            signature: "204013dcca13378b820e40cf1da77abe38662546ef0a304545de3c35845b83a7ad4b42051c2b3539c9181b3f0cb3fb4bc970db89663c6bd6ca1468568a62beaa75"
        }
    ]
}
```
```
IDENTITY_CREATE with instantLock

{
    "type": 2,
    "fundingAddress": "yV1ZYoep5FFSBxKWM24JUwKfnAkFHnXXV7",
    "assetLockProof": {
        coreChainLockedHeight: null
        type: "instantSend",
        fundingAmount: 34999000,
        txid: "fc89dd4cbe2518da3cd9737043603e81665df58d4989a38b2942eec56bacad1d",
        vout: 0,
        fundingAddress: "yeMdYXBPum8RmHvrq5SsYE9zNYhMEimbUY",
        instantLock: 'AQEKM9t1ICNzvddKryjM4enKn0Y5amBn3o6DwDoC4uk5SAAAAAAdraxrxe5CKYujiUmN9V1mgT5gQ3Bz2TzaGCW+TN2J/JQP49yOk0uJ6el6ls9CmNo++yPYoX1Sx1lWEZTTAAAAhXiuCBXgzawuboxMAXDiXQpJCCPi417VE4mdcYPgTa0/Hd+RCHLAR6H+MXhqKazlGddI7AdWxxLZ94ZvQu+qIpe7G9XRRjQWeYwroIyc6MqQF5mKpvV0AUMYUNMXjCsq'
    },
    "userFeeIncrease": 0,
    "identityId": "BHAuKDRVPHkJd99pLoQh8dfjUFobwk5bq6enubEBKpsv",
    "signature": "1fc5b49ce2feb6cfc94f31de8167b806af0265657d5b8f01584e0db3ca011dba24328998bf40a50dd06b6ab10ed47622f46c07dec4d7cad3625b41aa52c9e11c2f",
    "raw": "03000400000000000000210258abe04886308feb52b8f3d64eace4913c9d049f4dda9a88a217e6ca6b89a107411f60451588fe72a067daaa0a1ee04279e77ce346128560129162386f76d51eccdc1d88704f2262fe173de57e5598010655d410da94ae2e1cf7086049878b08e966000100000200002103e6680bb560e40adb299a6b940d3dcbe2b08e6e1a64bc8f6bc9ec3d638655c3554120066559ccd6cea8ac2d366980f77a94cbfdfbd978803edbf4066f42bc53adcdb51956fb0d3c9cec2012583d17b66456094a8620109d6dae29dc562b2870592940000200000100002102326a8c19a1c58d30d142e113d0ddf381d95a6306f56c9ec4d3cb8c4823685b29411f5bb82721b58d92e67db9fb699ab939ccc4a6d5e2e498e80dfb8a3535c13f571923f045e645a898762f8305a4a2218bfedb060f8a8492c48ae9c96247ce17710b00030003010000210252a2d08f295871ec4b04cb0bcf7b2899b0b004702d9058982dd797141d527e78412044820dc7651186634326922eda85741bb3f9f005057d94b36845a7edc16ed1df4d5ccabd7e7f003e9c189847fbc06e943252640bc47963c42ae6c0d87b7b506b00c601014fae5c4ed0e736dd25610b65ff51b56cbe1b9467520f0ced40a9e3b58e4555b10100000077ba9d450b94520434c5d15339922aa7df81b51344b98588649a44752f1a355cd0d05ce3df52f3fb7fc6e64cc414fb7cd9d0ffc4d088e77d9e542fade30000008a8678665212af134cfa36ea40984009adca338efa3131667f5a62b489d2fb2713eb7eccd14dd83cc6679b597548feae18bdc393dae2ab2a50844220359d4b87c428507808dc8df62f56dabb8d1eae2c1859b9ca54b3b4820ebc8453f57c34f6ef03000800014fae5c4ed0e736dd25610b65ff51b56cbe1b9467520f0ced40a9e3b58e4555b1010000006a473044022070293df3b93c523373f1f86272c5dba7886ab41cfc50b0b89658c07d0825c16002201afdf3b31393c5b99373597042b4d651028e824fc12f802aa1be51cc165bcf1e012103d55244573359ad586597b9bb4dd31b8f145121b7c01146656bc26c4b99184a47ffffffff0240420f0000000000026a0049ac4c2e000000001976a91441bb9b42b9f0d589008b4a7f6a72a6bb342b386d88ac0000000024010140420f00000000001976a9145f573cd6a8570cb0b74c4b0ea15334e6bd6b34a788ac0000411fc5b49ce2feb6cfc94f31de8167b806af0265657d5b8f01584e0db3ca011dba24328998bf40a50dd06b6ab10ed47622f46c07dec4d7cad3625b41aa52c9e11c2f98b95bbff1488807c3a4ed36c5fde32f9a6f1e05a622938476652041669e4135",
    "publicKeys": [
        {
            contractBounds: null,
            id: 0,
            type: "ECDSA_SECP256K1",
            data: "0348a6a633850f3c83a0cb30a9fceebbaa3b9ab3f923f123d92728cef234176dc5",
            publicKeyHash: "07630dddc55729c043de7bdeb145ee0d44feae3b",
            purpose: "AUTHENTICATION",
            securityLevel: "MASTER",
            readOnly: false,
            signature: "2042186a3dec52bfe9a24ee17b98adc5efcbc0a0a6bacbc9627f1405ea5e1bb7ae2bb94a270363400969669e9884ab9967659e9a0d8de7464ee7c47552c8cb0e99"
        },
        {
            contractBounds: null,
            id: 1,
            type: "ECDSA_SECP256K1",
            data: "034278b0d7f5e6d902ec5a30ae5c656937a0323bdc813e851eb8a2d6a1d23c51cf",
            publicKeyHash: "e2615c5ef3f910ebe5ada7930e7b2c04a7ffbb23",
            purpose: "AUTHENTICATION",
            securityLevel: "HIGH",
            readOnly: false,
            signature: "1fbb0d0bb63d26c0d5b6e1f4b8c0eebef4d256c4e8aa933a2cb6bd6b2d8aae545215312924c7dd41c963071e2ccfe2187a8684d93c55063cb45fdd03e76344d6a4"
        },
        {
            contractBounds: null,
            id: 2,
            type: "ECDSA_SECP256K1",
            data: "0245c3b0f0323ddbb9ddf123f939bf37296af4f38fa489aad722c50486575cd8f4",
            publicKeyHash: "d53ee3b3518fee80816ab26af98a34ea60ae9af7",
            purpose: "AUTHENTICATION",
            securityLevel: "CRITICAL",
            readOnly: false,
            signature: "204013dcca13378b820e40cf1da77abe38662546ef0a304545de3c35845b83a7ad4b42051c2b3539c9181b3f0cb3fb4bc970db89663c6bd6ca1468568a62beaa75"
        }
    ]
}
```
```
{
    type: 3,
    assetLockProof: {
        coreChainLockedHeight: null
        type: "instantSend",
        fundingAmount: 999000,
        txid: "7734f498c5b59f64f73070e0a5ec4fa113065da00358223cf888c3c27317ea64",
        vout: 0,
        fundingAddress: "yWxCwVRgqRmePNPJxezgus1T7xSv5q17SU"
    },
    identityId: '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF',
    amount: 300000000,
    signature: '810cd0bfe02104362941d35bd05fdf82cdc50c3bc8510077bfa62d47b68710',
    raw: '040000c60101ecd6b031477f342806df5740b70f93b8a3e925bbf2d90d979a5ed162a8d7d5660000000064ea1773c2c388f83c225803a05d0613a14feca5e07030f7649fb5c598f43477940fe3dc8e934b89e9e97a96cf4298da3efb23d8a17d52c759561194d3000000a5e81597e94558618bf1464801188ecbc09c7a12e73489225c63684259f075f87aa3d47ea9bbbe1f9c314086ddc35a6d18b30ff4fe579855779f9268b8bf5c79760c7d8c56d34163931f016c2e3036852dd33a6b643dd59dc8c54199f34e3d2def0300080001ecd6b031477f342806df5740b70f93b8a3e925bbf2d90d979a5ed162a8d7d566000000006a4730440220339d4d894eb2ff9c193bd8c33cdb3030a8be18ddbf30d983e8286c08c6c4c7d90220181741d9eed3814ec077030c26c0b9fff63b9ef10e1e6ca1c87069b261b0127a0121034951bbd5d0d500942426507d4b84e6d88406300ed82009a8db087f493017786affffffff02e093040000000000026a0078aa0a00000000001976a914706db5d1e8fb5f925c6db64104f4b77f0c8b73d488ac00000000240101e0930400000000001976a91474a509b4f3b80ce818465dc0f9f66e2103d9178b88ac003012c19b98ec0033addb36cd64b7f510670f2a351a4304b5f6994144286efdac411f810cd0bfe02104362941d35bd05fdf82cdc50c3bc8510077bfa62d47b68710'
}
```
```
{
    "type": 4,
    "internalConfig": {
        "canBeDeleted": false,
        "readonly": false,
        "keepsHistory": false,
        "documentsKeepHistoryContractDefault": false,
        "documentsMutableContractDefault": true,
        "documentsCanBeDeletedContractDefault": true,
        "requiresIdentityDecryptionBoundedKey": null,
        "requiresIdentityEncryptionBoundedKey": null
    },
    "identityContractNonce": 6,
    "signaturePublicKeyId": 2,
    "signature": "1ff9a776c62ee371a0e5ed95e8efe27c7955f247d5527670e43cbd837e73cfaef3613592b9798e9afd2526e3b92330f07d0c5f1396390d63ad39b4bebeb9c82903",
    "userFeeIncrease": 0,
    "ownerId": "GgZekwh38XcWQTyWWWvmw6CEYFnLU7yiZFPWZEjqKHit",
    "dataContractId": "AJqYb8ZvfbA6ZFgpsvLfpMEzwjaYUPyVmeFxSJrafB18",
    "dataContractNonce": 0,
    "schema": {
        "note": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "position": 0
                },
                "author": {
                    "type": "string",
                    "position": 1
                }
            },
            "additionalProperties": false
        }
    },
    "version": 2,
    "dataContractOwner": "GgZekwh38XcWQTyWWWvmw6CEYFnLU7yiZFPWZEjqKHit",
    "raw": "010006008a4af217f340e9c4c95857496cf33b68eb6c712ac6d20a1eb7854d14afd9ffcf00000000000101000002e901dfc172a96ce3f7d334d6c0b69df3b01c86d30ff03a7c24f516838f94340d0001046e6f7465160312047479706512066f626a656374120a70726f70657274696573160212076d65737361676516021204747970651206737472696e671208706f736974696f6e02001206617574686f7216021204747970651206737472696e671208706f736974696f6e020112146164646974696f6e616c50726f7065727469657313000002411ff9a776c62ee371a0e5ed95e8efe27c7955f247d5527670e43cbd837e73cfaef3613592b9798e9afd2526e3b92330f07d0c5f1396390d63ad39b4bebeb9c82903"
}
```
```
{
  type: 5,
  identityContractNonce: 3,
  userFeeIncrease: 0,
  identityId: '4NGALjtX2t3AXE3ZCqJiSmYuiWEY3ZPQNUBxNWWRrRSp',
  revision: 2,
  publicKeysToAdd: [
      {
          contractBounds: null,
          id: 5,
          type: "ECDSA_HASH160",
          data: "c208ded6d1af562b8e5387c02a446ea6e8bb325f",
          publicKeyHash: "c208ded6d1af562b8e5387c02a446ea6e8bb325f",
          purpose: "AUTHENTICATION",
          securityLevel: "HIGH",
          readOnly: false,
          signature: ""
      },
      {
          contractBounds: null,
          id: 6,
          type: "ECDSA_SECP256K1",
          data: "026213380930c93c4b53f6ddbc5adc5f5165102d8f92f7d9a495a8f9c6e61b30f0",
          publicKeyHash: "d39eda042126256a372c388bd191532a7c9612ce",
          purpose: "AUTHENTICATION",
          securityLevel: "MASTER",
          readOnly: false,
          signature: "1faf8b0f16320d0f9e29c1db12ab0d3ec87974b19f6fc1189a988cd85503d79f844d3ff778678d7f4f3829891e8e8d0183456194d9fc76ed66e503154996eefe06"
      }
  ],
  setPublicKeyIdsToDisable: [],
  signature: '1f341c8eb7b890f416c7a970406dd37da078dab5f2c4aa8dd18375516933b234873127965dd72ee28b7392fcd87e28c4bfef890791b58fa9c34bce9e96d6536cb1',
  signaturePublicKeyId: 0,
  raw: '0600320566816f366803517a7eb44d331ccb0e442fab6396f3d6ac631b1069aae0410203020005020002000014c208ded6d1af562b8e5387c02a446ea6e8bb325f000006000000000021026213380930c93c4b53f6ddbc5adc5f5165102d8f92f7d9a495a8f9c6e61b30f0411faf8b0f16320d0f9e29c1db12ab0d3ec87974b19f6fc1189a988cd85503d79f844d3ff778678d7f4f3829891e8e8d0183456194d9fc76ed66e503154996eefe06000000411f341c8eb7b890f416c7a970406dd37da078dab5f2c4aa8dd18375516933b234873127965dd72ee28b7392fcd87e28c4bfef890791b58fa9c34bce9e96d6536cb1'
}
```
```
{
    "type": 6,
    "outputAddress": "yifJkXaxe7oM1NgBDTaXnWa6kXZAazBfjk",
    "userFeeIncrease": 0,
    "identityContractNonce": 6,
    "senderId": "8eTDkBhpQjHeqgbVeriwLeZr1tCa6yBGw76SckvD1cwc",
    "amount": 200000,
    "identityNonce": 6,
    "outputScript": "76a914f51453a538d9a0a9fb3fe0f2948a0f80d9cf525a88ac",
    "coreFeePerByte": 5,
    "signature": "20cc6d48ed7341d47d6efbdad14ce0f471e67f75110acd56738b7c42c78a71d7da4fd870e1c77934239ea3a0ca0fd1145814b5165bd4ec76e87e774836c680b01b",
    "signaturePublicKeyId": 3,
    "pooling": "Standard",
    "raw": "05017199f1f68404c86ecf60d9cb93aef318fa0f2b08e59ffd176bdef43154ffde6bfc00030d400500011976a914f51453a538d9a0a9fb3fe0f2948a0f80d9cf525a88ac0600034120cc6d48ed7341d47d6efbdad14ce0f471e67f75110acd56738b7c42c78a71d7da4fd870e1c77934239ea3a0ca0fd1145814b5165bd4ec76e87e774836c680b01b"
}
```
```
{
    "type": 7,
    "identityContractNonce": 1,
    "userFeeIncrease": 0,
    "senderId": "24YEeZmpy1QNKronDT8enYWLXnfoxYK7hrHUdpWHxURg",
    "recipientId": "6q9RFbeea73tE31LGMBLFZhtBUX3wZL3TcNynqE18Zgs",
    "amount": 21856638,
    "signaturePublicKeyId": 3,
    "signature": "1f39c5c81434699df7924d68eba4326352ac97883688e3ec3ffed36746d6fb8c227d4a96a40fcd38673f80ed64ab8e3514cf81fe8be319774429071881d3c8b1f8",
    "raw": "07000fc3bf4a26bff60f4f79a1f4b929ce4d4c5833d226c1c7f68758e71d7ae229db569fd4f616b3dedecbeef95352cf38f1fb04d232a0d20623bc195b0c3f721840fc014d817e010003411f39c5c81434699df7924d68eba4326352ac97883688e3ec3ffed36746d6fb8c227d4a96a40fcd38673f80ed64ab8e3514cf81fe8be319774429071881d3c8b1f8"
}
```
```
{
    "type": 8,
    "contestedResourcesVotePoll": [
        "EgRkYXNo",
        "EgN5MDE="
    ],
    "contractId": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
    "modifiedDataIds": [
        "523FUhxg6WEvp24PfjqFAuHFYXW1gkoXdy8QywfriSse"
    ],
    "ownerId": "523FUhxg6WEvp24PfjqFAuHFYXW1gkoXdy8QywfriSse",
    "signature": "2019d90a905092dd3074da3cd42b05abe944d857fc2573e81e1d39a16ba659c00c7b38b88bee46a853c5c30deb9c2ae3abf4fbb781eec12b86a0928ca7b02ced7d",
    "documentTypeName": "domain",
    "indexName": "parentNameAndLabel",
    "choice": "Abstain",
    "proTxHash": 'ad4e38fc81da72d61b14238ee6e5b91915554e24d725718800692d3a863c910b',
    "raw": "08005b246080ba64350685fe302d3d790f5bb238cb619920d46230c844f079944a233bb2df460e72e3d59e7fe1c082ab3a5bd9445dd0dd5c4894a6d9f0d9ed9404b5000000e668c659af66aee1e72c186dde7b5b7e0a1d712a09c40d5721f622bf53c5315506646f6d61696e12706172656e744e616d65416e644c6162656c021204646173681203793031010c00412019d90a905092dd3074da3cd42b05abe944d857fc2573e81e1d39a16ba659c00c7b38b88bee46a853c5c30deb9c2ae3abf4fbb781eec12b86a0928ca7b02ced7d"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
