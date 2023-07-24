const BASE_URL = process.env.REACT_APP_API_BASE_URL

const call = async (path, method, body) => {
    try {
        const response = await fetch(`${BASE_URL}/${path}`, {
            signal: AbortSignal.timeout(10000),
            method,
            headers: {
                'content-type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        })

        if (response.status === 200) {
            return response.json()
        } else {
            const text = await response.text()

            let json
            try {
                json = JSON.parse(text)
            }catch (e) {
            }

            if (json?.error) {
                throw new Error(json.error)
            }

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

const getBlocks = (page = 1, limit = 30) => {
    return call(`blocks?page=${page}&limit=${limit}`, 'GET')
}

const getStatus = () => {
    return call(`status`, 'GET')
}

const search = (query) => {
    return call(`search?query=${query}`, 'GET')
}

const decodeTx = (base64) => {
    return call(`transaction/decode`, 'POST', {base64})
}

export {getStatus, getBlocks, getBlockByHash, getTransactions, getTransaction, search, decodeTx}
