import type { DistributionFunction } from '../../../../../../types'

export type DistFunctionName =
  | 'FixedAmount'
  | 'Random'
  | 'StepDecreasingAmount'
  | 'Linear'
  | 'Polynomial'
  | 'Exponential'
  | 'Logarithmic'
  | 'InvertedLogarithmic'
  | string

export interface DistField {
  title: string
  value: unknown
}

export type DistDataResult = {
  title: string
  [field: string]: string | DistField
} | null

interface DistDataByTypeArgs {
  type?: DistFunctionName | null
  functionValue?: DistributionFunction | Record<string, unknown> | null
}

export const distDataByType = ({ type, functionValue }: DistDataByTypeArgs): DistDataResult => {
  if (!functionValue) return null

  const fv = functionValue as DistributionFunction & Record<string, unknown>

  if (type === 'FixedAmount') {
    return {
      title: 'Fixed Amount',
      amount: { title: 'Amount', value: fv.amount }
    }
  }

  if (type === 'Random') {
    return {
      title: 'Random',
      min: { title: 'Min', value: fv.min },
      max: { title: 'Max', value: fv.max }
    }
  }

  if (type === 'StepDecreasingAmount') {
    return {
      title: 'Step Decreasing Amount',
      stepCount: { title: 'Step count', value: fv.stepCount },
      decreasePerIntervalNumerator: {
        title: 'Decrease per interval numerator',
        value: fv.decreasePerIntervalNumerator
      },
      decreasePerIntervalDenominator: {
        title: 'Decrease per interval denominator',
        value: fv.decreasePerIntervalDenominator
      },
      startDecreasingOffset: {
        title: 'Start decreasing offset',
        value: fv.startDecreasingOffset
      },
      maxIntervalCount: {
        title: 'Max interval count',
        value: fv.maxIntervalCount
      },
      distributionStartAmount: {
        title: 'Distribution start amount',
        value: fv.distributionStartAmount
      },
      trailingDistributionIntervalAmount: {
        title: 'Trailing distribution interval amount',
        value: fv.trailingDistributionIntervalAmount
      },
      minValue: { title: 'Min value', value: fv.minValue }
    }
  }

  if (type === 'Linear') {
    return {
      title: 'Linear',
      a: { title: 'a', value: fv.a },
      d: { title: 'd', value: fv.d },
      startStep: { title: 'Start step', value: fv.startStep },
      startingAmount: {
        title: 'Starting amount',
        value: fv.startingAmount
      },
      minValue: { title: 'Min value', value: fv.minValue },
      maxValue: { title: 'Max value', value: fv.maxValue }
    }
  }

  if (type === 'Polynomial') {
    return {
      title: 'Polynomial',
      a: { title: 'a', value: fv.a },
      b: { title: 'b', value: fv.b },
      d: { title: 'd', value: fv.d },
      m: { title: 'm', value: fv.m },
      n: { title: 'n', value: fv.n },
      o: { title: 'o', value: fv.o },
      startMoment: { title: 'Start moment', value: fv.startMoment },
      minValue: { title: 'Min value', value: fv.minValue },
      maxValue: { title: 'Max value', value: fv.maxValue }
    }
  }

  if (type === 'Exponential') {
    return {
      title: 'Exponential',
      a: { title: 'a', value: fv.a },
      b: { title: 'b', value: fv.b },
      d: { title: 'd', value: fv.d },
      m: { title: 'm', value: fv.m },
      n: { title: 'n', value: fv.n },
      o: { title: 'o', value: fv.o },
      startMoment: { title: 'Start moment', value: fv.startMoment },
      minValue: { title: 'Min value', value: fv.minValue },
      maxValue: { title: 'Max value', value: fv.maxValue }
    }
  }

  if (type === 'Logarithmic') {
    return {
      title: 'Logarithmic',
      a: { title: 'a', value: fv.a },
      b: { title: 'b', value: fv.b },
      d: { title: 'd', value: fv.d },
      m: { title: 'm', value: fv.m },
      n: { title: 'n', value: fv.n },
      o: { title: 'o', value: fv.o },
      startMoment: { title: 'Start moment', value: fv.startMoment },
      minValue: { title: 'Min value', value: fv.minValue },
      maxValue: { title: 'Max value', value: fv.maxValue }
    }
  }

  if (type === 'InvertedLogarithmic') {
    return {
      title: 'Inverted Logarithmic',
      a: { title: 'a', value: fv.a },
      b: { title: 'b', value: fv.b },
      d: { title: 'd', value: fv.d },
      m: { title: 'm', value: fv.m },
      n: { title: 'n', value: fv.n },
      o: { title: 'o', value: fv.o },
      startMoment: { title: 'Start moment', value: fv.startMoment },
      minValue: { title: 'Min value', value: fv.minValue },
      maxValue: { title: 'Max value', value: fv.maxValue }
    }
  }

  return null
}
