const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

function polymod(values) {
  const GENERATOR = [
    0x3b6a57b2,
    0x26508e6d,
    0x1ea119fa,
    0x3d4233dd,
    0x2a1462b3
  ]

  let chk = 1

  for (let p = 0; p < values.length; p++) {
    const top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ values[p]

    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) {
        chk ^= GENERATOR[i]
      }
    }
  }

  return chk
}

function hrpExpand(hrp) {
  const ret = []

  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) >> 5)
  }

  ret.push(0)

  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) & 31)
  }

  return ret
}

function createChecksum(hrp, data) {
  const BECH32M_CONST = 0x2bc830a3

  const values = [
    ...hrpExpand(hrp),
    ...data,
    0,0,0,0,0,0
  ]

  const mod = polymod(values) ^ BECH32M_CONST

  const ret = []

  for (let i = 0; i < 6; i++) {
    ret.push((mod >> (5 * (5 - i))) & 31)
  }

  return ret
}

function convertBits(data, fromBits, toBits, pad = true) {
  let acc = 0
  let bits = 0
  const ret = []
  const maxv = (1 << toBits) - 1

  for (let i = 0; i < data.length; i++) {
    const value = data[i]

    if (value < 0 || (value >> fromBits) !== 0) {
      throw new Error("invalid value")
    }

    acc = (acc << fromBits) | value
    bits += fromBits

    while (bits >= toBits) {
      bits -= toBits
      ret.push((acc >> bits) & maxv)
    }
  }

  if (pad) {
    if (bits > 0) {
      ret.push((acc << (toBits - bits)) & maxv)
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    throw new Error("invalid padding")
  }

  return ret
}

function encodeBech32m(hrp, data) {
  const checksum = createChecksum(hrp, data)
  const combined = [...data, ...checksum]

  let ret = hrp + "1"

  for (let i = 0; i < combined.length; i++) {
    ret += CHARSET[combined[i]]
  }

  return ret
}

module.exports = function bech32mEncode(hrp, bytes) {
  const data = convertBits(bytes, 8, 5, true)
  return encodeBech32m(hrp, data)
}