/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 uses Turbopack by default. Force WASM build of pshenmic-dpp so SSR
  // does not resolve the Node/NAPI entry (native.js). Replaces old webpack alias.
  turbopack: {
    resolveAlias: {
      'pshenmic-dpp': 'pshenmic-dpp/wasm'
    }
  }
}

export default nextConfig
