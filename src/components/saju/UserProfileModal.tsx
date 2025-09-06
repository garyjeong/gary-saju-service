"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, User, Heart, Briefcase, Home, Lightbulb, Palette, DollarSign, HeartHandshake, Sparkles } from "lucide-react";
import { UserProfile } from "@/hooks/useAIInterpretation";

interface UserProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (profile: UserProfile) => void;
	currentProfile?: UserProfile;
}

const interests = [
	{ id: "career", label: "직업/진로", icon: Briefcase, description: "커리어 발전, 직업적 성공" },
	{ id: "love", label: "연애/결혼", icon: Heart, description: "사랑, 결혼, 인연" },
	{ id: "family", label: "가족/육아", icon: Home, description: "가정, 자녀, 가족관계" },
	{ id: "money", label: "재정/투자", icon: DollarSign, description: "돈, 투자, 경제적 안정" },
	{ id: "health", label: "건강/웰빙", icon: HeartHandshake, description: "건강, 체력, 정신적 안정" },
	{ id: "growth", label: "자기계발", icon: Lightbulb, description: "학습, 성장, 역량 개발" },
	{ id: "creativity", label: "창의/예술", icon: Palette, description: "창작, 예술, 문화 활동" },
] as const;

const tones = [
	{ id: "casual", label: "친근한 말투", description: "편안하고 친구 같은 반말체", emoji: "😊" },
	{ id: "formal", label: "정중한 말투", description: "격식 있고 전문적인 존댓말", emoji: "🙏" },
	{ id: "poetic", label: "시적인 말투", description: "감성적이고 아름다운 문체", emoji: "🌸" },
] as const;

const ageRanges = [
	{ id: "10s", label: "10대", range: [15, 19], description: "꿈과 가능성이 가득한 시기" },
	{ id: "20s", label: "20대", range: [20, 29], description: "도전과 성장의 시기" },
	{ id: "30s", label: "30대", range: [30, 39], description: "안정과 발전의 시기" },
	{ id: "40s", label: "40대", range: [40, 49], description: "성숙과 지혜의 시기" },
	{ id: "50s", label: "50대 이상", range: [50, 99], description: "경험과 통찰의 시기" },
] as const;

export default function UserProfileModal({ isOpen, onClose, onSubmit, currentProfile }: UserProfileModalProps) {
	const [selectedAgeRange, setSelectedAgeRange] = useState<typeof ageRanges[number]["id"]>(
		currentProfile?.age ? 
			ageRanges.find(range => currentProfile.age! >= range.range[0] && currentProfile.age! <= range.range[1])?.id || "20s"
			: "20s"
	);
	const [selectedGender, setSelectedGender] = useState<UserProfile["gender"]>(currentProfile?.gender || "female");
	const [selectedInterests, setSelectedInterests] = useState<string[]>(currentProfile?.interests || ["career", "love"]);
	const [selectedTone, setSelectedTone] = useState<UserProfile["tone"]>(currentProfile?.tone || "casual");

	const handleInterestToggle = (interestId: string) => {
		setSelectedInterests(prev => {
			if (prev.includes(interestId)) {
				return prev.filter(id => id !== interestId);
			} else if (prev.length < 3) {
				return [...prev, interestId];
			}
			return prev;
		});
	};

	const handleSubmit = () => {
		const selectedRange = ageRanges.find(range => range.id === selectedAgeRange);
		const age = selectedRange ? Math.floor((selectedRange.range[0] + selectedRange.range[1]) / 2) : undefined;

		const profile: UserProfile = {
			age,
			gender: selectedGender,
			interests: selectedInterests as UserProfile["interests"],
			tone: selectedTone,
		};

		onSubmit(profile);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			
			{/* Modal */}
			<div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl border border-white/10">
				{/* Header */}
				<div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-white/10 p-6 rounded-t-3xl">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h2 className="text-2xl font-serif font-bold">AI 개인화 설정</h2>
								<p className="text-sm text-muted-foreground">더 정확한 해석을 위한 정보를 입력해주세요</p>
							</div>
						</div>
						<Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
							<X className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 space-y-8">
					{/* 연령대 선택 */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<User className="w-5 h-5 text-primary" />
							<h3 className="text-lg font-semibold">연령대</h3>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{ageRanges.map((range) => (
								<button
									key={range.id}
									onClick={() => setSelectedAgeRange(range.id)}
									className={cn(
										"p-4 rounded-2xl border-2 transition-all duration-300 text-left",
										selectedAgeRange === range.id
											? "border-primary bg-primary/10 scale-105"
											: "border-muted hover:border-primary/50 hover:bg-primary/5"
									)}
								>
									<div className="font-medium">{range.label}</div>
									<div className="text-xs text-muted-foreground mt-1">
										{range.description}
									</div>
								</button>
							))}
						</div>
					</div>

					{/* 성별 선택 */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<User className="w-5 h-5 text-primary" />
							<h3 className="text-lg font-semibold">성별</h3>
						</div>
						<div className="grid grid-cols-3 gap-3">
							{[
								{ id: "female", label: "여성", emoji: "👩" },
								{ id: "male", label: "남성", emoji: "👨" },
								{ id: "other", label: "기타", emoji: "🤝" },
							].map((gender) => (
								<button
									key={gender.id}
									onClick={() => setSelectedGender(gender.id as UserProfile["gender"])}
									className={cn(
										"p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-2",
										selectedGender === gender.id
											? "border-primary bg-primary/10 scale-105"
											: "border-muted hover:border-primary/50 hover:bg-primary/5"
									)}
								>
									<span className="text-xl">{gender.emoji}</span>
									<span className="font-medium">{gender.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* 관심사 선택 */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Heart className="w-5 h-5 text-primary" />
							<h3 className="text-lg font-semibold">주요 관심사</h3>
							<span className="text-sm text-muted-foreground">
								({selectedInterests.length}/3)
							</span>
						</div>
						<p className="text-sm text-muted-foreground">
							궁금한 분야를 최대 3개까지 선택해주세요
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{interests.map((interest) => {
								const Icon = interest.icon;
								const isSelected = selectedInterests.includes(interest.id);
								const isDisabled = !isSelected && selectedInterests.length >= 3;

								return (
									<button
										key={interest.id}
										onClick={() => handleInterestToggle(interest.id)}
										disabled={isDisabled}
										className={cn(
											"p-4 rounded-2xl border-2 transition-all duration-300 text-left",
											isSelected
												? "border-accent bg-accent/10 scale-105"
												: isDisabled
												? "border-muted bg-muted/5 opacity-50 cursor-not-allowed"
												: "border-muted hover:border-accent/50 hover:bg-accent/5"
										)}
									>
										<div className="flex items-start gap-3">
											<Icon className={cn(
												"w-5 h-5 mt-0.5",
												isSelected ? "text-accent" : "text-muted-foreground"
											)} />
											<div className="flex-1">
												<div className="font-medium">{interest.label}</div>
												<div className="text-xs text-muted-foreground mt-1">
													{interest.description}
												</div>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* 말투 선택 */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-primary" />
							<h3 className="text-lg font-semibold">해석 스타일</h3>
						</div>
						<div className="grid grid-cols-1 gap-3">
							{tones.map((tone) => (
								<button
									key={tone.id}
									onClick={() => setSelectedTone(tone.id)}
									className={cn(
										"p-4 rounded-2xl border-2 transition-all duration-300 text-left",
										selectedTone === tone.id
											? "border-accent bg-accent/10 scale-105"
											: "border-muted hover:border-accent/50 hover:bg-accent/5"
									)}
								>
									<div className="flex items-start gap-3">
										<span className="text-2xl">{tone.emoji}</span>
										<div className="flex-1">
											<div className="font-medium">{tone.label}</div>
											<div className="text-sm text-muted-foreground mt-1">
												{tone.description}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-white/10 p-6 rounded-b-3xl">
					<div className="flex gap-4">
						<Button
							variant="outline"
							onClick={onClose}
							className="flex-1 rounded-2xl py-3"
						>
							취소
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={selectedInterests.length === 0}
							className="flex-1 rounded-2xl py-3 gradient-button text-white"
						>
							<Sparkles className="w-4 h-4 mr-2" />
							AI 해석 시작
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
