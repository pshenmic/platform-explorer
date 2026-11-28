import { beforeEach, afterEach, test, expect, jest } from '@jest/globals'
import { getTransactions, getStatus, decodeTx, search } from '../util/Api'
import { ResponseErrorNotFound, ResponseErrorTimeout } from '../util/Errors'

const response = (status = 200, data = {}) =>
  ({
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    body: { cancel: async () => {} }
  }) as unknown as Response

beforeEach(() => {
  jest.useFakeTimers()
  global.fetch = jest.fn<typeof globalThis.fetch>()
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

test.each([502, 503, 504])('GET retries HTTP %i twice and recovers', async status => {
  const fetch = global.fetch as jest.Mock<typeof globalThis.fetch>
  fetch
    .mockResolvedValueOnce(response(status))
    .mockResolvedValueOnce(response(status))
    .mockResolvedValue(response())
  const request = getTransactions()
  await jest.runAllTimersAsync()
  await expect(request).resolves.toEqual({})
  expect(fetch).toHaveBeenCalledTimes(3)
})

test('GET retries two network failures', async () => {
  const fetch = global.fetch as jest.Mock<typeof globalThis.fetch>
  fetch
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockResolvedValue(response())
  const request = search('abc')
  await jest.runAllTimersAsync()
  await expect(request).resolves.toEqual({})
  expect(fetch).toHaveBeenCalledTimes(3)
})

test('GET stops after three failed attempts', async () => {
  const fetch = global.fetch as jest.Mock<typeof globalThis.fetch>
  fetch.mockRejectedValue(new TypeError('Failed to fetch'))
  const request = expect(getTransactions()).rejects.toThrow('Failed to fetch')
  await jest.runAllTimersAsync()
  await request
  expect(fetch).toHaveBeenCalledTimes(3)
})

test('GET does not retry a timeout', async () => {
  const fetch = global.fetch as jest.Mock<typeof globalThis.fetch>
  fetch.mockImplementation(() => new Promise(() => {}))
  const request = expect(getTransactions()).rejects.toBeInstanceOf(ResponseErrorTimeout)
  await jest.runAllTimersAsync()
  await request
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true)
})

test.each([400, 401, 403, 404, 429, 500])('GET never retries HTTP %i', async status => {
  const fetch = global.fetch as jest.Mock<typeof globalThis.fetch>
  fetch.mockResolvedValue(response(status))
  await expect(getTransactions()).rejects.toThrow()
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('404 remains a not-found error', async () => {
  ;(global.fetch as jest.Mock<typeof globalThis.fetch>).mockResolvedValue(response(404))
  await expect(search('absent')).rejects.toBeInstanceOf(ResponseErrorNotFound)
})

test('status does not retry 503 while indexing', async () => {
  ;(global.fetch as jest.Mock<typeof globalThis.fetch>).mockResolvedValue(response(503))
  await expect(getStatus()).rejects.toThrow()
  expect(global.fetch).toHaveBeenCalledTimes(1)
})

test('POST never retries server or network failures', async () => {
  const fetch = global.fetch as jest.Mock<typeof globalThis.fetch>
  fetch.mockResolvedValueOnce(response(503)).mockRejectedValueOnce(new TypeError('Failed to fetch'))
  await expect(decodeTx('test')).rejects.toThrow()
  await expect(decodeTx('test')).rejects.toThrow()
  expect(fetch).toHaveBeenCalledTimes(2)
})
