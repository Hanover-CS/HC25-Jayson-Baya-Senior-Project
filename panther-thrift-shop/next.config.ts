// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // Disable ESLint checks during production builds
    },
};

export default nextConfig;
