const crypto = require('crypto')

const hash = (data) => {
    return crypto.createHash('sha1').update(data).digest('hex');
}

module.exports = {hash}
