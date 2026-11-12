import { describe, expect, test } from '@jest/globals'
import { epochProgress } from '../util/epochProgress'

describe('epoch time progress', () => {
  test('uses the complete epoch duration', () => {
    expect(epochProgress(100, 300, 150)).toBe(25)
  })
  test('clamps before start and after expected end', () => {
    expect(epochProgress(100, 300, 0)).toBe(0)
    expect(epochProgress(100, 300, 400)).toBe(100)
  })
  test('rejects missing or invalid timing', () => {
    expect(epochProgress(NaN, 300, 150)).toBeNull()
    expect(epochProgress(300, 100, 150)).toBeNull()
    expect(epochProgress(100, 100, 150)).toBeNull()
  })
})
