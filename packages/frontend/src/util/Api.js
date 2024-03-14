const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const fetchWrapper = (url, options) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject('RPC_TIMEOUT'), 10000)

        fetch(url, options).catch(reject).then(resolve)
    })
}

const call = async (path, method, body) => {
    try {
        const response = await fetchWrapper(`${BASE_URL}/${path}`, {
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
            } catch (e) {
            }

            if (json?.error) {
                throw new Error(json.error)
            }

            console.error(text)
            throw new Error('Unknown status code: ' + response.status)
        }
    } catch (e) {
        if (e === 'RPC_TIMEOUT') {
            throw new Error('Request to Tenderdash RPC is timed out')
        }

        console.error(e)
        throw new Error(e)
    }
}

const getBlockByHash = (hash) => {
    return call(`block/${hash}`, 'GET')
}

const getTransactions = (page = 1, limit = 30, order = 'asc') => {
    return call(`transactions?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getTransaction = (txHash) => {
    return call(`transaction/${txHash}`, 'GET')
}

const getBlocks = (page = 1, limit = 30, order = 'asc') => {
    return call(`blocks?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getDataContractByIdentifier = (identifier) => {
    return call(`dataContract/${identifier}`, 'GET')
}

const getDataContracts = (page = 1, limit = 30, order = 'asc') => {
    return call(`dataContracts?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getDocumentByIdentifier = (identifier) => {
    return call(`document/${identifier}`, 'GET')
}

const getDocumentsByDataContract = (dataContractIdentifier, page = 1, limit = 30, order = 'asc') => {
    return call(`dataContract/${dataContractIdentifier}/documents?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getTransactionsByIdentity = (identifier) => {
    return call(`identity/${identifier}/transactions`, 'GET')
}

const getDataContractsByIdentity = (identifier) => {
    return call(`identity/${identifier}/dataContracts`, 'GET')
}

const getDocumentsByIdentity = (identifier) => {
    return call(`identity/${identifier}/documents`, 'GET')
}

const getTransfersByIdentity = (identifier) => {
    return call(`identity/${identifier}/transfers`, 'GET')
}

const getIdentity = (identifier) => {
    return call(`identity/${identifier}`, 'GET')
}

const getIdentities = () => {
    return call(`identities`, 'GET')
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

export {
    getStatus,
    getBlocks,
    getBlockByHash,
    getTransactions,
    getTransaction,
    search,
    decodeTx,
    getDocumentsByDataContract,
    getDocumentByIdentifier,
    getDataContractByIdentifier,
    getDataContracts,
    getIdentities,
    getIdentity,
    getTransactionsByIdentity,
    getDataContractsByIdentity,
    getDocumentsByIdentity,
    getTransfersByIdentity
}
