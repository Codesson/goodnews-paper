import { NewsItem } from './types';

// 테스트용 더미 뉴스 데이터
export const DUMMY_NEWS: NewsItem[] = [
  {
    title: '어려운 이웃을 돕는 10대 청소년들의 따뜻한 선행',
    description: '지역 청소년들이 모여 어려운 이웃을 위한 봉사활동을 펼쳐 주민들의 감동을 자아내고 있습니다. 매주 주말마다 노인정을 찾아 청소와 식사 도움을 주는 이들의 따뜻한 마음이 지역사회에 희망을 전하고 있습니다.',
    link: 'https://example.com/news1',
    pubDate: new Date().toISOString(),
    source: '감동뉴스'
  },
  {
    title: '환경보호를 위해 1000그루 나무를 심은 기업의 사회공헌',
    description: '한 기업이 환경보호의 중요성을 알리기 위해 지역사회와 함께 1000그루의 나무를 심는 의미있는 활동을 진행했습니다. 미래 세대를 위한 지속가능한 환경 조성에 앞장서는 기업의 모습이 시민들에게 큰 감동을 주고 있습니다.',
    link: 'https://example.com/news2',
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    source: '희망뉴스'
  },
  {
    title: '불우한 학생들을 위한 장학금 기부 천사들의 나눔',
    description: '지역 유지들이 모여 어려운 학생들을 위한 장학금을 기부하는 따뜻한 행사가 열렸습니다. 교육의 기회를 잃을 뻔했던 학생들에게 새로운 희망을 전하는 이들의 선행이 지역사회에 큰 감동을 주고 있습니다.',
    link: 'https://example.com/news3',
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    source: '선행뉴스'
  },
  {
    title: '의료진들의 헌신으로 생명을 구한 감동적인 사연',
    description: '24시간 내내 환자를 지키며 생명을 구한 의료진들의 헌신적인 모습이 전국민의 감동을 자아내고 있습니다. 환자의 생명을 위해 자신의 휴식을 포기하고 진료에 매진한 의료진들의 모습이 진정한 의료인의 본보기를 보여주고 있습니다.',
    link: 'https://example.com/news4',
    pubDate: new Date(Date.now() - 10800000).toISOString(),
    source: '생명뉴스'
  },
  {
    title: '재활치료를 통해 다시 일어선 환자의 희망스러운 회복',
    description: '심각한 사고 후 재활치료를 통해 다시 일어선 환자의 감동적인 회복 사연이 전해지고 있습니다. 포기하지 않고 끊임없이 노력한 환자와 의료진들의 열정이 많은 사람들에게 희망과 용기를 전하고 있습니다.',
    link: 'https://example.com/news5',
    pubDate: new Date(Date.now() - 14400000).toISOString(),
    source: '회복뉴스'
  },
  {
    title: '지역사회 화합을 위한 다문화 축제의 성공적 개최',
    description: '다양한 문화를 이해하고 존중하는 다문화 축제가 성공적으로 개최되어 지역사회의 화합을 다지는 계기가 되었습니다. 서로 다른 문화권의 사람들이 하나되어 만든 축제의 성공이 우리 사회의 미래를 밝게 비추고 있습니다.',
    link: 'https://example.com/news6',
    pubDate: new Date(Date.now() - 18000000).toISOString(),
    source: '화합뉴스'
  }
]; 