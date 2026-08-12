import { ResponseErrorNotFound, ResponseErrorTimeout } from './Errors'
import type {
  Block,
  ContestedResource,
  ContestedResourcesStatus,
  DataContract,
  Document,
  EpochData,
  Identity,
  PaginatedResultSet,
  PlatformAddress,
  Rate,
  SeriesData,
  Status,
  Token,
  TokenTransition,
  Transaction,
  Transfer,
  Validator,
  Vote,
  Withdrawal
} from '../types'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type SortOrder = 'asc' | 'desc'
type QueryValue = string | number | boolean | string[] | null | undefined
type QueryFilters = Record<string, QueryValue>

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const fetchWrapper = (url: string, options: RequestInit): Promise<Response> => {
  const controller = new AbortController()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      console.warn('fetching timeout error')
      controller.abort()
      reject(new ResponseErrorTimeout())
    }, 30000)
    fetch(url, { ...options, signal: controller.signal })
      .then(value => {
        if (value) resolve(value)
      })
      .catch(reject)
      .finally(() => clearTimeout(timer))
  })
}

const call = async <T>(path: string, method: HttpMethod, body?: unknown): Promise<T> => {
  try {
    const response = await fetchWrapper(`${BASE_URL}/${path}`, {
      method,
      headers: {
        'content-type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (response.status === 200) {
      return response.json() as Promise<T>
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

const prepareQueryParams = (params: QueryFilters = {}): URLSearchParams => {
  const queryParams = new URLSearchParams()

  const parameterIsValid = (value: QueryValue): boolean => {
    return value !== undefined && value !== ''
  }

  Object.entries(params).forEach(([key, value]) => {
    if (!value) {
      return
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach(item => {
          if (parameterIsValid(item)) {
            queryParams.append(key, String(item))
          }
        })
      }
    } else if (parameterIsValid(value)) {
      queryParams.append(key, String(value))
    }
  })

  return queryParams
}

const getBlockByHash = (hash: string): Promise<Block> => {
  return call<Block>(`block/${hash}`, 'GET')
}

interface TransactionsHistoryPoint {
  txs: number
  blockHeight: number | null
  blockHash: string | null
}

const getTransactionsHistory = (
  start: string,
  end: string,
  intervalsCount?: number
): Promise<Array<SeriesData<TransactionsHistoryPoint>>> => {
  return call<Array<SeriesData<TransactionsHistoryPoint>>>(
    `transactions/history?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`,
    'GET'
  )
}

interface TransactionsStatisticBatchType {
  batchType: string
  count: number
}

interface TransactionsStatisticItem {
  transactionType: string
  count: number
  batchTypes?: TransactionsStatisticBatchType[] | null
}

const getTransactionsStatistic = (start?: string, end?: string): Promise<TransactionsStatisticItem[]> => {
  const range = start && end ? `?timestamp_start=${start}&timestamp_end=${end}` : ''
  return call<TransactionsStatisticItem[]>(`transactions/statistic${range}`, 'GET')
}

interface ShieldedStatistic {
  totalShieldedIn: string
  totalShieldedOut: string
  transitionsCount: number
  types?: Array<{ transactionType: string, count: number, amount: string }>
}

// optional time interval; omitted → all-time
const getShieldedStatistic = (start?: string, end?: string): Promise<ShieldedStatistic> => {
  const range = start != null && end != null ? `?timestamp_start=${start}&timestamp_end=${end}` : ''
  return call<ShieldedStatistic>(`transactions/shielded/statistic${range}`, 'GET')
}

interface ShieldedPool {
  poolBalance: string | null
  notesCount: number | null
}

const getShieldedPool = (): Promise<ShieldedPool> => {
  return call<ShieldedPool>('transactions/shielded/pool', 'GET')
}

interface ShieldHistoryPoint {
  amount: number
  blockHeight: number | null
  blockHash: string | null
}

const getShieldHistory = (
  start: string,
  end: string,
  intervalsCount?: number
): Promise<Array<SeriesData<ShieldHistoryPoint>>> => {
  return call<Array<SeriesData<ShieldHistoryPoint>>>(
    `transactions/shield/history?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`,
    'GET'
  )
}

const getUnshieldHistory = (
  start: string,
  end: string,
  intervalsCount?: number
): Promise<Array<SeriesData<ShieldHistoryPoint>>> => {
  return call<Array<SeriesData<ShieldHistoryPoint>>>(
    `transactions/unshield/history?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`,
    'GET'
  )
}

const getTransactions = (
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc',
  filters: QueryFilters = {}
): Promise<PaginatedResultSet<Transaction>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    ...filters
  })

  return call<PaginatedResultSet<Transaction>>(`transactions?${params.toString()}`, 'GET')
}

const getTransaction = (txHash: string): Promise<Transaction> => {
  return call<Transaction>(`transaction/${txHash}`, 'GET')
}

const getTokens = (
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc',
  filters: QueryFilters = {}
): Promise<PaginatedResultSet<Token>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    ...filters
  })

  return call<PaginatedResultSet<Token>>(`tokens?${params.toString()}`, 'GET')
}

const getTokensRating = (
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc',
  filters: QueryFilters = {}
): Promise<PaginatedResultSet<Token>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    ...filters
  })

  return call<PaginatedResultSet<Token>>(`tokens/rating?${params.toString()}`, 'GET')
}

const getToken = (identifier: string): Promise<Token> => {
  return call<Token>(`token/${identifier}`, 'GET')
}

const getTokenTransitions = (
  identifier: string,
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<TokenTransition>> => {
  return call<PaginatedResultSet<TokenTransition>>(
    `token/${identifier}/transitions?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getBlocks = (
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc',
  filters: QueryFilters = {}
): Promise<PaginatedResultSet<Block>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    ...filters
  })

  return call<PaginatedResultSet<Block>>(`blocks?${params.toString()}`, 'GET')
}

interface AvgBlockTimeHistoryPoint {
  avgBlockTime: number
  blockHeight: number | null
  blockHash: string | null
}

const getAvgBlockTimeHistory = (
  start: string,
  end: string,
  intervalsCount?: number
): Promise<Array<SeriesData<AvgBlockTimeHistoryPoint>>> => {
  return call<Array<SeriesData<AvgBlockTimeHistoryPoint>>>(
    `blocks/avgBlockTime/history?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`,
    'GET'
  )
}

const getBlocksByValidator = (
  proTxHash: string,
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<Block>> => {
  return call<PaginatedResultSet<Block>>(
    `validator/${proTxHash}/blocks?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getContestedResources = (
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc',
  orderBy?: string,
  filters: QueryFilters = {}
): Promise<PaginatedResultSet<ContestedResource>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    order_by: orderBy,
    ...filters
  })

  return call<PaginatedResultSet<ContestedResource>>(`contestedResources?${params.toString()}`, 'GET')
}

const getContestedResourceByValue = (value: string): Promise<ContestedResource> => {
  return call<ContestedResource>(`contestedResource/${value}`, 'GET')
}

const getContestedResourceVotes = (
  value: string,
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc',
  filters: QueryFilters = {}
): Promise<PaginatedResultSet<Vote>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    ...filters
  })

  return call<PaginatedResultSet<Vote>>(`contestedResource/${value}/votes?${params.toString()}`, 'GET')
}

interface DataContractRatingItem {
  identifier: string
  transitionsCount: number
}

const getDataContractsRating = (
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'desc'
): Promise<PaginatedResultSet<DataContractRatingItem>> => {
  return call<PaginatedResultSet<DataContractRatingItem>>(
    `dataContracts/rating?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getDataContractByIdentifier = (identifier: string): Promise<DataContract> => {
  return call<DataContract>(`dataContract/${identifier}`, 'GET')
}

const getDataContractTransactions = (
  identifier: string,
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<Transaction>> => {
  return call<PaginatedResultSet<Transaction>>(
    `dataContract/${identifier}/transactions?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getDataContracts = (
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc',
  orderBy?: string,
  filters: QueryFilters = {}
): Promise<PaginatedResultSet<DataContract>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    order_by: orderBy,
    ...filters
  })

  return call<PaginatedResultSet<DataContract>>(`dataContracts?${params.toString()}`, 'GET')
}

const getDocumentByIdentifier = (
  identifier: string,
  dataContractId?: string,
  typeName?: string
): Promise<Document> => {
  const params = []
  if (dataContractId) params.push(`contract_id=${dataContractId}`)
  if (typeName) params.push(`document_type_name=${typeName}`)
  const queryParams = params.join('&')

  return call<Document>(`document/${identifier}?${queryParams ? `?${queryParams}` : ''}`, 'GET')
}

const getDocumentRevisions = (
  identifier: string,
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<Document>> => {
  return call<PaginatedResultSet<Document>>(
    `document/${identifier}/revisions?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

interface DocumentsByDataContractFilters {
  document_type_name?: string
  owner?: string
  revision_min?: number
  revision_max?: number
  timestamp_start?: string
  timestamp_end?: string
}

const getDocumentsByDataContract = (
  dataContractIdentifier: string,
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc',
  filters: DocumentsByDataContractFilters = {}
): Promise<PaginatedResultSet<Document>> => {
  const params = prepareQueryParams({
    page,
    limit,
    order,
    document_type_name: filters.document_type_name,
    owner: filters.owner,
    revision_min: filters.revision_min,
    revision_max: filters.revision_max,
    timestamp_start: filters.timestamp_start,
    timestamp_end: filters.timestamp_end
  })
  return call<PaginatedResultSet<Document>>(`dataContract/${dataContractIdentifier}/documents?${params.toString()}`, 'GET')
}

const getEpoch = (identifier?: number | string): Promise<EpochData> => {
  return call<EpochData>(`epoch/${identifier ?? ''}`, 'GET')
}

const getTransactionsByIdentity = (
  identifier: string,
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<Transaction>> => {
  return call<PaginatedResultSet<Transaction>>(
    `identity/${identifier}/transactions?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getDataContractsByIdentity = (
  identifier: string,
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<DataContract>> => {
  return call<PaginatedResultSet<DataContract>>(
    `identity/${identifier}/dataContracts?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

interface DocumentsByIdentityFilters {
  document_type_name?: string
  transition_type?: string
  deleted?: boolean
  timestamp_start?: string
  timestamp_end?: string
}

const getDocumentsByIdentity = (
  identifier: string,
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc',
  filters: DocumentsByIdentityFilters = {}
): Promise<PaginatedResultSet<Document>> => {
  const params = prepareQueryParams({
    page,
    limit,
    order,
    // document_type_name works today; transition_type/deleted/timestamp_* await backend (see #798)
    document_type_name: filters.document_type_name,
    transition_type: filters.transition_type,
    deleted: filters.deleted,
    timestamp_start: filters.timestamp_start,
    timestamp_end: filters.timestamp_end
  })
  return call<PaginatedResultSet<Document>>(`identity/${identifier}/documents?${params.toString()}`, 'GET')
}

const getWithdrawalsByIdentity = (
  identifier: string,
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<Withdrawal>> => {
  return call<PaginatedResultSet<Withdrawal>>(
    `identity/${identifier}/withdrawals?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getTransfersByIdentity = (
  identifier: string,
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<Transfer>> => {
  return call<PaginatedResultSet<Transfer>>(
    `identity/${identifier}/transfers?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getTokensByIdentity = (
  identifier: string,
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc'
): Promise<PaginatedResultSet<Token>> => {
  return call<PaginatedResultSet<Token>>(
    `identity/${identifier}/tokens?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getIdentity = (identifier: string): Promise<Identity> => {
  return call<Identity>(`identity/${identifier}`, 'GET')
}

interface IdentitiesFilters {
  order?: SortOrder
  order_by?: string
  identity_type?: string | null
  balance_min?: number
  balance_max?: number
  tx_count_min?: number
  tx_count_max?: number
  documents_count_min?: number
  documents_count_max?: number
  data_contracts_min?: number
  data_contracts_max?: number
}

interface GetIdentitiesOptions {
  includeMasternodes?: boolean
  filters?: IdentitiesFilters
}

const getIdentities = (
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc',
  orderBy?: string,
  { includeMasternodes = false, filters = {} }: GetIdentitiesOptions = {}
): Promise<PaginatedResultSet<Identity>> => {
  const params = prepareQueryParams({
    page,
    limit,
    order: filters?.order ?? order,
    order_by: filters?.order_by ?? orderBy,
    // includeMasternodes=true (Show all toggle on) → omit identity_type so backend returns everything
    // includeMasternodes=false (default) → request only regular identities
    identity_type: filters?.identity_type ?? (includeMasternodes ? null : 'regular'),
    balance_min: filters?.balance_min,
    balance_max: filters?.balance_max,
    tx_count_min: filters?.tx_count_min,
    tx_count_max: filters?.tx_count_max,
    documents_count_min: filters?.documents_count_min,
    documents_count_max: filters?.documents_count_max,
    data_contracts_min: filters?.data_contracts_min,
    data_contracts_max: filters?.data_contracts_max
  })
  return call<PaginatedResultSet<Identity>>(`identities?${params.toString()}`, 'GET')
}

interface IdentitiesHistoryPoint {
  registeredIdentities: number
}

const getIdentitiesHistory = (
  start: string,
  end: string,
  intervalsCount?: number
): Promise<Array<SeriesData<IdentitiesHistoryPoint>>> => {
  return call<Array<SeriesData<IdentitiesHistoryPoint>>>(
    `identities/history?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`,
    'GET'
  )
}

interface ActiveIdentityItem {
  identifier: string
  transactionsCount: number
  aliases?: Array<{ alias: string, status: string, contested: boolean }>
}

const getActiveIdentities = (
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'desc',
  timestampStart?: string,
  timestampEnd?: string
): Promise<PaginatedResultSet<ActiveIdentityItem>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    timestamp_start: timestampStart,
    timestamp_end: timestampEnd
  })
  return call<PaginatedResultSet<ActiveIdentityItem>>(`identities/active?${params.toString()}`, 'GET')
}

interface ActiveDataContractItem {
  identifier: string
  transitionsCount: number
}

const getActiveDataContracts = (
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'desc',
  timestampStart?: string,
  timestampEnd?: string
): Promise<PaginatedResultSet<ActiveDataContractItem>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    timestamp_start: timestampStart,
    timestamp_end: timestampEnd
  })
  return call<PaginatedResultSet<ActiveDataContractItem>>(`dataContracts/active?${params.toString()}`, 'GET')
}

const getValidators = (
  page: number = 1,
  limit: number = 30,
  order: SortOrder = 'asc',
  filters?: QueryFilters
): Promise<PaginatedResultSet<Validator>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    // order_by: orderBy,
    ...filters
  })

  return call<PaginatedResultSet<Validator>>(`validators?${params}`, 'GET')
}

const getValidatorByProTxHash = (proTxHash: string): Promise<Validator> => {
  return call<Validator>(`validator/${proTxHash}`, 'GET')
}

export interface QuorumMember {
  proTxHash: string
  service?: string | null
  pubKeyOperator?: string | null
  valid?: boolean | null
}

/** Members are present on /quorums/current and /quorum/:hash, not on /quorums. */
export interface PlatformQuorum {
  blockHeight?: number | null
  creationHeight?: number | null
  minedBlockHash?: string | null
  numValidMembers?: number | null
  healthRatio?: string | number | null
  type?: string | null
  quorumHash?: string | null
  quorumIndex?: number | null
  quorumPublicKey?: string | null
  previousConsecutiveDKGFailures?: number | null
  isCurrent?: boolean | null
  members?: QuorumMember[] | null
}

const getQuorums = (): Promise<PlatformQuorum[]> => {
  return call<PlatformQuorum[]>('quorums', 'GET')
}

const getCurrentQuorum = (): Promise<PlatformQuorum> => {
  return call<PlatformQuorum>('quorums/current', 'GET')
}

const getQuorumByHash = (quorumHash: string): Promise<PlatformQuorum> => {
  return call<PlatformQuorum>(`quorum/${quorumHash}`, 'GET')
}

const getValidatorByMasternodeIdentity = (identity: string): Promise<Validator> => {
  return call<Validator>(`validator/identity/${identity}`, 'GET')
}

interface ValidatorBlocksStatsPoint {
  blocksCount: number
}

interface ValidatorRewardsStatsPoint {
  reward: number
}

const getBlocksStatsByValidator = (
  proTxHash: string,
  start: string,
  end: string,
  intervalsCount?: number
): Promise<Array<SeriesData<ValidatorBlocksStatsPoint>>> => {
  return call<Array<SeriesData<ValidatorBlocksStatsPoint>>>(
    `validator/${proTxHash}/stats?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`,
    'GET'
  )
}

const getRewardsStatsByValidator = (
  proTxHash: string,
  start: string,
  end: string,
  intervalsCount?: number
): Promise<Array<SeriesData<ValidatorRewardsStatsPoint>>> => {
  return call<Array<SeriesData<ValidatorRewardsStatsPoint>>>(
    `validator/${proTxHash}/rewards/stats?timestamp_start=${start}&timestamp_end=${end}${intervalsCount ? `&intervalsCount=${intervalsCount}` : ''}`,
    'GET'
  )
}

const getMasternodeVotes = (
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'asc',
  filters: QueryFilters = {}
): Promise<PaginatedResultSet<Vote>> => {
  const params = prepareQueryParams({
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    order,
    ...filters
  })

  return call<PaginatedResultSet<Vote>>(`masternodes/votes?${params.toString()}`, 'GET')
}

const getContestedResourcesStats = (): Promise<ContestedResourcesStatus> => {
  return call<ContestedResourcesStatus>('contestedResources/stats', 'GET')
}

const getPlatformAddressInfo = (hash: string): Promise<PlatformAddress> => {
  return call<PlatformAddress>(`platformAddress/${hash}/info`, 'GET')
}

const getPlatformAddressTransitions = (
  hash: string,
  page: number = 1,
  limit: number = 10,
  order: SortOrder = 'desc'
): Promise<PaginatedResultSet<Transaction>> => {
  return call<PaginatedResultSet<Transaction>>(
    `platformAddress/${hash}/transactions?page=${page}&limit=${limit}&order=${order}`,
    'GET'
  )
}

const getStatus = (): Promise<Status> => {
  return call<Status>('status', 'GET')
}

const getRate = (): Promise<Rate> => {
  return call<Rate>('rate', 'GET')
}

// Response shape is not yet documented in this PR — type it precisely in a
// follow-up after a valid query returns a populated payload.
const search = (query: string): Promise<unknown> => {
  return call<unknown>(`search?query=${query}`, 'GET')
}

// Response shape is not yet documented in this PR — type it precisely in a
// follow-up after testing with a real base64-encoded transaction.
const decodeTx = (base64: string): Promise<unknown> => {
  return call<unknown>('transaction/decode', 'POST', { base64 })
}

// Broadcast-flow endpoints added on develop (#790) — payloads/responses are
// not modelled in backend yet; type precisely in a follow-up.
const verifyTransaction = (payload: unknown): Promise<unknown> => {
  return call<unknown>('transaction/verify', 'POST', payload)
}

const broadcastTransaction = (payload: unknown): Promise<unknown> => {
  return call<unknown>('transaction/broadcast', 'POST', payload)
}

const waitForStateTransitionResult = (hash: string): Promise<unknown> => {
  return call<unknown>(`waitForStateTransitionResult/${hash}`, 'GET')
}

export {
  getStatus,
  getBlocks,
  getAvgBlockTimeHistory,
  getContestedResources,
  getContestedResourceByValue,
  getContestedResourceVotes,
  getBlockByHash,
  getTransactionsHistory,
  getTransactionsStatistic,
  getShieldedStatistic,
  getShieldedPool,
  getShieldHistory,
  getUnshieldHistory,
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
  getDataContractsRating,
  getDataContracts,
  getIdentities,
  getIdentity,
  getIdentitiesHistory,
  getActiveIdentities,
  getActiveDataContracts,
  getTransactionsByIdentity,
  getDataContractsByIdentity,
  getDataContractTransactions,
  getDocumentsByIdentity,
  getTransfersByIdentity,
  getWithdrawalsByIdentity,
  getTokensByIdentity,
  getValidators,
  getValidatorByProTxHash,
  getQuorums,
  getCurrentQuorum,
  getQuorumByHash,
  getBlocksByValidator,
  getBlocksStatsByValidator,
  getRewardsStatsByValidator,
  getEpoch,
  getContestedResourcesStats,
  getMasternodeVotes,
  getRate,
  getPlatformAddressInfo,
  getPlatformAddressTransitions,
  getValidatorByMasternodeIdentity,
  verifyTransaction,
  broadcastTransaction,
  waitForStateTransitionResult
}
