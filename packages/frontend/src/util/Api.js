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

const getTransactionsHistory = (start, end, intervalsCount) => {
  return call(`transactions/history?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`, 'GET')
}

const prepareQueryParams = (params = {}) => {
  const queryParams = new URLSearchParams()

  const parameterIsValid = (value) => {
    return value !== undefined && value !== ''
  }

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach(item => {
          if (parameterIsValid(item)) {
            queryParams.append(key, item)
          }
        })
      }
    } else if (parameterIsValid(value)) {
      queryParams.append(key, value)
    }
  })

  return queryParams
}

const getTransactions = (page = 1, limit = 10, order = 'asc', filters = {}) => {
  const params = prepareQueryParams({
    page: Math.max(1, parseInt(page)),
    limit: Math.max(1, parseInt(limit)),
    order,
    ...filters
  })

  return call(`transactions?${params.toString()}`, 'GET')
}

const getTransaction = (txHash) => {
  return call(`transaction/${txHash}`, 'GET')
}

const getTokens = (page = 1, limit = 30, order = 'asc', filters = {}) => {
  const params = prepareQueryParams({
    page: Math.max(1, parseInt(page)),
    limit: Math.max(1, parseInt(limit)),
    order,
    ...filters
  })

  return call(`tokens?${params.toString()}`, 'GET')
}

const getTokensRating = (page = 1, limit = 10, order = 'asc', filters = {}) => {
  const params = prepareQueryParams({
    page: Math.max(1, parseInt(page)),
    limit: Math.max(1, parseInt(limit)),
    order,
    ...filters
  })

  return call(`tokens/rating?${params.toString()}`, 'GET')
}

const getToken = (identifier) => {
  return call(`token/${identifier}`, 'GET')
}

const getTokenTransitions = (identifier, page = 1, limit = 30, order = 'asc') => {
  return call(`token/${identifier}/transitions?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getBlocks = (page = 1, limit = 30, order = 'asc', filters = {}) => {
  const params = prepareQueryParams({
    page: Math.max(1, parseInt(page)),
    limit: Math.max(1, parseInt(limit)),
    order,
    ...filters
  })

  return call(`blocks?${params.toString()}`, 'GET')
}

const getBlocksByValidator = (proTxHash, page = 1, limit = 30, order = 'asc') => {
  return call(`validator/${proTxHash}/blocks?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getContestedResources = (page = 1, limit = 30, order = 'asc', orderBy, filters = {}) => {
  const params = prepareQueryParams({
    page: Math.max(1, parseInt(page)),
    limit: Math.max(1, parseInt(limit)),
    order,
    order_by: orderBy,
    ...filters
  })

  return call(`contestedResources?${params.toString()}`, 'GET')
}

const getContestedResourceByValue = (value) => {
  return call(`contestedResource/${value}`, 'GET')
}

const getContestedResourceVotes = (value, page = 1, limit = 30, order = 'asc', filters = {}) => {
  const params = prepareQueryParams({
    page: Math.max(1, parseInt(page)),
    limit: Math.max(1, parseInt(limit)),
    order,
    ...filters
  })

  return call(`contestedResource/${value}/votes?${params.toString()}`, 'GET')
}

const getDataContractByIdentifier = (identifier) => {
  return call(`dataContract/${identifier}`, 'GET')
}

const getDataContractTransactions = (identifier, page = 1, limit = 30, order = 'asc') => {
  return call(`dataContract/${identifier}/transactions?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getDataContracts = (page = 1, limit = 30, order = 'asc', orderBy, filters = {}) => {
  const params = prepareQueryParams({
    page: Math.max(1, parseInt(page)),
    limit: Math.max(1, parseInt(limit)),
    order,
    order_by: orderBy,
    ...filters
  })

  return call(`dataContracts?${params.toString()}`, 'GET')
}

const getDocumentByIdentifier = (identifier, dataContractId, typeName) => {
  const params = []
  if (dataContractId) params.push(`contract_id=${dataContractId}`)
  if (typeName) params.push(`document_type_name=${typeName}`)
  const queryParams = params.join('&')

  return call(`document/${identifier}?${queryParams ? `?${queryParams}` : ''}`, 'GET')
}

const getDocumentRevisions = (identifier, page = 1, limit = 30, order = 'asc') => {
  return call(`document/${identifier}/revisions?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getDocumentsByDataContract = (dataContractIdentifier, page = 1, limit = 30, order = 'asc') => {
  return call(`dataContract/${dataContractIdentifier}/documents?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getEpoch = (identifier) => {
  return call(`epoch/${identifier || ''}`, 'GET')
}

const getTransactionsByIdentity = (identifier, page = 1, limit = 10, order = 'asc') => {
  return call(`identity/${identifier}/transactions?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getDataContractsByIdentity = (identifier, page = 1, limit = 10, order = 'asc') => {
  return call(`identity/${identifier}/dataContracts?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getDocumentsByIdentity = (identifier, page = 1, limit = 10, order = 'asc') => {
  return call(`identity/${identifier}/documents?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getWithdrawalsByIdentity = (identifier, page = 1, limit = 10, order = 'asc') => {
  return call(`identity/${identifier}/withdrawals?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getTransfersByIdentity = (identifier, page = 1, limit = 10, order = 'asc') => {
  return call(`identity/${identifier}/transfers?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getTokensByIdentity = (identifier, page = 1, limit = 10, order = 'asc') => {
  return call(`identity/${identifier}/tokens?page=${page}&limit=${limit}&order=${order}`, 'GET')
}

const getIdentity = (identifier) => {
  return call(`identity/${identifier}`, 'GET')
}

const getIdentities = (page = 1, limit = 30, order = 'asc', orderBy) => {
  return call(`identities?page=${page}&limit=${limit}&order=${order}${orderBy ? `&order_by=${orderBy}` : ''}`, 'GET')
}

const getValidators = (page = 1, limit = 30, order = 'asc', isActive, orderBy) => {
  return call(`validators?page=${page}&limit=${limit}&order=${order}${typeof isActive === 'boolean' ? `&isActive=${String(isActive)}` : ''}${orderBy ? `&order_by=${orderBy}` : ''}`, 'GET')
}

const getValidatorByProTxHash = (proTxHash) => {
  return call(`validator/${proTxHash}`, 'GET')
}

const getBlocksStatsByValidator = (proTxHash, start, end, intervalsCount) => {
  return call(`validator/${proTxHash}/stats?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`, 'GET')
}

const getRewardsStatsByValidator = (proTxHash, start, end, intervalsCount) => {
  return call(`validator/${proTxHash}/rewards/stats?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`, 'GET')
}

const getMasternodeVotes = (page = 1, limit = 10, order = 'asc', filters = {}) => {
  const params = prepareQueryParams({
    page: Math.max(1, parseInt(page)),
    limit: Math.max(1, parseInt(limit)),
    order,
    ...filters
  })

  return call(`masternodes/votes?${params.toString()}`, 'GET')
}

const getContestedResourcesStats = () => {
  return call('contestedResources/stats', 'GET')
}

const getStatus = () => {
  return call('status', 'GET')
}

const getRate = () => {
  return call('rate', 'GET')
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
  getContestedResources,
  getContestedResourceByValue,
  getContestedResourceVotes,
  getBlockByHash,
  getTransactionsHistory,
  getTransactions,
  getTransaction,
  getTokens,
  getToken,
  getTokenTransitions,
  getTokensRating,
  search,
  decodeTx,
  getDocumentsByDataContract,
  getDocumentByIdentifier,
  getDocumentRevisions,
  getDataContractByIdentifier,
  getDataContracts,
  getIdentities,
  getIdentity,
  getTransactionsByIdentity,
  getDataContractsByIdentity,
  getDataContractTransactions,
  getDocumentsByIdentity,
  getTransfersByIdentity,
  getWithdrawalsByIdentity,
  getTokensByIdentity,
  getValidators,
  getValidatorByProTxHash,
  getBlocksByValidator,
  getBlocksStatsByValidator,
  getRewardsStatsByValidator,
  getEpoch,
  getContestedResourcesStats,
  getMasternodeVotes,
  getRate
}
