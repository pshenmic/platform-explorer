/**
 *
 * @param fastify {Fastify}
 * @param mainController {MainController}
 * @param blockController {BlockController}
 * @param transactionController {TransactionController}
 */
module.exports = ({fastify, mainController, blockController, transactionController, dataContractsController}) => {
    const routes = [
        {
            path: '/status',
            method: 'GET',
            handler: mainController.getStatus
        },
        {
            path: '/block/:hash',
            method: 'GET',
            handler: blockController.getBlockByHash
        },
        {
            path: '/blocks',
            method: 'GET',
            handler: blockController.getBlocks
        },
        {
            path: '/transactions',
            method: 'GET',
            handler: transactionController.getTransactions
        },
        {
            path: '/transaction/:txHash',
            method: 'GET',
            handler: transactionController.getTransactionByHash
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
            path: '/search',
            method: 'GET',
            handler: mainController.search
        },
        {
            path: '/transaction/decode',
            method: 'POST',
            handler: transactionController.decode
        },
    ]

    routes.forEach(route => fastify[route.method.toLowerCase()](route.path, route.handler))
}
