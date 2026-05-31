/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'pub-your-r2-bucket.r2.dev', 'res.cloudinary.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
  },
}

module.exports = nextConfig
