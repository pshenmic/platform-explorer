const DataContract = require("../models/DataContract");

module.exports = class BlockDAO {
    constructor(knex) {
        this.knex = knex;
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
