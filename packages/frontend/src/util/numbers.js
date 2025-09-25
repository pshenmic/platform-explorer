export const formatNumberWithSpaces = (num, decimalPlaces) => {
  if (num === undefined || num === null) return ''

  const number = Number(num)
  if (isNaN(number)) return String(num)

  return number.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces || 0
  }).replace(/,/g, ', ')
}

export const formatNumberByDecimals = (str, decimalPlaces) => {
  const number = Number(str)
  const decimal = Number(decimalPlaces)

  if (isNaN(number)) return 0
  if (!Number.isInteger(decimal) || decimal <= 0) return number

  return number / (10 ** decimal)
}
