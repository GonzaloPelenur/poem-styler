/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // config.resolve.fallback = { fs: false };
    // config.infrastructureLogging = { debug: /PackFileCache/ };
    return config;
  },
};
export default nextConfig;
