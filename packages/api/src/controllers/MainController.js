const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')

class MainController {
    constructor(knex) {
        this.blocksDAO = new BlocksDAO(knex)
        this.dataContractsDAO = new DataContractsDAO(knex)
        this.transactionsDAO = new TransactionsDAO(knex)
    }

     getStatus = async (request, response) => {
         const max = await this.blocksDAO.getMaxHeight()

         response.send({
             network: "dash-testnet-25",
             appVersion: "1",
             p2pVersion: "8",
             blockVersion: "13",
             blocksCount: max,
             tenderdashVersion: "0.13.1"
         });
    }

    search = async (request, response) => {
        const {query} = request.query;

        // todo validate
        if (!query) {
            return response.status(400).send({error: '`?query=` missing'})
        }

        if (/^[0-9]$/.test(query)) {
            // search block by height
            const block = await this.blocksDAO.getBlockByHeight(query)

            if (block) {
                return response.send(block)
            }
        }

        if (/^[0-9A-F]{64,64}$/.test(query)) {
            // search block by hash
            const block = await this.blocksDAO.getBlockByHash(query)

            if (block) {
                return response.send(block)
            }

            // search transactions
            const transaction = await this.transactionsDAO.getTransactionByHash(query)

            if (transaction) {
                return response.send(transaction)
            }
        }

        // check if base64 and 44 length for Identity ids
        if (/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(query) && query.length === 44) {
            // search block by height
            const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(query)

            if (dataContract) {
                return response.send(dataContract)
            }
        }

        response.status(404).send({message: 'not found'})
    }
}

module.exports = MainController
