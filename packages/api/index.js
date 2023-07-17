const express = require('express');
const fetch = require('node-fetch')
const app = express();
const cors = require('cors')

const BASE_URL = process.env.BASE_URL

app.use(cors())

class ServiceNotAvailableError extends Error {
}

const call = async (path, method, body) => {
    console.log(`Request for the ${BASE_URL}/${path}`)

    try {
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
            throw new Error(`Unknown status code from Tenderdash RPC (${response.status})`)
        }
    } catch (e) {
        console.error(e)
        throw new ServiceNotAvailableError()
    }
}

function errorHandler(err, req, res) {
    if (err instanceof ServiceNotAvailableError) {
        res.status(403)
        return res.send({error: 'tenderdash backend is not available'})
    }

    console.error(err)
    res.status(500)

    res.send({error: err.message})
}


app.get('/status', async (req, res, next) => {
    try {
        const {sync_info, node_info} = await call('status', 'GET')
        const {latest_block_height} = sync_info
        const {network, protocol_version} = node_info

        const tenderdashVersion = node_info.version
        const appVersion = protocol_version.app
        const p2pVersion = protocol_version.p2p
        const blockVersion = protocol_version.block
        const blocksCount = latest_block_height

        res.send({network, appVersion, p2pVersion, blockVersion, blocksCount, tenderdashVersion});
    } catch (e) {
        next(e)
    }
});

app.get('/block/:hash', async (req, res, next) => {
    const {hash} = req.params;

    try {
        const block = await call(`block_by_hash?hash=${hash}`, 'GET')
        res.send(block);
    } catch (e) {
        next(e)
    }
});

app.get('/blocks', async (req, res, next) => {
    try {
        const blocks = await call(`block_search?query=block.height>1`, 'GET')
        res.send(blocks);
    } catch (e) {
        next(e)
    }
});

app.get('/transactions', async (req, res, next) => {
    try {
        const transactions = await call(`tx_search?query=tx.height>1`, 'GET')
        res.send(transactions);

    } catch (e) {
        next(e)
    }
});

app.get('/transaction/:txHash', async (req, res, next) => {
    try {
        const {txHash} = req.params;

        const tx = await call(`tx?hash=${txHash}`, 'GET')
        res.send(tx)
    } catch (e) {
        next(e)
    }
});

app.use(errorHandler)

app.listen(3005)

