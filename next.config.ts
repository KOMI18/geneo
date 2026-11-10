import type { NextConfig } from "next";

// Pages privées : jamais dans Google, même si un lien de partage circule.
const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/tree/:path*", headers: noIndex },
      { source: "/dashboard/:path*", headers: noIndex },
      { source: "/join/:path*", headers: noIndex },
      { source: "/api/:path*", headers: noIndex },
    ];
  },
};

export default nextConfig;
