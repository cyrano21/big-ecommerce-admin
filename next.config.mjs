/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/dwens2ze5/**'
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '',
                pathname: '**'
            },
            {
                protocol: 'https',
                hostname: 'www.datocms-assets.com',
                port: '',
                pathname: '**'
            }
        ],
    },
};

export default nextConfig;
