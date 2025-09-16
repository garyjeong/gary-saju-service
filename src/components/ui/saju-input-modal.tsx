"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedLoading } from "@/components/ui/enhanced-loading";
import { calculateSaju } from "@/lib/saju/calculator";
import { validateSajuData } from "@/lib/saju/validation";
import { X, Calendar, Clock, ArrowLeft, ArrowRight, User, Loader2, Smartphone, AlertCircle, Brain, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SajuInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 위저드 스텝 타입
type WizardStep = "basic" | "birth-date" | "birth-time" | "ai-preferences" | "confirm";

// 폼 데이터 타입
interface FormData {
  name: string;
  gender: "male" | "female" | "";
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  // AI 개인화 설정
  tone: "formal" | "casual" | "poetic" | "";
  interests: string[];
}

export default function SajuInputModal({ isOpen, onClose }: SajuInputModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>("basic");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    gender: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    birthHour: "",
    birthMinute: "",
    tone: "",
    interests: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // 성별 옵션
  const genderOptions = [
    { value: "male", label: "남성" },
    { value: "female", label: "여성" },
  ];

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      name: "",
      gender: "",
      birthYear: "",
      birthMonth: "",
      birthDay: "",
      birthHour: "",
      birthMinute: "",
      tone: "",
      interests: [],
    });
    setCurrentStep("basic");
    setErrors({});
    setIsCalculating(false);
    setLoadingStep(0);
    setProgress(0);
  };

  // 년도 옵션 (1900-2024)
  const yearOptions = Array.from({ length: 125 }, (_, i) => {
    const year = 2024 - i;
    return { value: year.toString(), label: `${year}년` };
  });

  // 월 옵션 (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: `${month}월` };
  });

  // 일 옵션 (동적으로 계산)
  const getDayOptions = () => {
    if (!formData.birthYear || !formData.birthMonth) {
      return Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        return { value: day.toString().padStart(2, '0'), label: `${day}일` };
      });
    }
    
    const year = parseInt(formData.birthYear);
    const month = parseInt(formData.birthMonth);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { value: day.toString().padStart(2, '0'), label: `${day}일` };
    });
  };

  // 시간 옵션 (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    return { value: i.toString().padStart(2, '0'), label: `${i}시` };
  });

  // 분 옵션 (00, 30)
  const minuteOptions = [
    { value: "00", label: "00분" },
    { value: "30", label: "30분" },
  ];

  // 해석 톤 옵션
  const toneOptions = [
    { value: "casual", label: "편안한 톤", description: "친근하고 부담 없는 대화체" },
    { value: "formal", label: "정중한 톤", description: "정중하고 격식 있는 어투" },
    { value: "poetic", label: "시적인 톤", description: "감성적이고 아름다운 표현" },
  ];

  // 관심사 옵션
  const interestOptions = [
    { value: "career", label: "직업운", icon: "💼" },
    { value: "love", label: "연애운", icon: "💕" },
    { value: "health", label: "건강운", icon: "🌿" },
    { value: "money", label: "재물운", icon: "💰" },
    { value: "family", label: "가족운", icon: "👨‍👩‍👧‍👦" },
    { value: "study", label: "학업운", icon: "📚" },
  ];

  // 모달 닫기
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 다음 스텝으로 이동
  const handleNext = () => {
    const stepValidation = {
      basic: () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요";
        if (!formData.gender) newErrors.gender = "성별을 선택해주세요";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
      "birth-date": () => {
        const newErrors: Record<string, string> = {};
        if (!formData.birthYear) newErrors.birthYear = "출생년도를 선택해주세요";
        if (!formData.birthMonth) newErrors.birthMonth = "출생월을 선택해주세요";
        if (!formData.birthDay) newErrors.birthDay = "출생일을 선택해주세요";
        
        // 유효한 날짜인지 검증
        if (formData.birthYear && formData.birthMonth && formData.birthDay) {
          const year = parseInt(formData.birthYear);
          const month = parseInt(formData.birthMonth);
          const day = parseInt(formData.birthDay);
          const date = new Date(year, month - 1, day);
          
          if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            newErrors.birthDay = "존재하지 않는 날짜입니다";
          }
          
          if (date > new Date()) {
            newErrors.birthDay = "미래 날짜는 입력할 수 없습니다";
          }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
      "birth-time": () => {
        const newErrors: Record<string, string> = {};
        if (!formData.birthHour) newErrors.birthHour = "출생시간을 선택해주세요";
        if (!formData.birthMinute) newErrors.birthMinute = "출생분을 선택해주세요";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
      "ai-preferences": () => {
        const newErrors: Record<string, string> = {};
        if (!formData.tone) newErrors.tone = "해석 스타일을 선택해주세요";
        if (formData.interests.length === 0) newErrors.interests = "관심사를 최소 1개 이상 선택해주세요";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
    };

    const validator = stepValidation[currentStep as keyof typeof stepValidation];
    if (validator && validator()) {
      const stepOrder: WizardStep[] = ["basic", "birth-date", "birth-time", "ai-preferences", "confirm"];
      const currentIndex = stepOrder.indexOf(currentStep);
      if (currentIndex < stepOrder.length - 1) {
        setCurrentStep(stepOrder[currentIndex + 1]);
      }
    }
  };

  // 이전 스텝으로 이동
  const handlePrevious = () => {
    const stepOrder: WizardStep[] = ["basic", "birth-date", "birth-time", "ai-preferences", "confirm"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // 사주 계산 및 결과 페이지로 이동
  const handleSubmit = async () => {
    try {
      setIsCalculating(true);
      setLoadingStep(0);
      setProgress(0);

      // 분리된 필드들을 통합된 형태로 변환
      const birthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
      const birthTime = `${formData.birthHour}:${formData.birthMinute}`;

      // 검증
      const validationResult = validateSajuData({
        name: formData.name,
        birthDate: birthDate,
        birthTime: birthTime,
        gender: formData.gender as "male" | "female",
      });

      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach(err => {
          errors[err.path[0] as string] = err.message;
        });
        setErrors(errors);
        setIsCalculating(false);
        return;
      }

      // 진행률 업데이트 (시뮬레이션)
      const progressSteps = [
        { step: 0, progress: 20, delay: 500 },
        { step: 1, progress: 50, delay: 1000 },
        { step: 2, progress: 80, delay: 1000 },
        { step: 3, progress: 100, delay: 500 },
      ];

      for (const { step, progress: prog, delay } of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        setLoadingStep(step);
        setProgress(prog);
      }

      // 사주 계산
      const sajuResult = await calculateSaju({
        name: formData.name,
        birthDate: birthDate,
        birthTime: birthTime,
        gender: formData.gender as "male" | "female",
      });

      // 세션 스토리지에 결과 저장
      sessionStorage.setItem("sajuResult", JSON.stringify(sajuResult));
      sessionStorage.setItem("inputData", JSON.stringify(formData));
      
      // AI 개인화 설정 저장
      const aiProfile = {
        age: formData.birthYear ? new Date().getFullYear() - parseInt(formData.birthYear) : undefined,
        gender: formData.gender,
        tone: formData.tone,
        interests: formData.interests
      };
      sessionStorage.setItem("aiProfile", JSON.stringify(aiProfile));

      // 모달 닫기 및 결과 페이지로 이동
      handleClose();
      router.push("/result");
    } catch (error) {
      console.error("사주 계산 오류:", error);
      setErrors({ submit: "사주 계산 중 오류가 발생했습니다. 다시 시도해주세요." });
      setIsCalculating(false);
    }
  };

  // 로딩 상태일 때
  if (isCalculating) {
    const loadingSteps = ['parsing', 'calculating', 'elements', 'interpreting', 'finalizing'];
    const currentStepId = loadingSteps[Math.min(loadingStep, loadingSteps.length - 1)];
    
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-background rounded-2xl p-8 max-w-2xl w-full mx-4">
              <EnhancedLoading
                currentStep={currentStepId}
                progress={progress}
                variant="card"
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // 스텝별 컨텐츠 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-serif font-bold mb-2">기본 정보</h3>
              <p className="text-muted-foreground">이름과 성별을 알려주세요</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="w-4 h-4" />
                  이름 *
                </Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <User className="w-4 h-4" />
                  성별 *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: option.value as "male" | "female" })}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-200 text-center",
                        formData.gender === option.value
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:border-primary/50 hover:bg-primary/5",
                        errors.gender && "border-destructive"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {formData.gender === option.value && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "birth-date":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-serif font-bold mb-2">생년월일</h3>
              <p className="text-muted-foreground">언제 태어나셨나요?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Calendar className="w-4 h-4" />
                  생년월일 *
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {/* 년도 선택 */}
                  <div>
                    <Input
                      type="text"
                      list="year-options"
                      value={formData.birthYear}
                      onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                      placeholder="년도 입력"
                      className={cn(errors.birthYear && "border-destructive")}
                    />
                    <datalist id="year-options">
                      {yearOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </datalist>
                    {errors.birthYear && (
                      <p className="text-destructive text-xs mt-1">{errors.birthYear}</p>
                    )}
                  </div>

                  {/* 월 선택 */}
                  <div>
                    <Input
                      type="text"
                      list="month-options"
                      value={formData.birthMonth}
                      onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                      placeholder="월 입력"
                      className={cn(errors.birthMonth && "border-destructive")}
                    />
                    <datalist id="month-options">
                      {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </datalist>
                    {errors.birthMonth && (
                      <p className="text-destructive text-xs mt-1">{errors.birthMonth}</p>
                    )}
                  </div>

                  {/* 일 선택 */}
                  <div>
                    <Input
                      type="text"
                      list="day-options"
                      value={formData.birthDay}
                      onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                      placeholder="일 입력"
                      className={cn(errors.birthDay && "border-destructive")}
                    />
                    <datalist id="day-options">
                      {getDayOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </datalist>
                    {errors.birthDay && (
                      <p className="text-destructive text-xs mt-1">{errors.birthDay}</p>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-3">양력 기준으로 선택해 주세요</p>
              </div>
            </div>
          </div>
        );

      case "birth-time":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-serif font-bold mb-2">출생시간</h3>
              <p className="text-muted-foreground">몇 시에 태어나셨나요?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Clock className="w-4 h-4" />
                  출생시간 *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* 시간 선택 */}
                  <div>
                    <Select
                      value={formData.birthHour}
                      onValueChange={(value) => setFormData({ ...formData, birthHour: value })}
                    >
                      <SelectTrigger className={cn("h-12", errors.birthHour && "border-destructive")}>
                        <SelectValue placeholder="시" />
                      </SelectTrigger>
                      <SelectContent>
                        {hourOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.birthHour && (
                      <p className="text-destructive text-xs mt-1">{errors.birthHour}</p>
                    )}
                  </div>

                  {/* 분 선택 */}
                  <div>
                    <Select
                      value={formData.birthMinute}
                      onValueChange={(value) => setFormData({ ...formData, birthMinute: value })}
                    >
                      <SelectTrigger className={cn("h-12", errors.birthMinute && "border-destructive")}>
                        <SelectValue placeholder="분" />
                      </SelectTrigger>
                      <SelectContent>
                        {minuteOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.birthMinute && (
                      <p className="text-destructive text-xs mt-1">{errors.birthMinute}</p>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-3">
                  정확한 시간을 모르시면 가장 가까운 시간으로 선택해 주세요
                </p>
              </div>
            </div>
          </div>
        );

      case "ai-preferences":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-serif font-bold mb-2">AI 개인화 설정</h3>
              <p className="text-muted-foreground">나에게 맞는 해석 스타일을 선택해 주세요</p>
            </div>
            
            <div className="space-y-6">
              {/* 해석 톤 선택 */}
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Sparkles className="w-4 h-4" />
                  해석 스타일 *
                </Label>
                <div className="grid gap-3">
                  {toneOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        formData.tone === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setFormData({ ...formData, tone: option.value as any })}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{option.label}</h4>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 transition-colors",
                          formData.tone === option.value
                            ? "bg-primary border-primary"
                            : "border-border"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
                {errors.tone && (
                  <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.tone}
                  </p>
                )}
              </div>

              {/* 관심사 선택 */}
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Star className="w-4 h-4" />
                  관심사 (최소 1개 이상) *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "p-3 rounded-xl border-2 cursor-pointer transition-all",
                        formData.interests.includes(option.value)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => {
                        const newInterests = formData.interests.includes(option.value)
                          ? formData.interests.filter(i => i !== option.value)
                          : [...formData.interests, option.value];
                        setFormData({ ...formData, interests: newInterests });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                        {formData.interests.includes(option.value) && (
                          <Check className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.interests && (
                  <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.interests}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-serif font-bold mb-2">정보 확인</h3>
              <p className="text-muted-foreground">입력한 정보를 확인해 주세요</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">이름</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">성별</span>
                  <span className="font-medium">
                    {genderOptions.find(option => option.value === formData.gender)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">생년월일</span>
                  <span className="font-medium">
                    {formData.birthYear}년 {formData.birthMonth}월 {formData.birthDay}일
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">출생시간</span>
                  <span className="font-medium">
                    {formData.birthHour}시 {formData.birthMinute}분
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">해석 스타일</span>
                  <span className="font-medium">
                    {toneOptions.find(option => option.value === formData.tone)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">관심사</span>
                  <span className="font-medium">
                    {formData.interests.map(interest => 
                      interestOptions.find(option => option.value === interest)?.label
                    ).join(", ")}
                  </span>
                </div>
              </div>
              
              {errors.submit && (
                <p className="text-destructive text-sm flex items-center gap-1 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            className="relative bg-background rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <Card className="border-none shadow-2xl">
              <CardContent className="p-8">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold">AI 사주 분석</h2>
                      <p className="text-muted-foreground">나만의 운명을 AI가 해석해 드립니다</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* 진행 표시기 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>진행률</span>
                    <span>{Math.round((["basic", "birth-date", "birth-time", "ai-preferences", "confirm"].indexOf(currentStep) + 1) / 5 * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(["basic", "birth-date", "birth-time", "ai-preferences", "confirm"].indexOf(currentStep) + 1) / 5 * 100}%` }}
                    />
                  </div>
                </div>

                {/* 스텝 컨텐츠 */}
                <div className="mb-8">
                  {renderStepContent()}
                </div>

                {/* 하단 버튼 */}
                <div className="flex gap-3">
                  {currentStep !== "basic" && (
                    <Button variant="outline" onClick={handlePrevious} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      이전
                    </Button>
                  )}
                  
                  <Button 
                    onClick={currentStep === "confirm" ? handleSubmit : handleNext} 
                    className="flex-1"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        분석 중...
                      </>
                    ) : currentStep === "confirm" ? (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        사주 분석 시작
                      </>
                    ) : (
                      <>
                        다음
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
