// documents.query mock returning the given document, batched DPNS lookups
// by 'records.identity in [...]' get one copy per requested identity
module.exports = (document) => async (dataContractId, documentTypeName, where) => {
  const [[field, operator, value] = []] = where ?? []

  if (field === 'records.identity' && operator === 'in') {
    return value.map(identity => ({
      ...document,
      properties: { ...document.properties, records: { identity } }
    }))
  }

  return [document]
}
