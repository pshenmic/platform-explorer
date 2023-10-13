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
            .select('data_contracts.id as id', 'data_contracts.identifier as identifier',
                'data_contracts.version as version')
            .select(this.knex.raw(`rank() over (partition by identifier order by version desc) rank`))

        const filteredContracts = this.knex.with('with_alias', subquery)
            .select( 'id', 'identifier', 'version', 'rank',
                this.knex('with_alias').count('*').as('total_count').where('rank', '1'))
            .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
            .from('with_alias')
            .where('rank',1)
            .orderBy('id', order)
            .as('filtered_data_contracts')

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
