import type { NextConfig } from "next";
import path from "path";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    root: path.resolve(__dirname),
  },

  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:9000"
          }/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*\\.(avif|gif|ico|jpg|jpeg|png|svg|webp|pdf|txt|xlsx|ttf|otf|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.picjumbo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picjumbo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "commotion-backed-vibes.ngrok-free.dev",
        pathname: "/**",
      },
    ],
  },
};

const configWithBundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default configWithBundleAnalyzer(nextConfig);
