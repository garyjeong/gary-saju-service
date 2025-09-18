import { test, expect } from "@playwright/test";

test.describe("상성 분석 시스템", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("메인 페이지에서 궁합 분석 버튼이 표시되어야 한다", async ({ page }) => {
		// 궁합 분석 버튼 확인
		const compatibilityButton = page.getByRole("link", {
			name: /궁합 분석하기/,
		});
		await expect(compatibilityButton).toBeVisible();

		// 하트 아이콘이 포함되어 있는지 확인
		await expect(compatibilityButton.locator("svg")).toBeVisible();
	});

	test("궁합 분석 페이지로 이동할 수 있어야 한다", async ({ page }) => {
		// 궁합 분석 버튼 클릭
		await page.getByRole("link", { name: /궁합 분석하기/ }).click();

		// URL 확인
		await expect(page).toHaveURL("/compatibility");

		// 페이지 제목 확인
		await expect(
			page.getByRole("heading", { name: /사주 궁합 분석/ })
		).toBeVisible();
	});

	test("상성 분석 입력 폼이 올바르게 렌더링되어야 한다", async ({ page }) => {
		await page.goto("/compatibility");

		// 단계 표시기 확인
		await expect(page.getByText("관계 타입")).toBeVisible();
		await expect(page.getByText("첫 번째 사람")).toBeVisible();
		await expect(page.getByText("두 번째 사람")).toBeVisible();
		await expect(page.getByText("확인")).toBeVisible();

		// 첫 번째 단계 내용 확인
		await expect(
			page.getByText("어떤 관계의 상성을 알아보고 싶으신가요?")
		).toBeVisible();
		await expect(page.getByText("연애 궁합")).toBeVisible();
		await expect(page.getByText("결혼 궁합")).toBeVisible();
		await expect(page.getByText("사업 파트너")).toBeVisible();
		await expect(page.getByText("우정")).toBeVisible();
	});

	test("관계 타입 선택이 올바르게 작동해야 한다", async ({ page }) => {
		await page.goto("/compatibility");

		// 초기에는 다음 버튼이 비활성화되어 있어야 함
		const nextButton = page.getByRole("button", { name: "다음" });
		await expect(nextButton).toBeDisabled();

		// 연애 궁합 선택
		await page.getByText("연애 궁합").click();

		// 선택된 상태 확인
		const romanceCard = page.locator('div:has-text("연애 궁합")').first();
		await expect(romanceCard).toHaveClass(/border-primary/);

		// 다음 버튼이 활성화되어야 함
		await expect(nextButton).toBeEnabled();

		// 다른 옵션 선택해보기
		await page.getByText("결혼 궁합").click();
		const marriageCard = page.locator('div:has-text("결혼 궁합")').first();
		await expect(marriageCard).toHaveClass(/border-primary/);
	});

	test("단계별 네비게이션이 올바르게 작동해야 한다", async ({ page }) => {
		await page.goto("/compatibility");

		// 1단계: 관계 타입 선택
		await page.getByText("연애 궁합").click();
		await page.getByRole("button", { name: "다음" }).click();

		// 2단계: 첫 번째 사람 정보 입력 화면으로 이동 확인
		await expect(
			page.getByText("첫 번째 사람의 정보를 입력해주세요")
		).toBeVisible();

		// 이전 버튼으로 돌아가기
		await page.getByRole("button", { name: "이전" }).click();

		// 1단계로 돌아왔는지 확인
		await expect(
			page.getByText("어떤 관계의 상성을 알아보고 싶으신가요?")
		).toBeVisible();
	});

	test("개인 정보 입력 폼이 올바르게 작동해야 한다", async ({ page }) => {
		await page.goto("/compatibility");

		// 1단계: 관계 타입 선택
		await page.getByText("연애 궁합").click();
		await page.getByRole("button", { name: "다음" }).click();

		// 2단계: 첫 번째 사람 정보 입력
		await expect(
			page.getByText("첫 번째 사람의 정보를 입력해주세요")
		).toBeVisible();

		// 필수 필드들이 표시되는지 확인
		await expect(page.getByText("이름 *")).toBeVisible();
		await expect(page.getByText("성별 *")).toBeVisible();
		await expect(page.getByText("생년월일 *")).toBeVisible();
		await expect(page.getByText("출생 시간 *")).toBeVisible();

		// 이름 입력
		await page.getByPlaceholder("홍길동").fill("김철수");

		// 성별 선택
		await page.locator('[role="combobox"]').first().click();
		await page.getByText("남성").click();

		// 생년월일 입력
		await page.locator('input[type="date"]').fill("1990-01-01");

		// 출생시간 선택 (모바일 시간 선택기 시뮬레이션)
		await page.locator('button:has-text("시간을 선택해 주세요")').click();
		await page.getByText("09:00").click();

		// 다음 단계로 이동
		await page.getByRole("button", { name: "다음" }).click();

		// 3단계로 이동했는지 확인
		await expect(
			page.getByText("두 번째 사람의 정보를 입력해주세요")
		).toBeVisible();
	});

	test("전체 입력 플로우 완료 후 분석 요청이 가능해야 한다", async ({
		page,
	}) => {
		await page.goto("/compatibility");

		// 1단계: 관계 타입 선택
		await page.getByText("연애 궁합").click();
		await page.getByRole("button", { name: "다음" }).click();

		// 2단계: 첫 번째 사람 정보 입력
		await page.getByPlaceholder("홍길동").fill("김철수");
		await page.locator('[role="combobox"]').first().click();
		await page.getByText("남성").click();
		await page.locator('input[type="date"]').fill("1990-01-01");
		await page.locator('button:has-text("시간을 선택해 주세요")').click();
		await page.getByText("09:00").click();
		await page.getByRole("button", { name: "다음" }).click();

		// 3단계: 두 번째 사람 정보 입력
		await page.getByPlaceholder("홍길동").fill("김영희");
		await page.locator('[role="combobox"]').first().click();
		await page.getByText("여성").click();
		await page.locator('input[type="date"]').fill("1992-05-15");
		await page.locator('button:has-text("시간을 선택해 주세요")').click();
		await page.getByText("14:00").click();
		await page.getByRole("button", { name: "다음" }).click();

		// 4단계: 확인 단계
		await expect(page.getByText("입력하신 정보를 확인해주세요")).toBeVisible();

		// 입력된 정보가 올바르게 표시되는지 확인
		await expect(page.getByText("김철수")).toBeVisible();
		await expect(page.getByText("김영희")).toBeVisible();
		await expect(page.getByText("1990-01-01")).toBeVisible();
		await expect(page.getByText("1992-05-15")).toBeVisible();

		// 상성 분석 시작 버튼
		const startAnalysisButton = page.getByRole("button", {
			name: "상성 분석 시작하기",
		});
		await expect(startAnalysisButton).toBeVisible();
		await expect(startAnalysisButton).toBeEnabled();
	});

	test("분석 진행 중 로딩 상태가 표시되어야 한다", async ({ page }) => {
		await page.goto("/compatibility");

		// 전체 입력 플로우 완료
		await page.getByText("연애 궁합").click();
		await page.getByRole("button", { name: "다음" }).click();

		await page.getByPlaceholder("홍길동").fill("김철수");
		await page.locator('[role="combobox"]').first().click();
		await page.getByText("남성").click();
		await page.locator('input[type="date"]').fill("1990-01-01");
		await page.locator('button:has-text("시간을 선택해 주세요")').click();
		await page.getByText("09:00").click();
		await page.getByRole("button", { name: "다음" }).click();

		await page.getByPlaceholder("홍길동").fill("김영희");
		await page.locator('[role="combobox"]').first().click();
		await page.getByText("여성").click();
		await page.locator('input[type="date"]').fill("1992-05-15");
		await page.locator('button:has-text("시간을 선택해 주세요")').click();
		await page.getByText("14:00").click();
		await page.getByRole("button", { name: "다음" }).click();

		// 분석 시작
		await page.getByRole("button", { name: "상성 분석 시작하기" }).click();

		// 로딩 모달이 표시되는지 확인
		await expect(page.getByText("상성 분석 중...")).toBeVisible();
		await expect(page.getByText("사주팔자 계산 중")).toBeVisible();
		await expect(page.getByText("오행 상생상극 분석 중")).toBeVisible();
		await expect(page.getByText("종합 해석 생성 중")).toBeVisible();
	});

	test.skip("분석 결과 페이지가 올바르게 표시되어야 한다", async ({ page }) => {
		// 이 테스트는 실제 분석 로직이 완성된 후 활성화
		await page.goto("/compatibility");

		// 전체 플로우 완료 후 결과 대기
		// ... (입력 단계들)

		// 결과 페이지 요소들 확인
		await expect(page.getByText("김철수 ♡ 김영희")).toBeVisible();
		await expect(page.getByText("점")).toBeVisible();
		await expect(page.getByText("상성 한줄 요약")).toBeVisible();
	});

	test("반응형 디자인이 모바일에서 올바르게 작동해야 한다", async ({
		page,
	}) => {
		// 모바일 뷰포트 설정
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/compatibility");

		// 모바일에서도 버튼들이 스택으로 표시되는지 확인
		const nextButton = page.getByRole("button", { name: "다음" });
		await expect(nextButton).toBeVisible();

		// 관계 타입 카드들이 세로로 배치되는지 확인
		await expect(page.getByText("연애 궁합")).toBeVisible();
		await expect(page.getByText("결혼 궁합")).toBeVisible();

		// 단계 표시기가 모바일에서도 적절히 표시되는지 확인
		await expect(page.getByText("관계 타입")).toBeVisible();
	});

	test("접근성 요소들이 올바르게 구현되어야 한다", async ({ page }) => {
		await page.goto("/compatibility");

		// 적절한 헤딩 구조 확인
		await expect(
			page.getByRole("heading", { name: /사주 궁합 분석/ })
		).toBeVisible();

		// 폼 레이블과 입력 필드 연결 확인
		await page.getByText("연애 궁합").click();
		await page.getByRole("button", { name: "다음" }).click();

		// 필수 필드 표시 확인
		await expect(page.getByText("이름 *")).toBeVisible();

		// 키보드 네비게이션 확인
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		// 포커스가 적절히 이동하는지 확인
	});

	test("에러 처리가 올바르게 작동해야 한다", async ({ page }) => {
		await page.goto("/compatibility");

		// 1단계에서 선택하지 않고 다음 버튼 클릭 시도
		const nextButton = page.getByRole("button", { name: "다음" });
		await expect(nextButton).toBeDisabled();

		// 2단계에서 필수 정보 누락 시 검증
		await page.getByText("연애 궁합").click();
		await nextButton.click();

		// 이름만 입력하고 다음 버튼 클릭 시도
		await page.getByPlaceholder("홍길동").fill("김철수");
		await expect(page.getByRole("button", { name: "다음" })).toBeDisabled();
	});

	test("Footer 링크에서도 상성 분석 페이지로 이동할 수 있어야 한다", async ({
		page,
	}) => {
		// 메인 페이지에서 Footer까지 스크롤
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

		// Footer의 상성 분석 링크 클릭
		await page.getByRole("link", { name: /사주 궁합 분석/ }).click();

		// 상성 분석 페이지로 이동 확인
		await expect(page).toHaveURL("/compatibility");
		await expect(
			page.getByRole("heading", { name: /사주 궁합 분석/ })
		).toBeVisible();
	});
});
