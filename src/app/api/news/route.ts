import { NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/rss';
import { analyzeNews } from '@/lib/analyzer';
import { getAllNews, getInspiringNews, hasTodayNews, saveNews } from '@/lib/database';
import { newsCache } from '@/lib/cache';
import { DUMMY_NEWS } from '@/lib/dummy-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const forceRefresh = searchParams.get('refresh') === 'true';
    const useDatabase = searchParams.get('useDatabase') !== 'false';
    const inspiringOnly = searchParams.get('inspiring') === 'true';

    console.log(`📰 뉴스 요청: category=${category}, limit=${limit}, refresh=${forceRefresh}`);

    // 1단계: 캐시 확인 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
      const cacheKey = `news_${category}_${limit}`;
      const cachedData = newsCache.get(cacheKey);
      
      if (cachedData) {
        console.log('⚡ 캐시된 데이터 반환');
        return NextResponse.json({
          success: true,
          data: cachedData,
          source: 'cache',
          isDummyData: false,
          isCached: true,
          cacheInfo: {
            cached: true,
            cacheKey,
            cacheStatus: newsCache.getStatus()
          }
        });
      }
    }

    // 2단계: 데이터베이스에서 조회 (useDatabase가 true인 경우)
    if (useDatabase) {
      try {
        console.log('🗄️ 데이터베이스에서 뉴스 조회 중...');
        const dbNews = inspiringOnly 
          ? await getInspiringNews(category === 'all' ? undefined : category, limit)
          : await getAllNews(category === 'all' ? undefined : category, limit);
        
        if (dbNews.length > 0) {
          console.log(`✅ 데이터베이스에서 ${dbNews.length}개 뉴스 조회 성공`);
          
          // 캐시에 저장 (성능 향상을 위해)
          const cacheKey = `news_${category}_${limit}`;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newsCache.set(cacheKey, dbNews as any);
          
          return NextResponse.json({
            success: true,
            data: dbNews,
            source: 'database',
            isDummyData: false,
            isCached: false,
            cacheInfo: {
              cached: false,
              cacheKey,
              cacheStatus: newsCache.getStatus()
            }
          });
        } else {
          console.log('⚠️ 데이터베이스에 뉴스가 없음, 오늘 날짜 기사 확인 중...');
          
          // 오늘 날짜 기사가 있는지 확인
          const hasToday = await hasTodayNews();
          
          if (!hasToday) {
            console.log('📡 오늘 날짜 기사가 없음, RSS 피드에서 새로 수집 중...');
            
            // RSS 피드에서 뉴스 수집 및 DB 저장
            try {
              const allNews = await fetchAllNews();
              
              if (allNews.length > 0) {
                console.log(`📊 RSS에서 ${allNews.length}개 뉴스 수집 완료`);
                
                // 뉴스 분석
                const analyzedNews = allNews.map(news => analyzeNews(news as unknown as Record<string, unknown>));
                
                // DB에 저장
                await saveNews(analyzedNews);
                console.log('💾 뉴스를 데이터베이스에 저장 완료');
                
                // 저장된 뉴스 다시 조회
                const updatedDbNews = await getAllNews(category === 'all' ? undefined : category, limit);
                
                if (updatedDbNews.length > 0) {
                  // 캐시에 저장
                  const cacheKey = `news_${category}_${limit}`;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  newsCache.set(cacheKey, updatedDbNews as any);
                  
                  return NextResponse.json({
                    success: true,
                    data: updatedDbNews,
                    source: 'database_updated',
                    isDummyData: false,
                    isCached: false,
                    cacheInfo: {
                      cached: false,
                      cacheKey,
                      cacheStatus: newsCache.getStatus()
                    }
                  });
                }
              }
            } catch (rssError) {
              console.warn('⚠️ RSS 피드 수집 실패:', rssError);
            }
          }
        }
      } catch (dbError) {
        console.warn('⚠️ 데이터베이스 조회 실패, RSS 피드로 폴백:', dbError);
      }
    }

    // 3단계: RSS 피드에서 실시간 수집
    try {
      console.log('📡 RSS 피드에서 뉴스 수집 중...');
      const allNews = await fetchAllNews();
      
      if (allNews.length > 0) {
        console.log(`📊 RSS에서 ${allNews.length}개 뉴스 수집 완료`);
        
        // 뉴스 분석
        const analyzedNews = allNews.map(news => analyzeNews(news as unknown as Record<string, unknown>));
        
        // 카테고리 및 감동 뉴스 필터링
        let filteredNews = analyzedNews;
        if (category !== 'all') {
          filteredNews = filteredNews.filter(news => news.category === category);
        }
        if (inspiringOnly) {
          filteredNews = filteredNews.filter(news => news.isInspiring === true);
        }
        
        // 제한된 수만큼 반환
        const limitedNews = filteredNews.slice(0, limit);
        
        // 캐시에 저장
        const cacheKey = `news_${category}_${limit}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newsCache.set(cacheKey, limitedNews as any);
        
        console.log(`✅ RSS 피드에서 ${limitedNews.length}개 뉴스 반환`);
        
        return NextResponse.json({
          success: true,
          data: limitedNews,
          source: 'rss',
          cacheInfo: {
            cached: false,
            cacheKey,
            cacheStatus: newsCache.getStatus()
          }
        });
      }
    } catch (rssError) {
      console.warn('⚠️ RSS 피드 수집 실패, 더미 데이터로 폴백:', rssError);
    }

    // 4단계: 더미 데이터 반환
    console.log('🎭 더미 데이터 반환');
    let dummyData = DUMMY_NEWS;
    
    if (category !== 'all') {
      dummyData = dummyData.filter(news => news.category === category);
    }
    if (inspiringOnly) {
      dummyData = dummyData.filter(news => news.isInspiring === true);
    }
    
    const limitedDummyData = dummyData.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: limitedDummyData,
      source: 'dummy',
      error: 'RSS 피드 연결에 실패했습니다. 테스트용 데이터를 표시합니다.',
      cacheInfo: {
        cached: false,
        cacheKey: null,
        cacheStatus: newsCache.getStatus()
      }
    });

  } catch (error) {
    console.error('❌ 뉴스 API 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '뉴스를 불러오는 중 오류가 발생했습니다.',
        data: [],
        source: 'error'
      },
      { status: 500 }
    );
  }
} 