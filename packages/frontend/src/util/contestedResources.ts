const getResourceValue = (resourceValue) => (
  (resourceValue?.[1] || '') +
  `${resourceValue?.[0]
    ? '.' + resourceValue?.[0]
    : ''}`
)

const decodeValue = (encodedValue) => {
  const jsonString = String(Buffer
    .from(encodedValue, 'base64')
    .toString('utf-8')
    .trim())

  try {
    return JSON.parse(jsonString)
  } catch (e) {
    console.warn(e)
    return null
  }
}

export default {
  getResourceValue,
  decodeValue
}
