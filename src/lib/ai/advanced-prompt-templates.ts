/**
 * 개-사주 고도화된 AI 프롬프트 템플릿 시스템 v2.0
 * 향상된 개인화, 버전 관리, A/B 테스트 지원
 */

import { AIInterpretationRequest } from "./openai-client";

// 프롬프트 버전 관리
export const PROMPT_VERSION = "2.0.0";
export const TEMPLATE_UPDATED_AT = "2025-09-17";

/**
 * 확장된 톤앤매너 시스템 (기존 3개 → 12개)
 */
export const ENHANCED_TONE_MODIFIERS = {
	// 기존 톤 (호환성 유지)
	formal: {
		name: "격식체",
		description: "정중하고 격식있는 존댓말로 전문적인 상담 톤",
		style: "존댓말, 전문용어 사용, 정중한 어조",
		examples: ["말씀드리겠습니다", "~하시기 바랍니다", "귀하의"],
	},
	casual: {
		name: "친근체",
		description: "친근하고 편안한 반말로 친구가 조언하는 듯한 톤",
		style: "반말, 구어체 표현, 친근한 어조",
		examples: ["~해", "그런데", "진짜로"],
	},
	poetic: {
		name: "시적체",
		description: "시적이고 감성적인 표현을 사용하여 아름다운 문체",
		style: "은유적 표현, 감성적 어휘, 운율감 있는 문장",
		examples: ["마치 ~처럼", "~의 향기", "별빛처럼"],
	},

	// 새로운 고급 톤
	wisdom: {
		name: "지혜체",
		description: "깊은 통찰과 지혜가 담긴 현자의 조언 톤",
		style: "깊이 있는 표현, 철학적 사고, 인생 경험 반영",
		examples: ["인생의 여정에서", "깊이 성찰해보면", "진정한 의미는"],
	},
	energetic: {
		name: "활력체",
		description: "에너지 넘치고 긍정적인 동기부여 톤",
		style: "역동적 표현, 긍정적 어휘, 동기부여 중심",
		examples: ["힘차게", "도전해보자", "빛나는 미래"],
	},
	gentle: {
		name: "온화체",
		description: "부드럽고 따뜻한 위로와 격려의 톤",
		style: "부드러운 표현, 공감적 어조, 위로의 말",
		examples: ["괜찮아", "따뜻하게", "조금씩 천천히"],
	},
	professional: {
		name: "전문체",
		description: "객관적이고 분석적인 전문가 컨설팅 톤",
		style: "객관적 분석, 논리적 구조, 데이터 기반 접근",
		examples: ["분석 결과", "객관적으로 보면", "전문적 견해로는"],
	},
	mystical: {
		name: "신비체",
		description: "신비롭고 영적인 전통 사주 명리학 톤",
		style: "전통적 표현, 동양철학 용어, 신비로운 어조",
		examples: ["천지의 기운", "운명의 실", "음양의 조화"],
	},
	modern: {
		name: "현대체",
		description: "트렌디하고 젊은 감각의 현대적 표현",
		style: "현대적 표현, 트렌드 반영, 젊은 감각",
		examples: ["라이프스타일", "워라밸", "셀프케어"],
	},
	humorous: {
		name: "유머체",
		description: "재치있고 유머러스한 밝은 분위기의 톤",
		style: "위트 있는 표현, 유머 요소, 밝은 분위기",
		examples: ["재미있게도", "깜짝 놀랄", "유쾌한"],
	},
	scholarly: {
		name: "학술체",
		description: "학문적이고 심도있는 연구 기반 톤",
		style: "학술적 표현, 이론적 배경, 체계적 분석",
		examples: ["고전에서는", "연구 결과에 따르면", "이론적으로"],
	},
	narrative: {
		name: "서사체",
		description: "이야기하듯 흥미진진한 서술 톤",
		style: "스토리텔링, 서사적 구조, 흥미로운 전개",
		examples: ["한번은", "그런데 말이야", "이야기를 해보면"],
	},
} as const;

/**
 * 세분화된 연령대별 맞춤 전략
 */
export const DETAILED_AGE_STRATEGIES = {
	"early-10s": {
		// 10-15세
		focus: "학업, 꿈 탐색, 기초 성격 형성",
		keywords: ["공부", "꿈", "친구관계", "취미", "성장"],
		advice_style: "격려와 응원 중심",
	},
	"late-10s": {
		// 16-19세
		focus: "진로 탐색, 자아 정체성, 대인관계",
		keywords: ["진로", "정체성", "독립성", "도전", "가능성"],
		advice_style: "구체적 가이드와 동기부여",
	},
	"early-20s": {
		// 20-25세
		focus: "사회 진출, 첫 직장, 연애",
		keywords: ["취업", "커리어", "연애", "자립", "경험"],
		advice_style: "실용적 조언과 격려",
	},
	"late-20s": {
		// 26-29세
		focus: "커리어 발전, 안정적 관계, 미래 계획",
		keywords: ["승진", "전문성", "결혼", "목표", "성취"],
		advice_style: "전략적 사고와 장기 계획",
	},
	"early-30s": {
		// 30-35세
		focus: "결혼, 출산, 커리어 안정화",
		keywords: ["가정", "육아", "안정", "책임", "균형"],
		advice_style: "균형감과 현실적 조언",
	},
	"late-30s": {
		// 36-39세
		focus: "중간 관리직, 자녀 교육, 부모 부양",
		keywords: ["리더십", "교육", "효도", "변화", "성숙"],
		advice_style: "경험 기반 지혜와 조화",
	},
	"early-40s": {
		// 40-45세
		focus: "중년 전환기, 새로운 도전, 건강 관리",
		keywords: ["전환", "도전", "건강", "지혜", "성찰"],
		advice_style: "내면 성장과 새로운 시작",
	},
	"late-40s": {
		// 46-49세
		focus: "자녀 독립 준비, 노후 계획, 취미 개발",
		keywords: ["독립", "계획", "취미", "여유", "준비"],
		advice_style: "미래 준비와 자아 실현",
	},
	"early-50s": {
		// 50-55세
		focus: "노후 설계, 건강 관리, 인생 정리",
		keywords: ["정리", "건강", "여행", "봉사", "지혜"],
		advice_style: "인생 정리와 새로운 시작",
	},
	"late-50s+": {
		// 56세 이상
		focus: "지혜로운 노년, 후세 지도, 건강한 삶",
		keywords: ["지혜", "지도", "건강", "평안", "만족"],
		advice_style: "지혜 전수와 평안한 삶",
	},
} as const;

/**
 * 확장된 관심사별 특화 전략
 */
export const ADVANCED_INTEREST_STRATEGIES = {
	// 기존 관심사 확장
	career: {
		name: "커리어 성공",
		subcategories: [
			"leadership",
			"entrepreneurship",
			"skill-development",
			"networking",
		],
		keywords: ["성공", "리더십", "전문성", "성과", "인정"],
		focus_areas: ["업무 능력", "팀워크", "의사소통", "목표 달성"],
	},
	love: {
		name: "연애와 관계",
		subcategories: ["dating", "marriage", "family-harmony", "friendship"],
		keywords: ["사랑", "이해", "소통", "신뢰", "헌신"],
		focus_areas: ["감정 표현", "갈등 해결", "관계 발전", "상호 존중"],
	},
	health: {
		name: "건강과 웰빙",
		subcategories: [
			"physical-health",
			"mental-health",
			"lifestyle",
			"longevity",
		],
		keywords: ["활력", "균형", "회복", "예방", "관리"],
		focus_areas: ["체력 관리", "스트레스 관리", "수면", "영양"],
	},
	wealth: {
		name: "재정과 투자",
		subcategories: ["saving", "investment", "business", "financial-planning"],
		keywords: ["안정", "증식", "투자", "계획", "자산"],
		focus_areas: ["재정 계획", "투자 전략", "수입 증대", "지출 관리"],
	},

	// 새로운 관심사 추가
	spirituality: {
		name: "영성과 철학",
		subcategories: ["meditation", "philosophy", "religion", "inner-peace"],
		keywords: ["깨달음", "평안", "성찰", "명상", "깊이"],
		focus_areas: ["내면 성장", "정신적 안정", "삶의 의미", "자아 실현"],
	},
	adventure: {
		name: "모험과 여행",
		subcategories: ["travel", "extreme-sports", "exploration", "challenges"],
		keywords: ["모험", "경험", "도전", "자유", "발견"],
		focus_areas: ["새로운 경험", "용기", "적응력", "개방성"],
	},
	learning: {
		name: "학습과 지식",
		subcategories: ["education", "research", "skills", "languages"],
		keywords: ["지식", "성장", "발전", "습득", "향상"],
		focus_areas: ["지적 호기심", "학습 능력", "전문 지식", "평생 교육"],
	},
	social_impact: {
		name: "사회 공헌",
		subcategories: ["volunteering", "charity", "environment", "community"],
		keywords: ["기여", "봉사", "변화", "영향", "책임"],
		focus_areas: ["사회적 역할", "리더십", "공익", "지역사회"],
	},
} as const;

/**
 * 응답 포맷 다양화
 */
export const RESPONSE_FORMATS = {
	detailed_json: {
		name: "상세 JSON",
		description: "모든 항목이 포함된 완전한 JSON 응답",
		structure: {
			personality: "성격과 기질 (200-300자)",
			strengths: "강점과 재능 (200-300자)",
			challenges: "성장 과제 (200-300자)",
			summary: "전체 요약 (150-200자)",
			lifeAdvice: "인생 조언 (200-300자)",
			careerGuidance: "진로 가이드 (200-300자)",
			relationshipTips: "관계 조언 (200-300자)",
			luckyElements: "행운 요소 (100-150자)",
			cautions: "주의사항 (100-150자)",
		},
	},
	simple_json: {
		name: "간단 JSON",
		description: "핵심 항목만 포함된 간결한 JSON 응답",
		structure: {
			personality: "핵심 성격 (100-150자)",
			summary: "전체 요약 (100-150자)",
			advice: "핵심 조언 (150-200자)",
		},
	},
	narrative: {
		name: "서사체",
		description: "이야기 형식의 자연스러운 텍스트 응답",
		structure: "자연스러운 문단 구성, 스토리텔링 방식",
	},
	bullet_points: {
		name: "요점 정리",
		description: "핵심 포인트를 정리한 불릿 포인트 형식",
		structure: "• 항목별 핵심 내용 정리",
	},
} as const;

/**
 * 프롬프트 테마 시스템
 */
export const PROMPT_THEMES = {
	traditional: {
		name: "전통 명리",
		description: "고전 사주명리학 중심의 전통적 해석",
		emphasis: ["음양오행", "십이지지", "육십갑자", "신살"],
	},
	modern_practical: {
		name: "현대 실용",
		description: "현대 생활에 적용 가능한 실용적 조언 중심",
		emphasis: ["라이프스타일", "커리어", "관계", "자기계발"],
	},
	psychological: {
		name: "심리 분석",
		description: "심리학적 관점에서의 성격 분석 중심",
		emphasis: ["성격 유형", "행동 패턴", "심리적 특성", "감정 관리"],
	},
	spiritual_growth: {
		name: "영성 성장",
		description: "내면 성장과 영적 발전에 중점",
		emphasis: ["자아 실현", "내면 성찰", "영적 성장", "삶의 의미"],
	},
} as const;

/**
 * 고도화된 프롬프트 생성 함수
 */
export function generateAdvancedPrompt(
	request: AIInterpretationRequest,
	options: {
		version?: string;
		theme?: keyof typeof PROMPT_THEMES;
		responseFormat?: keyof typeof RESPONSE_FORMATS;
		experimentGroup?: "A" | "B" | "C";
		customInstructions?: string[];
	} = {}
): string {
	const {
		version = PROMPT_VERSION,
		theme = "modern_practical",
		responseFormat = "detailed_json",
		experimentGroup = "A",
		customInstructions = [],
	} = options;

	const { sajuResult, userProfile } = request;
	const selectedTheme = PROMPT_THEMES[theme];
	const selectedFormat = RESPONSE_FORMATS[responseFormat];
	const toneConfig = userProfile?.tone
		? ENHANCED_TONE_MODIFIERS[
				userProfile.tone as keyof typeof ENHANCED_TONE_MODIFIERS
		  ]
		: null;

	// 프롬프트 헤더 (버전 정보 포함)
	let prompt = `# 개-사주 AI 해석 시스템 v${version} (${TEMPLATE_UPDATED_AT})
테마: ${selectedTheme.name} | 응답형식: ${
		selectedFormat.name
	} | 실험그룹: ${experimentGroup}

당신은 ${selectedTheme.description}를 제공하는 전문 AI 사주 상담사입니다.

## 핵심 해석 원칙:
${selectedTheme.emphasis.map((item) => `• ${item}`).join("\n")}

## 사주 데이터:
\`\`\`json
{
  "사주팔자": ${JSON.stringify(sajuResult.pillars, null, 2)},
  "오행분석": ${JSON.stringify(sajuResult.elements, null, 2)},
  "기본해석": ${JSON.stringify(sajuResult.interpretation, null, 2)}
}
\`\`\`
`;

	// 개인화 설정 추가
	if (userProfile) {
		prompt += "\n## 개인화 설정:\n";

		// 고도화된 톤 적용
		if (toneConfig) {
			prompt += `• **문체**: ${toneConfig.description}\n`;
			prompt += `• **스타일**: ${toneConfig.style}\n`;
			prompt += `• **예시 표현**: ${toneConfig.examples.join(", ")}\n`;
		}

		// 세분화된 연령대 전략
		if (userProfile.age) {
			const ageGroup = getDetailedAgeGroup(userProfile.age);
			const ageStrategy = DETAILED_AGE_STRATEGIES[ageGroup];
			prompt += `• **연령대**: ${userProfile.age}세 (${ageGroup})\n`;
			prompt += `• **중점영역**: ${ageStrategy.focus}\n`;
			prompt += `• **핵심키워드**: ${ageStrategy.keywords.join(", ")}\n`;
			prompt += `• **조언스타일**: ${ageStrategy.advice_style}\n`;
		}

		// 고급 관심사 반영
		if (userProfile.interests && userProfile.interests.length > 0) {
			prompt += "• **관심분야 특화**:\n";
			userProfile.interests.forEach((interest) => {
				const strategy =
					ADVANCED_INTEREST_STRATEGIES[
						interest as keyof typeof ADVANCED_INTEREST_STRATEGIES
					];
				if (strategy) {
					prompt += `  - ${strategy.name}: ${strategy.focus_areas.join(
						", "
					)}\n`;
				}
			});
		}
	}

	// 응답 형식 지정
	prompt += `\n## 응답 형식:
${
	responseFormat === "detailed_json"
		? `JSON 형식으로 다음 구조를 준수:
\`\`\`json
{
${Object.entries(selectedFormat.structure)
	.map(([key, desc]) => `  "${key}": "${desc}"`)
	.join(",\n")}
}
\`\`\``
		: responseFormat === "simple_json"
		? `간단한 JSON 형식:
\`\`\`json
{
${Object.entries(selectedFormat.structure)
	.map(([key, desc]) => `  "${key}": "${desc}"`)
	.join(",\n")}
}
\`\`\``
		: responseFormat === "narrative"
		? `자연스러운 문단 형식으로 이야기하듯 서술`
		: `핵심 포인트를 불릿 포인트로 정리`
}`;

	// 실험군별 차별화 (A/B/C 테스트)
	if (experimentGroup === "B") {
		prompt +=
			"\n\n## 실험군 B 추가 지침:\n• 더욱 구체적이고 실행 가능한 조언에 집중\n• 단계별 실행 계획 포함";
	} else if (experimentGroup === "C") {
		prompt +=
			"\n\n## 실험군 C 추가 지침:\n• 감성적이고 공감적인 표현 강화\n• 위로와 격려 메시지 비중 증가";
	}

	// 커스텀 지침 추가
	if (customInstructions.length > 0) {
		prompt += "\n## 추가 맞춤 지침:\n";
		customInstructions.forEach((instruction) => {
			prompt += `• ${instruction}\n`;
		});
	}

	// 계절감 및 시의성 추가
	prompt += `\n## 시의성 반영:
• ${getAdvancedSeasonalTouch()}
• 2025년 시대상황과 트렌드 반영
• 포스트 코로나 시대의 가치관 변화 고려`;

	// 품질 보증 지침
	prompt += `\n## 품질 기준:
• 한국어 자연스러움: 문법과 어법에 맞는 자연스러운 표현
• 개인화 깊이: 제공된 정보를 최대한 활용한 맞춤형 조언
• 건설적 관점: 긍정적이고 성장 지향적인 메시지
• 실용성: 일상 생활에 적용 가능한 구체적 조언
• 균형감: 전통과 현대, 이상과 현실의 조화`;

	return prompt;
}

/**
 * 세분화된 연령대 그룹 계산
 */
function getDetailedAgeGroup(
	age: number
): keyof typeof DETAILED_AGE_STRATEGIES {
	if (age <= 15) return "early-10s";
	if (age <= 19) return "late-10s";
	if (age <= 25) return "early-20s";
	if (age <= 29) return "late-20s";
	if (age <= 35) return "early-30s";
	if (age <= 39) return "late-30s";
	if (age <= 45) return "early-40s";
	if (age <= 49) return "late-40s";
	if (age <= 55) return "early-50s";
	return "late-50s+";
}

/**
 * 고도화된 계절감 생성
 */
function getAdvancedSeasonalTouch(): string {
	const now = new Date();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	// 세밀한 계절 구분
	if (month === 3 || (month === 4 && day <= 15)) {
		return "새봄의 기운처럼 새로운 시작과 변화의 에너지, 희망찬 출발";
	} else if (month === 4 || month === 5) {
		return "만물이 생동하는 늦봄처럼 성장과 발전의 역동적 에너지";
	} else if (month >= 6 && month <= 7) {
		return "초여름의 활력처럼 열정적이고 적극적인 도전 정신";
	} else if (month === 8 || (month === 9 && day <= 15)) {
		return "한여름의 풍성함처럼 결실을 맺는 성취와 완성의 에너지";
	} else if (month === 9 || month === 10) {
		return "가을의 성숙함처럼 안정과 조화, 지혜로운 판단력";
	} else if (month === 11 || (month === 12 && day <= 15)) {
		return "늦가을의 정리처럼 성찰과 준비, 내실 다지기";
	} else {
		return "겨울의 고요함처럼 내면 정화와 새로운 준비의 시간";
	}
}

/**
 * 프롬프트 메타데이터 생성
 */
export function generatePromptMetadata(
	request: AIInterpretationRequest,
	options: any = {}
) {
	return {
		version: PROMPT_VERSION,
		createdAt: new Date().toISOString(),
		theme: options.theme || "modern_practical",
		responseFormat: options.responseFormat || "detailed_json",
		experimentGroup: options.experimentGroup || "A",
		userProfileHash: request.userProfile
			? hashUserProfile(request.userProfile)
			: null,
		estimatedTokens: estimatePromptTokens(request, options),
		complexity: calculatePromptComplexity(request, options),
	};
}

/**
 * 사용자 프로필 해시 (프라이버시 보호)
 */
function hashUserProfile(profile: any): string {
	const key = `${profile.age || "unknown"}-${profile.gender || "unknown"}-${
		profile.tone || "default"
	}`;
	return Buffer.from(key).toString("base64").substring(0, 8);
}

/**
 * 프롬프트 토큰 수 추정
 */
function estimatePromptTokens(
	request: AIInterpretationRequest,
	options: any
): number {
	// 기본 프롬프트 + 사주 데이터 + 개인화 요소
	let tokens = 800; // 기본 프롬프트

	// 사주 데이터 크기
	tokens += JSON.stringify(request.sajuResult).length / 4;

	// 개인화 요소들
	if (request.userProfile) {
		tokens += 200; // 기본 개인화
		if (request.userProfile.interests?.length) {
			tokens += request.userProfile.interests.length * 50;
		}
	}

	// 응답 형식별 차이
	if (options.responseFormat === "detailed_json") tokens += 300;
	if (options.responseFormat === "narrative") tokens += 200;

	return Math.round(tokens);
}

/**
 * 프롬프트 복잡도 계산
 */
function calculatePromptComplexity(
	request: AIInterpretationRequest,
	options: any
): "simple" | "medium" | "complex" {
	let complexity = 0;

	// 기본 복잡도
	complexity += 1;

	// 개인화 요소들
	if (request.userProfile?.tone) complexity += 1;
	if (request.userProfile?.age) complexity += 1;
	if (request.userProfile?.interests?.length)
		complexity += request.userProfile.interests.length;

	// 응답 형식
	if (options.responseFormat === "detailed_json") complexity += 2;
	if (options.responseFormat === "narrative") complexity += 3;

	// 테마별 복잡도
	if (options.theme === "traditional") complexity += 2;
	if (options.theme === "psychological") complexity += 3;

	if (complexity <= 3) return "simple";
	if (complexity <= 7) return "medium";
	return "complex";
}
