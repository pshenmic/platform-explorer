

## Getting lists

##
### Parameters

page: `number` 

limit: `number`

order: `asc` / `desc`

##
### Api

Blocks:

`https://platform-explorer.pshenmic.dev/blocks?page=${page}&limit=${limit}&order=${order}`

Transactions:

`https://platform-explorer.pshenmic.dev/transactions?page=${page}&limit=${limit}&order=${order}`

Datacontracts:

`https://platform-explorer.pshenmic.dev/dataContracts?page=${page}&limit=${limit}&order=${order}`

Identities:

`https://platform-explorer.pshenmic.dev/identities?page=${page}&limit=${limit}&order=${order}`


#
---
## Entities details

Block:

`https://platform-explorer.pshenmic.dev/block/${blockHash}`


Transaction:

`https://platform-explorer.pshenmic.dev/transaction/${txHash}`

Data contract:

`https://platform-explorer.pshenmic.dev/dataContract/${identifier}`

Document:

`https://platform-explorer.pshenmic.dev/document/${identifier}`


Identity:

`https://platform-explorer.pshenmic.dev/identity/${identifier}`

#
---
## Entities connections

Documents of data contract:

`https://platform-explorer.pshenmic.dev/dataContract/${dataContractIdentifier}/documents?page=${page}&limit=${limit}&order=${order}`

#

Identity transfers:

`https://platform-explorer.pshenmic.dev/identity/${identifier}/transfers`

Identity documents:

`https://platform-explorer.pshenmic.dev/identity/${identifier}/documents`

Identity dataContracts:

`https://platform-explorer.pshenmic.dev/identity/${identifier}/dataContracts`

Identity transactions:

`https://platform-explorer.pshenmic.dev/identity/${identifier}/transactions`



#
---
## Common info

Getting status:

`https://platform-explorer.pshenmic.dev/status`

#
## Utilities

Search any type of entities:

`https://platform-explorer.pshenmic.dev/search?query=${query}`

Transaction decoding:

`https://platform-explorer.pshenmic.dev/transaction/decode`