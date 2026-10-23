const { readFileSync } = require('fs')
const { resolve } = require('path')
const { Reader } = require('mmdb-lib')
const { GEOIP_DB_PATH } = require('./constants')

const cacheStorage = {}

let reader

function getReader () {
  if (!reader) {
    reader = new Reader(readFileSync(resolve(GEOIP_DB_PATH)), {
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
