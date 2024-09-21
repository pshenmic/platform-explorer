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
        minimum: 1,
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
      isActive: {type: ['boolean', 'null']}
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
      identifier: {$ref: 'identifier#'}
    }
  }
]

module.exports = schemaTypes
