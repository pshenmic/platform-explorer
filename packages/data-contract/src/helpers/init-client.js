const Dash = require('dash');
const { getMnemonic } = require('./get-mnemonic');
const { getNetwork } = require('./get-network');


function initClient() {
    let clientOpts = {
        network: getNetwork(),
        wallet: {
            mnemonic: getMnemonic(),
            unsafeOptions: {
                skipSynchronizationBeforeHeight: 1000000,
            }
        },
    };
    return new Dash.Client(clientOpts);
}

module.exports = { initClient }