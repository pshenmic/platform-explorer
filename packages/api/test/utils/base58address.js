const { createHash } = require('crypto')
const { base58 } = require('@scure/base')

module.exports = function base58Address(payload, version = 0x00) {

  const versioned = Buffer.allocUnsafe(1 + payload.length)
  versioned[0] = version
  payload.copy(versioned, 1)

  const hash1 = createHash("sha256").update(versioned).digest()
  const hash2 = createHash("sha256").update(hash1).digest()

  const checksum = hash2.subarray(0, 4)

  const addressBytes = Buffer.concat([versioned, checksum])

  return base58.encode(addressBytes)
}