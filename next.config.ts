import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	// Docker 빌드를 위한 standalone 출력
	output: "standalone",
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
