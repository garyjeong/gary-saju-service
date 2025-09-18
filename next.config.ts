import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	// 이미지 최적화 설정
	images: {
		unoptimized: false,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	// 서버 외부 패키지 설정
	serverExternalPackages: [],
};

export default nextConfig;
