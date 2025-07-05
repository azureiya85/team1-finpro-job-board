import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'twemoji.maxcdn.com',
      },
    ],
  },
  
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

 outputFileTracingIncludes: {
    '/api/users/cv/generate': [
      '../../node_modules/@sparticuz/chromium/bin/**',
    ],
    '/api/users/certificates/**': [
      '../../node_modules/@sparticuz/chromium/bin/**',
    ],
  },
};

export default nextConfig;