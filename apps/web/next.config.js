/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: [
    "http://10.210.53.3:3001", "http://10.210.53.3:3000",
    "http://192.168.1.42:3001", "http://192.168.1.42:3000",
    "http://192.168.1.14:3001", "http://192.168.1.14:3000",
    "https://10.210.53.3:3001", "https://10.210.53.3:3000",
    "https://192.168.1.42:3001", "https://192.168.1.42:3000",
    "https://192.168.1.14:3001", "https://192.168.1.14:3000",
    "https://192.168.1.14:3443",
  ],
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
      {
        source: "/socket.io",
        destination: "http://localhost:4000/socket.io/",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:4000/socket.io/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

module.exports = nextConfig;
