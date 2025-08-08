module.exports = class DistributionFunction {
  amount
  min
  max
  stepCount
  decreasePerIntervalNumerator
  decreasePerIntervalDenominator
  startDecreasingOffset
  maxIntervalCount
  distributionStartAmount
  trailingDistributionIntervalAmount
  a
  b
  d
  m
  n
  o
  p
  startStep
  startingAmount
  minValue
  maxValue
  startMoment

  constructor (amount, min, max, stepCount, decreasePerIntervalNumerator, decreasePerIntervalDenominator, startDecreasingOffset, maxIntervalCount, distributionStartAmount, trailingDistributionIntervalAmount, a, b, d, m, n, o, p, startStep, startingAmount, minValue, maxValue, startMoment) {
    this.amount = amount ? String(amount) : undefined
    this.min = min ? String(min) : undefined
    this.max = max ? String(max) : undefined

    if (stepCount) {
      this.stepCount = stepCount
      this.decreasePerIntervalNumerator = decreasePerIntervalNumerator
      this.decreasePerIntervalDenominator = decreasePerIntervalDenominator
      this.startDecreasingOffset = startDecreasingOffset ? String(startDecreasingOffset) : null
      this.maxIntervalCount = maxIntervalCount ?? null
      this.distributionStartAmount = String(distributionStartAmount)
      this.trailingDistributionIntervalAmount = String(trailingDistributionIntervalAmount)
      this.minValue = minValue || null
    }

    if (startStep) {
      this.a = String(a)
      this.d = String(d)
      this.startStep = startStep ? String(startStep) : null
      this.startingAmount = String(startingAmount)
      this.minValue = minValue ? String(minValue) : null
      this.maxValue = maxValue ? String(maxValue) : null
    }

    if (m) {
      this.a = String(a)
      this.d = String(d)
      this.m = String(m)
      this.n = String(n)
      this.o = String(o)
      this.b = String(b)
      this.startMoment = startMoment ? String(startMoment) : null
      this.minValue = minValue ? String(minValue) : null
      this.maxValue = maxValue ? String(maxValue) : null
    }
  }

  static fromObject ({ amount, min, max, stepCount, decreasePerIntervalNumerator, decreasePerIntervalDenominator, startDecreasingOffset, maxIntervalCount, distributionStartAmount, trailingDistributionIntervalAmount, a, b, d, m, n, o, p, startStep, startingAmount, minValue, maxValue, startMoment }) {
    return new DistributionFunction(amount, min, max, stepCount, decreasePerIntervalNumerator, decreasePerIntervalDenominator, startDecreasingOffset, maxIntervalCount, distributionStartAmount, trailingDistributionIntervalAmount, a, b, d, m, n, o, p, startStep, startingAmount, minValue, maxValue, startMoment)
  }
}
