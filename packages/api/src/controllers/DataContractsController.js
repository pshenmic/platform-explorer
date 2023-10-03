const DataContract = require("../models/DataContract");

class DataContractsController {
    constructor(knex) {
        this.knex = knex
    }

    getDataContracts = async (request, response) => {
        const dataContracts = await this.knex
            .select('data_contracts.identifier as identifier')
            .from('data_contracts')
            .orderBy('id', 'desc')
            .limit(30)

        response.send(dataContracts.map(dataContract => DataContract.fromJSON(dataContract)));
    }

    getDataContractByIdentifier = async (request, response) => {
        const {identifier} = request.params

        const rows = await this.knex('data_contracts')
            .select('data_contracts.identifier as identifier', 'data_contracts.schema as schema')
            .where('data_contracts.identifier', identifier);

        const [row] = rows

        if (!row) {
            response.status(404).send({message: 'not found'})
        }

        response.send({identifier: row.identifier, schema: row.schema});
    }
}

module.exports = DataContractsController
