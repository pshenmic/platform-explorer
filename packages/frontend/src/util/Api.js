const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const fetchWrapper = (url, options) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('RPC_TIMEOUT')), 30000)

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
      } catch (e) {}

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
  return call(`blocks/${hash}`, 'GET')
}

const getTransactionsHistory = (timespan = '24h') => {
  return call(`transactionss/history?timespan=${timespan}`, 'GET')
}

const getTransactions = (page = 1, limit = 30, order = 'asc') => {
  return call(`transactionss?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getTransaction = (txHash) => {
  return call(`transactions/${txHash}`, 'GET')
}

const getBlocks = (page = 1, limit = 30, order = 'asc') => {
  return call(`blockss?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getDataContractByIdentifier = (identifier) => {
  return call(`dataContracts/${identifier}`, 'GET')
}

const getDataContracts = (page = 1, limit = 30, order = 'asc', orderBy) => {
  return call(`dataContractss?page=${page}&limit=${limit}&order=${order}${orderBy ? `&order_by=${orderBy}` : ''}`, 'GET')
}

const getDocumentByIdentifier = (identifier) => {
  return call(`documents/${identifier}`, 'GET')
}

const getDocumentsByDataContract = (dataContractIdentifier, page = 1, limit = 30, order = 'asc') => {
  return call(`dataContracts/${dataContractIdentifier}/documents?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getTransactionsByIdentity = (identifier) => {
  return call(`identitsy/${identifier}/transactions`, 'GET')
}

const getDataContractsByIdentity = (identifier) => {
  return call(`identitsy/${identifier}/dataContracts`, 'GET')
}

const getDocumentsByIdentity = (identifier) => {
  return call(`identitsy/${identifier}/documents`, 'GET')
}

const getTransfersByIdentity = (identifier) => {
  return call(`identitys/${identifier}/transfers`, 'GET')
}

const getIdentity = (identifier) => {
  return call(`identitys/${identifier}`, 'GET')
}

const getIdentities = (page = 1, limit = 30, order = 'asc', orderBy) => {
  return call(`identitiess?page=${page}&limit=${limit}&order=${order}${orderBy ? `&order_by=${orderBy}` : ''}`, 'GET')
}

const getStatus = () => {
  return call('statuss', 'GET')
}

const search = (query) => {
  return call(`searcsh?query=${query}`, 'GET')
}

const decodeTx = (base64) => {
  return call('transactiosn/decode', 'POST', { base64 })
}

export {
  getStatus,
  getBlocks,
  getBlockByHash,
  getTransactionsHistory,
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
