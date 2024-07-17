module.exports = {
  epochSchema: {
    params: {
      type: 'object',
      properties: {
        index: { type: 'number', minimum: 0 }
      }
    }
  },
  blockSchema: {
    params: {
      type: 'object',
      properties: {
        hash: { type: 'string', minLength: 64, maxLength: 64 }
      }
    }
  },
  validatorBlocksSchema: {
    params: {
      type: 'object',
      properties: {
        validator: { type: 'string', minLength: 64, maxLength: 64 }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  blocksSchema: {
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  transactionsSchema: {
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  transactionSchema: {
    params: {
      type: 'object',
      properties: {
        txHash: { type: 'string', minLength: 64, maxLength: 64 }
      }
    }
  },
  dataContractsSchema: {
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] },
        orderBy: { type: ['string', 'null'], enum: ['block_height', 'documents_count'] }
      }
    }
  },
  dataContractSchema: {
    params: {
      type: 'object',
      properties: {
        identifier: { type: 'string', minLength: 43, maxLength: 44 }
      }
    }
  },
  dataContractDocumentsSchema: {
    params: {
      type: 'object',
      properties: {
        identifier: { type: 'string', minLength: 43, maxLength: 44 }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  documentSchema: {
    params: {
      type: 'object',
      properties: {
        identifier: { type: 'string', minLength: 43, maxLength: 44 }
      }
    }
  },
  identitiesSchema: {
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] },
        orderBy: { type: ['string', 'null'], enum: ['block_height', 'documents_count'] }
      }
    }
  },
  identitySchema: {
    params: {
      type: 'object',
      properties: {
        identifier: { type: 'string', minLength: 43, maxLength: 44 }
      }
    }
  },
  identityTransactionsSchema: {
    params: {
      type: 'object',
      properties: {
        identifier: { type: 'string', minLength: 43, maxLength: 44 }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  identityDataContractsSchema: {
    params: {
      type: 'object',
      properties: {
        identifier: { type: 'string', minLength: 43, maxLength: 44 }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  identityDocumentsSchema: {
    params: {
      type: 'object',
      properties: {
        identifier: { type: 'string', minLength: 43, maxLength: 44 }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  identityTransfersSchema: {
    params: {
      type: 'object',
      properties: {
        identifier: { type: 'string', minLength: 43, maxLength: 44 }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  searchSchema: {
    querystring: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      }
    }
  },
  decodeSchema: {
    body: {
      type: 'object',
      required: ['base64'],
      properties: {
        base64: { type: 'string' }
      }
    }
  },
  transactionsHistorySchema: {
    querystring: {
      type: 'object',
      properties: {
        timespan: { type: ['string', 'null'], enum: ['1h', '24h', '3d', '1w'] }
      }
    }
  },
  validatorsSchema: {
    querystring: {
      type: 'object',
      properties: {
        isActive: { type: ['boolean', 'null'] },
        page: { type: ['integer', 'null'], minimum: 1 },
        limit: { type: ['integer', 'null'], minimum: 1, maximum: 100 },
        order: { type: ['string', 'null'], enum: ['asc', 'desc'] }
      }
    }
  },
  validatorSchema: {
    params: {
      type: 'object',
      properties: {
        proTxHash: { type: 'string', minLength: 64, maxLength: 64 }
      }
    }
  }
}
