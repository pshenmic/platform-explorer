import { afterEach, test, expect, jest } from '@jest/globals'
import { search } from '../util/Api'
import { getFirstResultUrl, getOnlyResultUrl } from '../components/search/getFirstResultUrl'

afterEach(() => {
  jest.restoreAllMocks()
})

test('search encodes the query string', async () => {
  const fetch = jest.fn<typeof globalThis.fetch>().mockResolvedValue({
    status: 200,
    json: async () => ({})
  } as Response)
  global.fetch = fetch
  await search('a&b #c')
  expect(fetch.mock.calls[0][0]).toContain('search?query=a%26b%20%23c')
})

test('getFirstResultUrl links the first non-empty category', () => {
  expect(getFirstResultUrl({})).toBeNull()
  expect(
    getFirstResultUrl({ identities: [], blocks: [{ header: { hash: 'ABC' } }] } as never)
  ).toBe('/block/ABC')
})

test('getOnlyResultUrl redirects only when there is exactly one result overall', () => {
  const one = { identities: [{ identifier: 'ID1' }] }
  expect(getOnlyResultUrl(one as never)).toBe('/identity/ID1')
  expect(
    getOnlyResultUrl({
      identities: [{ identifier: 'ID1' }],
      tokens: [{ identifier: 'T1' }]
    } as never)
  ).toBeNull()
  expect(getOnlyResultUrl({ identities: [] } as never)).toBeNull()
})
