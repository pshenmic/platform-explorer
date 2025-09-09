/**
 *
 * @param fastify {Fastify}
 * @param mainController {MainController}
 * @param epochController {EpochController}
 * @param blocksController {BlocksController}
 * @param transactionsController {TransactionsController}
 * @param dataContractsController {DataContractsController}
 * @param documentsController {DocumentsController}
 * @param identitiesController {IdentitiesContrtoller}
 * @param validatorsController {ValidatorsController}
 * @param rateController {RateController}
 * @param masternodeVotesController {MasternodeVotesController}
 * @param contestedResourcesController {ContestedResourcesController}
 * @param tokensController {TokensController}
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
  rateController,
  masternodeVotesController,
  contestedResourcesController,
  tokensController
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
      path: '/epoch/:index',
      method: 'GET',
      handler: epochController.getEpochByIndex,
      schema: {
        params: {
          type: 'object',
          properties: {
            index: { type: ['number', 'null'], minimum: 0 }
          }
        }
      }
    },
    {
      path: '/epoch',
      method: 'GET',
      handler: epochController.getEpochByIndex
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
      path: '/dataContract/:identifier/transactions',
      method: 'GET',
      handler: dataContractsController.getDataContractTransactions,
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
      path: '/dataContract/:identifier/raw',
      method: 'GET',
      handler: dataContractsController.getRawDataContract,
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
      path: '/document/:identifier',
      method: 'GET',
      handler: documentsController.getDocumentByIdentifier,
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
            document_type_name: { type: ['string', 'null'] },
            contract_id: { $ref: 'identifier#' }
          }
        }
      }
    },
    {
      path: '/document/:identifier/raw',
      method: 'GET',
      handler: documentsController.getRawDocumentByIdentifier,
      schema: {
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        },
        querystring: {
          type: 'object',
          required: ['document_type_name', 'contract_id'],
          properties: {
            document_type_name: { type: ['string', 'null'] },
            contract_id: { $ref: 'identifier#' }
          }
        }
      }
    },
    {
      path: '/document/:identifier/revisions',
      method: 'GET',
      handler: documentsController.getDocumentRevisions,
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
      path: '/contestedResource/:resourceValue',
      method: 'GET',
      handler: contestedResourcesController.getContestedResource,
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceValue: { type: 'string' }
          }
        }
      }
    },
    {
      path: '/contestedResource/:resourceValue/votes',
      method: 'GET',
      handler: contestedResourcesController.getContestedResourceVotes,
      schema: {
        querystring: { $ref: 'paginationOptions#' },
        params: {
          type: 'object',
          properties: {
            resourceValue: { type: 'string' }
          }
        }
      }
    },
    {
      path: '/contestedResources',
      method: 'GET',
      handler: contestedResourcesController.getContestedResources,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/contestedResources/stats',
      method: 'GET',
      handler: contestedResourcesController.getContestedResourcesStatus
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
      handler: identitiesController.getIdentityByDPNSName,
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
        querystring: { $ref: 'timeInterval#' }
      }
    },
    {
      path: '/transactions/gas/history',
      method: 'GET',
      handler: transactionsController.getGasHistory,
      schema: {
        querystring: { $ref: 'timeInterval#' }
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
      path: '/validator/identity/:identifier',
      method: 'GET',
      handler: validatorsController.getValidatorByMasternodeIdentifier,
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
        querystring: { $ref: 'timeInterval#' }
      }
    },
    {
      path: '/validator/:hash/rewards/stats',
      method: 'GET',
      handler: validatorsController.getValidatorRewardStatsByProTxHash,
      schema: {
        params: {
          type: 'object',
          properties: {
            hash: { $ref: 'hash#' }
          }
        },
        querystring: { $ref: 'timeInterval#' }
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
    },
    {
      path: '/masternodes/votes',
      method: 'GET',
      handler: masternodeVotesController.getMasternodeVotes,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/transaction/broadcast',
      method: 'POST',
      handler: transactionsController.broadcastTransaction,
      schema: {
        body: {
          type: 'object',
          properties: {
            base64: { type: 'string' },
            hex: { type: 'string' }
          }
        }
      }
    },
    {
      path: '/identity/:identifier/nonce',
      method: 'GET',
      handler: identitiesController.getIdentityNonce,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        }
      }
    },
    {
      path: '/identity/:identifier/contract/:data_contract_id/nonce',
      method: 'GET',
      handler: identitiesController.getIdentityContractNonce,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' },
            data_contract_id: { $ref: 'identifier#' }
          }
        }
      }
    },
    {
      path: '/tokens',
      method: 'GET',
      handler: tokensController.getTokens,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/token/:identifier',
      method: 'GET',
      handler: tokensController.getTokenByIdentifier,
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
      path: '/token/:identifier/transitions',
      method: 'GET',
      handler: tokensController.getTokenTransitions,
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
      path: '/tokens/:name/info',
      method: 'GET',
      handler: tokensController.getTokensByName,
      schema: {
        params: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              // minimal token name is 3 but for search by part name we use minimal length 1
              minLength: 1,
              maxLength: 25
            }
          }
        },
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/tokens/rating',
      method: 'GET',
      handler: tokensController.getTokensTrends,
      schema: {
        querystring: { $ref: 'paginationOptions#' }
      }
    },
    {
      path: '/identity/:identifier/tokens',
      method: 'GET',
      handler: tokensController.getTokensByIdentity,
      schema: {
        querystring: { $ref: 'paginationOptions#' },
        params: {
          type: 'object',
          properties: {
            identifier: { $ref: 'identifier#' }
          }
        }
      }
    },
    {
      path: '/quorum/info',
      method: 'GET',
      handler: mainController.getQuorumInfo,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            quorumType: {
              type: 'number',
              enum: [
                1,
                2,
                3,
                4,
                5,
                6,
                100,
                101,
                102,
                103,
                104,
                105,
                106,
                107
              ]
            },
            quorumHash: { $ref: 'hash#' }
          }
        }
      }
    },
    {
      path: '/identities/history',
      method: 'GET',
      handler: identitiesController.getIdentitiesHistory,
      schema: {
        querystring: { $ref: 'timeInterval#' }
      }
    },
    {
      path: '/waitForStateTransitionResult/:hash',
      method: 'GET',
      handler: transactionsController.waitForStateTransitionResult,
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
