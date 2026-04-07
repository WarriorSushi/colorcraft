import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/colorcraft',
  images: { unoptimized: true },
  turbopack: {
    root: '/root/projects/colorcraft',
  },
};
export default nextConfig;
