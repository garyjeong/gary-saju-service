"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SajuInputSchema, SajuInputType } from "@/lib/saju/validation";
import { calculateSaju } from "@/lib/saju/calculator";
import { Calendar, Clock, ArrowRight, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InputPage() {
	const router = useRouter();
	const [isCalculating, setIsCalculating] = useState(false);
	const [calculationError, setCalculationError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<SajuInputType>({
		resolver: zodResolver(SajuInputSchema),
		defaultValues: {
			name: "",
			birthDate: "",
			birthTime: "",
			gender: undefined,
		},
	});

	const watchedGender = watch("gender");

	const onSubmit = async (data: SajuInputType) => {
		setIsCalculating(true);
		setCalculationError(null);

		try {
			// 모든 필드가 입력되었는지 확인
			if (!data.name || !data.birthDate || !data.birthTime || !data.gender) {
				throw new Error("모든 필수 정보를 입력해주세요.");
			}

			// 실제 사주 계산 수행
			const result = calculateSaju({
				name: data.name,
				birthDate: data.birthDate,
				birthTime: data.birthTime,
				gender: data.gender,
			});
			
			// 결과를 세션 스토리지에 저장
			sessionStorage.setItem("sajuResult", JSON.stringify(result));
			sessionStorage.setItem("sajuInput", JSON.stringify(data));
			
			// 결과 페이지로 이동
			router.push("/result");
		} catch (error) {
			console.error("사주 계산 오류:", error);
			setCalculationError(
				error instanceof Error 
					? error.message 
					: "사주 계산 중 오류가 발생했습니다. 다시 시도해주세요."
			);
		} finally {
			setIsCalculating(false);
		}
	};

	const timeOptions = [];
	for (let hour = 0; hour < 24; hour++) {
		for (let minute = 0; minute < 60; minute += 30) {
			const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
			timeOptions.push(timeString);
		}
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					{/* 페이지 헤더 */}
					<div className="text-center space-y-4 mb-8">
						<h1 className="text-3xl font-serif font-bold text-foreground">
							사주 정보 입력
						</h1>
						<p className="text-lg text-muted-foreground">
							정확한 생년월일과 시간을 입력해 주세요
						</p>
					</div>

					{/* 입력 폼 */}
					<Card className="shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="w-5 h-5" />
								기본 정보
							</CardTitle>
						</CardHeader>
						<CardContent>
													<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* 에러 메시지 */}
							{calculationError && (
								<div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
									{calculationError}
								</div>
							)}

							{/* 이름 */}
							<div className="space-y-2">
								<Label htmlFor="name" className="text-sm font-medium">
									이름 *
								</Label>
								<Input
									id="name"
									type="text"
									placeholder="홍길동"
									{...register("name")}
									className="text-base"
									disabled={isCalculating}
								/>
								{errors.name && (
									<p className="text-sm text-destructive">{errors.name.message}</p>
								)}
							</div>

							{/* 성별 */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">성별</Label>
								<Select
									value={watchedGender}
									onValueChange={(value) => setValue("gender", value as "male" | "female")}
									disabled={isCalculating}
								>
									<SelectTrigger className="text-base">
										<SelectValue placeholder="성별을 선택해 주세요" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">남성</SelectItem>
										<SelectItem value="female">여성</SelectItem>
									</SelectContent>
								</Select>
								{errors.gender && (
									<p className="text-sm text-destructive">{errors.gender.message}</p>
								)}
							</div>

							{/* 생년월일 */}
							<div className="space-y-2">
								<Label htmlFor="birthDate" className="text-sm font-medium flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									생년월일 *
								</Label>
								<Input
									id="birthDate"
									type="date"
									{...register("birthDate")}
									className="text-base"
									max={new Date().toISOString().split("T")[0]}
									disabled={isCalculating}
								/>
								{errors.birthDate && (
									<p className="text-sm text-destructive">{errors.birthDate.message}</p>
								)}
								<p className="text-xs text-muted-foreground">
									양력 기준으로 입력해 주세요
								</p>
							</div>

							{/* 출생시간 */}
							<div className="space-y-2">
								<Label className="text-sm font-medium flex items-center gap-2">
									<Clock className="w-4 h-4" />
									출생 시간 *
								</Label>
								<Select
									value={watch("birthTime")}
									onValueChange={(value) => setValue("birthTime", value)}
									disabled={isCalculating}
								>
									<SelectTrigger className="text-base">
										<SelectValue placeholder="시간을 선택해 주세요" />
									</SelectTrigger>
									<SelectContent className="max-h-48">
										{timeOptions.map((time) => (
											<SelectItem key={time} value={time}>
												{time}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.birthTime && (
									<p className="text-sm text-destructive">{errors.birthTime.message}</p>
								)}
								<p className="text-xs text-muted-foreground">
									정확한 시간을 모르시면 가장 가까운 시간으로 선택해 주세요
								</p>
							</div>

							{/* 제출 버튼 */}
							<div className="pt-4">
								<Button
									type="submit"
									size="lg"
									className="w-full gap-2"
									disabled={isCalculating}
								>
									{isCalculating ? (
										<>
											<Loader2 className="w-5 h-5 animate-spin" />
											사주 계산 중...
										</>
									) : (
										<>
											사주 풀이 보기
											<ArrowRight className="w-5 h-5" />
										</>
									)}
								</Button>
							</div>
						</form>
						</CardContent>
					</Card>

					{/* 안내 사항 */}
					<Card className="mt-6 bg-secondary/30">
						<CardContent className="p-4">
							<h3 className="font-serif font-medium text-foreground mb-2">
								📝 입력 시 참고사항
							</h3>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• 생년월일은 양력을 기준으로 입력해 주세요</li>
								<li>• 출생 시간이 정확할수록 더 정밀한 분석이 가능합니다</li>
								<li>• 입력한 정보는 저장되지 않으며, 세션에서만 사용됩니다</li>
								<li>• 모든 서비스는 무료로 제공됩니다</li>
							</ul>
						</CardContent>
					</Card>

					{/* 네비게이션 */}
					<div className="flex justify-between items-center mt-8">
						<Button asChild variant="outline">
							<Link href="/">← 홈으로 돌아가기</Link>
						</Button>
						<Button asChild variant="ghost">
							<Link href="/result">결과 예시 보기 →</Link>
						</Button>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
