/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    images: {
        remotePatterns: [
            {hostname: 'res.cloudinary.com'},
            {hostname: 'localhost'},
            {hostname: 'www.datocms-assets.com'}
        ],
    },
};

export default nextConfig;
