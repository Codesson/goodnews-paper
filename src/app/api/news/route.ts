import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/rss';
import { fetchNewsFromRSSProxy } from '@/lib/news-api';
import { filterInspiringNews } from '@/lib/analyzer';
import { DUMMY_NEWS } from '@/lib/dummy-data';
import { newsCache, generateCacheKey } from '@/lib/cache';
import { getInspiringNews, saveNews, saveCollectionLog } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const forceRefresh = searchParams.get('refresh') === 'true';
    const useDatabase = searchParams.get('db') === 'true';
    
    // 캐시 키 생성
    const cacheKey = generateCacheKey(category, limit);
    
    // 강제 새로고침이 아닌 경우 캐시 확인
    if (!forceRefresh) {
      const cachedData = newsCache.get(cacheKey);
      if (cachedData) {
        console.log(`캐시에서 데이터 반환: ${cacheKey}`);
        return NextResponse.json({
          success: true,
          data: cachedData,
          total: cachedData.length,
          category,
          source: 'cache',
          message: '캐시된 데이터를 반환합니다.'
        });
      }
    }
    
    // 데이터베이스에서 조회 시도
    if (useDatabase) {
      try {
        const dbNews = await getInspiringNews(category, limit);
        if (dbNews.length > 0) {
          console.log(`데이터베이스에서 ${dbNews.length}개 뉴스 조회`);
          return NextResponse.json({
            success: true,
            data: dbNews,
            total: dbNews.length,
            category,
            source: 'database',
            message: '데이터베이스에서 뉴스를 조회했습니다.'
          });
        }
      } catch (dbError) {
        console.error('데이터베이스 조회 오류:', dbError);
      }
    }
    
    console.log(`캐시 미스, 새로운 데이터 수집: ${cacheKey}`);
    
    // 1. RSS 피드에서 뉴스 수집 시도
    let allNews = await fetchAllNews();
    
    // 2. RSS 피드가 실패한 경우 RSS 프록시 시도
    if (allNews.length === 0) {
      console.log('RSS 피드 실패, RSS 프록시 시도');
      allNews = await fetchNewsFromRSSProxy();
    }
    
    // 3. 모든 방법이 실패한 경우 더미 데이터 사용
    if (allNews.length === 0) {
      console.log('모든 뉴스 소스 실패, 더미 데이터 사용');
      allNews = DUMMY_NEWS;
    }
    
    // 감동적인 뉴스만 필터링
    const inspiringNews = filterInspiringNews(allNews);
    
    // 카테고리 필터링
    let filteredNews = inspiringNews;
    if (category !== 'all') {
      filteredNews = inspiringNews.filter(news => news.category === category);
    }
    
    // 개수 제한
    const limitedNews = filteredNews.slice(0, limit);
    
    // 데이터베이스에 저장 (더미 데이터가 아닌 경우에만)
    if (allNews !== DUMMY_NEWS && limitedNews.length > 0) {
      try {
        await saveNews(limitedNews);
        await saveCollectionLog('rss', 'success', limitedNews.length);
        console.log('데이터베이스에 뉴스 저장 완료');
      } catch (dbError) {
        console.error('데이터베이스 저장 오류:', dbError);
        await saveCollectionLog('rss', 'error', 0, dbError instanceof Error ? dbError.message : 'Unknown error');
      }
    }
    
    // 캐시에 저장 (더미 데이터가 아닌 경우에만)
    if (allNews !== DUMMY_NEWS && limitedNews.length > 0) {
      newsCache.set(cacheKey, limitedNews);
      console.log(`캐시에 데이터 저장: ${cacheKey}`);
    }
    
    return NextResponse.json({
      success: true,
      data: limitedNews,
      total: filteredNews.length,
      category,
      source: allNews === DUMMY_NEWS ? 'dummy' : 'rss',
      message: allNews.length > 0 ? '실시간 뉴스 데이터를 성공적으로 수집했습니다.' : '더미 데이터를 사용하고 있습니다.',
      cacheInfo: {
        cached: !forceRefresh && newsCache.get(cacheKey) !== null,
        cacheKey,
        cacheStatus: newsCache.getStatus()
      }
    });
    
  } catch (error) {
    console.error('뉴스 API 오류:', error);
    
    // 에러 발생 시에도 더미 데이터 제공
    const inspiringNews = filterInspiringNews(DUMMY_NEWS);
    const limitedNews = inspiringNews.slice(0, 20);
    
    return NextResponse.json({
      success: true,
      data: limitedNews,
      total: inspiringNews.length,
      category: 'all',
      source: 'dummy',
      error: '뉴스 수집 중 오류가 발생하여 더미 데이터를 제공합니다.'
    });
  }
} 