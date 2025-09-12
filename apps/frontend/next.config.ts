import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
	outputFileTracingRoot: require('path').join(__dirname, '../../'),
	eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
