const schemaObjects = [
  {
    $id: 'baseSchema',
    type: 'object',
    properties: {
      hash: { type: 'string', minLength: 64, maxLength: 64 },
      page: { type: ['integer', 'null'], minimum: 1 },
      limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
      order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
    }
  },
  {
    $id: 'txHashSchema',
    type: 'object',
    properties: { txHash: { $ref: 'baseSchema#/properties/hash' } }
  },
  {
    $id: 'validatorSchema',
    type: 'object',
    properties: { validator: { $ref: 'baseSchema#/properties/hash' } }
  },
  {
    $id: 'hashSchema',
    type: 'object',
    properties: { hash: { $ref: 'baseSchema#/properties/hash' } }
  },
  {
    $id: 'identifierSchema',
    type: 'object',
    properties: { identifier: { type: 'string', minLength: 43, maxLength: 44 } }
  },
  {
    $id: 'epochSchema',
    type: 'object',
    properties: { index: { type: 'number', minimum: 0 } }
  },
  {
    $id: 'paginationWithOrderBySchema',
    type: 'object',
    properties: {
      page: { $ref: 'baseSchema#/properties/page' },
      limit: { $ref: 'baseSchema#/properties/limit' },
      order: { $ref: 'baseSchema#/properties/order' },
      orderBy: { type: ['string', 'null'], enum: ['block_height', 'documents_count'] }
    }
  },
  {
    $id: 'paginationSchema',
    type: 'object',
    properties: {
      page: { $ref: 'baseSchema#/properties/page' },
      limit: { $ref: 'baseSchema#/properties/limit' },
      order: { $ref: 'baseSchema#/properties/order' }
    }
  },
  {
    $id: 'querySchema',
    type: 'object',
    properties: { query: { type: 'string' } }
  },
  {
    $id: 'decodeSchema',
    type: 'object',
    required: ['base64'],
    properties: { base64: { type: 'string' } }
  },
  {
    $id: 'timespanSchema',
    type: 'object',
    properties: {
      timespan: { type: ['string', 'null'], enum: ['1h', '24h', '3d', '1w'] }
    }
  },
  {
    $id: 'paginationWithIsActiveSchema',
    type: 'object',
    properties: {
      isActive: { type: ['boolean', 'null'] },
      page: { $ref: 'baseSchema#/properties/page' },
      limit: { $ref: 'baseSchema#/properties/limit' },
      order: { $ref: 'baseSchema#/properties/order' }
    }
  }
]

const schemas = {
  epochSchema: { params: { $ref: 'epochSchema#' } },
  blockSchema: { params: { $ref: 'hashSchema#' } },
  validatorBlocksSchema: {
    params: { $ref: 'validatorSchema#' },
    querystring: { $ref: 'paginationSchema#' }
  },
  blocksSchema: { querystring: { $ref: 'paginationSchema#' } },
  transactionsSchema: { querystring: { $ref: 'paginationSchema#' } },
  transactionSchema: { params: { $ref: 'txHashSchema#' } },
  dataContractsSchema: { querystring: { $ref: 'paginationWithOrderBySchema#' } },
  dataContractSchema: { params: { $ref: 'identifierSchema#' } },
  dataContractDocumentsSchema: {
    params: { $ref: 'identifierSchema#' },
    querystring: { $ref: 'paginationSchema#' }
  },
  documentSchema: { params: { $ref: 'identifierSchema#' } },
  identitiesSchema: { querystring: { $ref: 'paginationWithOrderBySchema#' } },
  identitySchema: { params: { $ref: 'identifierSchema#' } },
  identityTransactionsSchema: {
    params: { $ref: 'identifierSchema#' },
    querystring: { $ref: 'paginationSchema#' }
  },
  identityDataContractsSchema: {
    params: { $ref: 'identifierSchema#' },
    querystring: { $ref: 'paginationSchema#' }
  },
  identityDocumentsSchema: {
    params: { $ref: 'identifierSchema#' },
    querystring: { $ref: 'paginationSchema#' }
  },
  identityTransfersSchema: {
    params: { $ref: 'identifierSchema#' },
    querystring: { $ref: 'paginationSchema#' }
  },
  searchSchema: { querystring: { $ref: 'querySchema#' } },
  decodeSchema: { body: { $ref: 'decodeSchema#' } },
  transactionsHistorySchema: { querystring: { $ref: 'timespanSchema#' } },
  validatorsSchema: { querystring: { $ref: 'paginationWithIsActiveSchema#' } },
  validatorSchema: { params: { $ref: 'txHashSchema#' } }
}

module.exports = { schemaObjects, schemas }
