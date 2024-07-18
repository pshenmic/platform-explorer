const schemaTypes = [
  {
    $id: 'hash',
    type: 'string',
    minLength: 64,
    maxLength: 64
  },
  {
    $id: 'page',
    type: ['integer', 'null'],
    minimum: 1
  },
  {
    $id: 'limit',
    type: ['integer', 'null'],
    minimum: 1,
    maximum: 100
  },
  {
    $id: 'order',
    type: ['string', 'null'],
    enum: ['asc', 'desc']
  },
  {
    $id: 'timespan',
    type: ['string', 'null'],
    enum: ['1h', '24h', '3d', '1w']
  },
  {
    $id: 'orderBy',
    type: ['string', 'null'],
    enum: ['block_height', 'documents_count']
  },
]

const schemaObjects = [
  {
    $id: 'txHashSchema',
    type: 'object',
    properties: { txHash: { $ref: 'hash#' } }
  },
  {
    $id: 'validatorSchema',
    type: 'object',
    properties: { validator: { $ref: 'hash#' } }
  },
  {
    $id: 'hashSchema',
    type: 'object',
    properties: { hash: { $ref: 'hash#' } }
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
      page: { $ref: 'page#' },
      limit: { $ref: 'limit#' },
      order: { $ref: 'order#' },
      orderBy: { $ref: 'orderBy#' },
    }
  },
  {
    $id: 'paginationSchema',
    type: 'object',
    properties: {
      page: { $ref: 'page#' },
      limit: { $ref: 'limit#' },
      order: { $ref: 'order#' }
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
      timespan: { $ref: 'timespan#' },
    }
  },
  {
    $id: 'paginationWithIsActiveSchema',
    type: 'object',
    properties: {
      isActive: { type: ['boolean', 'null'] },
      page: { $ref: 'page#' },
      limit: { $ref: 'limit#' },
      order: { $ref: 'order#' }
    }
  }
]



module.exports = { schemaObjects, schemaTypes }
