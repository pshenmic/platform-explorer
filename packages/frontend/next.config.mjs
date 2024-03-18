/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: function (config, { webpack }) {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader'
        });
    
        return config;
      }
};

export default nextConfig;
