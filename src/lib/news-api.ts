import { NewsItem } from './types';

// News API 설정
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// 한국 뉴스 소스들
const KOREAN_NEWS_SOURCES = [
  'yonhap-news',
  'kbs',
  'mbc',
  'sbs',
  'chosun',
  'joongang',
  'donga'
];

// News API에서 뉴스 가져오기
export async function fetchNewsFromAPI(): Promise<NewsItem[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY가 설정되지 않았습니다.');
    return [];
  }

  try {
    // 한국 뉴스 검색
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?` +
      `q=한국&` +
      `language=ko&` +
      `sortBy=publishedAt&` +
      `pageSize=50&` +
      `apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`News API 응답 오류: ${data.message}`);
    }

    return data.articles.map((article: any) => ({
      title: article.title || '',
      description: article.description || '',
      link: article.url || '',
      pubDate: article.publishedAt || new Date().toISOString(),
      source: article.source?.name || 'Unknown'
    }));

  } catch (error) {
    console.error('News API 오류:', error);
    return [];
  }
}

// 무료 대안: RSS 피드 프록시 서비스 활용
export async function fetchNewsFromRSSProxy(): Promise<NewsItem[]> {
  try {
    // RSS 피드 프록시 서비스 사용
    const rssUrls = [
      'https://rss.cnn.com/rss/edition.rss',
      'https://feeds.bbci.co.uk/news/rss.xml',
      'https://www.reuters.com/tools/rss'
    ];

    const allNews: NewsItem[] = [];

    for (const url of rssUrls) {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'ok' && data.items) {
            const newsItems = data.items.map((item: any) => ({
              title: item.title || '',
              description: item.description || '',
              link: item.link || '',
              pubDate: item.pubDate || new Date().toISOString(),
              source: data.feed?.title || 'Unknown'
            }));
            
            allNews.push(...newsItems);
          }
        }
      } catch (error) {
        console.error(`RSS 프록시 오류 (${url}):`, error);
      }
    }

    return allNews.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

  } catch (error) {
    console.error('RSS 프록시 오류:', error);
    return [];
  }
} 