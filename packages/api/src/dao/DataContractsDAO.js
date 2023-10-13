const DataContract = require("../models/DataContract");
const PaginatedResultSet = require("../models/PaginatedResultSet");

module.exports = class DataContractsDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getDataContracts = async (page, limit, order) => {
        const fromRank = (page - 1) * limit
        const toRank = fromRank + limit - 1

        const subquery = this.knex('data_contracts')
            .select(this.knex('data_contracts').countDistinct('identifier').as('total_count'), 'data_contracts.id as id', 'data_contracts.identifier as identifier', 'data_contracts.version as version')
            .select(this.knex.raw(`rank() over (partition by identifier order by version desc) rank`))
            .as('data_contracts')

        const filteredContracts = this.knex(subquery)
            .select('total_count', 'id', 'identifier', 'version', 'rank')
            .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
            .where('rank', '=', 1)
            .orderBy('id', order)
            .as('temp')

        const rows = await this.knex(filteredContracts)
            .select('total_count', 'id', 'identifier', 'version', 'row_number')
            .whereBetween('row_number', [fromRank, toRank])
            .orderBy('id', order);

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        const resultSet = rows.map(dataContract => DataContract.fromRow(dataContract));

        return new PaginatedResultSet(resultSet, page, limit, totalCount);
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
