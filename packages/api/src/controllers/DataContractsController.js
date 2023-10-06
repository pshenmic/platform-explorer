const DataContract = require("../models/DataContract");

class DataContractsController {
    constructor(knex) {
        this.knex = knex
    }

    getDataContracts = async (request, response) => {
        const subquery = this.knex('data_contracts')
            .distinctOn('identifier')
            .select('data_contracts.id as id',
                'data_contracts.identifier as identifier',
                'data_contracts.version as version')
            .as('data_contracts')

        const rows = await this.knex(subquery)
            .select('id', 'identifier', 'version')
            .orderBy('id', 'asc')

        response.send(rows.map(dataContract => DataContract.fromJSON(dataContract)));
    }

    getDataContractByIdentifier = async (request, response) => {
        const {identifier} = request.params

        const rows = await this.knex('data_contracts')
            .select('data_contracts.identifier as identifier', 'data_contracts.schema as schema', 'data_contracts.version as version')
            .where('data_contracts.identifier', identifier)
            .orderBy('id', 'desc')
            .limit(1);

        const [row] = rows

        if (!row) {
            response.status(404).send({message: 'not found'})
        }

        response.send({identifier: row.identifier, schema: row.schema, version: row.version});
    }
}

module.exports = DataContractsController
