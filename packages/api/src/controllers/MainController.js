const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')

class MainController {
    constructor(knex) {
        this.blocksDAO = new BlocksDAO(knex)
        this.dataContractsDAO = new DataContractsDAO(knex)
        this.documentsDAO = new DocumentsDAO(knex)
        this.transactionsDAO = new TransactionsDAO(knex)
    }

    getStatus = async (request, response) => {
        const max = await this.blocksDAO.getMaxHeight()

        response.send({
            network: "dash-testnet-26",
            appVersion: "1",
            p2pVersion: "8",
            blockVersion: "13",
            blocksCount: max,
            tenderdashVersion: "0.13.2"
        });
    }

    search = async (request, response) => {
        const {query} = request.query;

        // todo validate
        if (!query) {
            return response.status(400).send({error: '`?query=` missing'})
        }

        if (/^[0-9]+$/.test(query)) {
            // search block by height
            const block = await this.blocksDAO.getBlockByHeight(query)

            if (block) {
                return response.send({block})
            }
        }

        if (/^[0-9A-F]{64,64}$/.test(query)) {
            // search block by hash
            const block = await this.blocksDAO.getBlockByHash(query)

            if (block) {
                return response.send({block})
            }

            // search transactions
            const transaction = await this.transactionsDAO.getTransactionByHash(query)

            if (transaction) {
                return response.send({transaction})
            }
        }

        // check for any Identifiers (data contracts, documents)
        if (query.length >= 43 && query.length <= 44) {
            // search data contracts
            const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(query)

            if (dataContract) {
                return response.send({dataContract})
            }

            // search documents
            const document = await this.documentsDAO.getDocumentByIdentifier(query)

            if (document) {
                return response.send({document})
            }
        }

        response.status(404).send({message: 'not found'})
    }
}

module.exports = MainController
