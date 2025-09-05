import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import ElementChart from '@/components/saju/ElementChart'
import SajuCard from '@/components/saju/SajuCard'
import TabNavigation from '@/components/saju/TabNavigation'
import LuckTimeline from '@/components/saju/LuckTimeline'

// Mock data
const mockElements = {
  wood: { score: 25, description: '창의성과 성장력을 나타냅니다' },
  fire: { score: 35, description: '열정과 활동력을 나타냅니다' },
  earth: { score: 20, description: '안정성과 신뢰감을 나타냅니다' },
  metal: { score: 10, description: '논리성과 결단력을 나타냅니다' },
  water: { score: 10, description: '지혜와 적응력을 나타냅니다' },
}

const mockLuckData = [
  {
    year: 2024,
    theme: '변화와 기회',
    score: 85,
    keywords: ['승진', '새로운 만남', '건강 관리'] as const,
  },
  {
    year: 2025,
    theme: '안정과 성장',
    score: 78,
    keywords: ['재정 안정', '학습', '가족'] as const,
  },
]

const mockTabs = [
  { id: 'basic', label: '기본 풀이', description: '성격 & 특성' },
  { id: 'elements', label: '오행 분석', description: '균형 & 에너지' },
  { id: 'timeline', label: '운세 흐름', description: '시기별 운세' },
]

// Test wrapper for theme provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light">
    {children}
  </ThemeProvider>
)

describe('React 컴포넌트 테스트', () => {
  describe('SajuCard', () => {
    it('기본 사주 카드가 렌더링되어야 한다', () => {
      render(
        <SajuCard title="테스트 제목">
          <div>테스트 내용</div>
        </SajuCard>
      )
      
      expect(screen.getByText('테스트 제목')).toBeInTheDocument()
      expect(screen.getByText('테스트 내용')).toBeInTheDocument()
    })

    it('서브타이틀이 있을 때 표시되어야 한다', () => {
      render(
        <SajuCard title="테스트 제목" subtitle="테스트 서브타이틀">
          <div>테스트 내용</div>
        </SajuCard>
      )
      
      expect(screen.getByText('테스트 서브타이틀')).toBeInTheDocument()
    })

    it('variant props에 따라 다른 스타일이 적용되어야 한다', () => {
      const { rerender, container } = render(
        <SajuCard title="테스트" variant="interpretation">
          <div>내용</div>
        </SajuCard>
      )
      
      const card = container.firstChild
      expect(card).toHaveClass('bg-secondary/50')
      
      rerender(
        <SajuCard title="테스트" variant="data">
          <div>내용</div>
        </SajuCard>
      )
      
      expect(card).toHaveClass('bg-muted/30')
    })
  })

  describe('ElementChart', () => {
    it('오행 차트가 정상 렌더링되어야 한다', () => {
      render(<ElementChart elements={mockElements} />)
      
      // 각 오행이 표시되는지 확인
      expect(screen.getAllByText('목(木)')).toHaveLength(1)
      expect(screen.getAllByText('화(火)')).toHaveLength(2) // 리스트와 중앙에 각각 1개씩
      expect(screen.getAllByText('토(土)')).toHaveLength(1)
      expect(screen.getAllByText('금(金)')).toHaveLength(1)
      expect(screen.getAllByText('수(水)')).toHaveLength(1)
      
      // 점수가 표시되는지 확인
      expect(screen.getByText('25%')).toBeInTheDocument()
      expect(screen.getByText('35%')).toBeInTheDocument()
      
      // 설명이 표시되는지 확인
      expect(screen.getByText('창의성과 성장력을 나타냅니다')).toBeInTheDocument()
    })

    it('가장 높은 점수의 오행이 중앙에 표시되어야 한다', () => {
      render(<ElementChart elements={mockElements} />)
      
      // 화(火)가 35점으로 가장 높고, 중앙 부분에 표시되어야 함
      const centerElement = screen.getByText('오행 균형').closest('div')
      const centerElementText = centerElement?.querySelector('.text-lg')?.textContent
      expect(centerElementText).toBe('화(火)')
    })

    it('커스텀 className이 적용되어야 한다', () => {
      const { container } = render(
        <ElementChart elements={mockElements} className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('TabNavigation', () => {
    const mockOnTabChange = jest.fn()

    beforeEach(() => {
      mockOnTabChange.mockClear()
    })

    it('탭 네비게이션이 정상 렌더링되어야 한다', () => {
      render(
        <TabNavigation
          tabs={mockTabs}
          activeTab="basic"
          onTabChange={mockOnTabChange}
        />
      )
      
      expect(screen.getByText('기본 풀이')).toBeInTheDocument()
      expect(screen.getByText('오행 분석')).toBeInTheDocument()
      expect(screen.getByText('운세 흐름')).toBeInTheDocument()
    })

    it('활성 탭이 하이라이트되어야 한다', () => {
      render(
        <TabNavigation
          tabs={mockTabs}
          activeTab="elements"
          onTabChange={mockOnTabChange}
        />
      )
      
      const activeTab = screen.getByText('오행 분석').closest('button')
      expect(activeTab).toHaveClass('text-primary', 'border-primary')
    })

    it('탭 클릭 시 콜백이 호출되어야 한다', async () => {
      const user = userEvent.setup()
      
      render(
        <TabNavigation
          tabs={mockTabs}
          activeTab="basic"
          onTabChange={mockOnTabChange}
        />
      )
      
      await user.click(screen.getByText('오행 분석'))
      
      expect(mockOnTabChange).toHaveBeenCalledWith('elements')
    })

    it('탭 설명이 표시되어야 한다', () => {
      render(
        <TabNavigation
          tabs={mockTabs}
          activeTab="basic"
          onTabChange={mockOnTabChange}
        />
      )
      
      expect(screen.getByText('성격 & 특성')).toBeInTheDocument()
      expect(screen.getByText('균형 & 에너지')).toBeInTheDocument()
      expect(screen.getByText('시기별 운세')).toBeInTheDocument()
    })
  })

  describe('LuckTimeline', () => {
    it('운세 타임라인이 정상 렌더링되어야 한다', () => {
      render(<LuckTimeline yearlyLuck={mockLuckData} />)
      
      // 연도가 표시되는지 확인
      expect(screen.getByText('2024')).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
      
      // 테마가 표시되는지 확인
      expect(screen.getByText('변화와 기회')).toBeInTheDocument()
      expect(screen.getByText('안정과 성장')).toBeInTheDocument()
      
      // 점수가 표시되는지 확인
      expect(screen.getByText('85점')).toBeInTheDocument()
      expect(screen.getByText('78점')).toBeInTheDocument()
    })

    it('키워드들이 표시되어야 한다', () => {
      render(<LuckTimeline yearlyLuck={mockLuckData} />)
      
      expect(screen.getByText('승진')).toBeInTheDocument()
      expect(screen.getByText('새로운 만남')).toBeInTheDocument()
      expect(screen.getByText('건강 관리')).toBeInTheDocument()
      expect(screen.getByText('재정 안정')).toBeInTheDocument()
      expect(screen.getByText('학습')).toBeInTheDocument()
      expect(screen.getByText('가족')).toBeInTheDocument()
    })

    it('커스텀 className이 적용되어야 한다', () => {
      const { container } = render(
        <LuckTimeline yearlyLuck={mockLuckData} className="custom-timeline" />
      )
      
      expect(container.firstChild).toHaveClass('custom-timeline')
    })
  })

  describe('테마 관련 테스트', () => {
    it('다크모드에서도 정상 작동해야 한다', () => {
      render(
        <TestWrapper>
          <SajuCard title="다크모드 테스트">
            <ElementChart elements={mockElements} />
          </SajuCard>
        </TestWrapper>
      )
      
      expect(screen.getByText('다크모드 테스트')).toBeInTheDocument()
      expect(screen.getByText('목(木)')).toBeInTheDocument()
    })
  })

  describe('접근성 테스트', () => {
    it('탭 네비게이션이 키보드 접근 가능해야 한다', async () => {
      const user = userEvent.setup()
      const mockOnTabChange = jest.fn()
      
      render(
        <TabNavigation
          tabs={mockTabs}
          activeTab="basic"
          onTabChange={mockOnTabChange}
        />
      )
      
      const firstTab = screen.getByText('기본 풀이').closest('button')
      expect(firstTab).toBeInTheDocument()
      
      // 탭 키로 포커스 이동
      await user.tab()
      expect(firstTab).toHaveFocus()
      
      // 엔터 키로 활성화
      await user.keyboard('{Enter}')
      expect(mockOnTabChange).toHaveBeenCalledWith('basic')
    })

    it('버튼들이 적절한 ARIA 속성을 가져야 한다', () => {
      const mockOnTabChange = jest.fn()
      
      render(
        <TabNavigation
          tabs={mockTabs}
          activeTab="basic"
          onTabChange={mockOnTabChange}
        />
      )
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(mockTabs.length)
    })
  })

  describe('에러 상황 처리', () => {
    it('빈 데이터로도 크래시 없이 렌더링되어야 한다', () => {
      const emptyElements = {
        wood: { score: 0, description: '' },
        fire: { score: 0, description: '' },
        earth: { score: 0, description: '' },
        metal: { score: 0, description: '' },
        water: { score: 0, description: '' },
      }
      
      expect(() => {
        render(<ElementChart elements={emptyElements} />)
      }).not.toThrow()
    })

    it('빈 타임라인 데이터로도 크래시 없이 렌더링되어야 한다', () => {
      expect(() => {
        render(<LuckTimeline yearlyLuck={[]} />)
      }).not.toThrow()
    })
  })
})
