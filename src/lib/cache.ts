import { NewsItem } from './types';

interface CacheItem {
  data: NewsItem[];
  timestamp: number;
  expiresAt: number;
}

class NewsCache {
  private cache: Map<string, CacheItem> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10분

  // 캐시에서 뉴스 데이터 가져오기
  get(key: string): NewsItem[] | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 캐시 만료 확인
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // 캐시에 뉴스 데이터 저장
  set(key: string, data: NewsItem[]): void {
    const now = Date.now();
    const cacheItem: CacheItem = {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };

    this.cache.set(key, cacheItem);
  }

  // 캐시 무효화
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  // 모든 캐시 무효화
  clear(): void {
    this.cache.clear();
  }

  // 캐시 상태 확인
  getStatus(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 전역 캐시 인스턴스
export const newsCache = new NewsCache();

// 캐시 키 생성 함수
export function generateCacheKey(category: string = 'all', limit: number = 20): string {
  return `news_${category}_${limit}`;
} 