import { ResponseErrorNotFound, ResponseErrorTimeout } from './Errors'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const fetchWrapper = (url, options) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new ResponseErrorTimeout()), 30000)
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
    } else if (response.status === 404) {
      throw new ResponseErrorNotFound()
    } else {
      const text = await response.text()
      console.error(text)
      const error = new Error('Unknown status code: ' + response.status)
      throw error
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

const getBlockByHash = (hash) => {
  return call(`block/${hash}`, 'GET')
}

const getTransactionsHistory = (timespan = '24h') => {
  return call(`transactions/history?timespan=${timespan}`, 'GET')
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

const getBlocksByValidator = (proTxHash, page = 1, limit = 30, order = 'asc') => {
  return call(`validator/${proTxHash}/blocks?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getDataContractByIdentifier = (identifier) => {
  return call(`dataContract/${identifier}`, 'GET')
}

const getDataContracts = (page = 1, limit = 30, order = 'asc', orderBy) => {
  return call(`dataContracts?page=${page}&limit=${limit}&order=${order}${orderBy ? `&order_by=${orderBy}` : ''}`, 'GET')
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

const getIdentities = (page = 1, limit = 30, order = 'asc', orderBy) => {
  return call(`identities?page=${page}&limit=${limit}&order=${order}${orderBy ? `&order_by=${orderBy}` : ''}`, 'GET')
}

const getValidators = (page = 1, limit = 30, order = 'asc', isActive = true, orderBy) => {
  return call(`validators?page=${page}&limit=${limit}&order=${order}&isActive=${String(isActive)}${orderBy ? `&order_by=${orderBy}` : ''}`, 'GET')
}

const getValidatorByProTxHash = (proTxHash) => {
  return call(`validator/${proTxHash}`, 'GET')
}

const getBlocksStatsByValidator = (proTxHash, timespan = '24h') => {
  return call(`validator/${proTxHash}/stats?timespan=${timespan}`, 'GET')
}

const getStatus = () => {
  return call('status', 'GET')
}

const search = (query) => {
  return call(`search?query=${query}`, 'GET')
}

const decodeTx = (base64) => {
  return call('transaction/decode', 'POST', { base64 })
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
  getTransfersByIdentity,
  getValidators,
  getValidatorByProTxHash,
  getBlocksByValidator,
  getBlocksStatsByValidator
}
