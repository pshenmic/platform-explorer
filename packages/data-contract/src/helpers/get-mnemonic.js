function getMnemonic() {
    if (process.env.MNEMONIC && process.env.MNEMONIC.toString().replace(' ', '') !== "") {
        return process.env.MNEMONIC;
    } else {
        throw new Error('Mnemonic is not set');
    }
}

module.exports = { getMnemonic }