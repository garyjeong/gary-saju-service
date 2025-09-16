import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 🌟 한국 전통 한지 스타일 기본 레이아웃
          "flex h-12 w-full px-4 py-3 text-base font-medium",
          // 🌟 한지 배경과 테두리
          "bg-card text-card-foreground border-2 border-korea-white-500/20 rounded-xl",
          // 🌟 전통 그림자와 전환 효과 (안정적 호버)
          "shadow-sm hover:shadow-md hover:border-korea-yellow/30 transition-all duration-300",
          // 🌟 포커스 상태 - 전통 금색과 주홍색
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-korea-yellow/30",
          "focus-visible:border-korea-red/50 focus-visible:ring-offset-0",
          // 🌟 플레이스홀더 스타일
          "placeholder:text-foreground-muted placeholder:font-normal",
          // 🌟 파일 입력 스타일 (file input일 경우)
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // 🌟 비활성화 상태
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm",
          // 🌟 다크 모드 대응
          "dark:bg-card dark:border-korea-black-500/30 dark:hover:border-korea-yellow/30",
          className,
        )}
        ref={ref}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          fontSize: type === 'email' || type === 'tel' ? '16px' : undefined, // iOS zoom 방지
        }}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
