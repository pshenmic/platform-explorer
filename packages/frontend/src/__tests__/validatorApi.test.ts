import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { getEpochStatsByValidator, getValidatorEarnings, type ValidatorEarnings } from '../util/Api'

const originalFetch = globalThis.fetch
const fetchMock = jest.fn<typeof fetch>()
const hash = 'a'.repeat(64)
const start = '2026-09-01T00:00:00Z'
const end = '2026-10-01T00:00:00Z'

function respond(body: unknown) {
  fetchMock.mockResolvedValue({ status: 200, json: async () => body } as Response)
}

beforeEach(() => {
  fetchMock.mockReset()
  globalThis.fetch = fetchMock
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('indexed validator API', () => {
  test('preserves historical earnings and the nested estimate', async () => {
    const body: ValidatorEarnings = {
      core: { payments: 4, amount: 200000000 },
      platform: {
        epochs: 3,
        firstEpoch: 10,
        lastEpoch: 12,
        blocksProposed: 7,
        reward: 500000000000
      },
      estimate: {
        periodDays: 30,
        eligible: true,
        corePerMonth: 2,
        platformPerMonth: 5,
        totalPerMonth: 7,
        platformHistory: {
          firstEpoch: 10,
          lastEpoch: 12,
          startTime: start,
          endTime: end,
          reward: 500000000000
        }
      }
    }
    respond(body)
    const result = await getValidatorEarnings(hash)
    expect(result).toEqual(body)
    expect(result.estimate?.totalPerMonth).toBe(7)
    expect(fetchMock.mock.calls[0][0]).toEqual(
      expect.stringContaining(`validator/${hash}/earnings`)
    )
  })

  test('preserves zero payouts and nullable history bounds', async () => {
    const body: ValidatorEarnings = {
      core: { payments: 0, amount: 0 },
      platform: { epochs: 0, firstEpoch: null, lastEpoch: null, blocksProposed: 0, reward: 0 },
      estimate: {
        periodDays: 30,
        eligible: true,
        corePerMonth: null,
        platformPerMonth: 0,
        totalPerMonth: null,
        platformHistory: {
          firstEpoch: null,
          lastEpoch: null,
          startTime: start,
          endTime: end,
          reward: 0
        }
      }
    }
    respond(body)
    expect(await getValidatorEarnings(hash)).toEqual(body)
  })

  test('accepts numeric fees, proposed blocks and unpaid rewards', async () => {
    const points = [
      {
        timestamp: start,
        data: {
          epoch: 10,
          endEpoch: 12,
          endTime: null,
          blocksProposed: 7,
          totalBlocks: 20,
          fees: 1000,
          reward: null
        }
      }
    ]
    respond(points)
    expect(await getEpochStatsByValidator(hash, start, end, 42)).toEqual(points)
    expect(fetchMock.mock.calls[0][0]).toEqual(expect.stringContaining('&intervalsCount=42'))
  })

  test('preserves an empty epoch history and optional intervals count', async () => {
    respond([])
    expect(await getEpochStatsByValidator(hash, start, end)).toEqual([])
    expect(fetchMock.mock.calls[0][0]).not.toEqual(expect.stringContaining('intervalsCount='))
  })

  test('accepts zero fees without replacing them with missing data', async () => {
    const points = [
      {
        timestamp: start,
        data: {
          epoch: 10,
          endEpoch: 10,
          endTime: end,
          blocksProposed: 0,
          totalBlocks: 20,
          fees: 0,
          reward: 0
        }
      }
    ]
    respond(points)
    expect(await getEpochStatsByValidator(hash, start, end, 84)).toEqual(points)
  })

  test('rejects the superseded epoch response instead of drawing invalid points', async () => {
    respond([
      {
        timestamp: start,
        data: { epoch: 10, endEpoch: 10, endTime: end, blocksCount: 7, fees: '1000' }
      }
    ])
    await expect(getEpochStatsByValidator(hash, start, end)).rejects.toThrow('updated API')
  })
})
