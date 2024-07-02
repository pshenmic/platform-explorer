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
      handler: epochController.getEpochInfo
    },
    {
      path: '/block/:hash',
      method: 'GET',
      handler: blocksController.getBlockByHash
    },
    {
      path: '/validator/:validator/blocks',
      method: 'GET',
      handler: blocksController.getBlocksByValidator
    },
    {
      path: '/blocks',
      method: 'GET',
      handler: blocksController.getBlocks
    },
    {
      path: '/transactions',
      method: 'GET',
      handler: transactionsController.getTransactions
    },
    {
      path: '/transaction/:txHash',
      method: 'GET',
      handler: transactionsController.getTransactionByHash
    },
    {
      path: '/dataContracts',
      method: 'GET',
      handler: dataContractsController.getDataContracts
    },
    {
      path: '/dataContract/:identifier',
      method: 'GET',
      handler: dataContractsController.getDataContractByIdentifier
    },
    {
      path: '/dataContract/:identifier/documents',
      method: 'GET',
      handler: documentsController.getDocumentsByDataContract
    },
    {
      path: '/document/:identifier',
      method: 'GET',
      handler: documentsController.getDocumentByIdentifier
    },
    {
      path: '/identities',
      method: 'GET',
      handler: identitiesController.getIdentities
    },
    {
      path: '/identity/:identifier',
      method: 'GET',
      handler: identitiesController.getIdentityByIdentifier
    },
    {
      path: '/identity/:identifier/transactions',
      method: 'GET',
      handler: identitiesController.getTransactionsByIdentity
    },
    {
      path: '/identity/:identifier/dataContracts',
      method: 'GET',
      handler: identitiesController.getDataContractsByIdentity
    },
    {
      path: '/identity/:identifier/documents',
      method: 'GET',
      handler: identitiesController.getDocumentsByIdentity
    },
    {
      path: '/identity/:identifier/transfers',
      method: 'GET',
      handler: identitiesController.getTransfersByIdentity
    },
    {
      path: '/search',
      method: 'GET',
      handler: mainController.search
    },
    {
      path: '/transaction/decode',
      method: 'POST',
      handler: transactionsController.decode
    },
    {
      path: '/transactions/history',
      method: 'GET',
      handler: transactionsController.getTransactionHistory
    },
    {
      path: '/validators',
      method: 'GET',
      handler: validatorsController.getValidators
    },
    {
      path: '/validator/:proTxHash',
      method: 'GET',
      handler: validatorsController.getValidatorByProTxHash
    }
  ]

  routes.forEach(route => fastify[route.method.toLowerCase()](route.path, route.handler))
}
