import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://pokeapi.co/**")],
  },
};

export default nextConfig;
