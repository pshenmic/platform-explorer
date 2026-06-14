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

    // Force `pshenmic-dpp` to resolve to its wasm build. The package's
    // `"node"` conditional export still wins in Next.js SSR (webpack default
    // `conditionNames` doesn't include `"browser"`), pulling a NAPI-native
    // build that webpack can't bundle. Workaround for owl352/pshenmic-dpp#178.
    config.resolve.alias = {
      ...config.resolve.alias,
      'pshenmic-dpp$': 'pshenmic-dpp/wasm'
    }

    return config
  }
}

export default nextConfig
