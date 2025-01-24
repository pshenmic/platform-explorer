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
* [Masternode Votes](#masternode-votes)
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
  "epoch": {
    "number": 3926,
    "firstBlockHeight": 77795,
    "firstCoreBlockHeight": 1167247,
    "startTime": 1735486842745,
    "feeMultiplier": 1,
    "endTime": 1735490442745
  },
  "transactionsCount": 201,
  "totalCredits": 7797729400736590,
  "totalCollectedFeesDay": 0,
  "transfersCount": 44,
  "dataContractsCount": 39,
  "documentsCount": 115,
  "identitiesCount": 62,
  "network": "dash-testnet-51",
  "api": {
    "version": "1.0.8",
    "block": {
      "height": 919,
      "hash": "0B18C97D80A5480635DCA717B53ACE8A8FF6D1EE6DD99A73AEBC8207AA23ACD3",
      "timestamp": "2024-08-26T22:50:21.503Z"
    }
  },
  "tenderdash": {
    "version": "1.4.0",
    "block": {
      "height": 77800,
      "hash": "1AC55D4514D007461AB44D2DF23CFEF36AD8EAA11932C146A05D8635D7DD40E7",
      "timestamp": "2024-12-29T15:55:49.194Z"
    }
  },
  "indexer": {
    "status": "syncing",
    "syncProgress": 1.18123393316195
  },
  "versions": {
    "software": {
      "dapi": "1.7.1",
      "drive": "1.7.1",
      "tenderdash": "1.4.0"
    },
    "protocol": {
      "tenderdash": {
        "p2p": 10,
        "block": 14
      },
      "drive": {
        "latest": 7,
        "current": 7
      }
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
* epoch number can be null


```
HTTP /epoch/2492

{
  "epoch": {
    "number": 2492,
    "firstBlockHeight": 44046,
    "firstCoreBlockHeight": 1131311,
    "startTime": 1730324534559,
    "feeMultiplier": 1,
    "endTime": 1730328026683
  },
  "tps": 0.0140315750528904,
  "totalCollectedFees": 1897008860,
  "bestValidator": "87075234AC47353B42BB97CE46330CB67CD4648C01F0B2393D7E729B0D678918",
  "topVotedResource": {
    "resource": [
      "dash",
      "asdthree0"
    ],
    "yes": 7,
    "abstain": 1,
    "lock": 4
  },
  "bestVoter": {
    "identifier": "4GfuwhaXL5YSerKKwJ19X2s5yXn8dC738tqfcvncqNgM",
    "yes": 2,
    "abstain": 1,
    "lock": 2
  },
  "totalVotesCount": 12,
  "totalVotesGasUsed": 120000000
}
```
---
### Block by hash
Get a block by hash
```
GET /block/12E5592208322B5A3598C98C1811FCDD403DF40F522511D7A965DDE1D96C97C7

{
  "header": {
    "hash": "04D16F8EE2A892E5F9F884C11DB97CD20BAA4A9539111A9131F847B93422DB26",
    "height": 37994,
    "timestamp": "2024-10-20T21:35:48.669Z",
    "blockVersion": 14,
    "appVersion": 4,
    "l1LockedHeight": 1124953,
    "validator": "8917BB546318F3410D1A7901C7B846A73446311B5164B45A03F0E613F208F234",
    "appHash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
  },
  "txs": [
    {
      "hash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9",
      "index": 0,
      "blockHash": "04D16F8EE2A892E5F9F884C11DB97CD20BAA4A9539111A9131F847B93422DB26",
      "blockHeight": 37994,
      "type": 1,
      "data": "AgDuMmDTP4yp4UxhCAbUbbj9M0NSKtDkSMDXiaFYkDf05gEAAAD8TaL0Ynpk50URo4Lr7GID83h4Q7YxOfxNyBcNWF7mwQEIcHJlb3JkZXLmaMZZr2au4ecsGG3ee1t+Ch1xKgnEDVch9iK/U8UxVe4PfekoUsU6NnJAmQzOoXBkr3P+LpzyoMFt1ppC7LqAARBzYWx0ZWREb21haW5IYXNoDLF9yHanBZpOsaoAIQ7+WgMlafEFgvsSfAqiyosXA967AAABQR8wm64iVoCLY0WmrqLS13iPcikGVcuYsqpuoqIWfYRLLlqXQlyHQ5XnsfTKor5spJtUz8gvlN3//sqH+sI8y/gz",
      "timestamp": "2024-10-20T21:35:48.669Z",
      "gasUsed": 34509040,
      "status": "SUCCESS",
      "error": null,
      "owner": {
        "identifier": "H2pb35GtKpjLinncBYeMsXkdDYXCbsFzzVmssce6pSJ1",
        "aliases": [
          {
            "alias": "owl352-testnet.dash",
            "status": "ok",
            "contested": false,
            "timestamp": "2024-08-26 13:29:44.606+00"
          }
        ]
      }
    }
  ]
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
            l1LockedHeight: 1337,
            "appHash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
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
GET /blocks?start_epoch_index=1000&end_epoch_index=1200&height_min=2000&height_max=4000&gas_min=1&gas_max=99999999999&timestamp_start=2024-08-29T23:24:11.516z&timestamp_end=2025-08-29T23:24:11.516z&tx_count_min=2&tx_count_max=11&validator=C11C1168DCF9479475CB1355855E30EA75C0CDDA8A8F9EA80591568DD1C33BA8

{
  "resultSet": [
    {
      "header": {
        "hash": "667043D129E088F4D467C56B9A496FA79C82979DC1A53636C24E7CF384AEFEFB",
        "height": 2653,
        "timestamp": "2024-08-30T09:43:34.043Z",
        "blockVersion": 14,
        "appVersion": 1,
        "l1LockedHeight": 1093395,
        "validator": "C11C1168DCF9479475CB1355855E30EA75C0CDDA8A8F9EA80591568DD1C33BA8",
        "totalGasUsed": 509281140,
        "appHash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
      },
      "txs": [
        "EA0A1997F31D5204EB9FC6E49CDEF1E9A7FB446AB1D4B9995A9C7ED3C6CE718B",
        "38D6CC1BD7C999A913C20A9637059CCD5174E75EEA11FD3CD3F00872F23E1EC7",
        "2BD1D1074BD4D1BF44B454A478BF28D5C56AFB7755AC4EAD537E46191087F0B2",
        "E69BBC5871008F1B1A7011E5ED8BC68C05D7873A46358FC28C1FB43F016D51AD",
        "A2B663CB5C8600C49E9F13AE4AA93D93BB68B3B5670CD2AF91F1C4EA801A9FD3",
        "32F07D735F7FB2AAA6E9A60F66B3934DB89DBA30FDC01F70BDA160D530E895E6",
        "AFDC21861488981E0E40A8627D044A74A99B24CB627D02BF58985265C23E24BA",
        "E5687BC511C4425B4D6509E5854B23E0B2A0A7C7D91DC877C5D238A9400DD7B8",
        "FE1027D26715DDF148AA31289E51E7C47ECFC8E9E6B4927CB37D7892FB175043",
        "8D38D5DDD3C0DBEF2716581A100C5EA64D298C4860884B68845EE3B0675B1380",
        "5B69FB56BC9B7E6816BC7375499ED4729F2D471E9A34716D5E14BBA290769681"
      ]
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
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
        validator: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
        "appHash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
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
    validator: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
    appHash: "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
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
    validator: "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
    appHash: "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
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
          "contested": true,
          "timestamp": "2024-08-26 13:29:44.606+00"
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
              "contested": true,
              "timestamp": "2024-08-26 13:29:44.606+00"
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
Return last revision of the document by given identifier.

Allows to get withdrawals documents by contract id and document type
```
GET /document/FUJsiMpQZWGfdrWPEUhBRExMAQB9q6MNfFgRqCdz42UJ?document_type_name=preorder&contract_id=GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec

{
  "identifier": "FUJsiMpQZWGfdrWPEUhBRExMAQB9q6MNfFgRqCdz42UJ",
  "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
  "revision": 1,
  "txHash": "DB51A0366133EC56098815D3BF66F374BD3E53951B415C5D4F487BAB6DAD271D",
  "deleted": false,
  "data": "{\"saltedDomainHash\":\"fFfVmDpvXdr5psoak2U5yeUntEEy3M9pAFHVIn+yEvU=\"}",
  "timestamp": "2024-08-25T18:31:50.335Z",
  "isSystem": false,
  "typeName": "preorder",
  "transitionType": "0",
  "owner": "Gn15UqiQ6gpqzXcDhv4adwsJ1KgpG6xx9e3rij9n4ctP"
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
GET /dataContract/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/documents?page=1&limit=10&order=asc&type=preorder

{
  "resultSet": [
    {
      "identifier": "2qHj3sdxdKD4G7ZXGCuF6cB6ADYdtPs2BKNx24YcH6gW",
      "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
      "revision": 1,
      "txHash": "EDBC1D2AC12B8BE211086E3B8DD8018C5FB2FECBD46EB77205F9AF24E73BADAD",
      "deleted": false,
      "data": "{\"saltedDomainHash\":\"DcKS9AWVE1atKvIokA7JNdUNmyj4SbFUvB6e83whw2g=\"}",
      "timestamp": "2024-08-25T09:11:05.698Z",
      "isSystem": false,
      "typeName": "preorder",
      "transitionType": "0",
      "owner": "BHAuKDRVPHkJd99pLoQh8dfjUFobwk5bq6enubEBKpsv"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 750
  }
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
      "contested": false,
      "timestamp": "2024-08-26 13:29:44.606+00"
    }
  ],
  "totalGasSpent": 310352700,
  "averageGasSpent": 23873285,
  "totalTopUpsAmount": 46350660,
  "totalWithdrawalsAmount": 0,
  "lastWithdrawalHash": null,
  "lastWithdrawalTimestamp": null,
  "totalTopUps": 0,
  "totalWithdrawals": 0,
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
              "contested": true,
              "timestamp": "2024-08-26 13:29:44.606+00"
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
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/documents?page=1&limit=10&order=asc&document_type_name=preorder

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
        isSystem: false,
        transitionType: 0,
        typeName: 'preorder'
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
* `type` cannot be less, then 0 and more then 8
```
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/transfers?hash=445E6F081DEE877867816AD3EF492E2C0BD1DDCCDC9C793B23DDDAF8AEA23118&page=1&limit=10&order=asc&type=6

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
    }
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Masternode Votes
Return list of votes by params
* `limit` cannot be more than 100
* `type` cannot be less than 0 and more than 8
* `choice` cannot be less than 0 and more than 3
```
GET /masternodes/votes?timestamp_start=2024-09-18T01:10:57.833Z&timestamp_end=2024-09-19T01:10:57.833Z&voter_identity=2Ey6wdP5YYSqhq96KmU349CeSCsV4avrsNCaXqogGEr9&choice=0&towards_identity=LgdvpQHb7mvrab6Vv49iTz912aHBVjpTJ6rXGRDQL2s

{
  "resultSet": [
    {
      "proTxHash": "bc77a5a2cec455c79fb92fb683dbd87a2a92b663c9a46d0c50d11889b4aeb121",
      "txHash": "499C9C0830F98B395CFC440EE34A96C550DF5000A78B5604BC2B50B4545E0D2C",
      "voterIdentifier": "2Ey6wdP5YYSqhq96KmU349CeSCsV4avrsNCaXqogGEr9",
      "choice": 0,
      "timestamp": "2024-09-18T19:27:17.212Z",
      "towardsIdentity": "LgdvpQHb7mvrab6Vv49iTz912aHBVjpTJ6rXGRDQL2s ",
      "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
      "documentTypeName": "domain",
      "indexName": "parentNameAndLabel",
      "indexValues": [
        "dash",
        "test001"
      ],
      "powerMultiplier": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
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
                "entropy": "f09a3ceacaa2f12b9879ba223d5b8c66c3106efe58edc511556f31ee9676412b",
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
    "indexValues": [
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
