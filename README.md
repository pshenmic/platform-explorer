 # Dash Platform Explorer

![Dash](https://img.shields.io/badge/dash-008DE4?style=for-the-badge&logo=dash&logoColor=white)
![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

![a](https://github.com/pshenmic/platform-explorer/actions/workflows/build.yml/badge.svg)

___

### **Platform Explorer**

Index and explore Dash Platform (Evolution) chain data, continuously parsing blockchain in the background. 

Main features:
* Data Contracts with schemas
* Documents with data
* Search and list the data
* Supports last Dash Platform release (testnet)

## Prerequisites
* PostgreSQL
* Rust 1.73+
* Node.js 18+
* Tenderdash (RPC)

To access Tenderdash RPC, you will need a dash evonode fullnode instance running. You can get it via starting your node with the [dashmate](https://github.com/dashpay/platform/tree/master/packages/dashmate "dashmate") (testnet or local dev node)

Example:
```bash
dashmate setup testnet fullnode
dashmate start
dashmate status core
dashmate status platform
```

Once synced, your Tenderdash RPC will be accessible at http://127.0.0.1:36657
___
### Running

#### _only dev mode is implemented atm_

### Indexer

If you want to use additional features, such as subscribing to new blocks, you must specify these variables.

```
REDIS_URL=redis://default@127.0.0.1:6379
REDIS_PUBSUB_NEW_BLOCK_CHANNEL=block
```

Verify `packages/indexer/.env` with your PostgreSQL credentials and Core RPC URL, Tenderdash RPC URL, then do:
```bash
cd packages/indexer
cargo run
```

After successful build, indexer should start and connect to the Tenderdash RPC and start persisting chain data into PostgreSQL

### Backend

Verify `packages/api/.env` with your PostgreSQL credentials and TenderdashRPC URLs, then do:

```
cd packages/api
npm install
npm start
```

### Frontend

Verify your `packages/frontend/.env` is matching your backend API URL

Then:
```
cd packages/frontend
npm install
npm start
```
