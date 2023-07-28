# Dash Platform Explorer

![image](assets/screenshot.png)

## Initial setup

This project currently relies only on the Tenderdash RPC.
To access platform chain data, you will need an instance of tenderdash running.
You can get it via starting your node with the `dashmate` (it can be testnet, devnet, or local dev node)

1) Start node
```bash
npm install -g dashmate
dashmate setup # choose testnet evo fullnode f.e.
dashmate start
dashmate status platform
```

Once core is synced, the tenderdash rpc will start accepting requests

2) Run backend



Set `BASE_URL=http://tenderdashUrl:36657` in the `packages/frontend/.env`

```
$ yarn workspaces api start
```

3) Start frontend

Set `REACT_APP_API_BASE_URL=http://127.0.0.1:3005` in the `packages/frontend/.env`

```
$ yarn workspaces frontend start
```
