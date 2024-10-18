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
* [Transaction by hash](#transaction-by-hash)
* [Transactions](#transactions)
* [Data Contract By Identifier](#data-contract-by-identifier)
* [Data Contracts](#data-contracts)
* [Document by Identifier](#document-by-identifier)
* [Documents by Data Contract](#documents-by-data-contract)
* [Identity by Identifier](#identity-by-identifier)
* [Identity by DPNS](#identity-by-dpns)
* [Identities](#identities)
* [Data Contracts by Identity](#data-contracts-by-identity)
* [Documents by Identity](#documents-by-identity)
* [Transactions By Identity](#transactions-by-identity)
* [Transfers by Identity](#transfers-by-identity)
* [Transactions history](#transactions-history)
* [Rate](#rate)

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
GET /block/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF

{
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
      endpoints: {
        coreP2PPortStatus: {
          host: '52.33.28.41',
          port: 19999,
          status: 'ERROR'
        },
        platformP2PPortStatus: {
          host: '52.33.28.41',
          port: 36656,
          status: 'ERROR'
        },
        platformGrpcPortStatus: {
          host: '52.33.28.41',
          port: 1443,
          status: 'ERROR'
        }
      }
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
  lastWithdrawalTime: "2024-10-12T03:15:19.257Z"
}
```
---
### Validator stats by ProTxHash
Return a series data for the amount of proposed blocks by validator chart with

* `start` lower interval threshold in ISO string ( _optional_ )
* `end` upper interval threshold in ISO string ( _optional_ )


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
    error: null
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

```
GET /transactions?=1&limit=10&order=asc

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
        error: null
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
    aliases: ["test.dash"...]
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
GET /dpns/identity?dpns=test-name.1.dash

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
    aliases: []
}
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
        aliases: ["test.dash"]
    }, ...
    ]
}
```
Response codes:
```
200: OK
500: Internal Server Error
```

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
        error: null
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
### Transactions history
Return a series data for the amount of transactions chart

* `start` lower interval threshold in ISO string ( _optional_ )
* `end` upper interval threshold in ISO string ( _optional_ )

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
