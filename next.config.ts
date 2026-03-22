import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "prisma", "pg", "@prisma/adapter-pg"],
};

export default nextConfig;
