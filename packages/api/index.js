const express = require('express');
const fetch = require('node-fetch')
const app = express();
const cors = require('cors')
const cache = require('./src/cache')
const Worker = require('./src/worker')
const crypto = require('crypto')

const BASE_URL = process.env.BASE_URL
const BLOCK_TIME = 3 * 1000;
app.use(cors())

class ServiceNotAvailableError extends Error {
}

// const worker = new Worker()
// worker.setHandler(async () => {
//     try {
//     } catch (e) {
//     }
// })
// worker.start(3000)

const hash = (data) => {
    return crypto.createHash('sha1').update(data).digest('hex');
}

const call = async (path, method, body) => {
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

function errorHandler(err, req, res, next) {
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
        const cached = cache.get('status')

        if (cached) {
            return res.send(cached)
        }

        const {sync_info, node_info} = await call('status', 'GET')
        const {latest_block_height} = sync_info
        const {network, protocol_version} = node_info

        const tenderdashVersion = node_info.version
        const appVersion = protocol_version.app
        const p2pVersion = protocol_version.p2p
        const blockVersion = protocol_version.block
        const blocksCount = latest_block_height

        const status = {
            network,
            appVersion,
            p2pVersion,
            blockVersion,
            blocksCount,
            tenderdashVersion
        }

        cache.set('status', status, BLOCK_TIME)

        res.send(status);
    } catch (e) {
        next(e)
    }
});

app.get('/block/:hash', async (req, res, next) => {
    const {hash} = req.params;

    try {
        const cached = cache.get('block_' + hash)

        if ((new Date().getTime() - cached?.time) > cached?.timeout) {
            return res.send(cached)
        }

        const block = await call(`block_by_hash?hash=${hash}`, 'GET')

        cache.set('block_' + hash, block);

        res.send(block);
    } catch (e) {
        next(e)
    }
});

app.get('/blocks', async (req, res, next) => {
    try {
        const {from, to} = req.query

        let query = `block_search?query=`

        if (from) {
            query += `block.height>${from}`
        } else {
            query += `block.height>1`
        }

        if (to) {
            query += `%20AND%20block.height<${to}`
        }

        const cached = cache.get('block_search' + hash(query))

        if (cached) {
            return res.send(cached)
        }

        const blocks = await call(query, 'GET')

        cache.set('block_search' + hash(query), blocks)

        res.send(blocks);
    } catch (e) {
        next(e)
    }
});

app.get('/transactions', async (req, res, next) => {
    try {
        const {from, to} = req.query

        let query = `tx_search?query=`

        if (from) {
            query += `tx.height>${from}`
        } else {
            query += `tx.height>1`
        }

        if (to) {
            query += `%20AND%20tx.height<${to}`
        }

        const cached = cache.get('tx_search_' + hash(query))

        if (cached) {
            return res.send(cached)
        }

        const transactions = await call(`tx_search?query=tx.height>1`, 'GET')

        cache.set('tx_search_' + hash(query))

        res.send(transactions);
    } catch (e) {
        next(e)
    }
});

app.get('/transaction/:txHash', async (req, res, next) => {
    try {
        const {txHash} = req.params;

        const cached = cache.get('transaction_' + txHash)

        if (cached) {
            return res.send(cached)
        }

        const transaction = await call(`tx?hash=${txHash}`, 'GET')

        cache.set('transaction_' + txHash)

        res.send(transaction)
    } catch (e) {
        next(e)
    }
});

app.use(errorHandler)

app.listen(3005)

console.log('Api started')
