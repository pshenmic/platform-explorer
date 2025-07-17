const Localization = require('./Localization')

module.exports = class Token {
  identifier
  timestamp
  description
  localizations
  baseSupply
  totalSupply
  maxSupply
  owner
  mintable
  burnable
  freezable
  unfreezable
  destroyable
  allowedEmergencyActions
  dataContractIdentifier
  changeMaxSupply

  constructor (identifier, timestamp, description, localizations, baseSupply, maxSupply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowedEmergencyActions, dataContractIdentifier, totalSupply, changeMaxSupply) {
    this.identifier = identifier ?? null
    this.timestamp = timestamp ?? null
    this.description = description ?? null
    this.localizations = localizations ?? null
    this.baseSupply = baseSupply ?? null
    this.maxSupply = maxSupply ?? null
    this.owner = owner ?? null
    this.mintable = mintable ?? null
    this.burnable = burnable ?? null
    this.freezable = freezable ?? null
    this.unfreezable = unfreezable ?? null
    this.destroyable = destroyable ?? null
    this.allowedEmergencyActions = allowedEmergencyActions ?? null
    this.dataContractIdentifier = dataContractIdentifier ?? null
    this.totalSupply = totalSupply ?? null
    this.changeMaxSupply = changeMaxSupply ?? null
  }

  /* eslint-disable */
  static fromRow ({
    identifier,
    timestamp,
    description,
    localizations,
    base_supply,
    max_supply,
    owner,
    mintable,
    burnable,
    freezable,
    unfreezable,
    destroyable,
    allowed_emergency_actions,
    data_contract_identifier
  }) {
    return new Token(identifier, timestamp, description, localizations, base_supply, max_supply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowed_emergency_actions, data_contract_identifier)
  }

  static fromObject ({
    identifier,
    timestamp,
    description,
    localizations,
    baseSupply,
    maxSupply,
    owner,
    mintable,
    burnable,
    freezable,
    unfreezable,
    destroyable,
    allowedEmergencyActions,
    dataContractIdentifier,
    totalSupply,
    changeMaxSupply
  }) {
    if (localizations) {
      for (const locale in localizations) {
        localizations[locale] = Localization.fromObject(localizations[locale])
      }
    }

    return new Token(identifier, timestamp, description, localizations, baseSupply, maxSupply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowedEmergencyActions, dataContractIdentifier, totalSupply, changeMaxSupply)
  }
}
