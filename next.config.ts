import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/colorcraft',
  images: { unoptimized: true },
};
export default nextConfig;
