/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        forceSwcTransforms: true, // Force SWC transforms even if Babel is configured
    },
    swcMinify: true, // Enable SWC minification for better performance
};

export default nextConfig;
