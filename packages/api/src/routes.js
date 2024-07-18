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
      schema: { params: { $ref: 'epochSchema#' } },
    },
    {
      path: '/block/:hash',
      method: 'GET',
      handler: blocksController.getBlockByHash,
      schema: { params: { $ref: 'hashSchema#' } },
    },
    {
      path: '/validator/:validator/blocks',
      method: 'GET',
      handler: blocksController.getBlocksByValidator,
      schema: { querystring: { $ref: 'paginationSchema#' } },
    },
    {
      path: '/blocks',
      method: 'GET',
      handler: blocksController.getBlocks,
      schema: { querystring: { $ref: 'paginationSchema#' } },
    },
    {
      path: '/transactions',
      method: 'GET',
      handler: transactionsController.getTransactions,
      schema: { querystring: { $ref: 'paginationSchema#' } }
    },
    {
      path: '/transaction/:txHash',
      method: 'GET',
      handler: transactionsController.getTransactionByHash,
      schema: { params: { $ref: 'txHashSchema#' } },
    },
    {
      path: '/dataContracts',
      method: 'GET',
      handler: dataContractsController.getDataContracts,
      schema: { querystring: { $ref: 'paginationWithOrderBySchema#' } },
    },
    {
      path: '/dataContract/:identifier',
      method: 'GET',
      handler: dataContractsController.getDataContractByIdentifier,
      schema: { params: { $ref: 'identifierSchema#' } },
    },
    {
      path: '/dataContract/:identifier/documents',
      method: 'GET',
      handler: documentsController.getDocumentsByDataContract,
      schema: {
        params: { $ref: 'identifierSchema#' },
        querystring: { $ref: 'paginationSchema#' }
      },
    },
    {
      path: '/document/:identifier',
      method: 'GET',
      handler: documentsController.getDocumentByIdentifier,
      schema: { params: { $ref: 'identifierSchema#' } },
    },
    {
      path: '/identities',
      method: 'GET',
      handler: identitiesController.getIdentities,
      schema: { querystring: { $ref: 'paginationWithOrderBySchema#' } },
    },
    {
      path: '/identity/:identifier',
      method: 'GET',
      handler: identitiesController.getIdentityByIdentifier,
      schema: { params: { $ref: 'identifierSchema#' } },
    },
    {
      path: '/identity/:identifier/transactions',
      method: 'GET',
      handler: identitiesController.getTransactionsByIdentity,
      schema: {
        params: { $ref: 'identifierSchema#' },
        querystring: { $ref: 'paginationSchema#' }
      },
    },
    {
      path: '/identity/:identifier/dataContracts',
      method: 'GET',
      handler: identitiesController.getDataContractsByIdentity,
      schema: {
        params: { $ref: 'identifierSchema#' },
        querystring: { $ref: 'paginationSchema#' }
      },
    },
    {
      path: '/identity/:identifier/documents',
      method: 'GET',
      handler: identitiesController.getDocumentsByIdentity,
      schema: {
        params: { $ref: 'identifierSchema#' },
        querystring: { $ref: 'paginationSchema#' }
      },
    },
    {
      path: '/identity/:identifier/transfers',
      method: 'GET',
      handler: identitiesController.getTransfersByIdentity,
      schema: {
        params: { $ref: 'identifierSchema#' },
        querystring: { $ref: 'paginationSchema#' }
      },
    },
    {
      path: '/search',
      method: 'GET',
      handler: mainController.search,
      schema: { querystring: { $ref: 'querySchema#' } },
    },
    {
      path: '/transaction/decode',
      method: 'POST',
      handler: transactionsController.decode,
      schema: { body: { $ref: 'decodeSchema#' } },
    },
    {
      path: '/transactions/history',
      method: 'GET',
      handler: transactionsController.getTransactionHistory,
      schema: { querystring: { $ref: 'timespanSchema#' } },
    },
    {
      path: '/validators',
      method: 'GET',
      handler: validatorsController.getValidators,
      schema: { querystring: { $ref: 'paginationWithIsActiveSchema#' } },
    },
    {
      path: '/validator/:proTxHash',
      method: 'GET',
      handler: validatorsController.getValidatorByProTxHash,
      schema: { params: { $ref: 'txHashSchema#' } }
    }
  ]

  routes.forEach(route => fastify[route.method.toLowerCase()](route.path, { schema: route.schema ?? null }, route.handler))
}
