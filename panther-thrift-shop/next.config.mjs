/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        forceSwcTransforms: true, // Force SWC transforms even if Babel is configured
    },
};

export default nextConfig;
