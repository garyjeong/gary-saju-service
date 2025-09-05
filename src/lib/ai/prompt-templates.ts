/**
 * 개-사주 AI 프롬프트 템플릿 시스템
 * 사용자 맞춤형 해석을 위한 프롬프트 생성
 */

import { AIInterpretationRequest } from "./openai-client";

/**
 * 기본 사주 해석 프롬프트
 */
const BASE_INTERPRETATION_PROMPT = `
당신은 전통 사주명리학에 정통한 전문가이면서, 현대인에게 친근하고 실용적인 조언을 제공하는 AI 사주 상담사입니다.

다음 사주 정보를 바탕으로 깊이 있고 개인화된 해석을 제공해주세요:

사주 정보:
- 사주팔자: {pillars}
- 오행 분석: {elements}
- 기본 해석: {basicInterpretation}

해석 원칙:
1. 전통 사주명리학 이론을 기반으로 하되, 현대적 관점에서 재해석
2. 부정적 표현보다는 건설적이고 희망적인 조언 위주
3. 구체적이고 실용적인 삶의 지침 제공
4. 개인의 성장과 발전 가능성에 초점

응답 형식 (JSON):
{
  "personality": "성격과 기질에 대한 심화 해석 (200-300자)",
  "strengths": "강점과 재능에 대한 구체적 분석 (200-300자)",
  "challenges": "극복해야 할 과제와 성장 포인트 (200-300자)",
  "summary": "전체적인 사주 요약과 인생 방향성 (150-200자)",
  "lifeAdvice": "인생 전반에 대한 실용적 조언 (200-300자)",
  "careerGuidance": "직업과 진로에 대한 구체적 가이드 (200-300자)",
  "relationshipTips": "인간관계와 사랑에 대한 조언 (200-300자)"
}
`;

/**
 * 사용자 프로필별 톤 조정
 */
const TONE_MODIFIERS = {
	formal: "정중하고 격식있는 존댓말로 전문적인 상담 톤으로",
	casual: "친근하고 편안한 반말로 친구가 조언하는 듯한 톤으로",
	poetic: "시적이고 감성적인 표현을 사용하여 아름다운 문체로",
};

/**
 * 연령대별 맞춤 조언
 */
const AGE_SPECIFIC_GUIDANCE = {
	"10s": "학업, 꿈 찾기, 자아 정체성 형성에 중점을 둔",
	"20s": "진로 선택, 연애, 자립과 성장에 중점을 둔",
	"30s": "커리어 발전, 결혼과 가정, 안정적 기반 구축에 중점을 둔",
	"40s": "중년의 전환기, 가족 관계, 새로운 도전에 중점을 둔",
	"50s+": "인생 후반부 계획, 건강 관리, 지혜로운 노년 준비에 중점을 둔",
};

/**
 * 성별별 관심사 고려
 */
const GENDER_CONSIDERATIONS = {
	male: "남성적 에너지, 사회적 성취, 리더십 발휘",
	female: "여성적 직관, 감성과 이성의 조화, 관계 중심적 접근",
	other: "개인의 고유한 특성, 다양성 존중, 자유로운 자아 표현",
};

/**
 * 관심사별 맞춤 조언
 */
const INTEREST_KEYWORDS = {
	career: "직업적 성공, 업무 능력 향상, 리더십 개발",
	love: "연애와 결혼, 인간관계, 감정적 만족",
	health: "건강 관리, 체력 증진, 정신적 안정",
	money: "재정 관리, 투자, 경제적 안정",
	family: "가족 관계, 육아, 가정의 화목",
	growth: "자기계발, 학습, 정신적 성장",
	creativity: "예술적 재능, 창의성 발휘, 문화 활동",
};

/**
 * 계절별 감성 추가
 */
function getSeasonalTouch(): string {
	const month = new Date().getMonth() + 1;

	if (month >= 3 && month <= 5) {
		return "새봄의 기운처럼 새로운 시작과 성장의 에너지";
	} else if (month >= 6 && month <= 8) {
		return "여름의 활력처럼 역동적이고 열정적인 에너지";
	} else if (month >= 9 && month <= 11) {
		return "가을의 결실처럼 성숙하고 안정적인 에너지";
	} else {
		return "겨울의 고요함처럼 내면의 성찰과 준비의 에너지";
	}
}

/**
 * 개인화된 프롬프트 생성
 */
export function generatePersonalizedPrompt(
	request: AIInterpretationRequest
): string {
	const { sajuResult, userProfile } = request;

	// 기본 프롬프트 시작
	let prompt = BASE_INTERPRETATION_PROMPT;

	// 사주 정보 삽입
	prompt = prompt.replace(
		"{pillars}",
		JSON.stringify(sajuResult.pillars, null, 2)
	);
	prompt = prompt.replace(
		"{elements}",
		JSON.stringify(sajuResult.elements, null, 2)
	);
	prompt = prompt.replace(
		"{basicInterpretation}",
		JSON.stringify(sajuResult.interpretation, null, 2)
	);

	// 사용자 프로필 기반 맞춤화
	if (userProfile) {
		prompt += "\n\n추가 맞춤화 지침:\n";

		// 톤 조정
		if (userProfile.tone) {
			prompt += `- 문체: ${TONE_MODIFIERS[userProfile.tone]}\n`;
		}

		// 연령대별 조언
		if (userProfile.age) {
			const ageGroup =
				userProfile.age < 20
					? "10s"
					: userProfile.age < 30
					? "20s"
					: userProfile.age < 40
					? "30s"
					: userProfile.age < 50
					? "40s"
					: "50s+";

			prompt += `- 연령대 고려: ${AGE_SPECIFIC_GUIDANCE[ageGroup]} 조언을 포함해주세요\n`;
		}

		// 성별 고려
		if (userProfile.gender) {
			prompt += `- 성별 특성: ${
				GENDER_CONSIDERATIONS[userProfile.gender]
			}을 고려한 해석\n`;
		}

		// 관심사 반영
		if (userProfile.interests && userProfile.interests.length > 0) {
			const interestGuidance = userProfile.interests
				.map(
					(interest) =>
						INTEREST_KEYWORDS[interest as keyof typeof INTEREST_KEYWORDS]
				)
				.filter(Boolean)
				.join(", ");

			if (interestGuidance) {
				prompt += `- 관심 분야: ${interestGuidance}에 특별히 중점을 둔 조언\n`;
			}
		}
	}

	// 계절감 추가
	prompt += `\n- 현재 시기: ${getSeasonalTouch()}를 고려한 시의적절한 조언\n`;

	// 마무리 지침
	prompt += `
\n응답 시 주의사항:
- 반드시 JSON 형식으로만 응답
- 각 항목은 지정된 글자 수 범위 내에서 작성
- 미신적이거나 근거 없는 예언은 피하고, 건설적인 조언에 집중
- 한국어로 자연스럽고 읽기 쉽게 작성
- 개인의 자유의지와 노력의 중요성 강조`;

	return prompt;
}

/**
 * 간단한 프롬프트 (캐시용)
 */
export function generateSimplePrompt(sajuResult: any): string {
	return `
다음 사주 정보를 간단히 해석해주세요:

사주팔자: ${JSON.stringify(sajuResult.pillars)}
오행 분석: ${JSON.stringify(sajuResult.elements)}

간단한 JSON 형식으로 응답:
{
  "personality": "성격 특성 (100자 내외)",
  "summary": "전체 요약 (100자 내외)",
  "advice": "핵심 조언 (100자 내외)"
}
	`.trim();
}

/**
 * 에러 복구용 폴백 프롬프트
 */
export function generateFallbackPrompt(sajuResult: any): string {
	return `
사주 해석을 간단히 요약해주세요:
- 성격: ${sajuResult.interpretation?.personality || "정보 없음"}
- 강점: ${sajuResult.interpretation?.strengths || "정보 없음"}
- 조언: 이 사주의 주인은 어떤 점에 주의하면 좋을까요?

JSON 형식으로 한 줄씩 간단히 답변해주세요.
	`.trim();
}
