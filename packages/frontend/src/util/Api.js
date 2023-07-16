const BASE_URL = process.env.REACT_APP_API_BASE_URL

const call = async (path, method, body) => {
    try {
        const response = await fetch(`${BASE_URL}/${path}`, {method, body})

        if (response.status === 200) {
            return response.json()
        } else {
            const text = await response.text()
            console.error(text)
        }
    } catch (e) {
        console.error(e)
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

const getBlocks = () => {
    return call(`blocks`, 'GET')
}

const getStatus = () => {
    return call(`status`, 'GET')
}

export {getStatus, getBlocks, getBlockByHash, getTransactions, getTransaction}
