class MainController {
    constructor(knex) {
        this.knex = knex;
    }

     getStatus = async (request, response) => {
         const [result] = await this.knex('blocks').max('height')

         const {max} = result

         response.send({
             network: "dash-testnet-25",
             appVersion: "1",
             p2pVersion: "8",
             blockVersion: "13",
             blocksCount: max,
             tenderdashVersion: "0.13.1"
         });
    }

    search = async (request, response) => {
        const {query} = request.query;

        // todo validate
        if (!query) {
            return response.status(400).send({error: '`?query=` missing'})
        }

        if (/^[0-9]$/.test(query)) {
            // search blocks by height
            const [row] = await this.knex('blocks').select('hash', 'block_height').where('block_height', query)

            if (row) {
                const {hash, block_height} = row

                return response.send({hash: hash, height: block_height})
            }
        }

        // check if base64 and 44 length for Identity ids
        if (/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(query) && query.length === 44) {
            // search blocks by height
            const [row] = await this.knex('data_contracts').select('identifier').where('identifier', query)

            if (row) {
                return response.send({identifier: row.identifier})
            }
        }

        // search blocks
        const [row] = await this.knex('blocks').select('hash', 'block_height').where('hash', query)

        if (row) {
            const {hash, block_height} = row

            return response.send({hash: hash, height: block_height})
        }

        // search transactions
        const [stRow] = await this.knex('state_transitions').select('hash').where('hash', query)

        if (stRow) {
            const {hash} = stRow

            return response.send({hash})
        }

        response.status(404).send({message: 'not found'})
    }
}

module.exports = MainController
