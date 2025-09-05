"use client";

import { Calendar, Sparkles } from "lucide-react";
import SajuCard from "./SajuCard";
import SajuDisplay from "./SajuDisplay";
import ElementsDisplay from "./ElementsDisplay";
import FortunePeriodsDisplay from "./FortunePeriodsDisplay";

interface TaskResultProps {
	sajuData?: {
		displayDate: string;
		gender: string;
		age: number;
		pillars: Array<{
			name: string;
			stem: string;
			branch: string;
		}>;
		elements: Array<{
			name: string;
			score: number;
			color: string;
		}>;
		fortunePeriods?: Array<{
			period: string;
			description: string;
		}>;
	};
}

export default function TaskResult({ sajuData }: TaskResultProps) {
	if (!sajuData) {
		return (
			<div className="flex flex-col items-center justify-center py-24 space-y-6">
				<div className="relative">
					<div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
						<Calendar className="w-10 h-10 text-primary" />
					</div>
					<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-30"></div>
				</div>
				<div className="text-center space-y-3">
					<h3 className="text-2xl font-bold font-serif">사주 정보를 입력해주세요</h3>
					<p className="text-muted-foreground max-w-md mx-auto">
						생년월일과 시간을 입력하시면 상세한 사주 분석 결과를 확인하실 수 있습니다
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="text-center space-y-4">
				<div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl backdrop-blur-sm">
					<Sparkles className="w-6 h-6 text-primary" />
					<h2 className="text-2xl font-bold font-serif gradient-text">사주 풀이 결과</h2>
				</div>
				<p className="text-muted-foreground text-lg">
					{sajuData.displayDate} 출생자의 전문 사주 분석입니다
				</p>
			</div>

			<div className="grid gap-8 lg:grid-cols-2">
				<SajuCard title="기본 정보" variant="data">
					<div className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div className="text-center p-3 bg-muted/30 rounded-xl">
								<div className="text-xs text-muted-foreground mb-1">생년월일</div>
								<div className="text-sm font-medium">{sajuData.displayDate}</div>
							</div>
							<div className="text-center p-3 bg-muted/30 rounded-xl">
								<div className="text-xs text-muted-foreground mb-1">성별</div>
								<div className="text-sm font-medium">
									{sajuData.gender === "남성" ? "남자" : "여자"}
								</div>
							</div>
							<div className="text-center p-3 bg-muted/30 rounded-xl">
								<div className="text-xs text-muted-foreground mb-1">나이</div>
								<div className="text-sm font-medium">{sajuData.age}세</div>
							</div>
						</div>
					</div>
				</SajuCard>

				<SajuCard title="사주팔자" variant="data">
					<SajuDisplay pillars={sajuData.pillars} />
				</SajuCard>

				<SajuCard title="오행 분석" variant="interpretation" className="lg:col-span-2">
					<ElementsDisplay elements={sajuData.elements} />
				</SajuCard>

				{sajuData.fortunePeriods && sajuData.fortunePeriods.length > 0 && (
					<SajuCard
						title="대운"
						subtitle="10년 주기 운세"
						variant="data"
						className="lg:col-span-2"
					>
						<FortunePeriodsDisplay periods={sajuData.fortunePeriods} />
					</SajuCard>
				)}
			</div>
		</div>
	);
}
