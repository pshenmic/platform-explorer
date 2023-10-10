const DataContract = require("../models/DataContract");
const DataContractsDAO = require("../dao/DataContractsDAO");

class DataContractsController {
    constructor(knex) {
        this.knex = knex
        this.dataContractsDAO = new DataContractsDAO(knex)
    }

    getDataContracts = async (request, response) => {
        const subquery = this.knex('data_contracts')
            .select(this.knex.raw('data_contracts.id as id, data_contracts.identifier as identifier, data_contracts.version as version, rank() over (partition by identifier order by version desc) rank'))
            .as('data_contracts')

        const rows = await this.knex(subquery)
            .select('id', 'identifier', 'version', 'rank')
            .where('rank', '=', 1)

        response.send(rows.map(dataContract => DataContract.fromRow(dataContract)));
    }

    getDataContractByIdentifier = async (request, response) => {
        const {identifier} = request.params

        const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(identifier)

        if (!dataContract) {
            response.status(404).send({message: 'not found'})
        }

        response.send(dataContract);
    }
}

module.exports = DataContractsController
