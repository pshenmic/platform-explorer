export const formatNumberWithSpaces = (num) => {
  if (num === undefined || num === null) return ''

  const number = Number(num)

  if (isNaN(number)) return String(num)

  return number.toLocaleString('ru-RU').replace(/,/g, ' ')
}
