const schema = {
    "labler": {
        "type": "object",
        "properties": {
            "contractId": {
                "type": "string",
                "minLength": 43,
                "maxLength": 44,
                "position": 0
            },
            "shortName": {
                "type": "string",
                "maxLength": 32,
                "minLength": 3,
                "position": 1.
            }
        },
        "required": [
            "shortName",
            "contractId"
        ],
        "additionalProperties": false
    }
};

const networks = ['testnet', 'mainnet'];

module.exports = { schema, networks }