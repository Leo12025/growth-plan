import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 全应用为登录态动态页面（cookies + 实时数据库读取），关闭预渲染缓存
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
