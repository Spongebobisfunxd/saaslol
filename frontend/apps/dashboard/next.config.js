/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@loyalty/ui', '@loyalty/api-client', '@loyalty/types', '@loyalty/utils', '@loyalty/store', '@loyalty/i18n'],
};
module.exports = nextConfig;
