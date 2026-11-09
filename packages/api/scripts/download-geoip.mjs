import { createHash } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { dirname, resolve } from 'path'

const FILE_NAME = 'dbip-city-ipv4.mmdb'
const RELEASE_URL = 'https://api.github.com/repos/sapics/ip-location-db/releases/tags/latest'

const outPath = resolve(process.env.GEOIP_DB_PATH ?? `geoip/${FILE_NAME}`)

const request = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }

  return response
}

const release = await (await request(RELEASE_URL)).json()
const asset = release.assets.find(({ name }) => name === FILE_NAME)

if (!asset) {
  throw new Error(`${FILE_NAME} not found in ip-location-db latest release`)
}

const data = Buffer.from(await (await request(asset.browser_download_url)).arrayBuffer())

// The separate checksum release is not refreshed together with `latest`, so verify against the asset digest
const expected = asset.digest?.replace('sha256:', '')
const actual = createHash('sha256').update(data).digest('hex')

if (expected !== actual) {
  throw new Error(`Checksum mismatch for ${FILE_NAME}: expected ${expected}, got ${actual}`)
}

await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, data)

console.log(`GeoIP database (${asset.updated_at}) saved to ${outPath}`)
