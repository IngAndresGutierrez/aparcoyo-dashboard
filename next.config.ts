// next.config.js
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      // Agregar tu backend cuando lo tengas
      {
        protocol: "https",
        hostname: "aparcoyo-back.onrender.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
