const BlocksDAO = require('../dao/BlocksDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const TransactionsDAO = require('../dao/TransactionsDAO')
const DocumentsDAO = require('../dao/DocumentsDAO')
const IdentitiesDAO = require('../dao/IdentitiesDAO')
const TenderdashRPC = require("../tenderdashRpc");

class MainController {
    constructor(knex) {
        this.blocksDAO = new BlocksDAO(knex)
        this.dataContractsDAO = new DataContractsDAO(knex)
        this.documentsDAO = new DocumentsDAO(knex)
        this.transactionsDAO = new TransactionsDAO(knex)
        this.identitiesDAO = new IdentitiesDAO(knex)
    }

    getStatus = async (request, response) => {
        let stats
        let tdStatus

        try {
            stats = await this.blocksDAO.getStats()
            tdStatus = await TenderdashRPC.getStatus();
        } catch (e) {
            console.error(e)
        }

        response.send({
            appVersion: stats?.appVersion,
            blockVersion: stats?.blockVersion,
            blocksCount: stats?.topHeight,
            blockTimeAverage: stats?.blockTimeAverage,
            txCount: stats?.txCount,
            transfersCount: stats?.transfersCount,
            dataContractsCount: stats?.dataContractsCount,
            documentsCount: stats?.documentsCount,
            network: tdStatus?.network ?? null,
            tenderdashVersion: tdStatus?.tenderdashVersion ?? null
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

        // check for any Identifiers (identities, data contracts, documents)
        if (query.length >= 43 && query.length <= 44) {
            // search identites
            const identity = await this.identitiesDAO.getIdentityByIdentifier(query)

            if (identity) {
                return response.send({identity})
            }

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
