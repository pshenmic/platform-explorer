const Localization = require('./Localization')

module.exports = class Token {
  identifier
  position
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
  totalGasUsed
  mainGroup
  totalTransitionsCount
  totalFreezeTransitionsCount
  totalBurnTransitionsCount
  decimals
  perpetualDistribution
  preProgrammedDistribution
  price
  prices
  
  constructor (identifier, position, timestamp, description, localizations, baseSupply, maxSupply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowedEmergencyActions, dataContractIdentifier, totalGasUsed, totalTransitionsCount, totalFreezeTransitionsCount, totalBurnTransitionsCount, totalSupply, changeMaxSupply, perpetualDistribution, mainGroup, decimals, preProgrammedDistribution, price, prices) {
    this.identifier = identifier ?? null
    this.position = position ?? null
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
    this.totalGasUsed = totalGasUsed ?? null
    this.mainGroup = mainGroup ?? null
    this.totalTransitionsCount = totalTransitionsCount ?? null
    this.totalFreezeTransitionsCount = totalFreezeTransitionsCount ?? null
    this.totalBurnTransitionsCount = totalBurnTransitionsCount ?? null
    this.decimals = decimals ?? null
    this.perpetualDistribution = perpetualDistribution ?? null
    this.preProgrammedDistribution = preProgrammedDistribution ?? null
    this.price = price ?? null
    this.prices = prices ?? null
  }

  /* eslint-disable */
  static fromRow({
                   identifier,
                   position,
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
                   data_contract_identifier,
                   total_gas_used,
                   total_transitions_count,
                   total_freeze_transitions_count,
                   total_burn_transitions_count,
                 }) {
    return new Token(identifier, position, timestamp, description, localizations, base_supply, max_supply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowed_emergency_actions, data_contract_identifier, Number(total_gas_used), Number(total_transitions_count), Number(total_freeze_transitions_count), Number(total_burn_transitions_count))
  }

  static fromObject({
                      identifier,
                      position,
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
                      changeMaxSupply,
                      perpetualDistribution,
                      totalGasUsed,
                      mainGroup,
                      totalTransitionsCount,
                      totalFreezeTransitionsCount,
                      totalBurnTransitionsCount,
                      decimals,
                      preProgrammedDistribution,
                      price,
                      prices
                    }) {
    if (localizations) {
      for (const locale in localizations) {
        localizations[locale] = Localization.fromObject(localizations[locale])
      }
    }

    return new Token(identifier, position, timestamp, description, localizations, baseSupply, maxSupply, owner, mintable, burnable, freezable, unfreezable, destroyable, allowedEmergencyActions, dataContractIdentifier, totalGasUsed, totalTransitionsCount, totalFreezeTransitionsCount, totalBurnTransitionsCount, totalSupply, changeMaxSupply, perpetualDistribution, mainGroup, decimals, preProgrammedDistribution, price?.toString(), prices)
  }
}
