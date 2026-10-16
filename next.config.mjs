/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [{ source: '/day-0-beam', destination: '/blog/day-0-beam', permanent: true }]
  },
}

export default nextConfig
