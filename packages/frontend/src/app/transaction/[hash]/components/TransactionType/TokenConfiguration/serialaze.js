export const distDataByType = ({ type, functionValue }) => {
  if (type === 'FixedAmount') {
    return {
      title: 'Fixed Amount',
      amount: { title: 'Amount', value: functionValue.amount }
    }
  }

  if (type === 'Random') {
    return {
      title: 'Random',
      min: { title: 'Min', value: functionValue.min },
      max: { title: 'Max', value: functionValue.max }
    }
  }

  if (type === 'StepDecreasingAmount') {
    return {
      title: 'Step Decreasing Amount',
      stepCount: { title: 'Step count', value: functionValue.stepCount },
      decreasePerIntervalNumerator: {
        title: 'Decrease per interval numerator',
        value: functionValue.decreasePerIntervalNumerator
      },
      decreasePerIntervalDenominator: {
        title: 'Decrease per interval denominator',
        value: functionValue.decreasePerIntervalDenominator
      },
      startDecreasingOffset: {
        title: 'Start decreasing offset',
        value: functionValue.startDecreasingOffset
      },
      maxIntervalCount: {
        title: 'Max interval count',
        value: functionValue.maxIntervalCount
      },
      distributionStartAmount: {
        title: 'Distribution start amount',
        value: functionValue.distributionStartAmount
      },
      trailingDistributionIntervalAmount: {
        title: 'Trailing distribution interval amount',
        value: functionValue.trailingDistributionIntervalAmount
      },
      minValue: { title: 'Min value', value: functionValue.minValue }
    }
  }

  if (type === 'Linear') {
    return {
      title: 'Linear',
      a: { title: 'a', value: functionValue.a },
      d: { title: 'd', value: functionValue.d },
      startStep: { title: 'Start step', value: functionValue.startStep },
      startingAmount: {
        title: 'Starting amount',
        value: functionValue.startingAmount
      },
      minValue: { title: 'Min value', value: functionValue.minValue },
      maxValue: { title: 'Max value', value: functionValue.maxValue }
    }
  }

  if (type === 'Polynomial') {
    return {
      title: 'Polynomial',
      a: { title: 'a', value: functionValue.a },
      b: { title: 'b', value: functionValue.b },
      d: { title: 'd', value: functionValue.d },
      m: { title: 'm', value: functionValue.m },
      n: { title: 'n', value: functionValue.n },
      o: { title: 'o', value: functionValue.o },
      startMoment: { title: 'Start moment', value: functionValue.startMoment },
      minValue: { title: 'Min value', value: functionValue.minValue },
      maxValue: { title: 'Max value', value: functionValue.maxValue }
    }
  }

  if (type === 'Exponential') {
    return {
      title: 'Exponential',
      a: { title: 'a', value: functionValue.a },
      b: { title: 'b', value: functionValue.b },
      d: { title: 'd', value: functionValue.d },
      m: { title: 'm', value: functionValue.m },
      n: { title: 'n', value: functionValue.n },
      o: { title: 'o', value: functionValue.o },
      startMoment: { title: 'Start moment', value: functionValue.startMoment },
      minValue: { title: 'Min value', value: functionValue.minValue },
      maxValue: { title: 'Max value', value: functionValue.maxValue }
    }
  }

  if (type === 'Logarithmic') {
    return {
      title: 'Logarithmic',
      a: { title: 'a', value: functionValue.a },
      b: { title: 'b', value: functionValue.b },
      d: { title: 'd', value: functionValue.d },
      m: { title: 'm', value: functionValue.m },
      n: { title: 'n', value: functionValue.n },
      o: { title: 'o', value: functionValue.o },
      startMoment: { title: 'Start moment', value: functionValue.startMoment },
      minValue: { title: 'Min value', value: functionValue.minValue },
      maxValue: { title: 'Max value', value: functionValue.maxValue }
    }
  }

  if (type === 'InvertedLogarithmic') {
    return {
      title: 'Inverted Logarithmic',
      a: { title: 'a', value: functionValue.a },
      b: { title: 'b', value: functionValue.b },
      d: { title: 'd', value: functionValue.d },
      m: { title: 'm', value: functionValue.m },
      n: { title: 'n', value: functionValue.n },
      o: { title: 'o', value: functionValue.o },
      startMoment: { title: 'Start moment', value: functionValue.startMoment },
      minValue: { title: 'Min value', value: functionValue.minValue },
      maxValue: { title: 'Max value', value: functionValue.maxValue }
    }
  }

  return null
}
