import { NewsItem, AnalyzedNews } from './types';

// 감동적인 키워드 정의
const INSPIRING_KEYWORDS = {
  positive: [
    '희망', '감동', '따뜻', '선행', '기부', '봉사', '희생',
    '성공', '회복', '치유', '화해', '용기', '사랑', '가족',
    '친구', '이웃', '도움', '나눔', '꿈', '희생', '정의',
    '평화', '화합', '성장', '발전', '혁신', '발명', '치료'
  ],
  negative: [
    '범죄', '사고', '폭력', '부정', '비리', '사기', '죄',
    '죽음', '병', '고통', '슬픔', '분노', '혐오', '차별',
    '전쟁', '테러', '폭발', '화재', '지진', '태풍', '홍수'
  ]
};

// 카테고리별 키워드
const CATEGORY_KEYWORDS = {
  '인물': ['기부', '선행', '봉사', '희생', '성공', '용기', '정의'],
  '사회': ['나눔', '화해', '이웃', '도움', '희망', '화합', '평화'],
  '환경': ['보호', '복원', '친환경', '지속가능', '생태', '자연'],
  '과학': ['발명', '치료', '혁신', '발전', '기술', '연구'],
  '교육': ['성장', '학습', '발전', '미래', '희망', '꿈']
};

// 키워드 기반 감동 분석
export function analyzeInspiringKeywords(text: string): {
  isInspiring: boolean;
  score: number;
  category: string;
  reason: string;
} {
  const lowerText = text.toLowerCase();
  
  // 긍정적 키워드 카운트
  const positiveCount = INSPIRING_KEYWORDS.positive.filter(
    keyword => lowerText.includes(keyword)
  ).length;
  
  // 부정적 키워드 카운트
  const negativeCount = INSPIRING_KEYWORDS.negative.filter(
    keyword => lowerText.includes(keyword)
  ).length;
  
  // 카테고리 분류
  let category = '기타';
  let categoryScore = 0;
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;
    
    if (score > categoryScore) {
      categoryScore = score;
      category = cat;
    }
  }
  
  // 점수 계산 (1-10점)
  const baseScore = Math.max(0, positiveCount - negativeCount);
  const score = Math.min(10, Math.max(1, baseScore + categoryScore));
  
  const isInspiring = positiveCount > negativeCount && score >= 5;
  
  return {
    isInspiring,
    score,
    category,
    reason: isInspiring 
      ? `${positiveCount}개의 긍정적 키워드 발견`
      : `${negativeCount}개의 부정적 키워드 발견`
  };
}

// 뉴스 분석
export function analyzeNews(news: NewsItem): AnalyzedNews {
  const analysis = analyzeInspiringKeywords(
    news.title + ' ' + news.description
  );
  
  return {
    ...news,
    ...analysis
  };
}

// 감동적인 뉴스만 필터링
export function filterInspiringNews(newsItems: NewsItem[]): AnalyzedNews[] {
  return newsItems
    .map(analyzeNews)
    .filter(news => news.isInspiring && news.score >= 6)
    .sort((a, b) => b.score - a.score);
} 