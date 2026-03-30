const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(
  /\/$/,
  ''
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Serve SCORM under the same origin as the app so /courses/:id iframes work and
    // package-relative assets load via /uploads/... on :3000 → backend :3001.
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
