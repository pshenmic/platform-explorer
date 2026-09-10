export type AxisFormatCode = 'number' | 'date' | 'datetime' | 'time'

export interface AxisTypeConfig {
  axis: AxisFormatCode
  tooltip?: AxisFormatCode
}

export interface ChartAxis {
  title?: string
  abbreviation?: string
  type: AxisFormatCode | AxisTypeConfig
}

export interface ChartDataPoint {
  x: Date | number
  y: number
}

export interface TimespanRange {
  start: string
  end: string
}

export interface TimespanValue {
  label: string
  range: TimespanRange
  intervalsCount?: number
  short?: string
}

export interface ChartConfig {
  timespan: {
    defaultIndex: number
    /** Optional preset selected value (some callers set this). */
    default?: TimespanValue
    values: TimespanValue[]
  }
}

export type ChartRenderType = 'line' | 'bar'
