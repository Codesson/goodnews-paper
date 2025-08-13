import { parseString } from 'xml2js';
import { NewsItem, RSSFeed } from './types';

// RSS 피드 목록 (실제 작동하는 URL들 + 프록시 시도)
export const RSS_FEEDS: RSSFeed[] = [
  // 국내 언론사 (프록시를 통한 접근 시도)
  {
    name: '매일경제',
    url: 'https://www.mk.co.kr/rss/30000001/',
    category: '국내'
  },
  {
    name: '조선일보',
    url: 'https://www.chosun.com/rss',
    category: '국내'
  },
  {
    name: '동아일보',
    url: 'https://www.donga.com/rss',
    category: '국내'
  },
  {
    name: '한겨레',
    url: 'http://www.hani.co.kr/rss/',
    category: '국내'
  },
  {
    name: '경향신문',
    url: 'https://www.khan.co.kr/rss/',
    category: '국내'
  },
  {
    name: '연합뉴스',
    url: 'https://www.yna.co.kr/rss/',
    category: '국내'
  },
  {
    name: 'KBS 뉴스',
    url: 'http://news.kbs.co.kr/rss/',
    category: '국내'
  },
  {
    name: 'MBC 뉴스',
    url: 'https://imnews.imbc.com/rss/',
    category: '국내'
  },
  {
    name: 'SBS 뉴스',
    url: 'https://news.sbs.co.kr/rss',
    category: '국내'
  },
  {
    name: 'YTN 뉴스',
    url: 'https://www.ytn.co.kr/rss/',
    category: '국내'
  },
  // 국제 언론사 (실제 작동하는 것들)
  {
    name: 'BBC 뉴스',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
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
  },
  {
    name: '테크크런치',
    url: 'https://techcrunch.com/feed/',
    category: '국제'
  },
  {
    name: '더버지',
    url: 'https://www.theverge.com/rss/index.xml',
    category: '국제'
  },
  {
    name: '아르스 테크니카',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: '국제'
  },
  // 긍정적 뉴스 전문 사이트
  {
    name: 'Positive News',
    url: 'https://www.positive.news/feed/',
    category: '국제'
  },
  {
    name: 'Good News Network',
    url: 'https://www.goodnewsnetwork.org/feed/',
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

// RSS2JSON API를 통한 RSS 피드 파싱
async function fetchViaRSS2JSON(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    
    const response = await fetch(rss2jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoodNewsBot/1.0)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`RSS2JSON API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`RSS2JSON 상태 오류: ${data.message}`);
    }

    return data.items.map((item: any) => ({
      title: item.title || '',
      description: item.description || '',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      source: sourceName
    }));
  } catch (error) {
    console.error(`RSS2JSON 파싱 오류 (${url}):`, error);
    return [];
  }
}

// RSS 프록시 서비스를 통한 RSS 피드 파싱
async function fetchViaProxy(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    // 여러 프록시 서비스 시도
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://thingproxy.freeboard.io/fetch/${url}`
    ];

    for (const proxyUrl of proxyUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          continue; // 다음 프록시 시도
        }

        const xmlText = await response.text();
        
        if (!xmlText || xmlText.trim().length === 0) {
          continue;
        }

        return new Promise((resolve, reject) => {
          parseString(xmlText, { 
            explicitArray: false,
            ignoreAttrs: true,
            trim: true
          }, (err, result) => {
            if (err) {
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
              resolve([]);
            }
          });
        });
      } catch (proxyError) {
        console.warn(`프록시 시도 실패 (${proxyUrl}):`, proxyError);
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.error(`프록시 파싱 오류 (${url}):`, error);
    return [];
  }
}

// RSS 피드 파싱 (개선된 에러 처리 + 프록시/API 시도)
export async function parseRSSFeed(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    // 1단계: 직접 접근 시도 (개선된 헤더)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const xmlText = await response.text();
      
      if (xmlText && xmlText.trim().length > 0) {
        return new Promise((resolve, reject) => {
          parseString(xmlText, { 
            explicitArray: false,
            ignoreAttrs: true,
            trim: true
          }, (err, result) => {
            if (err) {
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
              resolve([]);
            }
          });
        });
      }
    }

    // 2단계: RSS2JSON API 시도
    console.log(`${sourceName}: 직접 접근 실패, RSS2JSON API 시도 중...`);
    const rss2jsonResult = await fetchViaRSS2JSON(url, sourceName);
    if (rss2jsonResult.length > 0) {
      console.log(`${sourceName}: RSS2JSON API 성공 (${rss2jsonResult.length}개 기사)`);
      return rss2jsonResult;
    }

    // 3단계: 프록시 서비스 시도
    console.log(`${sourceName}: RSS2JSON 실패, 프록시 서비스 시도 중...`);
    const proxyResult = await fetchViaProxy(url, sourceName);
    if (proxyResult.length > 0) {
      console.log(`${sourceName}: 프록시 서비스 성공 (${proxyResult.length}개 기사)`);
      return proxyResult;
    }

    console.warn(`${sourceName}: 모든 방법 실패`);
    return [];
    
  } catch (error) {
    console.error(`RSS 피드 파싱 오류 (${url}):`, error);
    return [];
  }
}

// 모든 RSS 피드에서 뉴스 수집 (개선된 에러 처리)
export async function fetchAllNews(): Promise<NewsItem[]> {
  try {
    console.log('RSS 피드 수집 시작...');
    
    const allNews = await Promise.allSettled(
      RSS_FEEDS.map(feed => parseRSSFeed(feed.url, feed.name))
    );
    
    const successfulNews = allNews
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<NewsItem[]>).value)
      .flat();
    
    console.log(`총 ${successfulNews.length}개의 뉴스 수집 완료`);
    
    return successfulNews.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  } catch (error) {
    console.error('뉴스 수집 중 오류:', error);
    return [];
  }
} 