import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')]
  },
  // Next 16 uses Turbopack by default. Force WASM build of pshenmic-dpp so SSR
  // does not resolve the Node/NAPI entry (native.js). Replaces old webpack alias.
  turbopack: {
    resolveAlias: {
      'pshenmic-dpp': 'pshenmic-dpp/wasm'
    }
  }
}

export default nextConfig
