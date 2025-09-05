import { test, expect } from "@playwright/test";

test.describe("개-사주 전체 플로우 E2E 테스트", () => {
	test.beforeEach(async ({ page }) => {
		// 각 테스트 전에 홈페이지로 이동
		await page.goto("/");
	});

	test("홈페이지에서 사주 입력까지 전체 플로우", async ({ page }) => {
		// 홈페이지 로딩 확인
		await expect(page.locator("h1")).toContainText("개-사주");
		await expect(
			page.locator("text=전통 사주를 현대적이고 감성적인 UI로")
		).toBeVisible();

		// "사주 보기 시작" 버튼 클릭
		await page.click("text=사주 보기 시작");

		// 입력 페이지로 이동 확인
		await expect(page).toHaveURL("/input");
		await expect(page.locator("h1")).toContainText("사주 정보 입력");

		// 폼 입력
		await page.fill('input[name="name"]', "홍길동");

		// 성별 선택
		await page.click("text=성별을 선택해 주세요");
		await page.click("text=남성");

		// 생년월일 입력
		await page.fill('input[type="date"]', "1990-05-15");

		// 출생 시간 선택
		await page.click("text=시간을 선택해 주세요");
		await page.click("text=14:30");

		// 폼 제출
		await page.click("text=사주 풀이 보기");

		// 결과 페이지로 이동 확인 (로딩 후)
		await expect(page).toHaveURL("/result");
		await expect(page.locator("h1")).toContainText("홍길동님의 사주 풀이");
	});

	test("입력 폼 검증 테스트", async ({ page }) => {
		await page.goto("/input");

		// 빈 폼으로 제출 시도
		await page.click("text=사주 풀이 보기");

		// 에러 메시지 확인
		await expect(page.locator("text=이름을 입력해주세요")).toBeVisible();
		await expect(page.locator("text=성별을 선택해주세요")).toBeVisible();

		// 잘못된 이름 입력
		await page.fill('input[name="name"]', "123");
		await page.click("text=사주 풀이 보기");
		await expect(
			page.locator("text=이름은 한글 또는 영문만 입력 가능합니다")
		).toBeVisible();
	});

	test("결과 페이지 탭 네비게이션", async ({ page }) => {
		// 먼저 유효한 데이터로 결과 페이지에 도달
		await page.goto("/input");
		await page.fill('input[name="name"]', "김민수");
		await page.click("text=성별을 선택해 주세요");
		await page.click("text=남성");
		await page.fill('input[type="date"]', "1985-12-25");
		await page.click("text=시간을 선택해 주세요");
		await page.click("text=08:30");
		await page.click("text=사주 풀이 보기");

		// 결과 페이지 도달 확인
		await expect(page).toHaveURL("/result");

		// 탭 네비게이션 테스트
		await expect(page.locator("text=기본 풀이")).toBeVisible();
		await expect(page.locator("text=오행 분석")).toBeVisible();
		await expect(page.locator("text=운세 흐름")).toBeVisible();

		// 오행 분석 탭 클릭
		await page.click("text=오행 분석");
		await expect(page.locator("text=오행 균형 분석")).toBeVisible();

		// 운세 흐름 탭 클릭
		await page.click("text=운세 흐름");
		await expect(page.locator("text=연도별 운세 흐름")).toBeVisible();
	});

	test("공유 페이지 접근 및 기능", async ({ page }) => {
		// 결과 페이지에서 공유 버튼 클릭
		await page.goto("/input");
		await page.fill('input[name="name"]', "이영희");
		await page.click("text=성별을 선택해 주세요");
		await page.click("text=여성");
		await page.fill('input[type="date"]', "1992-08-20");
		await page.click("text=시간을 선택해 주세요");
		await page.click("text=16:45");
		await page.click("text=사주 풀이 보기");

		await expect(page).toHaveURL("/result");

		// SNS 공유하기 버튼 클릭
		await page.click("text=SNS 공유하기");

		// 공유 페이지로 이동 확인
		await expect(page).toHaveURL("/share");
		await expect(page.locator("h1")).toContainText("사주 카드 공유하기");

		// 공유 옵션들 확인
		await expect(page.locator("text=이미지로 저장")).toBeVisible();
		await expect(page.locator("text=링크 공유")).toBeVisible();
		await expect(page.locator("text=SNS 공유")).toBeVisible();
	});

	test("테마 전환 기능", async ({ page }) => {
		// 다크모드 토글 테스트
		const themeButton = page.locator('button[aria-label="테마 전환"]');
		await expect(themeButton).toBeVisible();

		// 다크모드로 전환
		await themeButton.click();

		// 다크모드 적용 확인 (html 클래스 변경)
		await expect(page.locator("html")).toHaveClass(/dark/);

		// 라이트모드로 다시 전환
		await themeButton.click();
		await expect(page.locator("html")).not.toHaveClass(/dark/);
	});

	test("네비게이션 링크들", async ({ page }) => {
		// 헤더 로고 클릭 시 홈으로 이동
		await page.click("text=개-사주");
		await expect(page).toHaveURL("/");

		// 푸터 링크들 확인
		await expect(page.locator("text=사주 입력")).toBeVisible();
		await expect(page.locator("text=결과 보기")).toBeVisible();
		await expect(page.locator("text=공유하기")).toBeVisible();

		// GitHub 링크 확인
		const githubLink = page.locator('a[href*="github.com"]');
		await expect(githubLink).toBeVisible();
	});

	test("모바일 반응형 디자인", async ({ page }) => {
		// 모바일 뷰포트로 설정
		await page.setViewportSize({ width: 375, height: 667 });

		// 모바일에서도 주요 요소들이 정상 표시되는지 확인
		await expect(page.locator("h1")).toContainText("개-사주");
		await expect(page.locator("text=사주 보기 시작")).toBeVisible();

		// 입력 페이지에서 모바일 레이아웃 확인
		await page.goto("/input");
		await expect(page.locator("h1")).toContainText("사주 정보 입력");

		// 폼이 모바일에서도 사용 가능한지 확인
		await page.fill('input[name="name"]', "모바일테스트");
		await expect(page.locator('input[name="name"]')).toHaveValue(
			"모바일테스트"
		);
	});

	test("페이지 로딩 성능", async ({ page }) => {
		// 홈페이지 로딩 시간 측정
		const startTime = Date.now();
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const loadTime = Date.now() - startTime;

		// 3초 이내 로딩 확인
		expect(loadTime).toBeLessThan(3000);

		// 주요 요소들이 로드되었는지 확인
		await expect(page.locator("h1")).toBeVisible();
		await expect(page.locator("text=사주 보기 시작")).toBeVisible();
	});

	test("오늘의 운세 위젯 표시", async ({ page }) => {
		await expect(page.locator("text=오늘의 키워드")).toBeVisible();
		await expect(page.locator("text=새로운 시작")).toBeVisible();
		await expect(page.locator("text=88점")).toBeVisible();

		// 오늘 날짜가 표시되는지 확인
		const currentYear = new Date().getFullYear();
		await expect(page.locator(`text=${currentYear}년`)).toBeVisible();
	});

	test("에러 페이지 처리", async ({ page }) => {
		// 존재하지 않는 페이지로 이동
		const response = await page.goto("/nonexistent-page");
		expect(response?.status()).toBe(404);
	});

	test("접근성 기본 요소 확인", async ({ page }) => {
		// 주요 버튼들이 키보드로 접근 가능한지 확인
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");

		// 포커스된 요소가 시각적으로 구분되는지 확인
		const focusedElement = await page.locator(":focus");
		await expect(focusedElement).toBeVisible();

		// alt 텍스트가 있는 이미지들 확인
		const images = page.locator("img");
		const imageCount = await images.count();

		for (let i = 0; i < imageCount; i++) {
			const img = images.nth(i);
			const alt = await img.getAttribute("alt");
			expect(alt).toBeTruthy();
		}
	});
});
