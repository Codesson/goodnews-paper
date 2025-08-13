import { parseString } from 'xml2js';
import { NewsItem, RSSFeed } from './types';

// RSS 피드 목록 (실제 작동하는 URL들)
export const RSS_FEEDS: RSSFeed[] = [
  {
    name: 'BBC 뉴스',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    category: '국제'
  },
  {
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/topNews',
    category: '국제'
  },
  {
    name: 'CNN',
    url: 'https://rss.cnn.com/rss/edition.rss',
    category: '국제'
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    category: '국제'
  },
  {
    name: 'NPR',
    url: 'https://feeds.npr.org/1001/rss.xml',
    category: '국제'
  }
];

// RSS 아이템 타입 정의
interface RSSItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

// RSS 피드 파싱 (개선된 에러 처리)
export async function parseRSSFeed(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    // 타임아웃과 헤더 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoodNewsBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // XML이 비어있거나 잘못된 경우 처리
    if (!xmlText || xmlText.trim().length === 0) {
      console.warn(`빈 RSS 피드 응답: ${url}`);
      return [];
    }

    return new Promise((resolve, reject) => {
      parseString(xmlText, { 
        explicitArray: false,
        ignoreAttrs: true,
        trim: true
      }, (err, result) => {
        if (err) {
          console.error(`XML 파싱 오류 (${url}):`, err);
          reject(err);
          return;
        }
        
        try {
          const items = result?.rss?.channel?.item || [];
          const newsItems: NewsItem[] = Array.isArray(items) ? items.map((item: RSSItem) => ({
            title: item.title || '',
            description: item.description || '',
            link: item.link || '',
            pubDate: item.pubDate || new Date().toISOString(),
            source: sourceName
          })) : [];
          
          resolve(newsItems);
        } catch (parseError) {
          console.error(`RSS 데이터 파싱 오류 (${url}):`, parseError);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error(`RSS 피드 파싱 오류 (${url}):`, error);
    return [];
  }
}

// 모든 RSS 피드에서 뉴스 수집 (개선된 에러 처리)
export async function fetchAllNews(): Promise<NewsItem[]> {
  try {
    const allNews = await Promise.allSettled(
      RSS_FEEDS.map(feed => parseRSSFeed(feed.url, feed.name))
    );
    
    const successfulNews = allNews
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<NewsItem[]>).value)
      .flat();
    
    return successfulNews.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  } catch (error) {
    console.error('뉴스 수집 중 오류:', error);
    return [];
  }
} 