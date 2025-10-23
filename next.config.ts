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
      {
        protocol: "https",
        hostname: "aparcoyo-back.onrender.com",
        port: "",
        pathname: "/**",
      },
      // ✅ AGREGAR ESTOS DOS NUEVOS DOMINIOS
      {
        protocol: "http",
        hostname: "kns.aparcoyo.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "aparcoyo.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
