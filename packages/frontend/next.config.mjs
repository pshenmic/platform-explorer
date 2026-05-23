import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')]
  },
  webpack: function (config, { webpack }) {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader'
    })

    // Force every bare `pshenmic-dpp` import (ours and inside dash-platform-sdk)
    // to resolve to the wasm build. The package's conditional `"node"` export
    // pulls a NAPI-native build that webpack can't bundle for the browser.
    config.resolve.alias = {
      ...config.resolve.alias,
      'pshenmic-dpp$': 'pshenmic-dpp/wasm'
    }

    return config
  }
}

export default nextConfig
