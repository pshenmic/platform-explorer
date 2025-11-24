module.exports = class DataContract {
  identifier
  name
  owner
  schema
  version
  txHash
  timestamp
  isSystem
  documentsCount
  tokensCount
  topIdentity
  identitiesInteracted
  totalGasUsed
  averageGasUsed
  groups
  tokens
  description
  keywords

  constructor (identifier, name, owner, schema, version, txHash, timestamp, isSystem, documentsCount, tokensCount, topIdentity, identitiesInteracted, totalGasUsed, averageGasUsed, groups, tokens, description, keywords) {
    this.identifier = identifier ? identifier.trim() : null
    this.name = name ? name.trim() : null
    this.owner = owner ?? null
    this.schema = schema ?? null
    this.version = version ?? null
    this.txHash = txHash ?? null
    this.timestamp = timestamp ?? null
    this.isSystem = isSystem ?? null
    this.documentsCount = documentsCount ?? null
    this.tokensCount = tokensCount ?? null
    this.topIdentity = topIdentity ?? null
    this.identitiesInteracted = identitiesInteracted ?? null
    this.totalGasUsed = totalGasUsed ?? null
    this.averageGasUsed = averageGasUsed ?? null
    this.groups = groups ?? null
    this.tokens = tokens ?? null
    this.description = description ?? null
    this.keywords = keywords ?? null
  }

  /* eslint-disable camelcase */
  static fromRow ({
    identifier,
    name,
    owner,
    schema,
    version,
    tx_hash,
    timestamp,
    is_system,
    documents_count,
    tokens_count,
    top_identity,
    identities_interacted,
    total_gas_used,
    average_gas_used,
    description,
    keywords
  }) {
    return new DataContract(identifier, name, typeof owner === 'string' ? owner.trim() : owner, schema ? JSON.stringify(schema) : null, version, tx_hash, timestamp, is_system, Number(documents_count), Number(tokens_count), typeof top_identity === 'string' ? top_identity.trim() : top_identity, Number(identities_interacted), Number(total_gas_used), Number(average_gas_used), undefined, undefined, description, keywords)
  }

  static fromObject ({
    identifier,
    name,
    owner,
    schema,
    version,
    txHash,
    timestamp,
    isSystem,
    documentsCount,
    tokensCount,
    topIdentity,
    identitiesInteracted,
    totalGasUsed,
    averageGasUsed,
    groups,
    tokens,
    description,
    keywords
  }) {
    let formattedGroups
    if (groups) {
      const groupsKeys = Object.keys(groups)

      formattedGroups = groupsKeys.map(key => ({
        position: Number(key),
        members: groups[key].members,
        requiredPower: groups[key].requiredPower
      }))
    }

    return new DataContract(identifier, name, owner, schema, version, txHash, timestamp, isSystem, documentsCount, tokensCount, topIdentity, identitiesInteracted, totalGasUsed, averageGasUsed, formattedGroups, tokens, description, keywords)
  }
}
