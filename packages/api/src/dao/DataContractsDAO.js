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
            .select('data_contracts.id as id', 'data_contracts.identifier as identifier', 'data_contracts.owner as owner',
                'data_contracts.is_system as is_system', 'data_contracts.version as version',
                'data_contracts.state_transition_hash as tx_hash')
            .select(this.knex.raw(`rank() over (partition by identifier order by version desc) rank`))

        const filteredContracts = this.knex.with('with_alias', subquery)
            .select( 'id', 'owner', 'identifier', 'version', 'tx_hash', 'rank', 'is_system',
                this.knex('with_alias').count('*').as('total_count').where('rank', '1'))
            .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
            .from('with_alias')
            .where('rank', 1)
            .orderBy('id', order)
            .as('filtered_data_contracts')

        const rows = await this.knex(filteredContracts)
            .select('total_count', 'identifier', 'filtered_data_contracts.owner', 'version', 'row_number',
                'filtered_data_contracts.tx_hash', 'is_system', 'blocks.timestamp as timestamp', 'blocks.hash as block_hash')
            .leftJoin('state_transitions', 'state_transitions.hash', 'filtered_data_contracts.tx_hash')
            .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
            .whereBetween('row_number', [fromRank, toRank])

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        const resultSet = rows.map(dataContract => DataContract.fromRow(dataContract));

        return new PaginatedResultSet(resultSet, page, limit, totalCount);
    }

    getDataContractByIdentifier = async (identifier) => {
        const rows = await this.knex('data_contracts')
            .select('data_contracts.identifier as identifier', 'data_contracts.owner as owner',
                'data_contracts.schema as schema', 'data_contracts.is_system as is_system',
                'data_contracts.version as version', 'state_transitions.hash as tx_hash', 'blocks.timestamp as timestamp')
            .leftJoin('state_transitions', 'data_contracts.state_transition_hash', 'state_transitions.hash')
            .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
            .where('data_contracts.identifier', identifier)
            .orderBy('data_contracts.id', 'desc')
            .limit(1);

        const [row] = rows

        if (!row) {
            return null
        }

        return DataContract.fromRow(row)
    }
}
