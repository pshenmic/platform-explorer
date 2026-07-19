const { readFileSync } = require('fs')
const { resolve } = require('path')
const { Reader } = require('mmdb-lib')
const { GEOIP_PROVIDER, GEOIP_TABLE_NAME } = require('./constants')

const cacheStorage = {}

let reader

function getReader () {
  if (!reader) {
    const mmdbPath = resolve(
      require.resolve(`${GEOIP_PROVIDER}/package.json`),
      '..',
      GEOIP_TABLE_NAME
    )

    reader = new Reader(readFileSync(mmdbPath), {
      cache: {
        get: (key) => cacheStorage[key],
        set: (key, value) => (cacheStorage[key] = value)
      }
    })
  }

  return reader
}

class GeoIP {
  static lookup (ipv4) {
    if (!ipv4) {
      throw new Error('you must specify a valid IP address')
    }

    const response = getReader().get(ipv4)

    return {
      ipv4,
      countryCode: response?.country_code ?? null,
      city: response?.city ?? null,
      latitude: response?.latitude ?? null,
      longitude: response?.longitude ?? null
    }
  }
}

module.exports = GeoIP
