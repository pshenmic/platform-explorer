const DashCoreRPC = require('./dashcoreRpc')

async function getValidatorRegistration () {
  try {
    const nodes = await DashCoreRPC.getProTxList('registered', true)
    if (!Array.isArray(nodes) || nodes.some(node => typeof node?.proTxHash !== 'string')) return null
    return new Map(nodes.map(node => [node.proTxHash.toUpperCase(), node]))
  } catch {
    return null
  }
}

module.exports = getValidatorRegistration
