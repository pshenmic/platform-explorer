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
        enum: ['block_height', 'documents_count', 'tx_count', 'balance', 'gas_used', 'timestamp', 'id', 'owner']
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
        type: ['number', 'null'],
        minimum: 0
      },
      gas_max: {
        type: ['number', 'null'],
        minimum: 0
      },
      document_type_name: {
        type: ['string', 'null']
      },
      epoch_index_min: {
        type: ['number', 'null'],
        minimum: 0
      },
      epoch_index_max: {
        type: ['number', 'null'],
        minimum: 1
      },
      validator: {
        type: 'string',
        minLength: 64,
        maxLength: 64
      },
      height_min: {
        type: ['number', 'null'],
        minimum: 1
      },
      height_max: {
        type: ['number', 'null'],
        minimum: 2
      },
      tx_count_min: {
        type: ['number', 'null'],
        minimum: 0
      },
      tx_count_max: {
        type: ['number', 'null'],
        minimum: 0
      },
      timestamp_start: {
        type: ['string', 'null'],
        format: 'date-time'
      },
      timestamp_end: {
        type: ['string', 'null'],
        format: 'date-time'
      },
      voter_identity: {
        type: ['string', 'null'],
        minLength: 43,
        maxLength: 44
      },
      towards_identity: {
        type: ['string', 'null'],
        minLength: 43,
        maxLength: 44
      },
      choice: {
        type: ['number', 'null'],
        minimum: 0,
        maximum: 2
      },
      power: {
        type: ['number', 'null'],
        enum: [1, 4]
      },
      start_at: {
        type: ['string', 'null'],
        minLength: 43,
        maxLength: 44
      }
    }
  },
  {
    $id: 'timeInterval',
    type: 'object',
    properties: {
      timestamp_start: {
        type: ['string', 'null'],
        format: 'date-time'
      },
      timestamp_end: {
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
