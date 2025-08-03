const DistributionFunction = require('./DistributionFunction')
module.exports = class PerpetualDistribution {
  type
  recipientType
  recipientValue
  interval
  functionName
  functionValue

  constructor (type, recipientType, recipientValue, interval, functionName, functionValue) {
    this.type = type ?? null
    this.recipientType = recipientType ?? null
    this.recipientValue = recipientValue ?? null
    this.interval = interval ?? null
    this.functionName = functionName ?? null
    this.functionValue = functionValue ?? null
  }

  static fromObject ({ type, recipientType, recipientValue, interval, functionName, functionValue }) {
    return new PerpetualDistribution(type, recipientType, recipientValue, interval, functionName, functionValue)
  }

  /**
   * Convert TokenPerpetualDistributionWASM to PerpetualDistribution
   * @param perpetualDistribution {Object}
   * @returns {PerpetualDistribution}
   */
  static fromWASMObject (perpetualDistribution) {
    const perpetualDistributionValue = perpetualDistribution.distributionType?.getDistribution()

    const perpetualDistributionRecipientType = perpetualDistribution?.distributionRecipient?.getType() ?? null
    const perpetualDistributionRecipientValue = perpetualDistribution?.distributionRecipient?.getValue() ?? null

    const perpetualDistributionType = perpetualDistributionValue.constructor?.name?.slice(0, -4) ?? null
    const perpetualDistributionInterval = perpetualDistributionValue?.interval ? Number(perpetualDistributionValue?.interval) : null
    const perpetualDistributionFunctionName = perpetualDistributionValue?.function?.getFunctionName() ?? null

    const perpetualDistributionFunctionValue = perpetualDistributionValue?.function?.getFunctionValue()

    return PerpetualDistribution.fromObject({
      type: perpetualDistributionType,
      recipientType: perpetualDistributionRecipientType,
      recipientValue: perpetualDistributionRecipientValue,
      interval: perpetualDistributionInterval,
      functionName: perpetualDistributionFunctionName,
      functionValue: perpetualDistributionFunctionValue ? DistributionFunction.fromObject(perpetualDistributionFunctionValue) : null
    })
  }
}
