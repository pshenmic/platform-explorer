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
  validatorsController
}) => {
  const routes = [
    {
      path: '/status',
      method: 'GET',
      handler: mainController.getStatus
    },
    {
      path: '/epoch/:index',
      method: 'GET',
      handler: epochController.getEpochByIndex,
      schema: {
        params: {
          type: 'object',
          properties: {
            index: { type: 'number', minimum: 0 }
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
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
          }
        },
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
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
          }
        }
      }
    },
    {
      path: '/transactions',
      method: 'GET',
      handler: transactionsController.getTransactions,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
          }
        }
      }
    },
    {
      path: '/transaction/:txHash',
      method: 'GET',
      handler: transactionsController.getTransactionByHash,
      schema: {
        params: {
          type: 'object',
          properties: {
            txHash: { $ref: 'hash#' }
          }
        }
      }
    },
    {
      path: '/dataContracts',
      method: 'GET',
      handler: dataContractsController.getDataContracts,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' },
            orderBy: { $ref: 'orderBy#' }
          }
        }
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
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
          }
        }
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
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' },
            orderBy: { $ref: 'orderBy#' }
          }
        }
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
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
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
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
          }
        }
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
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
          }
        }
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
        querystring: {
          type: 'object',
          properties: {
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
          }
        }
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
        querystring: {
          type: 'object',
          properties: {
            isActive: { $ref: 'isActive#' },
            page: { $ref: 'page#' },
            limit: { $ref: 'limit#' },
            order: { $ref: 'order#' }
          }
        }
      }
    },
    {
      path: '/validator/:proTxHash',
      method: 'GET',
      handler: validatorsController.getValidatorByProTxHash,
      schema: {
        params: {
          type: 'object',
          properties: {
            proTxHash: { $ref: 'hash#' }
          }
        }
      }
    }
  ]

  routes.forEach(route => fastify[route.method.toLowerCase()](route.path, { schema: route.schema ?? null }, route.handler))
}
