import type { NextConfig } from "next";

// Production static export is served under /threat-dashboard on nginx.
// Local `npm run dev` uses "/" so http://127.0.0.1:3000/ loads the dashboard (no 404 at /).
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "development" ? "" : "/threat-dashboard",
};

export default nextConfig;
