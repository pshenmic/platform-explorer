/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }
        ]
      }
    ]
  },
  // Next 16 uses Turbopack by default. Force WASM build of pshenmic-dpp so SSR
  // does not resolve the Node/NAPI entry (native.js). Replaces old webpack alias.
  turbopack: {
    resolveAlias: {
      'pshenmic-dpp': 'pshenmic-dpp/wasm',
      worker_threads: { browser: './src/util/browserWorkerThreads.ts' }
    }
  },
  experimental: {
    optimizePackageImports: ['d3'],
    // First-visit mobile LCP: skip the render-blocking CSS waterfall.
    inlineCss: true
  }
}

export default nextConfig
