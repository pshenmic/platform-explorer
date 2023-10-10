const DataContract = require("../models/DataContract");

module.exports = class DataContractsDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getDataContracts = async () => {
        const subquery = this.knex('data_contracts')
            .select(this.knex.raw('data_contracts.id as id, data_contracts.identifier as identifier, data_contracts.version as version, rank() over (partition by identifier order by version desc) rank'))
            .as('data_contracts')

        const rows = await this.knex(subquery)
            .select('id', 'identifier', 'version', 'rank')
            .where('rank', '=', 1)

        return rows.map(dataContract => DataContract.fromRow(dataContract));
    }

    getDataContractByIdentifier = async (identifier) => {
        const rows = await this.knex('data_contracts')
            .select('data_contracts.identifier as identifier', 'data_contracts.schema as schema', 'data_contracts.version as version')
            .where('data_contracts.identifier', identifier)
            .orderBy('id', 'desc')
            .limit(1);

        const [row] = rows

        if (!row) {
            return null
        }

        return DataContract.fromRow(row)
    }
}
