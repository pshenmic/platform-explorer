# API

Api module provides a view for a database filled up with data with indexer.

### Start

````
$ npm install
$ npm start
````

Environments:
```
POSTGRES_HOST=127.0.0.1
POSTGRES_DB=indexer
POSTGRES_USER=indexer
POSTGRES_PASS=indexer
TENDERDASH_URL=http://127.0.0.1:36657
DASHCORE_URL=http://127.0.0.1:19998
DASHCORE_USER=username
DASHCORE_PASS=password
EPOCH_CHANGE_TIME=3600000
```


### Deploy

#### docker
Prepare an .env file with all necessary environments and then start a docker container
```
docker run -d -p 3005:3005 --restart always --env-file .env ghcr.io/pshenmic/platform-explorer:api
```

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
* [Validator Rewards Statistic](#validator-rewards-stats-by-protxhash)
* [Validator Blocks Statistic](#validator-stats-by-protxhash)
* [Transaction by hash](#transaction-by-hash)
* [Transactions](#transactions)
* [Data Contract By Identifier](#data-contract-by-identifier)
* [RAW Data Contract By Identifier](#raw-data-contract-by-identifier)
* [Data Contracts](#data-contracts)
* [Data Contract Transactions](#data-contract-transactions)
* [Data Contracts Rating](#data-contracts-rating)
* [Document by Identifier](#document-by-identifier)
* [RAW Document by Identifier](#raw-document-by-identifier)
* [Document Revisions](#document-revisions)
* [Documents by Data Contract](#documents-by-data-contract)
* [Identity by Identifier](#identity-by-identifier)
* [Identity by DPNS](#identity-by-dpns)
* [Identity Withdrawals](#identity-withdrawals)
* [Identities](#identities)
* [Identities history](#identities-history)
* [Data Contracts by Identity](#data-contracts-by-identity)
* [Documents by Identity](#documents-by-identity)
* [Transactions By Identity](#transactions-by-identity)
* [Transfers by Identity](#transfers-by-identity)
* [Transactions history](#transactions-history)
* [Transactions gas history](#transactions-gas-history)
* [Votes for contested resource](#votes-for-contested-resource)
* [Contested Resource Value](#contested-resource-value)
* [Contested Resources](#contested-resources)
* [Contested Resources Stats](#contested-resources-stats)
* [Rate](#rate)
* [Masternode Votes](#masternode-votes)
* [Search](#search)
* [Decode Raw Transaction](#decode-raw-transaction)
* [Identity Nonce](#identity-nonce)
* [Identity Contract Nonce](#identity-contract-nonce)
* [Tokens](#tokens)
* [Token By Identifier](#token-by-identifier)
* [Token Transitions](#token-transitions)
* [Tokens Rating](#tokens-rating)
* [Tokens By Identity](#tokens-by-identity)
* [Token Holders](#token-holders)
* [Broadcast Transaction](#broadcast-transaction)
* [Wait for State Transition Result](#wait-for-state-transition-result)
* [Quorum Info](#quorum-info)

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
Returns info about epoch by specific index.

If you want to get the last epoch don't set epoch index

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
    "resourceValue": [
      "dash",
      "asdthree0"
    ],
    "totalCountTowardsIdentity": 7,
    "totalCountAbstain": 1,
    "totalCountLock": 4
  },
  "bestVoter": {
    "identifier": "4GfuwhaXL5YSerKKwJ19X2s5yXn8dC738tqfcvncqNgM",
    "totalCountTowardsIdentity": 2,
    "totalCountAbstain": 1,
    "totalCountLock": 2
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
      "type": "BATCH",
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
            "timestamp": "2024-08-26 13:29:44.606+00",
            "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
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
* `page` cannot be less then 1
```
GET /validator/B8F90A4F07D9E59C061D41CC8E775093141492A5FD59AB3BBC4241238BB28A18/blocks

{
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 10
    },
    "resultSet": [
    {
        "header": {
            "hash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
            "height": 1337,
            "timestamp": "2024-03-18T10:13:54.150Z",
            "blockVersion": 13,
            "appVersion": 1,
            "validator": "B8F90A4F07D9E59C061D41CC8E775093141492A5FD59AB3BBC4241238BB28A18",
            "l1LockedHeight": 1337,
            "appHash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
        },
        "txs": ["DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF"]
    }, ...
    ]
}
```
---
### Blocks
Return all blocks with pagination info
* `limit` cannot be more then 100
* `page` cannot be less then 1
```
GET /blocks?epoch_index_min=1000&epoch_index_max=1200&height_min=2000&height_max=4000&gas_min=1&gas_max=99999999999&timestamp_start=2024-08-29T23:24:11.516z&timestamp_end=2025-08-29T23:24:11.516z&tx_count_min=2&tx_count_max=11&validator=C11C1168DCF9479475CB1355855E30EA75C0CDDA8A8F9EA80591568DD1C33BA8

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
* `page` cannot be less then 1
```
GET /validators

{
  "resultSet": [
    {
      "proTxHash": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
      "isActive": true,
      "proposedBlocksAmount": 5,
      "lastProposedBlockHeader": {
        "height": 5,
        "timestamp": "2024-06-23T13:51:44.154Z",
        "hash": "7253F441FF6AEAC847F9E03672B9386E35FC8CBCFC4A7CC67557FCA10E342904",
        "l1LockedHeight": 1337,
        "appVersion": 1,
        "blockVersion": 13
        "validator": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
        "appHash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
      },
      "proTxInfo": {
        "type": "Evo",
        "collateralAddress": "6ce8545e25d4f03aba1527062d9583ae01827c65b234bd979aca5954c6ae3a59",
        "collateralAddress": 19,
        "collateralAddress": "yYK3Kiq36Xmf1ButkTUYb1iCNtJfSSM4KH",
        "operatorReward": 0,
        "confirmations": 214424,
        "state": {
            "version": 2,
            "service": "35.164.23.245:19999",
            "registeredHeight": 850334,
            "lastPaidHeight": 1064721,
            "consecutivePayments": 0,
            "PoSePenalty": 0,
            "PoSeRevivedHeight": 1027671,
            "PoSeBanHeight": -1,
            "revocationReason": 0,
            "ownerAddress": "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
            "votingAddress": "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
            "platformNodeID": "b5f25f8f70cf8d05c2d2970bdf186c994431d84e",
            "platformP2PPort": 36656,
            "platformHTTPPort": 1443,
            "payoutAddress": "yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A",
            "pubKeyOperator": "b928fa4e127214ccb2b5de1660b5e371d2f3c9845077bc3900fc6aabe82ddd2e61530be3765cea15752e30fc761ab730"
        }
      },
      "identity": "8tsWRSwsTM5AXv4ViCF9gu39kzjbtfFDM6rCyL2RcFzd",
      "identityBalance": 0,
      "epochInfo": {
        "number": 1982,
        "firstBlockHeight": 31976,
        "firstCoreBlockHeight": 1118131,
        "startTime": 1728488466559,
        "feeMultiplier": 1,
        "endTime": 1728492066559
      },
      "totalReward": null,
      "epochReward": null,
      "withdrawalsCount": null,
      "lastWithdrawal": null,
      "lastWithdrawalTime": null,
      "endpoints": null
    }, ...
  ],
  "pagination": { 
    "page": 1, 
    "limit": 10, 
    "total": 30 
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
  "proTxHash": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
  "isActive": true,
  "proposedBlocksAmount": 5,
  "lastProposedBlockHeader": {
    "height": 5,
    "timestamp": "2024-06-23T13:51:44.154Z",
    "hash": "7253F441FF6AEAC847F9E03672B9386E35FC8CBCFC4A7CC67557FCA10E342904",
    "l1LockedHeight": 1337,
    "appVersion": 1,
    "blockVersion": 13,
    "validator": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
    "appHash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
  },
  "proTxInfo": {
    "type": "Evo",
    "collateralAddress": "6ce8545e25d4f03aba1527062d9583ae01827c65b234bd979aca5954c6ae3a59",
    "collateralAddress": 19,
    "collateralAddress": "yYK3Kiq36Xmf1ButkTUYb1iCNtJfSSM4KH",
    "operatorReward": 0,
    "confirmations": 214424,
    "state": {
      "version": 2,
      "service": "35.164.23.245:19999",
      "registeredHeight": 850334,
      "lastPaidHeight": 1064721,
      "consecutivePayments": 0,
      "PoSePenalty": 0,
      "PoSeRevivedHeight": 1027671,
      "PoSeBanHeight": -1,
      "revocationReason": 0,
      "ownerAddress": "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
      "votingAddress": "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
      "platformNodeID": "b5f25f8f70cf8d05c2d2970bdf186c994431d84e",
      "platformP2PPort": 36656,
      "platformHTTPPort": 1443,
      "payoutAddress": "yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A",
      "pubKeyOperator": "b928fa4e127214ccb2b5de1660b5e371d2f3c9845077bc3900fc6aabe82ddd2e61530be3765cea15752e30fc761ab730",
    }
  },
  "identity": "8tsWRSwsTM5AXv4ViCF9gu39kzjbtfFDM6rCyL2RcFzd",
  "identityBalance": 0,
  "epochInfo": {
    "number": 1982,
    "firstBlockHeight": 31976,
    "firstCoreBlockHeight": 1118131,
    "startTime": 1728488466559,
    "feeMultiplier": 1,
    "endTime": 1728492066559
  },
  "totalReward": 0,
  "epochReward": 0,
  "withdrawalsCount": 1,
  "lastWithdrawal": "01FE1F00379C66C6E3BFD81A088E57E17613EC36E4FF812458535A8ABCB84047",
  "lastWithdrawalTime": "2024-10-12T03:15:19.257Z",
  "endpoints": {
    "coreP2PPortStatus": {
      "host": '52.33.28.41',
      "port": 19999,
      "status": 'ERROR',
      "message": null
    },
    "platformP2PPortStatus": {
      "host": '52.33.28.41',
      "port": 36656,
      "status": 'ERROR',
      "message": null
    },
    "platformGrpcPortStatus": {
      "host": '52.33.28.41',
      "port": 1443,
      "status": 'ERROR',
      "message": null
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
  "proTxHash": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
  "isActive": true,
  "proposedBlocksAmount": 5,
  "lastProposedBlockHeader": {
    "height": 5,
    "timestamp": "2024-06-23T13:51:44.154Z",
    "hash": "7253F441FF6AEAC847F9E03672B9386E35FC8CBCFC4A7CC67557FCA10E342904",
    "l1LockedHeight": 1337,
    "appVersion": 1,
    "blockVersion": 13,
    "validator": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
    "appHash": "49C07BEDB5710565CFC82F678DEB4849D2CA1CCD3DFBA6FDA3F1C0F3C39D0AD9"
  },
  "proTxInfo": {
    "type": "Evo",
    "collateralAddress": "6ce8545e25d4f03aba1527062d9583ae01827c65b234bd979aca5954c6ae3a59",
    "collateralAddress": 19,
    "collateralAddress": "yYK3Kiq36Xmf1ButkTUYb1iCNtJfSSM4KH",
    "operatorReward": 0,
    "confirmations": 214424,
    "state": {
      "version": 2,
      "service": "35.164.23.245:19999",
      "registeredHeight": 850334,
      "lastPaidHeight": 1064721,
      "consecutivePayments": 0,
      "PoSePenalty": 0,
      "PoSeRevivedHeight": 1027671,
      "PoSeBanHeight": -1,
      "revocationReason": 0,
      "ownerAddress": "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
      "votingAddress": "yWrbg8HNwkogZfqKe1VW8czS9KiqdjvJtE",
      "platformNodeID": "b5f25f8f70cf8d05c2d2970bdf186c994431d84e",
      "platformP2PPort": 36656,
      "platformHTTPPort": 1443,
      "payoutAddress": "yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A",
      "pubKeyOperator": "b928fa4e127214ccb2b5de1660b5e371d2f3c9845077bc3900fc6aabe82ddd2e61530be3765cea15752e30fc761ab730",
    }
  },
  "identity": "8tsWRSwsTM5AXv4ViCF9gu39kzjbtfFDM6rCyL2RcFzd",
  "identityBalance": 0,
  "epochInfo": {
    "number": 1982,
    "firstBlockHeight": 31976,
    "firstCoreBlockHeight": 1118131,
    "startTime": 1728488466559,
    "feeMultiplier": 1,
    "endTime": 1728492066559
  },
  "totalReward": 0,
  "epochReward": 0,
  "withdrawalsCount": 1,
  "lastWithdrawal": "01FE1F00379C66C6E3BFD81A088E57E17613EC36E4FF812458535A8ABCB84047",
  "lastWithdrawalTime": "2024-10-12T03:15:19.257Z",
  "endpoints": {
    "coreP2PPortStatus": {
      "host": '52.33.28.41',
      "port": 19999,
      "status": 'ERROR',
      "message": null
    },
    "platformP2PPortStatus": {
      "host": '52.33.28.41',
      "port": 36656,
      "status": 'ERROR',
      "message": null
    },
    "platformGrpcPortStatus": {
      "host": '52.33.28.41',
      "port": 1443,
      "status": 'ERROR',
      "message": null
    }
  }
}
```
---
### Validator rewards stats by ProTxHash
Return a series data for the reward from proposed blocks by validator chart with

* `timestamp_start` lower interval threshold in ISO string
* `timestamp_end` upper interval threshold in ISO string
* `intervalsCount` intervals count in response ( _optional_ )

```
GET /validator/F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0/rewards/stats?timestamp_start=2024-01-01T00:00:00&timestamp_end=2025-01-01T00:00:00
[
    {
        "timestamp": "2024-06-23T13:51:44.154Z",
        "data": {
            "reward": 34000000
        }
    },...
]
```
---
### Validator stats by ProTxHash
Return a series data for the amount of proposed blocks by validator chart with

* `timestamp_start` lower interval threshold in ISO string
* `timestamp_end` upper interval threshold in ISO string
* `intervalsCount` intervals count in response ( _optional_ )

```
GET /validator/F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0/stats?timestamp_start=2024-01-01T00:00:00&timestamp_end=2025-01-01T00:00:00
[
    {
        "timestamp": "2024-06-23T13:51:44.154Z",
        "data": {
            "blocksCount": 2
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
    "blockHash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
    "blockHeight": 1337,
    "data": "{}",
    "hash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
    "index": 0,
    "timestamp": "2024-03-18T10:13:54.150Z",
    "type": 0,
    "gasUsed": 1337000,
    "status": "SUCCESS",
    "error": null,
    "owner": {
      "identifier": "6q9RFbeea73tE31LGMBLFZhtBUX3wZL3TcNynqE18Zgs",
      "aliases": [
        {
          "alias": "alias.dash",
          "status": "locked",
          "contested": true,
          "timestamp": "2024-08-26 13:29:44.606+00",
          "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
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
* `page` cannot be less then 1
* `owner` Identity identifier
* `status` can be `SUCCESS`, `FAIL` or `ALL`
* `transaction_type` number or string of tx type. Can be set multiple times
* `batch_type` number or string of batch type. Can be set multiple times.
* `gas_min` number of min `gas_used`
* `gas_max` number of max `gas_used`
* `timestamp_start` must be used with `timestamp_end`
* `timestamp_end` must be used with `timestamp_start`
* Valid `order_by` values are `id`, `gas_used`, `timestamp` or `owner`

| Batch type string                   | Batch type number |
|:------------------------------------|:------------------|
| DOCUMENT_CREATE                     | 0                 |
| DOCUMENT_REPLACE                    | 1                 |
| DOCUMENT_DELETE                     | 2                 |
| DOCUMENT_TRANSFER                   | 3                 |
| DOCUMENT_UPDATE_PRICE               | 4                 |
| DOCUMENT_PURCHASE                   | 5                 |
| TOKEN_BURN                          | 6                 |
| TOKEN_MINT                          | 7                 |
| TOKEN_TRANSFER                      | 8                 |
| TOKEN_FREEZE                        | 9                 |
| TOKEN_UNFREEZE                      | 10                |
| TOKEN_DESTROY_FROZEN_FUNDS          | 11                |
| TOKEN_CLAIM                         | 12                |
| TOKEN_EMERGENCY_ACTION              | 13                |
| TOKEN_CONFIG_UPDATE                 | 14                |
| TOKEN_DIRECT_PURCHASE               | 15                |
| TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE | 16                |

```
GET /transactions?=1&limit=10&orderBy=id&order=asc&owner=6q9RFbeea73tE31LGMBLFZhtBUX3wZL3TcNynqE18Zgs&transaction_type=0&transaction_type=1&status=ALL&gas_min=0&gas_max=9999999

{
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 10
    },
    "resultSet": [
      {
            "hash": "845E3D4FADDE4A439D433FAA8D347DF0C8AA90D03BF3C0DC798C7162AB3E8A09",
            "index": 0,
            "blockHash": "890AB057D3E0589ECCFE39B99159D3C7B78B7523A0BBD0B8CC44458A22F677FD",
            "blockHeight": 153886,
            "type": "BATCH",
            "batchType": "TOKEN_DESTROY",
            "data": "AgG5BZwAg32+HPkczu8vW/+JvgoxqyypH+IC1KWlLtXX+AEBBQAACwCbiMtpA6d+vzAtw94GNRJHq4fwB34qQQEzrXqSVfZAWzrS4mQNCYzn5pR3R9NTjxQS7yJebl2ShErW4h/ObaL5AIu9OaYYa3jGyt5B+ApYhRzbdO4bGGL5ra2piVS3+dt/AAABQR8jZTTmxLRVrsT2jkPynIbzGNAXctI4fqn+bE2zzLXOcm3tDePi/tnfctTUtQ4CsJYwG3l411apgtMwVYVb/Qb2",
            "timestamp": "2025-07-15T14:42:41.156Z",
            "gasUsed": 1040160,
            "status": "FAIL",
            "error": "Identity AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW account is not frozen for token 4xd9usiX6WCPE4h1AFPQBJ4Rje6TfZw8kiBzkSAzvmCL. Action attempted: destroy_frozen_funds",
            "owner": {
                "identifier": "DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD",
                "aliases": []
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
* `topIdentity` - identity with the largest number of documents

```
GET /dataContract/HzMke6E5SnSqLdCX1u3WdwpWx1hFFkSnFQpahTPdYUSF

{
    "identifier": "HzMke6E5SnSqLdCX1u3WdwpWx1hFFkSnFQpahTPdYUSF",
    "name": null,
    "owner": {
        "identifier": "DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD",
        "aliases": []
    },
    "schema": "{}",
    "version": 1,
    "txHash": "A26C97F3F5C8C52E6635E7547FE08C7C159ACE7D8BEE6A649E714B7A8E854F55",
    "timestamp": "2025-07-31T07:31:37.624Z",
    "isSystem": false,
    "documentsCount": 0,
    "topIdentity": {
        "identifier": null,
        "aliases": []
    },
    "identitiesInteracted": 0,
    "totalGasUsed": 30124352540,
    "averageGasUsed": 30124352540,
    "groups": [
        {
            "position": 0,
            "members": {
                "35SD29sWhmKEeQt1h87B2yXQVvBPDhevUYeubpAwGEow": 1,
                "AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW": 1,
                "CuG7FxrSwt35A6SpEqqLn5RTNNwuxeN6kJ3JBof8QdPz": 1,
                "DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD": 1
            },
            "requiredPower": 2
        }
    ],
    "tokens": [
        {
            "identifier": "9itsUTJYiiroLNSyr3Nrmiyd9gdk7X9HH22bSew9dmrF",
            "position": 0,
            "timestamp": null,
            "description": null,
            "localizations": {
                "en": {
                    "pluralForm": "A1-mint-grps",
                    "singularForm": "A1-mint-grp",
                    "shouldCapitalize": true
                }
            },
            "baseSupply": "1000000000",
            "totalSupply": "1000102300",
            "maxSupply": "20000000000",
            "owner": {
                "identifier": "DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD",
                "aliases": []
            },
            "mintable": true,
            "burnable": true,
            "freezable": true,
            "unfreezable": true,
            "destroyable": true,
            "allowedEmergencyActions": true,
            "dataContractIdentifier": "HzMke6E5SnSqLdCX1u3WdwpWx1hFFkSnFQpahTPdYUSF",
            "changeMaxSupply": true,
            "distributionType": null,
            "totalGasUsed": null,
            "mainGroup": 0,
            "totalTransitionsCount": null,
            "totalFreezeTransitionsCount": null,
            "totalBurnTransitionsCount": null,
            "decimals": 4
        }
    ]
}
```
Response codes:
```
200: OK
404: Not found
500: Internal Server Error
```
---
### RAW Data Contract by Identifier
Return raw base64 data contract from dpp

```
GET /dataContract/6hVQW16jyvZyGSQk2YVty4ND6bgFXozizYWnPt753uW5/raw

{
    "base64": "AFSpyOpeUrxGdPgqZwWB5c2Lwlk5O8Mn0bV/hUjj3HT2AAAAAAABAQAAAvSPZWjyiqAx4cW2gLlcoXK8zI3nJech+VU74QHIqJk3AAEHdG9ycmVudBYEEgR0eXBlEgZvYmplY3QSCHJlcXVpcmVkFQISCiRjcmVhdGVkQXQSCiR1cGRhdGVkQXQSCnByb3BlcnRpZXMWAxIEbmFtZRYFEgR0eXBlEgZzdHJpbmcSCHBvc2l0aW9uAgESCW1heExlbmd0aAKgEgltaW5MZW5ndGgCBhILZGVzY3JpcHRpb24SH05hbWUgb2YgdGhlIGRpc3RyaWJ1dGVkIHRvcnJlbnQSBm1hZ25ldBYFEgR0eXBlEgZzdHJpbmcSCHBvc2l0aW9uAgASCW1heExlbmd0aAL7A+gSCW1pbkxlbmd0aAIQEgtkZXNjcmlwdGlvbhIoTWFnbmV0IGxpbmtzIHVzZWQgaW4gQml0VG9ycmVudCBwcm90b2NvbBILZGVzY3JpcHRpb24WBRIEdHlwZRIGc3RyaW5nEghwb3NpdGlvbgICEgltYXhMZW5ndGgCoBIJbWluTGVuZ3RoAhASC2Rlc2NyaXB0aW9uEiREZXNjcmlwdGlvbiBmb3IgYSBnaXZlbiB0b3JyZW50IGZpbGUSFGFkZGl0aW9uYWxQcm9wZXJ0aWVzEwA="
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
* `page` cannot be less then 1

```
GET /dataContracts?page=1&limit=10&order=asc&order_by=block_height

{
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 10
    },
    "resultSet": [
    {
        "identifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        "name": "DPNS",
        "owner": "4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF",
        "schema": "{}",
        "version": 0,
        "txHash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        "timestamp": "2024-03-18T10:13:54.150Z",
        "isSystem": false,
        "documentsCount": 1337
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
### Data Contract Transactions
Return set of transactions for data contract

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1

```
GET /dataContract/AJqYb8ZvfbA6ZFgpsvLfpMEzwjaYUPyVmeFxSJrafB18/transactions

{
  "resultSet": [
    {
      "type": "DATA_CONTRACT_CREATE",
      "action": null,
      "owner": {
        "identifier": "GgZekwh38XcWQTyWWWvmw6CEYFnLU7yiZFPWZEjqKHit",
        "aliases": [
        {
          "alias": "Tutorial-Test-000000.dash",
          "status": "ok",
          "contested": false,
          "timestamp": null,
          "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
        },
        {
          "alias": "Tutorial-Test-000000-backup.dash",
          "status": "ok",
          "contested": false,
          "timestamp": null,
          "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
        }
      ],
      }
      "timestamp": "2024-08-26T13:30:22.211Z",
      "gasUsed": 32230560,
      "error": null,
      "hash": "5FBEE4EC0030159C5D25D0C3DEC3AB894ED0DC89B07BEAFAF8A1BE1E3EFCCC10"
    },
    {
        "type": "BATCH",
        "action": [
            {
                "documentAction": "Replace",
                "tokenAction": null,
                "documentIdentifier": "AeUwXZc3TsLTvtmiSFcnWpp4jjDPAv66kjh7AiRoRECh",
                "tokenIdentifier": null,
                "recipient": null,
                "price": null,
                "amount": null
            }
        ],
        "owner": {
            "identifier": "7Yowk46VwwHqmD5yZyyygggh937aP6h2UW7aQWBdWpM5",
            "aliases": [
                {
                    "alias": "my-unit-test-3.dash",
                    "status": "ok",
                    "timestamp": "2024-08-30T18:26:03.394Z",
                    "documentId": "2qsGt3eFi7xsr35ToAa51XEshk9bM7AsRcuuaWz7zTNP",
                    "contested": false
                }
            ]
        },
        "timestamp": "2024-08-25T16:46:41.370Z",
        "gasUsed": 18096920,
        "error": null,
        "hash": "E26EF4624CBC1DC3A3FFC643FC41218D528D0262D6940B21FF8DC7E82AA0AA3D"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6
  }
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
---
### Data Contracts Rating
Return Data Contracts rating based on txs in selected interval

If it is not possible to get data contract transitions for selected period,
then will be returned list of data contracts in order of creation date

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
* `timestamp_start` and `timestamp_end` can be null and `timestamp_end` must be greater then `timestamp_start` if they are used. Default value is equal to the interval in the past 30 days

```
GET /dataContracts/rating?timestamp_start=2025-08-18T21:13:57.191Z&timestamp_end=2025-09-18T21:13:57.191Z&limit=5&page=2&order=desc

{
    "resultSet": [
        {
            "identifier": "465jdPpFCZefhb4g2k2FpCcrKpPYhJJskDqbGFsKu6wb",
            "transitionsCount": 26
        },
        {
            "identifier": "GWghYQoDFEb3osEfigrF7CKdZLWauxC7TwM4jsJyqa23",
            "transitionsCount": 21
        },
        {
            "identifier": "4P7d1iqwofPA1gFtbEcXiagDnANXAQhX2WZararioX8f",
            "transitionsCount": 17
        },
        {
            "identifier": "Bwr4WHCPz5rFVAD87RqTs3izo4zpzwsEdKPWUT1NS1C7",
            "transitionsCount": 13
        },
        {
            "identifier": "dfaPU4HsMpUX7NMF2TR5oeAC4cZvLwYrSU6WT4884bq",
            "transitionsCount": 9
        }
    ],
    "pagination": {
        "page": 2,
        "limit": 5,
        "total": 116
    }
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
  "identifier": "47JuExXJrZaG3dLfrL2gnAH8zhYh6z9VutF8NvgRQbQJ",
  "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
  "revision": 1,
  "txHash": "5CA1D01931D7C236194D3364D410946FAF6C12FDC0FB56DB3B05ADB881B43B1A",
  "deleted": false,
  "data": {"saltedDomainHash":"DcKS9AWVE1atKvIokA7JNdUNmyj4SbFUvB6e83whw2g="},
  "timestamp": "2024-12-27T14:31:00.798Z",
  "isSystem": false,
  "entropy": "7beffbed25071ab26c0c7c50b3bab098f42126f2a91f9355f492a2d83beb74aa",
  "prefundedVotingBalance": {
    "parentNameAndLabel": 20000000000
  },
  "typeName": "preorder",
  "gasUsed": null,
  "totalGasUsed": 15999780,
  "identityContractNonce": null,
  "groups": null,
  "owner": {
    "identifier": "BHAuKDRVPHkJd99pLoQh8dfjUFobwk5bq6enubEBKpsv",
    "aliases": [
      {
        "alias": "User-777.dash",
        "status": "ok",
        "contested": false,
        "timestamp": null,
        "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
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
### RAW Document by Identifier
Return raw document from dapi in base64

* `document_type_name` required
* `contract_id` required
```
GET /document/9eCqy4HPK1bqMZSVJvX6DvF78YNknczLrjNoccyiZfdF/raw?document_type_name=preorder&contract_id=GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec

{
    "base64": "AADmaMZZr2au4ecsGG3ee1t+Ch1xKgnEDVch9iK/U8UxVQAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBmRvbWFpbhYLEgR0eXBlEgZvYmplY3QSB2luZGljZXMVAhYEEgRuYW1lEhJwYXJlbnROYW1lQW5kTGFiZWwSBnVuaXF1ZRMBEgljb250ZXN0ZWQWAxIKcmVzb2x1dGlvbgIAEgtkZXNjcmlwdGlvbhKqSWYgdGhlIG5vcm1hbGl6ZWQgbGFiZWwgcGFydCBvZiB0aGlzIGluZGV4IGlzIGxlc3MgdGhhbiAyMCBjaGFyYWN0ZXJzIChhbGwgYWxwaGFiZXQgYS16LCBBLVosIDAsIDEsIGFuZCAtKSB0aGVuIGEgbWFzdGVybm9kZSB2b3RlIGNvbnRlc3QgdGFrZXMgcGxhY2UgdG8gZ2l2ZSBvdXQgdGhlIG5hbWUSDGZpZWxkTWF0Y2hlcxUBFgISBWZpZWxkEg9ub3JtYWxpemVkTGFiZWwSDHJlZ2V4UGF0dGVybhITXlthLXpBLVowMS1dezMsMTl9JBIKcHJvcGVydGllcxUCFgESGm5vcm1hbGl6ZWRQYXJlbnREb21haW5OYW1lEgNhc2MWARIPbm9ybWFsaXplZExhYmVsEgNhc2MWAxIEbmFtZRIKaWRlbnRpdHlJZBIKcHJvcGVydGllcxUBFgESEHJlY29yZHMuaWRlbnRpdHkSA2FzYxIObnVsbFNlYXJjaGFibGUTABIIJGNvbW1lbnQS+wE3SW4gb3JkZXIgdG8gcmVnaXN0ZXIgYSBkb21haW4geW91IG5lZWQgdG8gY3JlYXRlIGEgcHJlb3JkZXIuIFRoZSBwcmVvcmRlciBzdGVwIGlzIG5lZWRlZCB0byBwcmV2ZW50IG1hbi1pbi10aGUtbWlkZGxlIGF0dGFja3MuIG5vcm1hbGl6ZWRMYWJlbCArICcuJyArIG5vcm1hbGl6ZWRQYXJlbnREb21haW4gbXVzdCBub3QgYmUgbG9uZ2VyIHRoYW4gMjUzIGNoYXJzIGxlbmd0aCBhcyBkZWZpbmVkIGJ5IFJGQyAxMDM1LiBEb21haW4gZG9jdW1lbnRzIGFyZSBpbW11dGFibGU6IG1vZGlmaWNhdGlvbiBhbmQgZGVsZXRpb24gYXJlIHJlc3RyaWN0ZWQSCHJlcXVpcmVkFQkSCiRjcmVhdGVkQXQSCiR1cGRhdGVkQXQSDiR0cmFuc2ZlcnJlZEF0EgVsYWJlbBIPbm9ybWFsaXplZExhYmVsEhpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIMcHJlb3JkZXJTYWx0EgdyZWNvcmRzEg5zdWJkb21haW5SdWxlcxIJdHJhZGVNb2RlAgESCXRyYW5zaWVudBUBEgxwcmVvcmRlclNhbHQSCnByb3BlcnRpZXMWBxIFbGFiZWwWBhIEdHlwZRIGc3RyaW5nEgdwYXR0ZXJuEipeW2EtekEtWjAtOV1bYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSQSCHBvc2l0aW9uAgASCW1heExlbmd0aAI/EgltaW5MZW5ndGgCAxILZGVzY3JpcHRpb24SGURvbWFpbiBsYWJlbC4gZS5nLiAnQm9iJy4SB3JlY29yZHMWBRIEdHlwZRIGb2JqZWN0Eghwb3NpdGlvbgIFEgpwcm9wZXJ0aWVzFgESCGlkZW50aXR5FgcSBHR5cGUSBWFycmF5EghtYXhJdGVtcwIgEghtaW5JdGVtcwIgEghwb3NpdGlvbgIBEglieXRlQXJyYXkTARILZGVzY3JpcHRpb24SMUlkZW50aWZpZXIgbmFtZSByZWNvcmQgdGhhdCByZWZlcnMgdG8gYW4gSWRlbnRpdHkSEGNvbnRlbnRNZWRpYVR5cGUSIWFwcGxpY2F0aW9uL3guZGFzaC5kcHAuaWRlbnRpZmllchINbWluUHJvcGVydGllcwIBEhRhZGRpdGlvbmFsUHJvcGVydGllcxMAEgxwcmVvcmRlclNhbHQWBhIEdHlwZRIFYXJyYXkSCG1heEl0ZW1zAiASCG1pbkl0ZW1zAiASCHBvc2l0aW9uAgQSCWJ5dGVBcnJheRMBEgtkZXNjcmlwdGlvbhIiU2FsdCB1c2VkIGluIHRoZSBwcmVvcmRlciBkb2N1bWVudBIOc3ViZG9tYWluUnVsZXMWBhIEdHlwZRIGb2JqZWN0Eghwb3NpdGlvbgIGEghyZXF1aXJlZBUBEg9hbGxvd1N1YmRvbWFpbnMSCnByb3BlcnRpZXMWARIPYWxsb3dTdWJkb21haW5zFgQSBHR5cGUSB2Jvb2xlYW4SCCRjb21tZW50Ek9Pbmx5IHRoZSBkb21haW4gb3duZXIgaXMgYWxsb3dlZCB0byBjcmVhdGUgc3ViZG9tYWlucyBmb3Igbm9uIHRvcC1sZXZlbCBkb21haW5zEghwb3NpdGlvbgIAEgtkZXNjcmlwdGlvbhJbVGhpcyBvcHRpb24gZGVmaW5lcyB3aG8gY2FuIGNyZWF0ZSBzdWJkb21haW5zOiB0cnVlIC0gYW55b25lOyBmYWxzZSAtIG9ubHkgdGhlIGRvbWFpbiBvd25lchILZGVzY3JpcHRpb24SQlN1YmRvbWFpbiBydWxlcyBhbGxvdyBkb21haW4gb3duZXJzIHRvIGRlZmluZSBydWxlcyBmb3Igc3ViZG9tYWlucxIUYWRkaXRpb25hbFByb3BlcnRpZXMTABIPbm9ybWFsaXplZExhYmVsFgYSBHR5cGUSBnN0cmluZxIHcGF0dGVybhI8XlthLWhqLWttLW5wLXowLTldW2EtaGota20tbnAtejAtOS1dezAsNjF9W2EtaGota20tbnAtejAtOV0kEggkY29tbWVudBJcTXVzdCBiZSBlcXVhbCB0byB0aGUgbGFiZWwgaW4gbG93ZXJjYXNlLiAibyIsICJpIiBhbmQgImwiIG11c3QgYmUgcmVwbGFjZWQgd2l0aCAiMCIgYW5kICIxIi4SCHBvc2l0aW9uAgESCW1heExlbmd0aAI/EgtkZXNjcmlwdGlvbhKjRG9tYWluIGxhYmVsIGNvbnZlcnRlZCB0byBsb3dlcmNhc2UgZm9yIGNhc2UtaW5zZW5zaXRpdmUgdW5pcXVlbmVzcyB2YWxpZGF0aW9uLiAibyIsICJpIiBhbmQgImwiIHJlcGxhY2VkIHdpdGggIjAiIGFuZCAiMSIgdG8gbWl0aWdhdGUgaG9tb2dyYXBoIGF0dGFjay4gZS5nLiAnYjBiJxIQcGFyZW50RG9tYWluTmFtZRYGEgR0eXBlEgZzdHJpbmcSB3BhdHRlcm4SLV4kfF5bYS16QS1aMC05XVthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldJBIIcG9zaXRpb24CAhIJbWF4TGVuZ3RoAj8SCW1pbkxlbmd0aAIAEgtkZXNjcmlwdGlvbhInQSBmdWxsIHBhcmVudCBkb21haW4gbmFtZS4gZS5nLiAnZGFzaCcuEhpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRYHEgR0eXBlEgZzdHJpbmcSB3BhdHRlcm4SQV4kfF5bYS1oai1rbS1ucC16MC05XVthLWhqLWttLW5wLXowLTktXC5dezAsNjF9W2EtaGota20tbnAtejAtOV0kEggkY29tbWVudBLATXVzdCBlaXRoZXIgYmUgZXF1YWwgdG8gYW4gZXhpc3RpbmcgZG9tYWluIG9yIGVtcHR5IHRvIGNyZWF0ZSBhIHRvcCBsZXZlbCBkb21haW4uICJvIiwgImkiIGFuZCAibCIgbXVzdCBiZSByZXBsYWNlZCB3aXRoICIwIiBhbmQgIjEiLiBPbmx5IHRoZSBkYXRhIGNvbnRyYWN0IG93bmVyIGNhbiBjcmVhdGUgdG9wIGxldmVsIGRvbWFpbnMuEghwb3NpdGlvbgIDEgltYXhMZW5ndGgCPxIJbWluTGVuZ3RoAgASC2Rlc2NyaXB0aW9uEqJBIHBhcmVudCBkb21haW4gbmFtZSBpbiBsb3dlcmNhc2UgZm9yIGNhc2UtaW5zZW5zaXRpdmUgdW5pcXVlbmVzcyB2YWxpZGF0aW9uLiAibyIsICJpIiBhbmQgImwiIHJlcGxhY2VkIHdpdGggIjAiIGFuZCAiMSIgdG8gbWl0aWdhdGUgaG9tb2dyYXBoIGF0dGFjay4gZS5nLiAnZGFzaCcSDGNhbkJlRGVsZXRlZBMBEgx0cmFuc2ZlcmFibGUCARIQZG9jdW1lbnRzTXV0YWJsZRMAEhRhZGRpdGlvbmFsUHJvcGVydGllcxMACHByZW9yZGVyFggSBHR5cGUSBm9iamVjdBIHaW5kaWNlcxUBFgMSBG5hbWUSCnNhbHRlZEhhc2gSBnVuaXF1ZRMBEgpwcm9wZXJ0aWVzFQEWARIQc2FsdGVkRG9tYWluSGFzaBIDYXNjEggkY29tbWVudBJKUHJlb3JkZXIgZG9jdW1lbnRzIGFyZSBpbW11dGFibGU6IG1vZGlmaWNhdGlvbiBhbmQgZGVsZXRpb24gYXJlIHJlc3RyaWN0ZWQSCHJlcXVpcmVkFQESEHNhbHRlZERvbWFpbkhhc2gSCnByb3BlcnRpZXMWARIQc2FsdGVkRG9tYWluSGFzaBYGEgR0eXBlEgVhcnJheRIIbWF4SXRlbXMCIBIIbWluSXRlbXMCIBIIcG9zaXRpb24CABIJYnl0ZUFycmF5EwESC2Rlc2NyaXB0aW9uEllEb3VibGUgc2hhLTI1NiBvZiB0aGUgY29uY2F0ZW5hdGlvbiBvZiBhIDMyIGJ5dGUgcmFuZG9tIHNhbHQgYW5kIGEgbm9ybWFsaXplZCBkb21haW4gbmFtZRIMY2FuQmVEZWxldGVkEwESEGRvY3VtZW50c011dGFibGUTABIUYWRkaXRpb25hbFByb3BlcnRpZXMTAAhwcmVvcmRlcgCAZWCvzw8hJFXtR5FzadoUU5o4+eebw+8vHW4FWMjNXlaf1PYWs97ey+75U1LPOPH7BNIyoNIGI7wZWww/chhAAACXCdoaj7/2gVG0qlOq38PqicCzWg4JrUrIpk1zwzifOQ=="
}
```
Response codes:
```
200: OK
404: Not found
500: Internal Server Error
```
---
### Document Revisions
Return revisions for selected document

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1

```
GET /document/5Quf1y4GrqygGLLUwNHntxHBCguvUiVaMv2kWh7HNFAd/revisions

{
  "resultSet": [
    {
      "identifier": "5Quf1y4GrqygGLLUwNHntxHBCguvUiVaMv2kWh7HNFAd",
      "dataContractIdentifier": null,
      "revision": 1,
      "txHash": "16912FC4819DD2F8BA77ADFBC44D44908C5EBC572F735796C61CF18181888437",
      "deleted": null,
      "data": "{\"name\":\"djblackog - beat99\",\"magnet\":\"magnet:?xt=urn:btih:83d167c53b937663500f2568122efa9b6588d2c3&dn=beat99.mp3\",\"description\":\"hip hop beat using quincy jones tell me a bedtime story sample 85bpm\"}",
      "timestamp": "2025-03-05T12:59:36.264Z",
      "system": null,
      "entropy": "3627d6398617e9bd6e7a14a10f7a5dd8b1ed458d9f0df38eb69cb67a30075aa3",
      "prefundedVotingBalance": null,
      "documentTypeName": null,
      "transitionType": "DOCUMENT_CREATE",
      "identityContractNonce": "2",
      "gasUsed": 15048420,
      "totalGasUsed": null,
      "owner": {
        "identifier": "HTfJKDuW8omFfFrSQuNTkgW39WpncdwFUrL91VJyJXUS",
        "aliases": []
      }
    },
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
404: Not found
500: Internal Server Error
```
---
### Documents by Data Contract
Return all documents by the given data contract identifier
* `limit` cannot be more then 100
* `page` cannot be less then 1
* `document_type_name` optional
```
GET /dataContract/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/documents?document_type_name=domain&page=1&limit=10&order=desc

{
  "resultSet": [
    {
      "identifier": "47JuExXJrZaG3dLfrL2gnAH8zhYh6z9VutF8NvgRQbQJ",
      "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
      "revision": 1,
      "txHash": "5CA1D01931D7C236194D3364D410946FAF6C12FDC0FB56DB3B05ADB881B43B1A",
      "deleted": false,
      "data": "{\"label\":\"web\",\"records\":{\"identity\":\"8J8k9aQ5Hotx8oLdnYAhYpyBJJGg4wZALptKLuDE9Df6\"},\"preorderSalt\":\"HVKEY/12WglST1QCqxH9/yJsp8MMb+1GLc8xWw23PCI=\",\"subdomainRules\":{\"allowSubdomains\":false},\"normalizedLabel\":\"web\",\"parentDomainName\":\"dash\",\"normalizedParentDomainName\":\"dash\"}",
      "timestamp": "2024-12-27T14:31:00.798Z",
      "isSystem": false,
      "entropy": null,
      "prefundedVotingBalance": null,
      "typeName": "domain",
      "gasUsed": null,
      "totalGasUsed": null,
      "owner": {
        "identifier": "BHAuKDRVPHkJd99pLoQh8dfjUFobwk5bq6enubEBKpsv",
        "aliases": [
          {
            "alias": "User-777.dash",
            "status": "ok",
            "contested": false,
            "timestamp": null,
            "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
          }
        ]
      }
    }, ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 521
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
GET /identity/3igSMtXaaS9iRQHbWU1w4hHveKdxixwMpgmhLzjVhFZJ

{
  "identifier": "3igSMtXaaS9iRQHbWU1w4hHveKdxixwMpgmhLzjVhFZJ",
  "revision": 0,
  "balance": "49989647300",
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
      "timestamp": "2024-08-26 13:29:44.606+00",
      "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
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
      "keyType": 0,
      "data": "0386067dea94b1cfb23bf252084a2020a4a6712df7e4ac16c211558a1dbb66904a",
      "purpose": 0,
      "securityLevel": 0,
      "readOnly": false,
      "isMaster": true,
      "publicKeyHash": "5501114f5842004d1ff6c7d04512c438afe0cb11",
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
      "status": "ok",
      "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
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
* `page` cannot be less then 1
```
GET /identities?page=1&limit=10&order=asc&order_by=block_height

{
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 10
    },
    "resultSet": [
      {
          "identifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
          "owner": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
          "revision": 1,
          "balance": "1000000",
          "timestamp": "2024-03-18T10:13:54.150Z",
          "txHash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
          "totalTxs": 1,
          "totalTransfers": 0,
          "totalDocuments": 0,
          "totalDataContracts": 0,
          "isSystem": false,
          "aliases": [
            {
              "alias": "alias.dash",
              "status": "locked",
              "contested": true,
              "timestamp": "2024-08-26 13:29:44.606+00",
              "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
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
### Identities history
Return a series data for the amount of registered identities

* `timestamp_start` lower interval threshold in ISO string
* `timestamp_end` upper interval threshold in ISO string
* `intervalsCount` intervals count in response ( _optional_ )

```
GET /identities/history?timestamp_start=2025-09-09T00:00:00.000Z&timestamp_end=2025-09-10T00:00:00.000Z&intervalsCount=3

[
    {
        "timestamp": "2025-09-09T00:00:00.000Z",
        "data": {
            "registeredIdentities": 0,
        }
    },
    {
        "timestamp": "2025-09-09T08:00:00.000Z",
        "data": {
            "registeredIdentities": 26,
        }
    },
    {
        "timestamp": "2025-09-09T16:00:00.000Z",
        "data": {
            "registeredIdentities": 30,
        }
    }
]
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
* `timestamp_start` ISO String
* `start_at` base58 encoded withdrawal document identifier
* returns 404 `not found` if identity don't have withdrawals
* Pagination always `null`
```
GET /identity/A1rgGVjRGuznRThdAA316VEEpKuVQ7mV8mBK1BFJvXnb/withdrawals?limit=5&start_at=95eiiqMotMvH23f6cv3BPC4ykcHFWTy2g3baCTWZANAs&timestamp_start=2024-10-10T02:37:39.187Z

{
  "pagination": {
    "limit": null,
    "page": null,
    "total": null
  },
  "resultSet": [
    {
      "document": "95eiiqMotMvH23f6cv3BPC4ykcHFWTy2g3baCTWZANAs",
      "sender": "A1rgGVjRGuznRThdAA316VEEpKuVQ7mV8mBK1BFJvXnb",
      "status": 3,
      "amount": 200000,
      "timestamp": "2024-10-10T02:37:39.187Z",
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
* `page` cannot be less then 1
```
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/dataContracts?page=1&limit=10&order=asc

{
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 10
    },
    "resultSet": [
    {
        "identifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        "name": "DPNS",
        "owner": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
        "version": 0,
        "schema": null,
        "txHash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        "timestamp": "2024-03-18T10:13:54.150Z",
        "isSystem": false
        "documentsCount": 1337
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
* `page` cannot be less then 1
* `document_type_name` document type name _optional_
```
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/documents?page=1&limit=10&order=asc&document_type_name=preorder

{
  "resultSet": [
    {
      "identifier": "47JuExXJrZaG3dLfrL2gnAH8zhYh6z9VutF8NvgRQbQJ",
      "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
      "revision": 1,
      "txHash": "5CA1D01931D7C236194D3364D410946FAF6C12FDC0FB56DB3B05ADB881B43B1A",
      "deleted": false,
      "data": null,
      "timestamp": "2024-12-27T14:31:00.798Z",
      "isSystem": false,
      "entropy": null,
      "prefundedVotingBalance": null,
      "typeName": "domain",
      "owner": {
        "identifier": "8J8k9aQ5Hotx8oLdnYAhYpyBJJGg4wZALptKLuDE9Df6",
        "aliases": []
      }
    }, ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
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
* `page` cannot be less then 1

```
GET /identity/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/transactions?page=1&limit=10&order=asc

{
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 10
    },
    "resultSet": [
    {
        "hash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
        "index": 0,
        "blockHash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF,
        "blockHeight": 1337,
        "type": "DATA_CONTRACT_CREATE",
        "data": null,
        "timestamp": "2024-03-18T10:13:54.150Z",
        "gasUsed": 1337000,
        "status": "SUCCESS",
        "error": null,
        "owner": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec"
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
* `page` cannot be less then 1
* `type` cannot be less, then 0 and more then 8
```
GET /identity/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/transfers?hash=445E6F081DEE877867816AD3EF492E2C0BD1DDCCDC9C793B23DDDAF8AEA23118&page=1&limit=10&order=asc&type=6

{
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 10
    },
    "resultSet": [
      {
          "amount": 199997000000,
          "sender": null,
          "recipient": "46r7vHmNRHFDAH2xcTdhDDeL4kv5aHemgPLThZgCtqt2",
          "timestamp": "2025-07-30T12:20:11.316Z",
          "txHash": "705C8F9C5010BFA50AC1A05E8E6D54B5F7B2D866ECD0C958BD8B9191CADB02EE",
          "type": "IDENTITY_TOP_UP",
          "blockHash": "10B265FA3B46CEF229A78E6ACE10ABDB168DDD5FFA445079181FA8FD2E77BE3E",
          "gasUsed": 7880180
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
      "power": 1
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
* Blocks
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
* Tokens
  * Full `Identifier`
  * Part `name`

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
        "contested": true,
        "timestamp": "2025-04-18T17:12:13.514Z",
        "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
      }
    },
    {
      "identifier": "5bUPV8KGgL42ZBS9fsmmKU3wweQbVeHHsiVrG3YMHyG5",
      "alias": "xyz.dash",
      "status": {
        "alias": "xyz.dash",
        "status": "locked",
        "contested": true,
        "timestamp": "2025-04-18T17:12:13.514Z",
        "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
      }
    }
  ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
___
### Transactions history
Return a series data for the amount of transactions chart

* `timestamp_start` lower interval threshold in ISO string
* `timestamp_end` upper interval threshold in ISO string
* `intervalsCount` intervals count in response ( _optional_ )

```
GET /transactions/history?timestamp_start=2024-01-01T00:00:00&timestamp_end=2025-01-01T00:00:00
[
    {
        "timestamp": "2024-04-22T08:45:20.911Z",
        "data": {
          "txs": 5
          "blockHeight": 2,
          "blockHash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF"
        }
    },
    {
        "timestamp": "2024-04-22T08:50:20.911Z",
        "data": {
          "txs": 13,
          "blockHeight": 7,
          "blockHash": "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF"
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
___
### Transactions Gas history
Return a series data for the used gas of transactions chart

* `timestamp_start` lower interval threshold in ISO string
* `timestamp_end` upper interval threshold in ISO string
* `intervalsCount` intervals count in response ( _optional_ )

```
GET /transactions/gas/history?timestamp_start=2024-01-01T00:00:00&timestamp_end=2025-01-01T00:00:00
[
    {
        "timestamp": "2024-04-22T08:45:20.911Z",
        "data": {
          "gas": 772831320,
          "blockHeight": 64060,
          "blockHash": "4A1F6B5238032DDAC55009A28797D909DB4288D5B5EC14B86DEC6EA8F25EC71A"
        }
    },
    {
        "timestamp": "2024-04-22T08:50:20.911Z",
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
___
### Votes for Contested Resource
Returns set of votes for selected resource

* `resourceValue` must be specified after `/contested/` in json base64
  * `WyJkYXNoIiwieHl6Il0=` = `'["dash", "xyz"]'`
* `choice` optional
```
GET /contestedResource/WyJkYXNoIiwieHl6Il0=/votes?choice=1&page=1&limit=10&order=asc
{
  "resultSet": [
    {
      "proTxHash": "61d33f478933797be4de88353c7c2d843c21310f6d00f6eff31424a756ee7dfb",
      "txHash": "36011F1807FED828951DAA04B44E38163FB0162108FD1341038DBE58051F4421",
      "voterIdentifier": "8AfS9TuU4gSxyqxUDGNhziNp1RGoCQwa1GqAS8ZBwXjU",
      "choice": 1,
      "timestamp": "2024-10-22T16:35:47.046Z",
      "towardsIdentity": null,
      "identityAliases": [],
      "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
      "documentTypeName": "domain",
      "documentIdentifier": null,
      "indexName": "parentNameAndLabel",
      "indexValues": [
        "dash",
        "xyz"
      ],
      "power": 1
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
400: Invalid input, check start/end values
500: Internal Server Error
```
___
### Contested Resource Value
Return info about contested resource value

* `resourceValue` must be specified after `/contested/` in json base64
  * `WyJkYXNoIiwieHl6Il0=` = `'["dash", "xyz"]'`

```
GET /contestedResource/WyJkYXNoIiwieHl6Il0=
{
  "contenders": [
    {
      "identifier": "36LGwPSXef8q8wpdnx4EdDeVNuqCYNAE9boDu5bxytsm",
      "timestamp": "2024-10-22T15:53:29.063Z",
      "documentIdentifier": "9aEkDDuCDQSm98AXNHGLbrtvHXe4dq1xaoC8wuA9nDn ",
      "documentStateTransition": null,
      "aliases": [
        {
          "alias": "0000-0000-0000-00001.dash",
          "status": "ok",
          "contested": false,
          "timestamp": null,
          "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
        },
        {
          "alias": "xyz.dash",
          "status": "ok",
          "contested": true,
          "timestamp": null,
          "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
        },
        {
          "alias": "000000000000000000.dash",
          "status": "pending",
          "contested": true,
          "timestamp": null
        }
      ],
      "towardsIdentityVotes": 2,
      "abstainVotes": 1,
      "lockVotes": 0
    },
    {
      "identifier": "5bUPV8KGgL42ZBS9fsmmKU3wweQbVeHHsiVrG3YMHyG5",
      "timestamp": "2024-10-22T16:06:01.346Z",
      "documentIdentifier": "Hck3wJDPPdfVCzffCh1xs5WUfBY7hJ3srCvhC7EcytG1",
      "documentStateTransition": null,
      "aliases": [
        {
          "alias": "xyz.dash",
          "status": "locked",
          "contested": true,
          "timestamp": null,
          "txHash": "2508B35FDDB3E2E797D4F2CB9C1FAEE71D4DC43B91CE2043BEC8CE2B4A442DD7"
        }
      ],
      "towardsIdentityVotes": 0,
      "abstainVotes": 1,
      "lockVotes": 2
    }
  ],
  "indexName": "parentNameAndLabel",
  "resourceValue": [
    "dash",
    "xyz"
  ],
  "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
  "prefundedVotingBalance": {
    "parentNameAndLabel": 20000000000
  },
  "documentTypeName": "domain",
  "timestamp": "2024-10-22T16:06:01.346Z",
  "totalGasUsed": 139430280,
  "totalDocumentsGasUsed": 109430280,
  "totalVotesGasUsed": 30000000,
  "totalCountVotes": 3,
  "totalCountLock": 0,
  "totalCountAbstain": 1,
  "totalCountYes": 2,
  "status": "finished",
  "endTimestamp": null
}
```
Response codes:
```
200: OK
400: Invalid input, check start/end values
500: Internal Server Error
```
___
### Contested Resources
Return set of contested resources

* `page` cannot be less than 1
* `limit` cannot be more than 100

```
GET /contestedResources?page=1&limit=10&order=asc

{
    "resultSet": [
        {
            "contenders": null,
            "indexName": "parentNameAndLabel",
            "resourceValue": [
                "dash",
                "test111"
            ],
            "dataContractIdentifier": "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",
            "prefundedVotingBalance": null,
            "documentTypeName": "domain",
            "timestamp": "2024-08-26T22:14:06.680Z",
            "totalGasUsed": null,
            "totalDocumentsGasUsed": null,
            "totalVotesGasUsed": null,
            "totalCountVotes": null,
            "totalCountLock": 0,
            "totalCountAbstain": 0,
            "totalCountTowardsIdentity": 1,
            "status": null,
            "endTimestamp": "2024-09-02T22:14:06.680Z"
        },
        ...
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 195
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
___
### Contested Resources Stats
Return info about stats about resource values

```
GET /contestedResources/stats

{
    "totalContestedResources": 235,
    "totalPendingContestedResources": 3,
    "totalVotesCount": 426,
    "expiringContestedResource": {
        "contenders": null,
        "indexName": null,
        "resourceValue": [
            "dash",
            "t0st010"
        ],
        "dataContractIdentifier": null,
        "prefundedVotingBalance": null,
        "documentTypeName": null,
        "timestamp": "2025-02-12T14:08:55.321Z",
        "totalGasUsed": null,
        "totalDocumentsGasUsed": null,
        "totalVotesGasUsed": null,
        "totalCountVotes": null,
        "totalCountLock": 0,
        "totalCountAbstain": 0,
        "totalCountTowardsIdentity": 0,
        "status": null,
        "endTimestamp": "2025-02-19T14:08:55.321Z"
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
___
### Rate
Return a rate DASH to USD
```
GET /rate
{
    "usd": 24.45,
    "source": "Kucoin"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Decode Raw Transaction
Return a decoded State Transition

Available transactions type for decode

| Transition type              | type index |
|------------------------------|------------|
| `DATA_CONTRACT_CREATE`       | 0          |
| `BATCH`                      | 1          |
| `IDENTITY_CREATE`            | 2          |
| `IDENTITY_TOP_UP`            | 3          |
| `DATA_CONTRACT_UPDATE`       | 4          |
| `IDENTITY_UPDATE`            | 5          |
| `IDENTITY_CREDIT_WITHDRAWAL` | 6          |
| `IDENTITY_CREDIT_TRANSFER`   | 7          |
| `MASTERNODE_VOTE`            | 8          |

- `fundingAddress` can be null
- `prefundedVotingBalance` can be null
- `contractBounds` always null

```
POST /transaction/decode

{
    "base64": "AAAA56Y/VzBp5vlrJR8JRCPSDLlaZjngwyM50w8dQAmAe3EAAAAAAAEBAAABYpzp8+tOQ8j6k24W7FXjqo7zZmMZcybMIDLw7VfLT0EAAQZsYWJsZXIWBBIEdHlwZRIGb2JqZWN0Egpwcm9wZXJ0aWVzFgISCmNvbnRyYWN0SWQWBBIEdHlwZRIGc3RyaW5nEgltaW5MZW5ndGgDVhIJbWF4TGVuZ3RoA1gSCHBvc2l0aW9uAwASCXNob3J0TmFtZRYEEgR0eXBlEgZzdHJpbmcSCW1heExlbmd0aANAEgltaW5MZW5ndGgDBhIIcG9zaXRpb24DAhIIcmVxdWlyZWQVAhIJc2hvcnROYW1lEgpjb250cmFjdElkEhRhZGRpdGlvbmFsUHJvcGVydGllcxMACgACQR8AOrSAQ3S/emVWILS8WyHcMA97CtY5rH7dB4DSjAm/0x6DZdZcm8jyGIdIuuTUALR8/N724YhxwhOQHqUm5ipN"
}
```
#### Responses:
```json
{
  "type": 0,
  "typeString": "DATA_CONTRACT_CREATE",
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
  "version": 1,
  "identityNonce": "10",
  "dataContractId": "GbGD5YbS9GVh7FSZjz3uUJpbrXo9ctbdKycfTqqg3Cmn",
  "ownerId": "7dwjL5frrkM69pv3BsKSQb4ELrMYmDeE11KNoDSefG6c",
  "schema": {
    "labler": {
      "type": "object",
      "properties": {
        "contractId": {
          "type": "string",
          "minLength": 43,
          "maxLength": 44,
          "position": 0
        },
        "shortName": {
          "type": "string",
          "maxLength": 32,
          "minLength": 3,
          "position": 1
        }
      },
      "required": [
        "shortName",
        "contractId"
      ],
      "additionalProperties": false
    }
  },
  "tokens": {
    "0": {
      "position": 0,
      "conventions": {
        "decimals": 1,
        "localizations": {
          "en": {
            "shouldCapitalize": true,
            "pluralForm": "tokens",
            "singularForm": "token"
          }
        }
      },
      "conventionsChangeRules": {
        "authorizedToMakeChange": {
          "takerType": "NoOne"
        },
        "adminActionTakers": {
          "takerType": "NoOne"
        },
        "changingAuthorizedActionTakersToNoOneAllowed": true,
        "changingAdminActionTakersToNoOneAllowed": true,
        "selfChangingAdminActionTakersAllowed": true
      },
      "baseSupply": "1",
      "keepsHistory": {
        "keepsTransferHistory": true,
        "keepsFreezingHistory": true,
        "keepsMintingHistory": true,
        "keepsBurningHistory": true,
        "keepsDirectPricingHistory": true,
        "keepsDirectPurchaseHistory": true
      },
      "startAsPaused": false,
      "isAllowedTransferToFrozenBalance": false,
      "maxSupply": null,
      "maxSupplyChangeRules": {
        "authorizedToMakeChange": {
          "takerType": "NoOne"
        },
        "adminActionTakers": {
          "takerType": "NoOne"
        },
        "changingAuthorizedActionTakersToNoOneAllowed": true,
        "changingAdminActionTakersToNoOneAllowed": true,
        "selfChangingAdminActionTakersAllowed": true
      },
      "distributionRules": null,
      "marketplaceRules": {
        "tradeMode": "NotTradeable",
        "tradeModeChangeRules": {
          "authorizedToMakeChange": {
            "takerType": "NoOne"
          },
          "adminActionTakers": {
            "takerType": "NoOne"
          },
          "changingAuthorizedActionTakersToNoOneAllowed": true,
          "changingAdminActionTakersToNoOneAllowed": true,
          "selfChangingAdminActionTakersAllowed": true
        }
      },
      "manualMintingRules": {
        "authorizedToMakeChange": {
          "takerType": "NoOne"
        },
        "adminActionTakers": {
          "takerType": "NoOne"
        },
        "changingAuthorizedActionTakersToNoOneAllowed": true,
        "changingAdminActionTakersToNoOneAllowed": true,
        "selfChangingAdminActionTakersAllowed": true
      },
      "manualBurningRules": {
        "authorizedToMakeChange": {
          "takerType": "NoOne"
        },
        "adminActionTakers": {
          "takerType": "NoOne"
        },
        "changingAuthorizedActionTakersToNoOneAllowed": true,
        "changingAdminActionTakersToNoOneAllowed": true,
        "selfChangingAdminActionTakersAllowed": true
      },
      "freezeRules": {
        "authorizedToMakeChange": {
          "takerType": "NoOne"
        },
        "adminActionTakers": {
          "takerType": "NoOne"
        },
        "changingAuthorizedActionTakersToNoOneAllowed": true,
        "changingAdminActionTakersToNoOneAllowed": true,
        "selfChangingAdminActionTakersAllowed": true
      },
      "unfreezeRules": {
        "authorizedToMakeChange": {
          "takerType": "NoOne"
        },
        "adminActionTakers": {
          "takerType": "NoOne"
        },
        "changingAuthorizedActionTakersToNoOneAllowed": true,
        "changingAdminActionTakersToNoOneAllowed": true,
        "selfChangingAdminActionTakersAllowed": true
      },
      "destroyFrozenFundsRules": {
        "authorizedToMakeChange": {
          "takerType": "NoOne"
        },
        "adminActionTakers": {
          "takerType": "NoOne"
        },
        "changingAuthorizedActionTakersToNoOneAllowed": true,
        "changingAdminActionTakersToNoOneAllowed": true,
        "selfChangingAdminActionTakersAllowed": true
      },
      "emergencyActionRules": {
        "authorizedToMakeChange": {
          "takerType": "NoOne"
        },
        "adminActionTakers": {
          "takerType": "NoOne"
        },
        "changingAuthorizedActionTakersToNoOneAllowed": true,
        "changingAdminActionTakersToNoOneAllowed": true,
        "selfChangingAdminActionTakersAllowed": true
      },
      "mainControlGroupCanBeModified": {
        "takerType": "NoOne"
      },
      "mainControlGroup": null,
      "description": "note"
    }
  },
  "groups": [],
  "signature": "1f003ab4804374bf7a655620b4bc5b21dc300f7b0ad639ac7edd0780d28c09bfd31e8365d65c9bc8f2188748bae4d400b47cfcdef6e18871c213901ea526e62a4d",
  "signaturePublicKeyId": 2,
  "raw": "000000e7a63f573069e6f96b251f094423d20cb95a6639e0c32339d30f1d4009807b7100000000000101000001629ce9f3eb4e43c8fa936e16ec55e3aa8ef36663197326cc2032f0ed57cb4f410001066c61626c6572160412047479706512066f626a656374120a70726f706572746965731602120a636f6e7472616374496416041204747970651206737472696e6712096d696e4c656e677468035612096d61784c656e67746803581208706f736974696f6e0300120973686f72744e616d6516041204747970651206737472696e6712096d61784c656e677468034012096d696e4c656e67746803061208706f736974696f6e0302120872657175697265641502120973686f72744e616d65120a636f6e7472616374496412146164646974696f6e616c50726f7065727469657313000a0002411f003ab4804374bf7a655620b4bc5b21dc300f7b0ad639ac7edd0780d28c09bfd31e8365d65c9bc8f2188748bae4d400b47cfcdef6e18871c213901ea526e62a4d"
}
```
```json lines
DOCUMENT TRANSITION

{
  "type": 1,
  "typeString": "BATCH",
  "transitions": [
    {
      "action": "DOCUMENT_CREATE",
      "id": "7TsrNHXDy14fYoRcoYjZHH14K4riMGU2VeHMwopG82DL",
      "dataContractId": "FhKAsUnPbqe7K4TZxgRdtPUrfSvNCtYV8iPsvjX7ZG58",
      "revision": "1",
      "prefundedVotingBalance": null,
      "type": "note",
      "entropy": "f09a3ceacaa2f12b9879ba223d5b8c66c3106efe58edc511556f31ee9676412b",
      "identityContractNonce": "2",
      "data": {
        "message": "Tutorial CI Test @ Thu, 08 Aug 2024 20:25:03 GMT"
      },
      "tokenPaymentInfo": {
        "paymentTokenContractId": "dfaPU4HsMpUX7NMF2TR5oeAC4cZvLwYrSU6WT4884bq",
        "tokenContractPosition": 0,
        "minimumTokenCost": null,
        "maximumTokenCost": "15",
        "gasFeesPaidBy": "DocumentOwner"
      }
    }
  ],
  "userFeeIncrease": 0,
  "signature": "1f2ed46b4eb1d77694fd3f3a783dc362295d779e701802aae5d30dca7d623c411e5fed34de9f437ae99514ed1ec0a1757c925888c15aa9c62095c0285b8765e261",
  "signaturePublicKeyId": 1,
  "ownerId": "woTQprzGS4bLqqbAhY2heG8QfD58Doo2UhDbiVVrLKG",
  "raw": "02000e09e4140f8b7777810be56c47f0ab5cbd9bed1e773abd9f9fdf2fe67a669ff7010000006008b85d9826e770ad21b6d585f010f1dfb3b3f2adc6492329bbef8fdec1b1d702046e6f7465da5764f89025e9a5f680633909db58f6f7f6d3582c445393f15aad58821c9f2bf09a3ceacaa2f12b9879ba223d5b8c66c3106efe58edc511556f31ee9676412b01076d65737361676512305475746f7269616c20434920546573742040205468752c2030382041756720323032342032303a32353a303320474d54000001411f2ed46b4eb1d77694fd3f3a783dc362295d779e701802aae5d30dca7d623c411e5fed34de9f437ae99514ed1ec0a1757c925888c15aa9c62095c0285b8765e261"
}
```
```json lines
TOKEN TRANSITION 

{
  "type": 1,
  "typeString": "BATCH",
  "transitions": [
    {
      "action": "TOKEN_TRANSFER",
      "tokenId": "8AnZE2i955j9PC55m3y3e6rVQVZHbLWTk66iNp8eoNWn",
      "identityContractNonce": "16",
      "tokenContractPosition": 1,
      "dataContractId": "9g672HNThwyShq1c5MqQURENR2Ncxce8fLrafh6MmHLr",
      "historicalDocumentTypeName": "transfer",
      "historicalDocumentId": "EmF2uMAEWrZKwcN3WnZW5ajt9YwkTe5Zr5y4NYJMCHFx",
      "recipient": "DkWXAH3qSpCL4BEULAjWdYF8n29WWBRS7TWE8GGN2kWY",
      "publicNote": null,
      "amount": "111"
    }
  ],
  "userFeeIncrease": 0,
  "signature": "1f423b5dca10a8169795a8935b58007ffa0cc35faee58de23281bd5523ba5cf8b27cf475c3fa49495cfe7356c3a3219060bef1e2bbd72f6a9c5948ee13896e8843",
  "signaturePublicKeyId": 1,
  "ownerId": "8noJkyFbsawoVkMsLxNo1k3oEVaJppUG2B4UriFHFoi",
  "raw": "020101fed99d7fcf72ca41aa2dba4445ae349421aa86ae6714319e271d8bab0cb34d0101020000100180e0eafa62ead97989b2ee14006ecefb24e290c03c9c7321a5a777aa8a86b6ff6a838baf57e456b1408869e3b12d1a1db56a5b9c67ff764512f1885d99df21d3006fbd7198a587375bf219dea865ced2abbd8605e9adb03c8c5cffbd1ba83fa99ad50000000001411f423b5dca10a8169795a8935b58007ffa0cc35faee58de23281bd5523ba5cf8b27cf475c3fa49495cfe7356c3a3219060bef1e2bbd72f6a9c5948ee13896e8843"
}
```
```json lines
IDENTITY_CREATE with chainLock

{
    "type": 2,
    "typeString": "IDENTITY_CREATE",
    "fundingAddress": null,
    "assetLockProof": {
      "coreChainLockedHeight": 1138871,
      "type": "chainLock",
      "fundingAmount": null,
      "txid": "fc89dd4cbe2518da3cd9737043603e81665df58d4989a38b2942eec56bacad1d",
      "vout": 0,
      "fundingAddress": null,
      "instantLock": null
    },
    "userFeeIncrease": 0,
    "identityId": "awCc9STLEgw8pJozBq24QzGK5Th9mow7V3EjjY9M7aG",
    "signature": "2015bf50b422df6ccfdc4bcdcae76a11106c8f6c627a284f37d2591184e413249350a722926c8899b5514fd94603598031358bc2a0ac031fb402ecc5b8025f2141",
    "raw": "0300010000020000000014b23f76cac0218f7637c924e45212bb260cff29250001fc001160b72021007051d2207c45d7592bb7e3e5b4b006a29cfe1899aea8abf00c50ee8a40860000412015bf50b422df6ccfdc4bcdcae76a11106c8f6c627a284f37d2591184e413249350a722926c8899b5514fd94603598031358bc2a0ac031fb402ecc5b8025f214108b1737186062205ee3a5f7e19454121b648e0806c7bc1e8bc073c38217a28e1",
    "publicKeys": [
        {
            "contractBounds": null,
            "id": 0,
            "type": "ECDSA_SECP256K1",
            "data": "0348a6a633850f3c83a0cb30a9fceebbaa3b9ab3f923f123d92728cef234176dc5",
            "publicKeyHash": "07630dddc55729c043de7bdeb145ee0d44feae3b",
            "purpose": "AUTHENTICATION",
            "securityLevel": "MASTER",
            "readOnly": false,
            "signature": "2042186a3dec52bfe9a24ee17b98adc5efcbc0a0a6bacbc9627f1405ea5e1bb7ae2bb94a270363400969669e9884ab9967659e9a0d8de7464ee7c47552c8cb0e99"
        },
        {
            "contractBounds": null,
            "id": 1,
            "type": "ECDSA_SECP256K1",
            "data": "034278b0d7f5e6d902ec5a30ae5c656937a0323bdc813e851eb8a2d6a1d23c51cf",
            "publicKeyHash": "e2615c5ef3f910ebe5ada7930e7b2c04a7ffbb23",
            "purpose": "AUTHENTICATION",
            "securityLevel": "HIGH",
            "readOnly": false,
            "signature": "1fbb0d0bb63d26c0d5b6e1f4b8c0eebef4d256c4e8aa933a2cb6bd6b2d8aae545215312924c7dd41c963071e2ccfe2187a8684d93c55063cb45fdd03e76344d6a4"
        },
        {
            "contractBounds": null,
            "id": 2,
            "type": "ECDSA_SECP256K1",
            "data": "0245c3b0f0323ddbb9ddf123f939bf37296af4f38fa489aad722c50486575cd8f4",
            "publicKeyHash": "d53ee3b3518fee80816ab26af98a34ea60ae9af7",
            "purpose": "AUTHENTICATION",
            "securityLevel": "CRITICAL",
            "readOnly": false,
            "signature": "204013dcca13378b820e40cf1da77abe38662546ef0a304545de3c35845b83a7ad4b42051c2b3539c9181b3f0cb3fb4bc970db89663c6bd6ca1468568a62beaa75"
        }
    ]
}
```
```json lines
IDENTITY_CREATE with instantLock

{
    "type": 2,
    "typeString": "IDENTITY_CREATE",
    "fundingAddress": "yV1ZYoep5FFSBxKWM24JUwKfnAkFHnXXV7",
    "assetLockProof": {
        "coreChainLockedHeight": null,
        "type": "instantSend",
        "fundingAmount": 34999000,
        "txid": "fc89dd4cbe2518da3cd9737043603e81665df58d4989a38b2942eec56bacad1d",
        "vout": 0,
        "fundingAddress": "yeMdYXBPum8RmHvrq5SsYE9zNYhMEimbUY",
        "instantLock": 'AQEKM9t1ICNzvddKryjM4enKn0Y5amBn3o6DwDoC4uk5SAAAAAAdraxrxe5CKYujiUmN9V1mgT5gQ3Bz2TzaGCW+TN2J/JQP49yOk0uJ6el6ls9CmNo++yPYoX1Sx1lWEZTTAAAAhXiuCBXgzawuboxMAXDiXQpJCCPi417VE4mdcYPgTa0/Hd+RCHLAR6H+MXhqKazlGddI7AdWxxLZ94ZvQu+qIpe7G9XRRjQWeYwroIyc6MqQF5mKpvV0AUMYUNMXjCsq'
    },
    "userFeeIncrease": 0,
    "identityId": "BHAuKDRVPHkJd99pLoQh8dfjUFobwk5bq6enubEBKpsv",
    "signature": "1fc5b49ce2feb6cfc94f31de8167b806af0265657d5b8f01584e0db3ca011dba24328998bf40a50dd06b6ab10ed47622f46c07dec4d7cad3625b41aa52c9e11c2f",
    "raw": "03000400000000000000210258abe04886308feb52b8f3d64eace4913c9d049f4dda9a88a217e6ca6b89a107411f60451588fe72a067daaa0a1ee04279e77ce346128560129162386f76d51eccdc1d88704f2262fe173de57e5598010655d410da94ae2e1cf7086049878b08e966000100000200002103e6680bb560e40adb299a6b940d3dcbe2b08e6e1a64bc8f6bc9ec3d638655c3554120066559ccd6cea8ac2d366980f77a94cbfdfbd978803edbf4066f42bc53adcdb51956fb0d3c9cec2012583d17b66456094a8620109d6dae29dc562b2870592940000200000100002102326a8c19a1c58d30d142e113d0ddf381d95a6306f56c9ec4d3cb8c4823685b29411f5bb82721b58d92e67db9fb699ab939ccc4a6d5e2e498e80dfb8a3535c13f571923f045e645a898762f8305a4a2218bfedb060f8a8492c48ae9c96247ce17710b00030003010000210252a2d08f295871ec4b04cb0bcf7b2899b0b004702d9058982dd797141d527e78412044820dc7651186634326922eda85741bb3f9f005057d94b36845a7edc16ed1df4d5ccabd7e7f003e9c189847fbc06e943252640bc47963c42ae6c0d87b7b506b00c601014fae5c4ed0e736dd25610b65ff51b56cbe1b9467520f0ced40a9e3b58e4555b10100000077ba9d450b94520434c5d15339922aa7df81b51344b98588649a44752f1a355cd0d05ce3df52f3fb7fc6e64cc414fb7cd9d0ffc4d088e77d9e542fade30000008a8678665212af134cfa36ea40984009adca338efa3131667f5a62b489d2fb2713eb7eccd14dd83cc6679b597548feae18bdc393dae2ab2a50844220359d4b87c428507808dc8df62f56dabb8d1eae2c1859b9ca54b3b4820ebc8453f57c34f6ef03000800014fae5c4ed0e736dd25610b65ff51b56cbe1b9467520f0ced40a9e3b58e4555b1010000006a473044022070293df3b93c523373f1f86272c5dba7886ab41cfc50b0b89658c07d0825c16002201afdf3b31393c5b99373597042b4d651028e824fc12f802aa1be51cc165bcf1e012103d55244573359ad586597b9bb4dd31b8f145121b7c01146656bc26c4b99184a47ffffffff0240420f0000000000026a0049ac4c2e000000001976a91441bb9b42b9f0d589008b4a7f6a72a6bb342b386d88ac0000000024010140420f00000000001976a9145f573cd6a8570cb0b74c4b0ea15334e6bd6b34a788ac0000411fc5b49ce2feb6cfc94f31de8167b806af0265657d5b8f01584e0db3ca011dba24328998bf40a50dd06b6ab10ed47622f46c07dec4d7cad3625b41aa52c9e11c2f98b95bbff1488807c3a4ed36c5fde32f9a6f1e05a622938476652041669e4135",
    "publicKeys": [
        {
            "contractBounds": null,
            "id": 0,
            "type": "ECDSA_SECP256K1",
            "data": "0348a6a633850f3c83a0cb30a9fceebbaa3b9ab3f923f123d92728cef234176dc5",
            "publicKeyHash": "07630dddc55729c043de7bdeb145ee0d44feae3b",
            "purpose": "AUTHENTICATION",
            "securityLevel": "MASTER",
            "readOnly": false,
            "signature": "2042186a3dec52bfe9a24ee17b98adc5efcbc0a0a6bacbc9627f1405ea5e1bb7ae2bb94a270363400969669e9884ab9967659e9a0d8de7464ee7c47552c8cb0e99"
        },
        {
            "contractBounds": null,
            "id": 1,
            "type": "ECDSA_SECP256K1",
            "data": "034278b0d7f5e6d902ec5a30ae5c656937a0323bdc813e851eb8a2d6a1d23c51cf",
            "publicKeyHash": "e2615c5ef3f910ebe5ada7930e7b2c04a7ffbb23",
            "purpose": "AUTHENTICATION",
            "securityLevel": "HIGH",
            "readOnly": false,
            "signature": "1fbb0d0bb63d26c0d5b6e1f4b8c0eebef4d256c4e8aa933a2cb6bd6b2d8aae545215312924c7dd41c963071e2ccfe2187a8684d93c55063cb45fdd03e76344d6a4"
        },
        {
            "contractBounds": null,
            "id": 2,
            "type": "ECDSA_SECP256K1",
            "data": "0245c3b0f0323ddbb9ddf123f939bf37296af4f38fa489aad722c50486575cd8f4",
            "publicKeyHash": "d53ee3b3518fee80816ab26af98a34ea60ae9af7",
            "purpose": "AUTHENTICATION",
            "securityLevel": "CRITICAL",
            "readOnly": false,
            "signature": "204013dcca13378b820e40cf1da77abe38662546ef0a304545de3c35845b83a7ad4b42051c2b3539c9181b3f0cb3fb4bc970db89663c6bd6ca1468568a62beaa75"
        }
    ]
}
```
```json
{
    "type": 3,
    "typeString": "IDENTITY_TOP_UP",
    "assetLockProof": {
        "coreChainLockedHeight": null,
        "type": "instantSend",
        "fundingAmount": 999000,
        "txid": "7734f498c5b59f64f73070e0a5ec4fa113065da00358223cf888c3c27317ea64",
        "vout": 0,
        "fundingAddress": "yWxCwVRgqRmePNPJxezgus1T7xSv5q17SU"
    },
    "identityId": "4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF",
    "amount": 300000000,
    "signature": "810cd0bfe02104362941d35bd05fdf82cdc50c3bc8510077bfa62d47b68710",
    "raw": "040000c60101ecd6b031477f342806df5740b70f93b8a3e925bbf2d90d979a5ed162a8d7d5660000000064ea1773c2c388f83c225803a05d0613a14feca5e07030f7649fb5c598f43477940fe3dc8e934b89e9e97a96cf4298da3efb23d8a17d52c759561194d3000000a5e81597e94558618bf1464801188ecbc09c7a12e73489225c63684259f075f87aa3d47ea9bbbe1f9c314086ddc35a6d18b30ff4fe579855779f9268b8bf5c79760c7d8c56d34163931f016c2e3036852dd33a6b643dd59dc8c54199f34e3d2def0300080001ecd6b031477f342806df5740b70f93b8a3e925bbf2d90d979a5ed162a8d7d566000000006a4730440220339d4d894eb2ff9c193bd8c33cdb3030a8be18ddbf30d983e8286c08c6c4c7d90220181741d9eed3814ec077030c26c0b9fff63b9ef10e1e6ca1c87069b261b0127a0121034951bbd5d0d500942426507d4b84e6d88406300ed82009a8db087f493017786affffffff02e093040000000000026a0078aa0a00000000001976a914706db5d1e8fb5f925c6db64104f4b77f0c8b73d488ac00000000240101e0930400000000001976a91474a509b4f3b80ce818465dc0f9f66e2103d9178b88ac003012c19b98ec0033addb36cd64b7f510670f2a351a4304b5f6994144286efdac411f810cd0bfe02104362941d35bd05fdf82cdc50c3bc8510077bfa62d47b68710"
}
```
```json
{
    "type": 4,
    "typeString": "DATA_CONTRACT_UPDATE",
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
    "tokens": {},
    "groups": [],
    "identityContractNonce": 6,
    "signaturePublicKeyId": 2,
    "signature": "1ff9a776c62ee371a0e5ed95e8efe27c7955f247d5527670e43cbd837e73cfaef3613592b9798e9afd2526e3b92330f07d0c5f1396390d63ad39b4bebeb9c82903",
    "userFeeIncrease": 0,
    "ownerId": "GgZekwh38XcWQTyWWWvmw6CEYFnLU7yiZFPWZEjqKHit",
    "dataContractId": "AJqYb8ZvfbA6ZFgpsvLfpMEzwjaYUPyVmeFxSJrafB18",
    "dataContractIdentityNonce": "0",
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
```json
{
  "type": 5,
  "typeString": "IDENTITY_UPDATE",
  "identityNonce": 3,
  "userFeeIncrease": 0,
  "identityId": "4NGALjtX2t3AXE3ZCqJiSmYuiWEY3ZPQNUBxNWWRrRSp",
  "revision": 2,
  "publicKeysToAdd": [
      {
          "contractBounds": null,
          "id": 5,
          "type": "ECDSA_HASH160",
          "data": "c208ded6d1af562b8e5387c02a446ea6e8bb325f",
          "publicKeyHash": "c208ded6d1af562b8e5387c02a446ea6e8bb325f",
          "purpose": "AUTHENTICATION",
          "securityLevel": "HIGH",
          "readOnly": false,
          "signature": ""
      },
      {
          "contractBounds": null,
          "id": 6,
          "type": "ECDSA_SECP256K1",
          "data": "026213380930c93c4b53f6ddbc5adc5f5165102d8f92f7d9a495a8f9c6e61b30f0",
          "publicKeyHash": "d39eda042126256a372c388bd191532a7c9612ce",
          "purpose": "AUTHENTICATION",
          "securityLevel": "MASTER",
          "readOnly": false,
          "signature": "1faf8b0f16320d0f9e29c1db12ab0d3ec87974b19f6fc1189a988cd85503d79f844d3ff778678d7f4f3829891e8e8d0183456194d9fc76ed66e503154996eefe06"
      }
  ],
  "setPublicKeyIdsToDisable": [],
  "signature": "1f341c8eb7b890f416c7a970406dd37da078dab5f2c4aa8dd18375516933b234873127965dd72ee28b7392fcd87e28c4bfef890791b58fa9c34bce9e96d6536cb1",
  "signaturePublicKeyId": 0,
  "raw": "0600320566816f366803517a7eb44d331ccb0e442fab6396f3d6ac631b1069aae0410203020005020002000014c208ded6d1af562b8e5387c02a446ea6e8bb325f000006000000000021026213380930c93c4b53f6ddbc5adc5f5165102d8f92f7d9a495a8f9c6e61b30f0411faf8b0f16320d0f9e29c1db12ab0d3ec87974b19f6fc1189a988cd85503d79f844d3ff778678d7f4f3829891e8e8d0183456194d9fc76ed66e503154996eefe06000000411f341c8eb7b890f416c7a970406dd37da078dab5f2c4aa8dd18375516933b234873127965dd72ee28b7392fcd87e28c4bfef890791b58fa9c34bce9e96d6536cb1"
}
```
```json
{
    "type": 6,
    "typeString": "IDENTITY_CREDIT_WITHDRAWAL",
    "outputAddress": "yifJkXaxe7oM1NgBDTaXnWa6kXZAazBfjk",
    "userFeeIncrease": 0,
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
```json
{
    "type": 7,
    "typeString": "IDENTITY_CREDIT_TRANSFER",
    "identityNonce": 1,
    "userFeeIncrease": 0,
    "senderId": "24YEeZmpy1QNKronDT8enYWLXnfoxYK7hrHUdpWHxURg",
    "recipientId": "6q9RFbeea73tE31LGMBLFZhtBUX3wZL3TcNynqE18Zgs",
    "amount": 21856638,
    "signaturePublicKeyId": 3,
    "signature": "1f39c5c81434699df7924d68eba4326352ac97883688e3ec3ffed36746d6fb8c227d4a96a40fcd38673f80ed64ab8e3514cf81fe8be319774429071881d3c8b1f8",
    "raw": "07000fc3bf4a26bff60f4f79a1f4b929ce4d4c5833d226c1c7f68758e71d7ae229db569fd4f616b3dedecbeef95352cf38f1fb04d232a0d20623bc195b0c3f721840fc014d817e010003411f39c5c81434699df7924d68eba4326352ac97883688e3ec3ffed36746d6fb8c227d4a96a40fcd38673f80ed64ab8e3514cf81fe8be319774429071881d3c8b1f8"
}
```
```json
{
    "type": 8,
    "typeString": "IDENTITY_CREDIT_TRANSFER",
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
    "proTxHash": "ad4e38fc81da72d61b14238ee6e5b91915554e24d725718800692d3a863c910b",
    "raw": "08005b246080ba64350685fe302d3d790f5bb238cb619920d46230c844f079944a233bb2df460e72e3d59e7fe1c082ab3a5bd9445dd0dd5c4894a6d9f0d9ed9404b5000000e668c659af66aee1e72c186dde7b5b7e0a1d712a09c40d5721f622bf53c5315506646f6d61696e12706172656e744e616d65416e644c6162656c021204646173681203793031010c00412019d90a905092dd3074da3cd42b05abe944d857fc2573e81e1d39a16ba659c00c7b38b88bee46a853c5c30deb9c2ae3abf4fbb781eec12b86a0928ca7b02ced7d"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Identity Nonce
Return Identity Nonce
```
GET /identity/HTfJKDuW8omFfFrSQuNTkgW39WpncdwFUrL91VJyJXUS/nonce
{
    "identityNonce": "1"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Identity Contract Nonce
Return Identity Contract Nonce
```
GET /identity/HTfJKDuW8omFfFrSQuNTkgW39WpncdwFUrL91VJyJXUS/contract/6hVQW16jyvZyGSQk2YVty4ND6bgFXozizYWnPt753uW5/nonce
{
    "identityContractNonce": "2"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Tokens
Return list of tokens

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
```
GET /tokens?limit=2&page=1&order=asc
[
  {
    "identifier": "5kRUF1SRTFtdskfaaQE9pCdADq8wyLFB1TNttnrBq3F8",
    "localizations": {
      "en": {
        "pluralForm": "k1-id1",
        "singularForm": "k1-id1",
        "shouldCapitalize": true
      }
    },
    "baseSupply": "100000",
    "totalSupply": "100500",
    "maxSupply": null,
    "owner": {
      "identifier": "8GnWmaDGZe9HBchfWPeq2cRPM88c4BvAahCk9vxr34mg",
      "aliases": [
        {
          "alias": "alias.dash",
          "contested": true,
          "documentId": "AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW",
          "status": "ok",
          "timestamp": "2025-08-10T19:09:39.485Z"
        }
      ]
    },
    "mintable": true,
    "burnable": true,
    "freezable": true,
    "unfreezable": true,
    "destroyable": true,
    "allowedEmergencyActions": true,
    "dataContractIdentifier": "CNvyZaBWofWPmgKYCBMF23h3cEhQfQHVY3wXCRkHEaau"
  },
  {
    "identifier": "GUo3MpaLeaLDvjDnF5XQLRCjWC9WhkNPbtrVWZ5FKjLp",
    "localizations": {
      "en": {
        "pluralForm": "a1-1",
        "singularForm": "a1-1",
        "shouldCapitalize": true
      }
    },
    "baseSupply": "100000",
    "totalSupply": "120000",
    "maxSupply": "5000",
    "owner": {
      "identifier": "8GnWmaDGZe9HBchfWPeq2cRPM88c4BvAahCk9vxr34mg",
      "aliases": [
        {
          "alias": "alias.dash",
          "contested": true,
          "documentId": "AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW",
          "status": "ok",
          "timestamp": "2025-08-10T19:09:39.485Z"
        }
      ]
    },
    "mintable": true,
    "burnable": true,
    "freezable": true,
    "unfreezable": true,
    "destroyable": true,
    "allowedEmergencyActions": true,
    "dataContractIdentifier": "5BwVvDstM6FaXQcLNUGkuPHAk5xH3uEoYEKqHKXjw5nL"
    "decimals": null,
  }
]
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Token By Identifier
Return token info by token identifier

* `perpetualDistribution` can have a different structure due to the extensive range of data formats for functions:
  * FixedAmount
    * `amount`
  * Random
    * `min`
    * `max`
  * StepDecreasingAmount
    * `stepCount`
    * `decreasePerIntervalNumerator`
    * `decreasePerIntervalDenominator`
    * `startDecreasingOffset`
    * `maxIntervalCount`
    * `distributionStartAmount`
    * `trailingDistributionIntervalAmount`
    * `minValue`
  * Linear
    * `a`
    * `d`
    * `startStep`
    * `startingAmount`
    * `minValue`
    * `maxValue`
  * Polynomial
    * `a`
    * `b`
    * `d`
    * `m`
    * `n`
    * `o`
    * `startMoment`
    * `minValue`
    * `maxValue`
  * Exponential
    * `a`
    * `b`
    * `d`
    * `m`
    * `n`
    * `o`
    * `startMoment`
    * `minValue`
    * `maxValue`
  * Exponential
    * `a`
    * `b`
    * `d`
    * `m`
    * `n`
    * `o`
    * `startMoment`
    * `minValue`
    * `maxValue`
  * Logarithmic
    * `a`
    * `b`
    * `d`
    * `m`
    * `n`
    * `o`
    * `startMoment`
    * `minValue`
    * `maxValue`
  * InvertedLogarithmic
    * `a`
    * `b`
    * `d`
    * `m`
    * `n`
    * `o`
    * `startMoment`
    * `minValue`
    * `maxValue`

```
GET /token/4xd9usiX6WCPE4h1AFPQBJ4Rje6TfZw8kiBzkSAzvmCL
{
    "identifier": "4xd9usiX6WCPE4h1AFPQBJ4Rje6TfZw8kiBzkSAzvmCL",
    "position": 0,
    "timestamp": "2025-07-15T09:14:43.782Z",
    "description": null,
    "localizations": {
        "en": {
            "pluralForm": "A1-preprog-1",
            "singularForm": "A1-preprog-1",
            "shouldCapitalize": true
        }
    },
    "baseSupply": "100000",
    "totalSupply": "101310",
    "maxSupply": null,
    "owner": {
      "identifier": "8GnWmaDGZe9HBchfWPeq2cRPM88c4BvAahCk9vxr34mg",
      "aliases": [
        {
          "alias": "alias.dash",
          "contested": true,
          "documentId": "AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW",
          "status": "ok",
          "timestamp": "2025-08-10T19:09:39.485Z"
        }
      ]
    },
    "mintable": true,
    "burnable": true,
    "freezable": true,
    "unfreezable": true,
    "destroyable": true,
    "allowedEmergencyActions": true,
    "dataContractIdentifier": "BU9B9aoh54Y8aXqRnrD6zmerxivw1ePLeARSmqGm52eN",
    "changeMaxSupply": true,
    "totalGasUsed": 921522940,
    "mainGroup": null,
    "totalTransitionsCount": 13,
    "totalFreezeTransitionsCount": 1,
    "totalBurnTransitionsCount": 0,
    "decimals": 10,
    "totalBurnTransitionsCount": 0,
    "balance": "10",
    "balances": null
    "perpetualDistribution": null,
    "preProgrammedDistribution": [
        {
            "timestamp": "2025-07-15T09:24:40.493Z",
            "out": [
                {
                    "identifier": "AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW",
                    "tokenAmount": "1000"
                },
                {
                    "identifier": "DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD",
                    "tokenAmount": "1000"
                }
            ]
        }
    ]
}

GET /token/4tyvbA2ZGFLvjXLnJRCacSoMbFfpmBwGRrAZsVwnfYri
{
    "identifier": "4tyvbA2ZGFLvjXLnJRCacSoMbFfpmBwGRrAZsVwnfYri",
    "position": 0,
    "timestamp": "2025-07-30T15:23:08.238Z",
    "description": null,
    "localizations": {
        "en": {
            "pluralForm": "sdk-02",
            "singularForm": "sdk-02",
            "shouldCapitalize": true
        }
    },
    "baseSupply": "100000",
    "totalSupply": "100000",
    "maxSupply": null,
    "owner": "5RG84o6KsTaZudDqS8ytbaRB8QP4YYQ2uwzb6Hj8cfjX",
    "mintable": true,
    "burnable": true,
    "freezable": true,
    "unfreezable": true,
    "destroyable": true,
    "allowedEmergencyActions": true,
    "dataContractIdentifier": "GZSQWeXohuc4YRPR54XFo56AC9XafmjyWpAKaMWKLBG8",
    "changeMaxSupply": false,
    "totalGasUsed": 353664760,
    "mainGroup": null,
    "totalTransitionsCount": 6,
    "totalFreezeTransitionsCount": 3,
    "totalBurnTransitionsCount": 0,
    "decimals": 10,
    "totalBurnTransitionsCount": 0,
    "balance": "10",
    "balances": null
    "perpetualDistribution": {
        "type": "BlockBasedDistribution",
        "recipientType": "ContractOwner",
        "recipientValue": null,
        "interval": 100,
        "functionName": "FixedAmount",
        "functionValue": {
            "amount": "5"
        }
    },
    "preProgrammedDistribution": null
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
404: Not Found
```
___
### Token Transitions
Return list of transitions for token

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
```
GET /token/4xd9usiX6WCPE4h1AFPQBJ4Rje6TfZw8kiBzkSAzvmCL/transitions?limit=10&order=desc&page=1
{
    "resultSet": [
        {
            "amount": 2000,
            "recipient": "HxEj8nUyvfuPzDGm9Wif1vWnUaeRcfvfDN1HZxV7q5rf",
            "owner": {
              "identifier": "8GnWmaDGZe9HBchfWPeq2cRPM88c4BvAahCk9vxr34mg",
              "aliases": [
                {
                  "alias": "alias.dash",
                  "contested": true,
                  "documentId": "AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW",
                  "status": "ok",
                  "timestamp": "2025-08-10T19:09:39.485Z"
                }
              ]
            },
            "action": "TOKEN_MINT",
            "stateTransitionHash": "432D47C8955424A5E61BD4204A33C2E1FCEB951BED6ED5B2C4B27E05C6433781",
            "timestamp": "2025-07-17T14:08:21.217Z",
            "publicNote": null
        },
        {
            "amount": 0,
            "recipient": "HxEj8nUyvfuPzDGm9Wif1vWnUaeRcfvfDN1HZxV7q5rf",
            "owner": {
              "identifier": "8GnWmaDGZe9HBchfWPeq2cRPM88c4BvAahCk9vxr34mg",
              "aliases": [
                {
                  "alias": "alias.dash",
                  "contested": true,
                  "documentId": "AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW",
                  "status": "ok",
                  "timestamp": "2025-08-10T19:09:39.485Z"
                }
              ]
            },
            "action": "TOKEN_FREEZE",
            "stateTransitionHash": "2F329C99AA7E7C52ABEB2340FFAC098EB19ADDB7B2CC0D5CA3A891B077E12FBB",
            "timestamp": "2025-07-15T14:44:17.346Z",
            "publicNote": null
        },
        ...
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
404: Not Found
```
___
### Tokens Rating
Return list of tokens identifier with order by transactions count.

If it is not possible to get tokens transitions for selected period,
then will be returned list of tokens in order of creation date

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
* `timestamp_start` and `timestamp_end` can be null and `timestamp_end` must be greater then `timestamp_start` if they are used. Default value is equal to the interval in the past 30 days
```
GET tokens/rating?order=desc&limit=10&page=1&timestamp_start=2025-06-20T17:10:28.585Z&timestamp_end=2025-07-28T20:37:28.585Z
{
    "resultSet": [
        {
            "tokenIdentifier": "8RsBCPSDUwWMnvLTDooh7ZcfZmnRb5tecsagsrdAFrrd",
            "transitionCount": 15,
            {
                "localizations": {
                    "en": {
                        "pluralForm": "A1-keyword",
                        "singularForm": "A1-keyword",
                        "shouldCapitalize": true
                    }
                },
                "tokenIdentifier": "FWuCZYmNo2qWfLcYsNUnu1LdqBWbzvWBUcGQHRFE2mVt",
                "transitionCount": 1
            },
            {
                "localizations": {
                    "en": {
                        "pluralForm": "A1-test-1",
                        "singularForm": "A1-test-1",
                        "shouldCapitalize": true
                    }
                },
                "tokenIdentifier": "Eg49SNkMVgo84vGhj89bEK53X2mURGuVSERzteaT1brr",
                "transitionCount": 1
            },
            {
                "localizations": {
                    "en": {
                        "pluralForm": "aaa",
                        "singularForm": "aaa",
                        "shouldCapitalize": true
                    }
                },
                "tokenIdentifier": "8Uv6WJEf7pyw17AtcJpGdURkU3wrmz86RkXxUdNNx575",
                "transitionCount": 2
            },
        },
        ...
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 11
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Tokens By Identity
Return list of tokens which created by identity

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
```
GET /identity/5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5B1/tokens?limit=10&page=1&order=asc
{
    "resultSet": [
        {
            "identifier": "Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv",
            "position": 0,
            "timestamp": null,
            "description": "The flurgon contract on testnet",
            "localizations": {
                "en": {
                    "pluralForm": "Flurgons",
                    "singularForm": "Flurgon",
                    "shouldCapitalize": true
                }
            },
            "baseSupply": "10000",
            "totalSupply": "10000",
            "maxSupply": null,
            "owner": {
              "identifier": "8GnWmaDGZe9HBchfWPeq2cRPM88c4BvAahCk9vxr34mg",
              "aliases": [
                {
                  "alias": "alias.dash",
                  "contested": true,
                  "documentId": "AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW",
                  "status": "ok",
                  "timestamp": "2025-08-10T19:09:39.485Z"
                }
              ]
            },
            "mintable": true,
            "burnable": true,
            "freezable": true,
            "unfreezable": true,
            "destroyable": true,
            "allowedEmergencyActions": true,
            "dataContractIdentifier": "ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A",
            "changeMaxSupply": true,
            "totalGasUsed": null,
            "mainGroup": null,
            "totalTransitionsCount": null,
            "totalFreezeTransitionsCount": null,
            "totalBurnTransitionsCount": null,
            "decimals": 0,
            "perpetualDistribution": {
                "type": "BlockBasedDistribution",
                "recipientType": "ContractOwner",
                "recipientValue": null,
                "interval": 100,
                "functionName": "FixedAmount",
                "functionValue": {
                    "amount": "5"
                }
            },
            "preProgrammedDistribution": null
        },
        ...
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 3
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Token Holders
Return list of token holders

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
```
GET /token/Bu2749WKcP5HFNm8v3k5kshRKDSVyfsJMqoWnXmK4q7h/holders?order=desc&limit=10&page=1
{
    "resultSet": [
        {
            "balance": "0",
            "holder": {
                "identifier": "HJDxtN6FJF3U3T9TMLWCqudfJ5VRkaUrxTsRp36djXAG",
                "aliases": [
                    {
                        "alias": "wasm-sdk-test-identity-2.dash",
                        "status": "ok",
                        "timestamp": "2025-08-26T13:20:11.698Z",
                        "documentId": "Girj8ujNxqzhHnnvEyKcKfvJxQh8CTG8N4GCY4oVXMS2",
                        "contested": false
                    }
                ]
            }
        },
        {
            "balance": "135",
            "holder": {
                "identifier": "7XcruVSsGQVSgTcmPewaE4tXLutnW1F6PXxwMbo8GYQC",
                "aliases": [
                    {
                        "alias": "wasm-sdk-test-identity.dash",
                        "status": "ok",
                        "timestamp": "2025-08-21T19:42:41.349Z",
                        "documentId": "9odEjcSxU3MqBNXxX2GvVjqZtYk1HSZmK7NHVmVqp35T",
                        "contested": false
                    }
                ]
            }
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 2
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Tokens By Name
Return list of tokens info with selected part name

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1

```
GET /tokens/psh/info?limit=10&page=1&order=asc
{
    "resultSet": [
        {
            "identifier": "6niNoQpsT9zyVDJtXcbpV3tR3qEGi6BC6xoDdJyx1u7C",
            "position": 0,
            "timestamp": null,
            "description": null,
            "localizations": {
                "en": {
                    "pluralForm": "PSHM",
                    "singularForm": "PSHM",
                    "shouldCapitalize": true
                }
            },
            "baseSupply": "1337",
            "totalSupply": "1338",
            "maxSupply": "13370",
            "owner": {
                "identifier": "HT3pUBM1Uv2mKgdPEN1gxa7A4PdsvNY89aJbdSKQb5wR",
                "aliases": []
            },
            "mintable": false,
            "burnable": false,
            "freezable": false,
            "unfreezable": false,
            "destroyable": false,
            "allowedEmergencyActions": false,
            "dataContractIdentifier": "dfaPU4HsMpUX7NMF2TR5oeAC4cZvLwYrSU6WT4884bq",
            "changeMaxSupply": false,
            "totalGasUsed": null,
            "mainGroup": null,
            "totalTransitionsCount": null,
            "totalFreezeTransitionsCount": null,
            "totalBurnTransitionsCount": null,
            "decimals": 8,
            "perpetualDistribution": {
                "type": "TimeBasedDistribution",
                "recipientType": "ContractOwner",
                "recipientValue": null,
                "interval": 14515200000,
                "functionName": "FixedAmount",
                "functionValue": {
                    "amount": "1337"
                }
            },
            "preProgrammedDistribution": null,
            "price": null,
            "prices": null
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
503: Service Temporarily Unavailable
```
___
### Broadcast Transaction
Send Transaction for Broadcast

* `base64` optional field. State transition buffer in base64
* `hex` optional field. State transition buffer in hex
* You must pass `hex` or `base64`

```
POST /transaction/broadcast
BODY:
{
    "base64": "AgDpAd/Bcqls4/fTNNbAtp3zsByG0w/wOnwk9RaDj5Q0DQEAAAAetrSpdOHzvWhmll5EyXQFOW6JEoHRY2Alb0wBP6ic9AcEbm90ZYpK8hfzQOnEyVhXSWzzO2jrbHEqxtIKHreFTRSv2f/PxVTtZXkupT+mJytiIWsAU0U1Ke1abN0JJvNNU1182eoCBmF1dGhvchIGb3dsMzUyB21lc3NhZ2USBHRlc3QAAAAA"
}

RESPONSE:
{
  "message": "broadcasted"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Wait For State Transition Result
Awaits for a state transition confirmation in the network

Assumes transaction already in mempool when this query is requested.
Always returns 200, 500 in the unexpected states

* `hash` state transitions hash

```
GET /waitForStateTransitionResult/:hash
RESPONSE:
{
  "message": "ok" // or "tx is not in mempool or already confirmed" 
}
```
Response codes:
```
200: OK
500: Internal Server Error
```
___
### Quorum Info
Returns info about quorum by type and hash

* `quorumType` contains quorum type number
  * `llmq_50_60` - 1
  * `llmq_400_60` - 2
  * `llmq_400_85` - 3
  * `llmq_100_67` - 4
  * `llmq_60_75` - 5
  * `llmq_25_67` - 6
  * `llmq_test` - 100
  * `llmq_devnet` - 101
  * `llmq_test_v17` - 102
  * `llmq_test_dip0024` - 103
  * `llmq_test_instantsend` - 104
  * `llmq_devnet_dip0024` - 105
  * `llmq_test_platform` - 106
  * `llmq_devnet_platform` - 107
* `quorumHash` optional. hash of quorum

```
GET /quorum/info?type=6&hash=000001148d84a95dd1dbbe309900f3ed434c10039dcc824b18543d413b83f7c8

{
    "height": 1306464,
    "type": "llmq_25_67",
    "quorumHash": "000001148d84a95dd1dbbe309900f3ed434c10039dcc824b18543d413b83f7c8",
    "quorumIndex": 0,
    "minedBlock": "000000293cbbadd2661d0d5198af2985eef7ece629833e9f610fe5d051ecfb71",
    "members": [
        {
            "proTxHash": "61d33f478933797be4de88353c7c2d843c21310f6d00f6eff31424a756ee7dfb",
            "service": "52.12.176.90:19999",
            "pubKeyOperator": "a6a63376eb861bda6afa09e28e39ba40cdfb877ee6f9aace10eaccd4caafe8d9243f2f2c0ef982a0766347073cc199bb",
            "valid": true
        },
        {
            "proTxHash": "7718edad371e46d20fad30086e4acf4a05c2b660df6ae5f2a684aebdf1be4290",
            "service": "44.227.137.77:19999",
            "pubKeyOperator": "b675a1940be872b6a0d4e1696bb39ea38179933a1bae02ae1eaf4b47f625bd939482f8791eb38925af47f73be027a64c",
            "valid": true
        },
        {
            "proTxHash": "ff261d2c1c76907a2ad8aeb6c5611796f03b5cbd88ae92452a4727e13f4f4ac9",
            "service": "54.187.14.232:19999",
            "pubKeyOperator": "967796952922dcc5208a3848ab85a787e4592df2d8ce36a29369b0b3a9576073651075039e1377873aa8c67514ad2726",
            "valid": true
        },
        {
            "proTxHash": "ba8ce1dc72857b4168e33272571df7fbaf84c316dfe48217addcf6595e254216",
            "service": "52.42.202.128:19999",
            "pubKeyOperator": "acec7bbead86221590f132810b8262cf98c91b338927907b86bf48baa54dd1912bfc1f6fccd069052cc8c79eb9e8ed2c",
            "valid": true
        },
        {
            "proTxHash": "d9b090cfc19caf2e27d512e69c43812a274bdf29c081d0ade4fd272ad56a5f89",
            "service": "44.240.98.102:19999",
            "pubKeyOperator": "86108e551691da2642f37b68bcfbc5bbe9984ca51aca15ee24b6fa9b8690ed62c6ed722d091e04ef617cfc99341fd358",
            "valid": true
        },
        {
            "proTxHash": "8b8d1193afd22e538ce0c9fb50fee155d0f6176ca68e65da684c5dce2d1e0815",
            "service": "52.34.144.50:19999",
            "pubKeyOperator": "a1749fecb407bb0e0ab9d6df65ea068dba5dc03e14dcb36abe5cb2b5c6e424683f715ff09ce290d035dbb31add0c0180",
            "valid": true
        },
        {
            "proTxHash": "6d1b185ba036efcd44a77e05a9aaf69a0c4e40976aec00b04773e52863320966",
            "service": "44.228.242.181:19999",
            "pubKeyOperator": "b8a2161c64bfdc7d621df51de569911a219f718bad4d6058dcca9bddf6696d43ddc4c1e3cf91640c93f820e5680efac3",
            "valid": true
        },
        {
            "proTxHash": "39741ad83dd791e1e738f19edae82d6c0322972e6a455981424da3769b3dbd4a",
            "service": "35.163.144.230:19999",
            "pubKeyOperator": "b6693296894820bdc3c0ae76f357e544847f10a68f0046f53745370dbe861d57e194ddaf7ff7d5e73cc3f240515c448e",
            "valid": true
        },
        {
            "proTxHash": "85f15a31d3838293a9c1d72a1a0fa21e66110ce20878bd4c1024c4ae1d5be824",
            "service": "54.201.32.131:19999",
            "pubKeyOperator": "ac3026b3e3023db1db9ec8e3b7678761820a2a6e96e7a5d9a39b1894170f9cea7765d3d131d60fa9d17492ba560fb1f9",
            "valid": true
        },
        {
            "proTxHash": "8de8b12952f7058d827bd04cdff1c2175d87bbf89f28b52452a637bc979addc4",
            "service": "52.43.86.231:19999",
            "pubKeyOperator": "9502bb884b3437d65c0e025e49fb00ff6ea9f55d5bcdc36330b46c8bd18be9126b7a6d7f35f558ef8040f2c2284500a5",
            "valid": true
        },
        {
            "proTxHash": "9cb04f271ba050132c00cc5838fb69e77bc55b5689f9d2d850dc528935f8145c",
            "service": "34.214.48.68:19999",
            "pubKeyOperator": "b6ee48c7a71a9d8e0813e68ca09846245fa155285f24a62b0ce9cb0102b1994ec58af8ba2a01c09363bdcc395d41f3df",
            "valid": true
        },
        {
            "proTxHash": "143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113",
            "service": "35.164.23.245:19999",
            "pubKeyOperator": "b928fa4e127214ccb2b5de1660b5e371d2f3c9845077bc3900fc6aabe82ddd2e61530be3765cea15752e30fc761ab730",
            "valid": true
        },
        {
            "proTxHash": "b3b5748571b60fe9ad112715d6a51725d6e5a52a9c3af5fd36a1724cf50d862f",
            "service": "52.43.13.92:19999",
            "pubKeyOperator": "816ab3f50007333bcb40445130cd0e82139f8c68b592001cd686efc15e303206491fada6cf90af8f24a28b81a9b59ccf",
            "valid": true
        },
        {
            "proTxHash": "2e48651a2e9c0cb4f2fb7ab874061aa4af0cd28b59695631e6a35af3950ef6fb",
            "service": "54.149.33.167:19999",
            "pubKeyOperator": "943a88959611417f9e8ce4e664e1d9c6a839daae14f54ae8e78bc5ef6ec1524d116efca49ecd5c57dce31d90015a51ff",
            "valid": true
        },
        {
            "proTxHash": "8eca4bcbb3a124ab283afd42dad3bdb2077b3809659788a0f1daffce5b9f001f",
            "service": "54.68.235.201:19999",
            "pubKeyOperator": "b942e2e50c5cf9d9fe81119cc5379057c05fe15134f85847356b5d1f6a21f29f4a53f61f03338d056edc15a8c63fbbe8",
            "valid": true
        },
        {
            "proTxHash": "8917bb546318f3410d1a7901c7b846a73446311b5164b45a03f0e613f208f234",
            "service": "52.13.132.146:19999",
            "pubKeyOperator": "87d25769002af2a4f050127c73fff03a24935e48f34fecaacd69410787d0e6384b345c78e81b1cb397b43dcd635568b6",
            "valid": true
        },
        {
            "proTxHash": "9712e85d660fa2f761f980ef5812c225f33f336f285728803dcd421937d3df54",
            "service": "35.82.197.197:19999",
            "pubKeyOperator": "a8dbccb130522909dc710a65728006732c18441757f12a338cf4a6d8cbd5baf1a484537a6a0542f51bb686e6e546f1a0",
            "valid": true
        },
        {
            "proTxHash": "20107ec50e81880dca18178bb7e53e2d0449c0734106a607253b9af2ffea006c",
            "service": "35.85.21.179:19999",
            "pubKeyOperator": "b6e979f20241cbb73de7451779e8e059d9cb75a74b72ea6862d7ac703dc2ac07d86cec39b6e8923b55fd54dbc6177c3a",
            "valid": true
        },
        {
            "proTxHash": "05b687978344fa2433b2aa99d41f643e2d8581a789cdc23084889ceca5244ea8",
            "service": "52.24.124.162:19999",
            "pubKeyOperator": "80f8efb42f65ed9650078785be5d13e6e90eb9df87a99261d4de34df2b4b79a9c9b8c5e1aec7ac068ebef14636ceac4c",
            "valid": true
        },
        {
            "proTxHash": "8e11eb784883d3dc9d0d74a74633f067dc61c408dfdee49b8f93bb161f2916c0",
            "service": "52.89.154.48:19999",
            "pubKeyOperator": "8160877a911d8bb7d1e75e2320e98cc3233c1f6972cb642424bfcec7c182c56d2c0ebb59e45f788f4d5dbfa2ebff3e3a",
            "valid": true
        },
        {
            "proTxHash": "87075234ac47353b42bb97ce46330cb67cd4648c01f0b2393d7e729b0d678918",
            "service": "35.167.145.149:19999",
            "pubKeyOperator": "a7afe7674de986aff5e2e0a173be8c29abed8b5d6f878389ea18be0d43c62ad1ba66a59e9e8d8453aa0ed1a696976758",
            "valid": true
        },
        {
            "proTxHash": "91bbce94c34ebde0d099c0a2cb7635c0c31425ebabcec644f4f1a0854bfa605d",
            "service": "52.40.219.41:19999",
            "pubKeyOperator": "81ad0f9be5a88ae62ff54fe938dfceea71be03bd4c6a7aebf75896e8d495d310acc4146aa4820bc0e5f5b06579dedea5",
            "valid": true
        },
        {
            "proTxHash": "88251bd4b124efeb87537deabeec54f6c8f575f4df81f10cf5e8eea073092b6f",
            "service": "52.33.28.47:19999",
            "pubKeyOperator": "af9cd8567923fea3f6e6bbf5e1b3a76bf772f6a3c72b41be15c257af50533b32cc3923cebdeda9fce7a6bc9659123d53",
            "valid": true
        },
        {
            "proTxHash": "40784f3f9a761c60156f9244a902c0626f8bc8fe003786c70f1fc6be41da467d",
            "service": "52.10.229.11:19999",
            "pubKeyOperator": "82f60dad4b7b498379d1c700da56d4927727eab4387a793b861a96df47bdabe5666c270acf04b5b842ab54045bbf102a",
            "valid": true
        },
        {
            "proTxHash": "5c6542766615387183715d958a925552472f93335fa1612880423e4bbdaef436",
            "service": "44.239.39.153:19999",
            "pubKeyOperator": "86d0a2ca6f434eaa47ff6919ecafa4fc3b012b89c62a04835a24c00faf62c3d30d3f8755c33a7abc595e96fb5b79594a",
            "valid": true
        }
    ],
    "quorumPublicKey": "a745d35df9873944150bf2244b97f791a844a09c9fb25e8adc3e3992846a348e571deb3b50e247a4682bf681c595ca87"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
