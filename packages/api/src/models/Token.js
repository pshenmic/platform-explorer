const Localization = require('./Localization')

module.exports = class Token {
  identifier
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

  constructor (identifier, localizations, baseSupply, maxSupply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowedEmergencyActions, dataContractIdentifier, totalSupply) {
    this.identifier = identifier ?? null
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
  }

  /* eslint-disable */
  static fromRow ({
    identifier,
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
    return new Token(identifier, localizations, base_supply, max_supply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowed_emergency_actions, data_contract_identifier)
  }

  static fromObject ({
    identifier,
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
    totalSupply
  }) {
    if (localizations) {
      for (const locale in localizations) {
        localizations[locale] = Localization.fromObject(localizations[locale])
      }
    }

    return new Token(identifier, localizations, baseSupply, maxSupply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowedEmergencyActions, dataContractIdentifier, totalSupply)
  }
}
