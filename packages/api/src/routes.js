/**
 *
 * @param fastify {Fastify}
 * @param mainController {MainController}
 * @param blockController {BlocksController}
 * @param transactionsController {TransactionsController}
 */
module.exports = ({fastify, mainController, blocksController, transactionsController, dataContractsController, documentsController, identitiesController}) => {
    const routes = [
        {
            path: '/status',
            method: 'GET',
            handler: mainController.getStatus
        },
        {
            path: '/block/:hash',
            method: 'GET',
            handler: blocksController.getBlockByHash
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
    ]

    routes.forEach(route => fastify[route.method.toLowerCase()](route.path, route.handler))
}
