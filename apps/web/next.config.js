const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  images: { unoptimized: true },
  allowedDevOrigins: [
    "http://10.210.53.3:3001", "http://10.210.53.3:3000",
    "http://192.168.1.42:3001", "http://192.168.1.42:3000",
    "http://192.168.1.14:3001", "http://192.168.1.14:3000",
    "https://10.210.53.3:3001", "https://10.210.53.3:3000",
    "https://192.168.1.42:3001", "https://192.168.1.42:3000",
    "https://192.168.1.14:3001", "https://192.168.1.14:3000",
    "https://192.168.1.14:3443",
  ],
  webpack: (config) => {
    config.resolve.alias["@"] = path.join(__dirname);
    return config;
  },
};

module.exports = nextConfig;
