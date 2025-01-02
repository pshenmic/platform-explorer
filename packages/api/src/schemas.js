const schemaTypes = [
  {
    $id: 'hash',
    type: 'string',
    minLength: 64,
    maxLength: 64
  },
  {
    $id: 'paginationOptions',
    type: 'object',
    properties: {
      page: {
        type: ['integer', 'null'],
        minimum: 1
      },
      limit: {
        type: ['integer', 'null'],
        minimum: 0,
        maximum: 100
      },
      order: {
        type: ['string', 'null'],
        enum: ['asc', 'desc']
      },
      orderBy: {
        type: ['string', 'null'],
        enum: ['block_height', 'documents_count', 'tx_count', 'balance']
      },
      isActive: { type: ['boolean', 'null'] },
      type: {
        type: ['integer', 'null'],
        minimum: 0,
        maximum: 8
      },
      hash: {
        type: 'string',
        minLength: 64,
        maxLength: 64
      },
      transaction_type: {
        type: ['array', 'null'],
        items: {
          type: 'number',
          minimum: 0,
          maximum: 8
        }
      },
      status: {
        type: ['string', 'null'],
        enum: ['SUCCESS', 'FAIL', 'ALL']
      },
      owner: {
        type: ['string', 'null']
      },
      gas_min: {
        type: ['number', 'null']
      },
      gas_max: {
        type: ['number', 'null']
      },
      document_type_name: {
        type: ['string', 'null']
      }
    }
  },
  {
    $id: 'timeInterval',
    type: 'object',
    properties: {
      start: {
        type: ['string', 'null'],
        format: 'date-time'
      },
      end: {
        type: ['string', 'null'],
        format: 'date-time'
      },
      timespan: {
        type: ['string', 'null'],
        enum: ['1h', '24h', '3d', '1w']
      },
      intervalsCount: {
        type: ['number', 'null'],
        minimum: 2,
        maximum: 100
      }
    }
  },
  {
    $id: 'identifier',
    type: 'string',
    minLength: 43,
    maxLength: 44
  },
  {
    $id: 'identifierSchema',
    type: 'object',
    properties: {
      identifier: { $ref: 'identifier#' }
    }
  }
]

module.exports = schemaTypes
