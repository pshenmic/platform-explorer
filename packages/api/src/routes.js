const { schemas } = require('./schemas')

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
      schema: schemas.epochSchema
    },
    {
      path: '/block/:hash',
      method: 'GET',
      handler: blocksController.getBlockByHash,
      schema: schemas.blockSchema
    },
    {
      path: '/validator/:validator/blocks',
      method: 'GET',
      handler: blocksController.getBlocksByValidator,
      schema: schemas.validatorBlocksSchema
    },
    {
      path: '/blocks',
      method: 'GET',
      handler: blocksController.getBlocks,
      schema: schemas.blocksSchema
    },
    {
      path: '/transactions',
      method: 'GET',
      handler: transactionsController.getTransactions,
      schema: schemas.transactionsSchema
    },
    {
      path: '/transaction/:txHash',
      method: 'GET',
      handler: transactionsController.getTransactionByHash,
      schema: schemas.transactionSchema
    },
    {
      path: '/dataContracts',
      method: 'GET',
      handler: dataContractsController.getDataContracts,
      schema: schemas.dataContractsSchema
    },
    {
      path: '/dataContract/:identifier',
      method: 'GET',
      handler: dataContractsController.getDataContractByIdentifier,
      schema: schemas.dataContractSchema
    },
    {
      path: '/dataContract/:identifier/documents',
      method: 'GET',
      handler: documentsController.getDocumentsByDataContract,
      schema: schemas.dataContractDocumentsSchema
    },
    {
      path: '/document/:identifier',
      method: 'GET',
      handler: documentsController.getDocumentByIdentifier,
      schema: schemas.documentSchema
    },
    {
      path: '/identities',
      method: 'GET',
      handler: identitiesController.getIdentities,
      schema: schemas.identitiesSchema
    },
    {
      path: '/identity/:identifier',
      method: 'GET',
      handler: identitiesController.getIdentityByIdentifier,
      schema: schemas.identitySchema
    },
    {
      path: '/identity/:identifier/transactions',
      method: 'GET',
      handler: identitiesController.getTransactionsByIdentity,
      schema: schemas.identityTransactionsSchema
    },
    {
      path: '/identity/:identifier/dataContracts',
      method: 'GET',
      handler: identitiesController.getDataContractsByIdentity,
      schema: schemas.identityDataContractsSchema
    },
    {
      path: '/identity/:identifier/documents',
      method: 'GET',
      handler: identitiesController.getDocumentsByIdentity,
      schema: schemas.identityDocumentsSchema
    },
    {
      path: '/identity/:identifier/transfers',
      method: 'GET',
      handler: identitiesController.getTransfersByIdentity,
      schema: schemas.identityTransfersSchema
    },
    {
      path: '/search',
      method: 'GET',
      handler: mainController.search,
      schema: schemas.searchSchema
    },
    {
      path: '/transaction/decode',
      method: 'POST',
      handler: transactionsController.decode,
      schema: schemas.decodeSchema
    },
    {
      path: '/transactions/history',
      method: 'GET',
      handler: transactionsController.getTransactionHistory,
      schema: schemas.transactionsHistorySchema
    },
    {
      path: '/validators',
      method: 'GET',
      handler: validatorsController.getValidators,
      schema: schemas.validatorsSchema
    },
    {
      path: '/validator/:proTxHash',
      method: 'GET',
      handler: validatorsController.getValidatorByProTxHash,
      schema: schemas.validatorSchema
    }
  ]

  routes.forEach(route => fastify[route.method.toLowerCase()](route.path, { schema: route.schema ?? null }, route.handler))
}
