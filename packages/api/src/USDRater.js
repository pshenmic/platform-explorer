const Constants = require('./constants')

function getProperty (obj, path) {
  return path.length > 0
    ? getProperty(
      obj[path[0]],
      path.slice(1))
    : obj
}

function getPropertyByPath (obj, path) {
  return getProperty(obj, path.split('.'))
}

async function getUSDRate (urlIndex = 0) {
  if (urlIndex >= Constants.ratesUrls.length) {
    throw new Error(`out of range (max: ${Constants.ratesUrls.length - 1})`)
  }

  const response = await fetch(Constants.ratesUrls[urlIndex], {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    }
  })

  const rate = getPropertyByPath(await response.json(), Constants.ratesUSDPath[urlIndex])

  if (rate !== null) {
    return Number(rate)
  } else {
    return await getUSDRate(urlIndex + 1)
  }
}

module.exports = getUSDRate
