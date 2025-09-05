import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import Home from '@/app/page'
import InputPage from '@/app/input/page'

// Mock next/navigation
const mockPush = jest.fn()
const mockUseRouter = jest.fn(() => ({
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock 사주 계산
jest.mock('@/lib/saju/calculator', () => ({
  calculateSaju: jest.fn().mockReturnValue({
    basic: {
      name: '테스트',
      birthInfo: {
        year: '갑자년',
        month: '을축월', 
        day: '병인일',
        time: '정묘시'
      },
      pillars: {
        year: { heavenly: '갑', earthly: '자', element: '목', ganJi: '갑자' },
        month: { heavenly: '을', earthly: '축', element: '목', ganJi: '을축' },
        day: { heavenly: '병', earthly: '인', element: '화', ganJi: '병인' },
        time: { heavenly: '정', earthly: '묘', element: '화', ganJi: '정묘' }
      }
    },
    elements: {
      wood: { score: 30, description: '창의성과 성장력' },
      fire: { score: 25, description: '열정과 활동력' },
      earth: { score: 20, description: '안정성과 신뢰감' },
      metal: { score: 15, description: '논리성과 결단력' },
      water: { score: 10, description: '지혜와 적응력' }
    },
    interpretation: {
      personality: ['창의적이고 활동적인 성격입니다.'],
      strengths: ['리더십', '창의력'],
      challenges: ['성급함', '완벽주의'],
      summary: '목 기운이 강한 사주입니다.'
    },
    compatibility: {
      favorable: ['정유일', '무인일'],
      unfavorable: ['신묘일', '임신일']
    }
  }),
  validateSajuInput: jest.fn().mockReturnValue({
    isValid: true,
    errors: []
  })
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('페이지 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 세션 스토리지 초기화
    window.sessionStorage.clear()
  })

  describe('홈페이지', () => {
    it('홈페이지가 정상 렌더링되어야 한다', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      expect(screen.getByText('개-사주')).toBeInTheDocument()
      expect(screen.getByText('전통 사주를 현대적이고 감성적인 UI로')).toBeInTheDocument()
      expect(screen.getByText('사주 보기 시작')).toBeInTheDocument()
      expect(screen.getByText('결과 예시 보기')).toBeInTheDocument()
    })

    it('오늘의 운세 위젯이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      expect(screen.getByText('오늘의 키워드')).toBeInTheDocument()
      expect(screen.getByText('새로운 시작')).toBeInTheDocument()
      expect(screen.getByText('88점')).toBeInTheDocument()
    })

    it('주요 기능 소개 섹션이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      expect(screen.getByText('개-사주의 특별함')).toBeInTheDocument()
      expect(screen.getByText('간편한 입력')).toBeInTheDocument()
      expect(screen.getByText('시각적 분석')).toBeInTheDocument()
      expect(screen.getByText('SNS 공유')).toBeInTheDocument()
    })

    it('네비게이션 링크들이 작동해야 한다', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      const startButton = screen.getByText('사주 보기 시작')
      expect(startButton.closest('a')).toHaveAttribute('href', '/input')
      
      const exampleButton = screen.getByText('결과 예시 보기')
      expect(exampleButton.closest('a')).toHaveAttribute('href', '/result')
    })
  })

  describe('입력 페이지', () => {
    it('입력 페이지가 정상 렌더링되어야 한다', () => {
      render(
        <TestWrapper>
          <InputPage />
        </TestWrapper>
      )
      
      expect(screen.getByText('사주 정보 입력')).toBeInTheDocument()
      expect(screen.getByText('정확한 생년월일과 시간을 입력해 주세요')).toBeInTheDocument()
      expect(screen.getByLabelText('이름 *')).toBeInTheDocument()
      expect(screen.getByText('성별')).toBeInTheDocument()
      expect(screen.getByLabelText('생년월일 *')).toBeInTheDocument()
      expect(screen.getByText('출생 시간 *')).toBeInTheDocument()
    })

    it('폼 입력과 검증이 작동해야 한다', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <InputPage />
        </TestWrapper>
      )
      
      // 이름 입력
      const nameInput = screen.getByLabelText('이름 *')
      await user.type(nameInput, '홍길동')
      expect(nameInput).toHaveValue('홍길동')
      
      // 날짜 입력
      const dateInput = screen.getByLabelText('생년월일 *')
      await user.type(dateInput, '1990-05-15')
      expect(dateInput).toHaveValue('1990-05-15')
    })

    it('필수 필드가 비어있으면 에러 메시지가 표시되어야 한다', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <InputPage />
        </TestWrapper>
      )
      
      const submitButton = screen.getByText('사주 풀이 보기')
      await user.click(submitButton)
      
      // 에러 메시지들이 표시되는지 확인
      await waitFor(() => {
        expect(screen.getByText('이름을 입력해주세요')).toBeInTheDocument()
      })
    })

    it('유효한 데이터 입력 후 제출하면 결과 페이지로 이동해야 한다', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <InputPage />
        </TestWrapper>
      )
      
      // 모든 필드 입력
      await user.type(screen.getByLabelText('이름 *'), '홍길동')
      await user.type(screen.getByLabelText('생년월일 *'), '1990-05-15')
      
      // 성별 선택
      const genderSelect = screen.getByText('성별을 선택해 주세요')
      await user.click(genderSelect)
      await user.click(screen.getByText('남성'))
      
      // 시간 선택
      const timeSelect = screen.getByText('시간을 선택해 주세요')
      await user.click(timeSelect)
      await user.click(screen.getByText('14:30'))
      
      // 제출
      const submitButton = screen.getByText('사주 풀이 보기')
      await user.click(submitButton)
      
      // 로딩 상태 확인
      await waitFor(() => {
        expect(screen.getByText('사주 계산 중...')).toBeInTheDocument()
      })
      
      // 라우터 푸시가 호출되었는지 확인
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/result')
      })
    })

    it('시간 옵션들이 올바르게 생성되어야 한다', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <InputPage />
        </TestWrapper>
      )
      
      const timeSelect = screen.getByText('시간을 선택해 주세요')
      await user.click(timeSelect)
      
      // 일부 시간 옵션들이 있는지 확인
      expect(screen.getByText('00:00')).toBeInTheDocument()
      expect(screen.getByText('12:30')).toBeInTheDocument()
      expect(screen.getByText('23:30')).toBeInTheDocument()
    })

    it('참고사항이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <InputPage />
        </TestWrapper>
      )
      
      expect(screen.getByText('📝 입력 시 참고사항')).toBeInTheDocument()
      expect(screen.getByText('생년월일은 양력을 기준으로 입력해 주세요')).toBeInTheDocument()
      expect(screen.getByText('출생 시간이 정확할수록 더 정밀한 분석이 가능합니다')).toBeInTheDocument()
    })
  })

  describe('페이지 간 데이터 흐름', () => {
    it('세션 스토리지를 통한 데이터 전달이 작동해야 한다', async () => {
      const user = userEvent.setup()
      
      // 세션 스토리지 모킹
      const mockSessionStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      }
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
      })
      
      render(
        <TestWrapper>
          <InputPage />
        </TestWrapper>
      )
      
      // 폼 작성 및 제출
      await user.type(screen.getByLabelText('이름 *'), '테스트')
      await user.type(screen.getByLabelText('생년월일 *'), '1990-01-01')
      
      const genderSelect = screen.getByText('성별을 선택해 주세요')
      await user.click(genderSelect)
      await user.click(screen.getByText('남성'))
      
      const timeSelect = screen.getByText('시간을 선택해 주세요')
      await user.click(timeSelect)
      await user.click(screen.getByText('12:00'))
      
      const submitButton = screen.getByText('사주 풀이 보기')
      await user.click(submitButton)
      
      // 세션 스토리지에 데이터가 저장되었는지 확인
      await waitFor(() => {
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'sajuResult',
          expect.any(String)
        )
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'sajuInput',
          expect.any(String)
        )
      })
    })
  })

  describe('에러 처리', () => {
    it('사주 계산 실패 시 에러 메시지가 표시되어야 한다', async () => {
      // 사주 계산을 실패하도록 모킹
      const { calculateSaju } = require('@/lib/saju/calculator')
      calculateSaju.mockImplementationOnce(() => {
        throw new Error('계산 오류')
      })
      
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <InputPage />
        </TestWrapper>
      )
      
      // 폼 작성 및 제출
      await user.type(screen.getByLabelText('이름 *'), '테스트')
      await user.type(screen.getByLabelText('생년월일 *'), '1990-01-01')
      
      const genderSelect = screen.getByText('성별을 선택해 주세요')
      await user.click(genderSelect)
      await user.click(screen.getByText('남성'))
      
      const timeSelect = screen.getByText('시간을 선택해 주세요')
      await user.click(timeSelect)
      await user.click(screen.getByText('12:00'))
      
      const submitButton = screen.getByText('사주 풀이 보기')
      await user.click(submitButton)
      
      // 에러 메시지가 표시되는지 확인
      await waitFor(() => {
        expect(screen.getByText(/계산 오류/)).toBeInTheDocument()
      })
    })
  })

  describe('반응형 디자인', () => {
    it('모바일 뷰포트에서도 정상 작동해야 한다', () => {
      // 모바일 크기로 윈도우 크기 변경
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      // 모바일에서도 주요 요소들이 표시되는지 확인
      expect(screen.getByText('개-사주')).toBeInTheDocument()
      expect(screen.getByText('사주 보기 시작')).toBeInTheDocument()
    })
  })
})
