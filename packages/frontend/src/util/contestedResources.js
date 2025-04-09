const getResourceValue = (resourceValue) => (
  (resourceValue?.[1] || '') +
  `${resourceValue?.[0]
    ? '.' + resourceValue?.[0]
    : ''}`
)

export default {
  getResourceValue
}
