const getResourceValue = (resourceValue?: Array<string | undefined> | null): string => (
  (resourceValue?.[1] || '') +
  `${resourceValue?.[0]
    ? '.' + resourceValue?.[0]
    : ''}`
)

const decodeValue = (encodedValue: string): unknown => {
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

const contestedResourcesUtils = {
  getResourceValue,
  decodeValue
}
export default contestedResourcesUtils
