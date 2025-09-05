import {
	validateSajuData,
	validateDateRange,
	validateTimeFormat,
} from "@/lib/saju/validation";

describe("사주 입력 검증 테스트", () => {
	describe("validateSajuData", () => {
		const validData = {
			name: "홍길동",
			birthDate: "1990-05-15",
			birthTime: "14:30",
			gender: "male",
		};

		it("유효한 데이터를 통과시켜야 한다", () => {
			const result = validateSajuData(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(validData);
			}
		});

		it("이름이 너무 짧으면 실패해야 한다", () => {
			const result = validateSajuData({ ...validData, name: "" });
			expect(result.success).toBe(false);
		});

		it("이름이 너무 길면 실패해야 한다", () => {
			const result = validateSajuData({ ...validData, name: "a".repeat(11) });
			expect(result.success).toBe(false);
		});

		it("이름에 특수문자가 있으면 실패해야 한다", () => {
			const result = validateSajuData({ ...validData, name: "홍길동123" });
			expect(result.success).toBe(false);
		});

		it("잘못된 날짜 형식이면 실패해야 한다", () => {
			const result = validateSajuData({ ...validData, birthDate: "90-05-15" });
			expect(result.success).toBe(false);
		});

		it("존재하지 않는 날짜면 실패해야 한다", () => {
			const result = validateSajuData({
				...validData,
				birthDate: "1990-02-30",
			});
			expect(result.success).toBe(false);
		});

		it("잘못된 시간 형식이면 실패해야 한다", () => {
			const result = validateSajuData({ ...validData, birthTime: "25:30" });
			expect(result.success).toBe(false);
		});

		it("잘못된 성별이면 실패해야 한다", () => {
			const result = validateSajuData({ ...validData, gender: "other" });
			expect(result.success).toBe(false);
		});
	});

	describe("validateDateRange", () => {
		it("유효한 날짜 범위를 통과시켜야 한다", () => {
			const result = validateDateRange("1990-05-15");
			expect(result.isValid).toBe(true);
			expect(result.message).toBeUndefined();
		});

		it("미래 날짜는 실패해야 한다", () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);
			const dateString = futureDate.toISOString().split("T")[0];

			const result = validateDateRange(dateString);
			expect(result.isValid).toBe(false);
			expect(result.message).toBe("미래 날짜는 입력할 수 없습니다");
		});

		it("1900년 이전 날짜는 실패해야 한다", () => {
			const result = validateDateRange("1899-12-31");
			expect(result.isValid).toBe(false);
			expect(result.message).toBe("1900년 이후 날짜를 입력해주세요");
		});

		it("경계값 테스트 - 1900년 1월 1일", () => {
			const result = validateDateRange("1900-01-01");
			expect(result.isValid).toBe(true);
		});

		it("경계값 테스트 - 오늘", () => {
			const today = new Date().toISOString().split("T")[0];
			const result = validateDateRange(today);
			expect(result.isValid).toBe(true);
		});
	});

	describe("validateTimeFormat", () => {
		it("유효한 시간 형식을 통과시켜야 한다", () => {
			const validTimes = ["00:00", "12:30", "23:59", "9:15", "1:05"];

			validTimes.forEach((time) => {
				const result = validateTimeFormat(time);
				expect(result.isValid).toBe(true);
				expect(result.message).toBeUndefined();
			});
		});

		it("잘못된 시간 형식은 실패해야 한다", () => {
			const invalidTimes = ["24:00", "12:60", "99:99", "abc", "12", "12:"];

			invalidTimes.forEach((time) => {
				const result = validateTimeFormat(time);
				expect(result.isValid).toBe(false);
				expect(result.message).toBe("올바른 시간 형식(HH:mm)을 입력해주세요");
			});
		});

		it("경계값 테스트", () => {
			const boundaryTimes = [
				{ time: "00:00", expected: true },
				{ time: "23:59", expected: true },
				{ time: "24:00", expected: false },
				{ time: "12:60", expected: false },
			];

			boundaryTimes.forEach(({ time, expected }) => {
				const result = validateTimeFormat(time);
				expect(result.isValid).toBe(expected);
			});
		});
	});

	describe("종합 검증 테스트", () => {
		it("실제 사용 사례들을 테스트한다", () => {
			const testCases = [
				{
					data: {
						name: "김민수",
						birthDate: "1985-12-25",
						birthTime: "08:30",
						gender: "male",
					},
					expected: true,
				},
				{
					data: {
						name: "이영희",
						birthDate: "1992-02-29",
						birthTime: "15:45",
						gender: "female",
					},
					expected: true, // 1992년은 윤년
				},
				{
					data: {
						name: "박철수",
						birthDate: "1993-02-29",
						birthTime: "20:15",
						gender: "male",
					},
					expected: false, // 1993년은 평년이므로 2월 29일은 존재하지 않음
				},
				{
					data: {
						name: "John Doe",
						birthDate: "1988-07-04",
						birthTime: "12:00",
						gender: "male",
					},
					expected: true, // 영문 이름
				},
				{
					data: {
						name: "홍 길동",
						birthDate: "1975-01-01",
						birthTime: "00:00",
						gender: "male",
					},
					expected: true, // 공백 포함 이름
				},
			];

			testCases.forEach(({ data, expected }, index) => {
				const result = validateSajuData(data);
				expect(result.success).toBe(expected);
			});
		});
	});
});
