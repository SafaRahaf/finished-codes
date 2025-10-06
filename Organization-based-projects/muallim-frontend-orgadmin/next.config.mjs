/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "muallim-uat-blob.s3.us-east-1.amazonaws.com",
      "example.com",
      "t4.ftcdn.net",
    ], // Replace with your actual domain
  },
  env: {
    // set CORE_API_URL and API_VERSION for connect backend and frontend
    FILE_UPLOAD_API_URL: process.env.NEXT_PUBLIC_FILE_UPLOAD_API_URL,
    FILE_BROWSE_URL: process.env.NEXT_PUBLIC_FILE_BROWSE_URL,
    // CORE_API_URL: "https://api.uat.muallim.icu/",
    CORE_API_URL: process.env.NEXT_PUBLIC_CORE_API_URL,
    API_URL_TEMP: process.env.NEXT_PUBLIC_CORE_API_URL,
    API_VERSION: "v1",
    API_VERSION_APPEND_AFTER_SERVICE: "true",
    MAP_KEY: process.env.NEXT_PUBLIC_MAP_KEY,
    MAP_STATUS: process.env.NEXT_PUBLIC_MAP_STATUS,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_CORE_API_URL}/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: "https://authms.muallimmadrasa.com/:path*",
      },
      {
        source: "/ip/:path*",
        destination: "http://160.22.20.149:3005/:path*",
      },
    ];
  },
};

export default nextConfig;
