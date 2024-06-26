## HTTP API

Platform Explorer HTTP API allow you to query and see platform blockchain data programmatically with a REST interface via HTTP calls. You can use it to build, test, or improve your applications.

API is still under ongoing development, so refer to this page or repo documentation for the most up-to-date latest specification.

Production (testnet) live URL is [https://platform-explorer.pshenmic.dev](https://platform-explorer.pshenmic.dev)

Reference:

* [Status](#status)
* [Block by hash](#block-by-hash)
* [Blocks](#blocks)
* [Transaction by hash](#transaction-by-hash)
* [Transactions](#transactions)
* [Data Contract](#data-contract-by-identifier)
* [Data Contracts](#data-contracts)
* [Document by Identifier](#document-by-identifier)
* [Documents by Data Contract](#documents-by-data-contract)
* [Identity by Identifier](#identity-by-identifier)
* [Identities](#identities)
* [Data Contracts by Identity](#data-contracts-by-identity)
* [Documents by Identity](#documents-by-identity)
* [Transactions By Identity](#transactions-by-identity)
* [Transfers by Identity](#transfers-by-identity)

### Status
Returns basic stats and epoch info

* apiHeight - current height available in the API
* maPeerHeight - max peer height seen in the network
* tenderdashChainHeight - current blockchain height on the node


```
HTTP /status

{
    epoch: {
        index: 3,
        startTime: "2024-04-08T14:00:00.000Z",
        endTime: "2024-04-09T14:00:00.000Z"
    },
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
```
GET /validators

{
  resultSet: [
    {
      "proTxHash": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
      "proposedBlocksAmount": 5,
      "lastProposedBlockHeader": {
        "height": 5,
        "timestamp": "2024-06-23T13:51:44.154Z",
        "hash": "7253F441FF6AEAC847F9E03672B9386E35FC8CBCFC4A7CC67557FCA10E342904",
        "l1LockedHeight": 1337,
        "appVersion": 1,
        "blockVersion": 13
        "validator": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0"
      }
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
  "proTxHash": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0",
  "proposedBlocksAmount": 5,
  "lastProposedBlockHeader": {
    "height": 5,
    "timestamp": "2024-06-23T13:51:44.154Z",
    "hash": "7253F441FF6AEAC847F9E03672B9386E35FC8CBCFC4A7CC67557FCA10E342904",
    "l1LockedHeight": 1337,
    "appVersion": 1,
    "blockVersion": 13,
    "validator": "F60A6BF9EC0794BB0CFD1E0F2217933F4B33EDE6FE810692BC275CA18148AEF0"
  }
}
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
### Identities
Return all identities paged and order by block height, tx count or balance.

* Valid `order_by` values are `block_height`, `tx_count` or `balance`
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

### Data contracts by Identity
Return all data contracts by the given identity

* `name` field is nullable
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
```
GET /identities/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec/transfers?page=1&limit=10&order=asc

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
Return a series data for the amount of transactions chart with variable timespan (1h, 24h, 3d, 1w)
```
GET /transactions/history?timespan=1h
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
400: Invalid input, check timespan value
500: Internal Server Error
```
