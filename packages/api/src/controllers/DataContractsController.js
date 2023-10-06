const DataContract = require("../models/DataContract");

class DataContractsController {
    constructor(knex) {
        this.knex = knex
    }

    getDataContracts = async (request, response) => {
        const subquery = this.knex('data_contracts')
            .select(this.knex.raw('data_contracts.id as id, data_contracts.identifier as identifier, data_contracts.version as version, rank() over (partition by identifier order by version desc) rank'))
            .as('data_contracts')

        const rows = await this.knex(subquery)
            .select('id', 'identifier', 'version', 'rank')
            .where('rank', '=', 1)

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
