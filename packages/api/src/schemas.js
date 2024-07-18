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
  {
    $id: 'identifier',
    type: 'string',
    minLength: 43,
    maxLength: 44
  }
]

module.exports = schemaTypes
