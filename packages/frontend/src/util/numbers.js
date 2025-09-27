export const formatNumberWithSpaces = (num, decimalPlaces) => {
  if (num === undefined || num === null) return ''

  if (typeof num === 'bigint') {
    return num.toLocaleString('ru-RU').replace(/,/g, ', ')
  }

  const number = Number(num)
  if (isNaN(number)) return String(num)

  return number.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces || 0
  }).replace(/,/g, ', ')
}

export const formatNumberByDecimals = (str, decimalPlaces) => {
  if (str === undefined || str === null) return '0'

  const strNum = String(str).replace(/[^0-9]/g, '') // Remove non-digits
  if (strNum === '' || strNum.startsWith('-')) return '0'

  const decimal = Number(decimalPlaces)
  if (isNaN(decimal) || !Number.isInteger(decimal) || decimal <= 0) {
    return strNum
  }

  const len = strNum.length
  let integerPart = '0'
  let fractionalPart = ''

  if (len > decimal) {
    integerPart = strNum.slice(0, len - decimal)
    fractionalPart = strNum.slice(len - decimal)
  } else {
    fractionalPart = '0'.repeat(decimal - len) + strNum
  }

  fractionalPart = fractionalPart.replace(/0+$/, '')

  let result = integerPart
  if (fractionalPart) {
    result += ',' + fractionalPart
  }

  return result
}
