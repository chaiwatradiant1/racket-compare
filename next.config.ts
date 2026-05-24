import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — no server runtime, no API routes, no DB.
  // Produces a fully static `out/` directory deployable to any static host.
  output: "export",
  // The site uses striped SVG placeholder slots (no <img> optimization needed),
  // but mark images unoptimized so any future next/image use stays export-safe.
  images: { unoptimized: true },
  // Emit `racket/<id>/index.html` style folders for clean static hosting.
  trailingSlash: true,
};

export default nextConfig;
