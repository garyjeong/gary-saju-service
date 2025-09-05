// manseryeok 라이브러리 모킹
const mockManseryeok = {
  calculateFourPillars: jest.fn().mockReturnValue({
    year: { heavenly: '갑', earthly: '자' },
    month: { heavenly: '을', earthly: '축' },
    day: { heavenly: '병', earthly: '인' },
    time: { heavenly: '정', earthly: '묘' }
  }),
  
  getHeavenlyStemElement: jest.fn((stem) => {
    const elements = {
      '갑': '목', '을': '목',
      '병': '화', '정': '화',
      '무': '토', '기': '토',
      '경': '금', '신': '금',
      '임': '수', '계': '수'
    };
    return elements[stem] || '목';
  }),
  
  getEarthlyBranchElement: jest.fn((branch) => {
    const elements = {
      '자': '수', '축': '토', '인': '목', '묘': '목',
      '진': '토', '사': '화', '오': '화', '미': '토',
      '신': '금', '유': '금', '술': '토', '해': '수'
    };
    return elements[branch] || '목';
  }),

  HEAVENLY_STEMS: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  EARTHLY_BRANCHES: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
};

module.exports = mockManseryeok;
