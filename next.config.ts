import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '1562-103-168-240-113.ngrok-free.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      }
    ],
  },
  allowedDevOrigins: ['http://192.168.1.45:3000', 'http://localhost:3000', 'http://192.168.1.45:3001', 'http://localhost:3001'],
};

export default nextConfig;
