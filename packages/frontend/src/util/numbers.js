export const sliceNumberByDecimals = (str, decimalPlaces) => {
  if (str === undefined || str === null) return { integer: '0', fractional: '' }

  if (str === '') return { integer: '0', fractional: '' }

  const decimal = Number(decimalPlaces)

  if (isNaN(decimal) || !Number.isInteger(decimal) || decimal <= 0) {
    return { integer: str, fractional: '' }
  }

  const len = str.length

  if (len > decimal) {
    return {
      integer: str.slice(0, len - decimal),
      fractional: str.slice(len - decimal)
    }
  }

  return {
    integer: '0',
    fractional: '0'.repeat(decimal - len) + str
  }
}

export const trimEndZeros = (str) => {
  return str.replace(/0+$/, '')
}

export const formatNumberWithSpaces = (num) => {
  try {
    const formattedInteger = BigInt(num).toLocaleString('ru-Ru')

    return formattedInteger
  } catch (e) {
    const formattedInteger = String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    return formattedInteger
  }
}

export const concatDecimal = (integer, fractional) => {
  if (fractional) {
    return integer + '.' + fractional
  }

  return integer
}
