/**
 *
 * @param fastify {Fastify}
 * @param mainController {MainController}
 * @param epochController {EpochController}
 * @param blockController {BlocksController}
 * @param transactionsController {TransactionsController}
 * @param validatorsController {ValidatorsController}
 */
module.exports = ({
  fastify,
  mainController,
  epochController,
  blocksController,
  transactionsController,
  dataContractsController,
  documentsController,
  identitiesController,
  validatorsController,
  rateController
}) => {
  const routes = [
    {
      path: '/status',
      method: 'GET',
      handler: mainController.getStatus
    },
    {
      path: '/rate',
      method: 'GET',
      handler: rateController.getUSDRate
    },
    {
      path: '/epoch',
      method: 'GET',
      handler: epochController.getEpochByIndex,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            index: { type: ['number', 'null'], minimum: 0 }
          }
        }
      }
    },
    {
      path: '/block/:hash',
      method: 'GET',
      handler: blocksController.getBlockByHash,
      schema: {
        params: {
          type: 'object',
          properties: {
            hash: { $ref: 'hash#' }
          }
        }
      }
    },
    {
      path: '/validator/:validator/blocks',
      method: 'GET',
      handler: blocksController.getBlocksByValidator,
      schema: {
        querystring: { $ref: 'paginationOptions#' },
        params: {
          type: 'object',
          properties: {
            validator: { $ref: 'hash#' }
          }
        }
      }
    },
    {
      path: '/blocks',
      method: 'GET',
      handler: blocksController.getBlocks,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/transactions',
      method: 'GET',
      handler: transactionsController.getTransactions,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/transaction/:hash',
      method: 'GET',
      handler: transactionsController.getTransactionByHash,
      schema: {
        params: {
          type: 'object',
          properties: {
            hash: { $ref: 'hash#' }
          }
        }
      }
    },
    {
      path: '/dataContracts',
      method: 'GET',
      handler: dataContractsController.getDataContracts,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/dataContract/:identifier',
      method: 'GET',
      handler: dataContractsController.getDataContractByIdentifier,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        }
      }
    },
    {
      path: '/dataContract/:identifier/documents',
      method: 'GET',
      handler: documentsController.getDocumentsByDataContract,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        },
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/document/:identifier',
      method: 'GET',
      handler: documentsController.getDocumentByIdentifier,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        }
      }
    },
    {
      path: '/identities',
      method: 'GET',
      handler: identitiesController.getIdentities,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/identity/:identifier',
      method: 'GET',
      handler: identitiesController.getIdentityByIdentifier,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        }
      }
    },
    {
      path: '/dpns/identity',
      method: 'GET',
      handler: identitiesController.getIdentityByDPNS,
      schema: {
        querystring: {
          type: 'object',
          required: ['dpns'],
          properties: {
            dpns: { type: 'string' }
          }
        }
      }
    },
    {
      path: '/identity/:identifier/transactions',
      method: 'GET',
      handler: identitiesController.getTransactionsByIdentity,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        },
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/identity/:identifier/withdrawals',
      method: 'GET',
      handler: identitiesController.getWithdrawalsByIdentity,
      schema: {
        querystring: { $ref: 'paginationOptions#' },
        params: {
          type: 'object',
          properties: {
            validator: { $ref: 'hash#' }
          }
        }
      }
    },
    {
      path: '/identity/:identifier/dataContracts',
      method: 'GET',
      handler: identitiesController.getDataContractsByIdentity,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        },
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/identity/:identifier/documents',
      method: 'GET',
      handler: identitiesController.getDocumentsByIdentity,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        },
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/identity/:identifier/transfers',
      method: 'GET',
      handler: identitiesController.getTransfersByIdentity,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        },
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/search',
      method: 'GET',
      handler: mainController.search,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          }
        }
      }
    },
    {
      path: '/transaction/decode',
      method: 'POST',
      handler: transactionsController.decode,
      schema: {
        body: {
          type: 'object',
          required: ['base64'],
          properties: {
            base64: { type: 'string' }
          }
        }
      }
    },
    {
      path: '/transactions/history',
      method: 'GET',
      handler: transactionsController.getTransactionHistory,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            timespan: { $ref: 'timespan#' }
          }
        }
      }
    },
    {
      path: '/validators',
      method: 'GET',
      handler: validatorsController.getValidators,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/validator/:hash/stats',
      method: 'GET',
      handler: validatorsController.getValidatorStatsByProTxHash,
      schema: {
        params: {
          type: 'object',
          properties: {
            hash: { $ref: 'hash#' }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            timespan: { $ref: 'timespan#' }
          }
        }
      }
    },
    {
      path: '/validator/:hash',
      method: 'GET',
      handler: validatorsController.getValidatorByProTxHash,
      schema: {
        params: {
          type: 'object',
          properties: {
            hash: { $ref: 'hash#' }
          }
        }
      }
    }
  ]

  routes.forEach(
    route =>
      fastify[route.method.toLowerCase()](
        route.path,
        { schema: route.schema ?? null },
        route.handler
      )
  )
}
