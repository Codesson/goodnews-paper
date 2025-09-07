import { AnalyzedNews } from './types';

export const DUMMY_NEWS: AnalyzedNews[] = [
  {
    title: '<strong>감동적인</strong> 뉴스 제목입니다',
    description: '<p>이것은 <em>HTML 태그</em>가 포함된 <strong>뉴스 설명</strong>입니다. <br>줄바꿈도 포함되어 있습니다.</p>',
    link: 'https://example.com/news1',
    pubDate: new Date().toISOString(),
    source: '테스트 뉴스',
    category: '사회',
    isInspiring: true,
    score: 8,
    reason: '감동적인 내용',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop&crop=center'
  },
  {
    title: '두 번째 뉴스 제목',
    description: '<div>이것은 <span style="color: red;">스타일이 적용된</span> HTML 콘텐츠입니다.</div>',
    link: 'https://example.com/news2',
    pubDate: new Date().toISOString(),
    source: '테스트 뉴스',
    category: '인물',
    isInspiring: true,
    score: 7,
    reason: '감동적인 내용',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&crop=center'
  },
  {
    title: '세 번째 뉴스 제목',
    description: '<h3>소제목</h3><p>이것은 <u>밑줄</u>과 <i>기울임꼴</i>이 포함된 텍스트입니다.</p>',
    link: 'https://example.com/news3',
    pubDate: new Date().toISOString(),
    source: '테스트 뉴스',
    category: '환경',
    isInspiring: true,
    score: 6,
    reason: '감동적인 내용',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop&crop=center'
  },
  {
    title: '네 번째 뉴스 제목',
    description: '<p>이것은 <strong>굵은 글씨</strong>와 <em>기울임꼴</em>이 함께 사용된 예시입니다.</p>',
    link: 'https://example.com/news4',
    pubDate: new Date().toISOString(),
    source: '테스트 뉴스',
    category: '과학',
    isInspiring: true,
    score: 9,
    reason: '감동적인 내용'
    // 이미지 없음 - 일반 카드로 표시
  },
  {
    title: '다섯 번째 뉴스 제목',
    description: '<div><h4>제목</h4><p>이것은 <span>span 태그</span>와 <div>div 태그</div>가 포함된 복잡한 HTML입니다.</p></div>',
    link: 'https://example.com/news5',
    pubDate: new Date().toISOString(),
    source: '테스트 뉴스',
    category: '교육',
    isInspiring: true,
    score: 8,
    reason: '감동적인 내용',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop&crop=center'
  }
]; 