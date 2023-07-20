const BASE_URL = process.env.REACT_APP_API_BASE_URL

const call = async (path, method, body) => {
    try {
        const response = await fetch(`${BASE_URL}/${path}`, {
            signal: AbortSignal.timeout(10000),
            method,
            body
        })

        if (response.status === 200) {
            return response.json()
        } else {
            const text = await response.text()
            console.error(text)
            throw new Error('Unknown status code: ' + response.status)
        }
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error('Request to Tenderdash RPC is timed out')
        }

        console.error(e)
        throw new Error(e)
    }
}

const getBlockByHash = (hash) => {
    return call(`block/${hash}`, 'GET')
}

const getTransactions = () => {
    return call(`transactions`, 'GET')
}

const getTransaction = (txHash) => {
    return call(`transaction/${txHash}`, 'GET')
}

const getBlocks = (fromHeight, toHeight) => {
    let query = 'blocks'

    if (fromHeight) {
        query += `?from=${fromHeight}`
    }

    if (toHeight) {
        query += `&to=${toHeight}`
    }

    return call(query, 'GET')
}

const getStatus = () => {
    return call(`status`, 'GET')
}

export {getStatus, getBlocks, getBlockByHash, getTransactions, getTransaction}
