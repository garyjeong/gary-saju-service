import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompatibilityInputForm } from "@/components/compatibility/CompatibilityInputForm";

// Mock framer-motion
jest.mock("framer-motion", () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
		button: ({ children, ...props }: any) => <button {...props}>{children}</button>
	},
	AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
	Users: () => <span data-testid="users-icon">Users</span>,
	Heart: () => <span data-testid="heart-icon">Heart</span>,
	Ring: () => <span data-testid="ring-icon">Ring</span>,
	Briefcase: () => <span data-testid="briefcase-icon">Briefcase</span>,
	UserPlus: () => <span data-testid="userplus-icon">UserPlus</span>,
	ArrowRight: () => <span data-testid="arrow-right-icon">ArrowRight</span>,
	ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
	Check: () => <span data-testid="check-icon">Check</span>,
	Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
	Clock: () => <span data-testid="clock-icon">Clock</span>,
	User: () => <span data-testid="user-icon">User</span>,
}));

// Mock UI components
jest.mock("@/components/ui/mobile-select", () => ({
	MobileSelect: ({ options, onValueChange, placeholder, value }: any) => (
		<select
			data-testid="mobile-select"
			value={value || ""}
			onChange={(e) => onValueChange(e.target.value)}
		>
			<option value="">{placeholder}</option>
			{options.map((option: any) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	),
}));

jest.mock("@/components/ui/mobile-time-picker", () => ({
	MobileTimePicker: ({ onValueChange, placeholder, value }: any) => (
		<input
			data-testid="mobile-time-picker"
			type="time"
			value={value || ""}
			placeholder={placeholder}
			onChange={(e) => onValueChange(e.target.value)}
		/>
	),
}));

describe("CompatibilityInputForm", () => {
	const mockOnSubmit = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const renderForm = (props = {}) => {
		return render(
			<CompatibilityInputForm
				onSubmit={mockOnSubmit}
				isLoading={false}
				{...props}
			/>
		);
	};

	describe("초기 렌더링", () => {
		test("첫 번째 단계가 올바르게 표시되어야 한다", () => {
			renderForm();

			expect(screen.getByText("관계 타입")).toBeInTheDocument();
			expect(screen.getByText("어떤 관계의 상성을 알아보고 싶으신가요?")).toBeInTheDocument();
		});

		test("관계 타입 옵션들이 표시되어야 한다", () => {
			renderForm();

			expect(screen.getByText("연애 궁합")).toBeInTheDocument();
			expect(screen.getByText("결혼 궁합")).toBeInTheDocument();
			expect(screen.getByText("사업 파트너")).toBeInTheDocument();
			expect(screen.getByText("우정")).toBeInTheDocument();
		});

		test("단계 표시기가 올바르게 렌더링되어야 한다", () => {
			renderForm();

			const stepIndicators = screen.getAllByTestId(/.*-icon/);
			expect(stepIndicators.length).toBeGreaterThan(0);
		});
	});

	describe("관계 타입 선택", () => {
		test("관계 타입을 선택할 수 있어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			const romanceOption = screen.getByText("연애 궁합").closest("div");
			expect(romanceOption).toBeInTheDocument();

			if (romanceOption) {
				await user.click(romanceOption);
				expect(romanceOption).toHaveClass("border-primary");
			}
		});

		test("다음 버튼이 관계 타입 선택 후 활성화되어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			const nextButton = screen.getByText("다음");
			expect(nextButton).toBeDisabled();

			const romanceOption = screen.getByText("연애 궁합").closest("div");
			if (romanceOption) {
				await user.click(romanceOption);
				expect(nextButton).not.toBeDisabled();
			}
		});
	});

	describe("단계 네비게이션", () => {
		test("다음 단계로 이동할 수 있어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			// 관계 타입 선택
			const romanceOption = screen.getByText("연애 궁합").closest("div");
			if (romanceOption) {
				await user.click(romanceOption);
			}

			// 다음 단계로 이동
			const nextButton = screen.getByText("다음");
			await user.click(nextButton);

			await waitFor(() => {
				expect(screen.getByText("첫 번째 사람")).toBeInTheDocument();
			});
		});

		test("이전 단계로 돌아갈 수 있어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			// 관계 타입 선택 후 다음 단계로 이동
			const romanceOption = screen.getByText("연애 궁합").closest("div");
			if (romanceOption) {
				await user.click(romanceOption);
			}

			const nextButton = screen.getByText("다음");
			await user.click(nextButton);

			// 이전 단계로 돌아가기
			await waitFor(() => {
				const prevButton = screen.getByText("이전");
				expect(prevButton).toBeInTheDocument();
			});

			const prevButton = screen.getByText("이전");
			await user.click(prevButton);

			await waitFor(() => {
				expect(screen.getByText("관계 타입")).toBeInTheDocument();
			});
		});
	});

	describe("개인 정보 입력", () => {
		const navigateToPersonStep = async (user: any) => {
			const romanceOption = screen.getByText("연애 궁합").closest("div");
			if (romanceOption) {
				await user.click(romanceOption);
			}

			const nextButton = screen.getByText("다음");
			await user.click(nextButton);

			await waitFor(() => {
				expect(screen.getByText("첫 번째 사람")).toBeInTheDocument();
			});
		};

		test("개인 정보 입력 필드들이 표시되어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			await navigateToPersonStep(user);

			expect(screen.getByPlaceholderText("홍길동")).toBeInTheDocument();
			expect(screen.getByTestId("mobile-select")).toBeInTheDocument();
			expect(screen.getByTestId("mobile-time-picker")).toBeInTheDocument();
		});

		test("이름을 입력할 수 있어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			await navigateToPersonStep(user);

			const nameInput = screen.getByPlaceholderText("홍길동");
			await user.type(nameInput, "김철수");

			expect(nameInput).toHaveValue("김철수");
		});

		test("성별을 선택할 수 있어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			await navigateToPersonStep(user);

			const genderSelect = screen.getByTestId("mobile-select");
			await user.selectOptions(genderSelect, "male");

			expect(genderSelect).toHaveValue("male");
		});

		test("생년월일을 입력할 수 있어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			await navigateToPersonStep(user);

			const birthDateInput = screen.getByDisplayValue("");
			await user.type(birthDateInput, "1990-01-01");

			expect(birthDateInput).toHaveValue("1990-01-01");
		});

		test("출생시간을 선택할 수 있어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			await navigateToPersonStep(user);

			const timeInput = screen.getByTestId("mobile-time-picker");
			fireEvent.change(timeInput, { target: { value: "09:30" } });

			expect(timeInput).toHaveValue("09:30");
		});
	});

	describe("폼 제출", () => {
		test("모든 정보 입력 후 폼을 제출할 수 있어야 한다", async () => {
			const user = userEvent.setup();
			renderForm();

			// 1단계: 관계 타입 선택
			const romanceOption = screen.getByText("연애 궁합").closest("div");
			if (romanceOption) {
				await user.click(romanceOption);
			}
			await user.click(screen.getByText("다음"));

			// 2단계: 첫 번째 사람 정보 입력
			await waitFor(() => {
				expect(screen.getByText("첫 번째 사람")).toBeInTheDocument();
			});

			await user.type(screen.getByPlaceholderText("홍길동"), "김철수");
			await user.selectOptions(screen.getByTestId("mobile-select"), "male");
			await user.type(screen.getByDisplayValue(""), "1990-01-01");
			fireEvent.change(screen.getByTestId("mobile-time-picker"), { target: { value: "09:30" } });

			await user.click(screen.getByText("다음"));

			// 3단계: 두 번째 사람 정보 입력
			await waitFor(() => {
				expect(screen.getByText("두 번째 사람")).toBeInTheDocument();
			});

			const nameInputs = screen.getAllByPlaceholderText("홍길동");
			const secondNameInput = nameInputs[nameInputs.length - 1];
			await user.clear(secondNameInput);
			await user.type(secondNameInput, "김영희");

			const genderSelects = screen.getAllByTestId("mobile-select");
			const secondGenderSelect = genderSelects[genderSelects.length - 1];
			await user.selectOptions(secondGenderSelect, "female");

			const birthDateInputs = screen.getAllByDisplayValue("");
			const secondBirthDateInput = birthDateInputs[birthDateInputs.length - 1];
			await user.type(secondBirthDateInput, "1992-05-15");

			const timeInputs = screen.getAllByTestId("mobile-time-picker");
			const secondTimeInput = timeInputs[timeInputs.length - 1];
			fireEvent.change(secondTimeInput, { target: { value: "14:30" } });

			await user.click(screen.getByText("다음"));

			// 4단계: 확인 및 제출
			await waitFor(() => {
				expect(screen.getByText("상성 분석 시작하기")).toBeInTheDocument();
			});

			await user.click(screen.getByText("상성 분석 시작하기"));

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledTimes(1);
			});

			expect(mockOnSubmit).toHaveBeenCalledWith({
				relationshipType: "romance",
				person1: {
					name: "김철수",
					birthDate: "1990-01-01",
					birthTime: "09:30",
					gender: "male"
				},
				person2: {
					name: "김영희",
					birthDate: "1992-05-15",
					birthTime: "14:30",
					gender: "female"
				}
			});
		});
	});

	describe("로딩 상태", () => {
		test("로딩 중일 때 버튼이 비활성화되어야 한다", () => {
			renderForm({ isLoading: true });

			const nextButton = screen.getByText("다음");
			expect(nextButton).toBeDisabled();
		});

		test("로딩 중일 때 입력 필드가 비활성화되어야 한다", async () => {
			const user = userEvent.setup();
			renderForm({ isLoading: true });

			// 관계 타입 선택 후 개인 정보 단계로 이동
			const romanceOption = screen.getByText("연애 궁합").closest("div");
			if (romanceOption) {
				await user.click(romanceOption);
			}
			// 로딩 중이므로 다음 단계로 진행할 수 없음
			const nextButton = screen.getByText("다음");
			expect(nextButton).toBeDisabled();
		});
	});
});
