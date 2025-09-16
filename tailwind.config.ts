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
				// 사주 서비스 전용 오행 색상
				element: {
					wood: "hsl(120, 40%, 35%)", // 목(木) - 녹색
					fire: "hsl(0, 70%, 50%)", // 화(火) - 적색
					earth: "hsl(28, 60%, 55%)", // 토(土) - 황토색
					metal: "hsl(50, 30%, 85%)", // 금(金) - 백금색
					water: "hsl(200, 50%, 40%)", // 수(水) - 청색
				},
				// 차트 및 시각화용 색상 팔레트
				chart: {
					1: "hsl(28, 60%, 55%)", // 토(土)
					2: "hsl(200, 50%, 40%)", // 수(水)
					3: "hsl(120, 40%, 35%)", // 목(木)
					4: "hsl(0, 70%, 50%)", // 화(火)
					5: "hsl(50, 30%, 85%)", // 금(金)
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
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.6s ease-out",
				"slide-in": "slide-in 0.3s ease-out",
				floating: "floating 3s ease-in-out infinite",
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
