const { networks } = require("../constants");

function getNetwork() {
    if (process.env.NETWORK) {
        if (networks.includes(process.env.NETWORK)) {
            return process.env.NETWORK;
        } else {
            throw new Error('Network value error ( available: testnet, mainnet )');
        }
    } else {
        throw new Error('Network is not set');
    }
}

module.exports = { getNetwork }