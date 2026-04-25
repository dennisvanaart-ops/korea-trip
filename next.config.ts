import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Anchor the standalone output to this project's directory.
  // Without this Next.js walks up to find a "workspace root" and mirrors
  // the full absolute path inside .next/standalone — making server.js
  // end up at a different path on every machine/container.
  // Setting it to __dirname ensures server.js is always at
  // .next/standalone/server.js regardless of where the project lives.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
