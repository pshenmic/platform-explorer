# Platform Explorer Data Contract

A simple utility for deploying a date contract that stores identifiers and names/aliases for them.

before launching, you need to enter your data in the `.env` file

---

## Prerequisites

- Node.js 20+

Insert your data in .env
```
npm install
```
---

## Register Identifier
We can register new identifier by this command
```
npm run identity:register
```
**Required env vars:**
* `MNEMONIC`
* `OWNER_IDENTIFIER`
---

## Deploy Contract
We can deploy data-contract from `schema.json` by this command
```
npm run dataContract:deploy
```
**Required env vars:**
* `MNEMONIC`
* `OWNER_IDENTIFIER`
---

## Push Document
We can push document from `document.json` by this command
```
npm run dataContract:deploy
```
**Required env vars:**
* `MNEMONIC`
* `OWNER_IDENTIFIER`
* `DOCUMENT_NAME`
* `CONTRACT_ID`
---

## Env Vars
* `MNEMONIC` - wallet mnemonic
* `OWNER_IDENTIFIER` - identifier which be used for interaction with blockchain
* `DOCUMENT_NAME` - name for document
* `CONTRACT_ID` - contract id for push
* `SKIP_SYNCHRONIZATION_BEFORE_HEIGHT` - core property