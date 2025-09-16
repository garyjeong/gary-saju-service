import type { Config } from "tailwindcss";

const config = {
	darkMode: ["class"],
	content: ["./src/**/*.{ts,tsx}"],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: "1rem",
				sm: "1.5rem",
				lg: "2rem",
				xl: "3rem",
				"2xl": "4rem",
			},
			screens: {
				"2xl": "1200px",
			},
		},
		extend: {
			fontFamily: {
				sans: ["var(--font-noto-sans-kr)", "system-ui", "sans-serif"],
				serif: ["var(--font-noto-serif-kr)", "Georgia", "serif"],
				mono: ["var(--font-geist-mono)", "Monaco", "monospace"],
			},
			fontSize: {
				xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.02em" }],
				sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.015em" }],
				base: ["1rem", { lineHeight: "1.6", letterSpacing: "0.01em" }],
				lg: ["1.125rem", { lineHeight: "1.6", letterSpacing: "0.005em" }],
				xl: ["1.25rem", { lineHeight: "1.6", letterSpacing: "0em" }],
				"2xl": ["1.5rem", { lineHeight: "1.5", letterSpacing: "-0.005em" }],
				"3xl": ["1.875rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
				"4xl": ["2.25rem", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
				"5xl": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
				"6xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				// 🌟 한국 전통 오방색(五方色) 기반 색상 시스템
				korea: {
					// 청색 (東 - 동쪽, 목, 봄)
					blue: "#003f7f", // 진청색 (궁궐 청색)
					"blue-50": "#e8f2ff",
					"blue-100": "#d1e6ff",
					"blue-500": "#1a5fb8",
					"blue-900": "#002952",

					// 백색 (中 - 중앙, 토, 늦여름)
					white: "#fefefe", // 한지 백색
					"white-50": "#fafafa",
					"white-100": "#f5f5f5",
					"white-500": "#e5e5e5",
					"white-900": "#a3a3a3",

					// 적색 (南 - 남쪽, 화, 여름)
					red: "#d73502", // 주홍색 (단청 주색)
					"red-50": "#fff2f0",
					"red-100": "#ffe5e0",
					"red-500": "#e8481d",
					"red-900": "#a32c01",

					// 흑색 (北 - 북쪽, 수, 겨울)
					black: "#1c1c1c", // 먹색
					"black-50": "#f9f9f9",
					"black-100": "#f0f0f0",
					"black-500": "#666666",
					"black-900": "#0a0a0a",

					// 황색 (西 - 서쪽, 금, 가을)
					yellow: "#f4b942", // 황금색 (단청 황색)
					"yellow-50": "#fffcf5",
					"yellow-100": "#fff8eb",
					"yellow-500": "#f59e0b",
					"yellow-900": "#b45309",
				},

				// 🌟 자연 기반 보조 색상
				nature: {
					mountain: "#4a5d23", // 산색 (깊은 녹색)
					sky: "#87ceeb", // 하늘색
					earth: "#8b4513", // 흙색
					stone: "#708090", // 돌색
					bamboo: "#228b22", // 대나무색
					pine: "#2d5016", // 소나무색
				},

				// 🌟 오행 기반 차트 색상 (한국 전통 색상 적용)
				chart: {
					1: "#f4b942", // 황(金) - 황금색
					2: "#003f7f", // 청(水) - 진청색
					3: "#4a5d23", // 청목(木) - 산색
					4: "#d73502", // 주(火) - 주홍색
					5: "#8b4513", // 갈(土) - 흙색
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			spacing: {
				"18": "4.5rem",
				"72": "18rem",
				"84": "21rem",
				"96": "24rem",
			},
			boxShadow: {
				soft: "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
				medium: "0 4px 12px 0 rgba(0, 0, 0, 0.12)",
				strong: "0 8px 24px 0 rgba(0, 0, 0, 0.16)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"fade-in": {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				"slide-in": {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(0)" },
				},
				floating: {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-20px)" },
				},
				// 🌟 사주 전용 신비로운 애니메이션
				"yin-yang": {
					"0%": { transform: "rotate(0deg)" },
					"100%": { transform: "rotate(360deg)" },
				},
				"cosmic-float": {
					"0%, 100%": {
						transform: "translateY(0px) translateX(0px) scale(1)",
						opacity: "0.7",
					},
					"33%": {
						transform: "translateY(-30px) translateX(20px) scale(1.1)",
						opacity: "1",
					},
					"66%": {
						transform: "translateY(-10px) translateX(-15px) scale(0.9)",
						opacity: "0.8",
					},
				},
				"star-twinkle": {
					"0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
					"50%": { opacity: "1", transform: "scale(1.2)" },
				},
				"mystic-glow": {
					"0%, 100%": {
						boxShadow: "0 0 20px rgba(45, 80, 22, 0.3)",
						filter: "brightness(1)",
					},
					"50%": {
						boxShadow: "0 0 40px rgba(45, 80, 22, 0.6)",
						filter: "brightness(1.2)",
					},
				},
				"ink-spread": {
					"0%": {
						transform: "scale(0.8)",
						opacity: "0",
						filter: "blur(5px)",
					},
					"50%": {
						transform: "scale(1.05)",
						opacity: "0.8",
						filter: "blur(1px)",
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1",
						filter: "blur(0px)",
					},
				},
				"element-flow": {
					"0%": { transform: "translateX(-100%) rotate(0deg)" },
					"25%": { transform: "translateX(-50%) rotate(90deg)" },
					"50%": { transform: "translateX(0%) rotate(180deg)" },
					"75%": { transform: "translateX(50%) rotate(270deg)" },
					"100%": { transform: "translateX(100%) rotate(360deg)" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.6s ease-out",
				"slide-in": "slide-in 0.3s ease-out",
				floating: "floating 3s ease-in-out infinite",
				// 🌟 사주 전용 애니메이션
				"yin-yang": "yin-yang 8s linear infinite",
				"cosmic-float": "cosmic-float 6s ease-in-out infinite",
				"star-twinkle": "star-twinkle 2s ease-in-out infinite",
				"mystic-glow": "mystic-glow 3s ease-in-out infinite",
				"ink-spread": "ink-spread 1s ease-out forwards",
				"element-flow": "element-flow 12s linear infinite",
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
