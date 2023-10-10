const Block = require("../models/Block");

module.exports = class BlockDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getBlockByHash = async (blockHash) => {
        const results = await this.knex
            .select('blocks.hash as hash', 'state_transitions.hash as st_hash', 'blocks.height as height', 'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version', 'blocks.l1_locked_height as l1_locked_height')
            .from('blocks')
            .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
            .where('blocks.hash', blockHash);

        const [block] = results

        if (!block) {
            return null
        }

        const txs = results.reduce((acc, value) => {
            if (value.st_hash) {
                return [...acc, value.st_hash]
            }

            return acc
        }, [])


        return Block.fromRow({header: block, txs});
    }

    getBlockByHeight = async (height) => {
        const results = await this.knex
            .select('blocks.hash as hash', 'state_transitions.hash as st_hash', 'blocks.height as height', 'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version', 'blocks.l1_locked_height as l1_locked_height')
            .from('blocks')
            .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
            .where('blocks.height', height);

        const [block] = results

        if (!block) {
            return null
        }

        const txs = results.reduce((acc, value) => {
            if (value.st_hash) {
                return [...acc, value.st_hash]
            }

            return acc
        }, [])

        if (!block.length) {
            return null
        }

        return Block.fromRow({header: block, txs});
    }
}
