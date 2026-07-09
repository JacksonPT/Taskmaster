import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this app instead of a parent folder with another lockfile.
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
