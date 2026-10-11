import { describe, expect, test } from '@jest/globals'
import { validatorChartHistory, validatorChartRange } from '../util/validatorChart'

const allStart = new Date('2020-01-01T00:00:00Z')
const start = new Date('2026-10-10T12:00:00Z')
const end = new Date('2026-10-11T12:00:00Z')
const now = end.getTime() + 60000

describe('validator chart range', () => {
  test('advances both ends of rolling ranges, preserving duration', () => {
    expect(validatorChartRange({ start, end, mode: 'rolling' }, now, allStart)).toEqual({
      start: '2026-10-10T12:01:00.000Z', end: '2026-10-11T12:01:00.000Z'
    })
  })
  test('keeps the All start fixed while advancing its end', () => {
    expect(validatorChartRange({ start: allStart, end, mode: 'rolling' }, now, allStart)).toEqual({
      start: allStart.toISOString(), end: '2026-10-11T12:01:00.000Z'
    })
  })
  test('keeps completed local calendar ranges fixed', () => {
    const selection = { start, end, mode: 'days' as const }
    const later = now + 7 * 86400000
    const range = validatorChartRange(selection, later, allStart)
    expect(range).toEqual(validatorChartRange(selection, later + 60000, allStart))
    const midnight = new Date(start)
    midnight.setHours(0, 0, 0, 0)
    expect(range?.start).toBe(midnight.toISOString())
  })
  test('advances a calendar range ending today only up to now', () => {
    const today = new Date(2026, 9, 11, 12)
    expect(validatorChartRange({ start: today, end: today, mode: 'days' }, today.getTime(), allStart)?.end)
      .toBe(today.toISOString())
  })
  test('requires both dates', () => {
    expect(validatorChartRange({ start }, now, allStart)).toBeNull()
  })
})

describe('validator chart history', () => {
  const unavailable = { data: { reward: null, endTime: end.toISOString(), blocksProposed: 29 } }
  const zero = { data: { reward: 0, endTime: end.toISOString(), blocksProposed: 2 } }
  const ongoing = { data: { reward: null, endTime: null, blocksProposed: 1 } }

  test('counts blocks from hidden epochs without treating missing payouts as zero', () => {
    expect(validatorChartHistory([unavailable, zero, ongoing])).toEqual({
      visiblePoints: [zero, ongoing], totalBlocks: 32
    })
  })
  test('keeps known blocks even when no payout bars can be displayed', () => {
    expect(validatorChartHistory([unavailable])).toEqual({ visiblePoints: [], totalBlocks: 29 })
  })
  test('keeps the current epoch visible without a payout', () => {
    expect(validatorChartHistory([unavailable, ongoing]).visiblePoints).toEqual([ongoing])
  })
  test('handles empty history', () => {
    expect(validatorChartHistory([])).toEqual({ visiblePoints: [], totalBlocks: 0 })
  })
})
