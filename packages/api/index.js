const express = require('express');
const fetch = require('node-fetch')
const app = express();
const cors = require('cors')
const BASE_URL = 'http://127.0.0.1:46657'

app.use(cors())

const call = async (path, method, body) => {
    console.log(`${BASE_URL}/${path}`)
    const response = await fetch(`${BASE_URL}/${path}`, {
        method,
        body,
        headers: {
            'content-type': 'application/json'
        }
    })

    if (response.status === 200) {
        return response.json()
    } else {
        const text = await response.text()
        console.error(text)
        throw new Error(`Unknown return status ${response.status} from tenderdash`)
    }
}

app.get('/status', async (req, res) => {
    const {sync_info, node_info} = await call('status', 'GET')
    const {latest_block_height} = sync_info
    const {network, protocol_version} = node_info

    const tenderdashVersion = node_info.version
    const appVersion = protocol_version.app
    const p2pVersion = protocol_version.p2p
    const blockVersion = protocol_version.block
    const blocksCount = latest_block_height

    res.send({network, appVersion, p2pVersion, blockVersion, blocksCount, tenderdashVersion});
});

app.get('/block/:hash', async (req, res) => {
    const {hash} = req.params;

    const block = await call(`block_by_hash?hash=${hash}`, 'GET')
    res.send(block);
});

app.get('/blocks', async (req, res) => {
    const blocks = await call(`block_search?query=block.height>1`, 'GET')
    res.send(blocks);
});

app.get('/transactions', async (req, res) => {
    const transactions = await call(`tx_search?query=tx.height>1`, 'GET')
    res.send(transactions);
});

app.get('/transaction/:txHash', async (req, res) => {
    const {txHash} = req.params;

    const tx = await call(`tx?hash=${txHash}`, 'GET')
    res.send(tx);
});

app.listen(3005)

