import { NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/rss';
import { analyzeNews } from '@/lib/analyzer';
import { saveNews, saveCollectionLog } from '@/lib/database';

export async function POST() {
  try {
    console.log('🔄 RSS 뉴스 수집 시작...');
    
    // 1단계: RSS 피드에서 모든 뉴스 수집
    const allNews = await fetchAllNews();
    console.log(`📊 총 ${allNews.length}개의 뉴스 수집 완료`);
    
    if (allNews.length === 0) {
      await saveCollectionLog('RSS', 'failed', 0, '수집된 뉴스가 없습니다.');
      return NextResponse.json(
        {
          success: false,
          error: '수집된 뉴스가 없습니다.',
          data: { collected: 0, saved: 0, inspiring: 0 }
        },
        { status: 400 }
      );
    }
    
    // 2단계: 뉴스 분석 (감동적인 뉴스 필터링 제거)
    console.log('🔍 뉴스 분석 중...');
    const analyzedNews = allNews.map(news => analyzeNews(news as unknown as Record<string, unknown>));
    
    // 모든 뉴스를 저장 (감동적인 뉴스만이 아닌 전체)
    console.log(`💾 모든 뉴스 ${analyzedNews.length}개를 데이터베이스에 저장 중...`);
    await saveNews(analyzedNews);
    
    // 감동적인 뉴스 수 계산 (통계용)
    const inspiringCount = analyzedNews.filter(news => news.isInspiring).length;
    
    // 3단계: 수집 로그 저장
    await saveCollectionLog('RSS', 'success', analyzedNews.length, `성공적으로 ${analyzedNews.length}개 뉴스 저장 (감동적인 뉴스: ${inspiringCount}개)`);
    
    // 4단계: 결과 반환
    const result = {
      success: true,
      message: '뉴스 수집 및 저장이 완료되었습니다.',
      data: {
        collected: allNews.length,
        saved: analyzedNews.length,
        inspiring: inspiringCount,
        timestamp: new Date().toISOString(),
        sources: [...new Set(allNews.map(news => news.source))],
        categories: [...new Set(analyzedNews.map(news => news.category))]
      }
    };
    
    console.log('✅ 뉴스 수집 완료:', result.data);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ 뉴스 수집 중 오류:', error);
    
    await saveCollectionLog('RSS', 'error', 0, error instanceof Error ? error.message : '알 수 없는 오류');
    
    return NextResponse.json(
      {
        success: false,
        error: '뉴스 수집 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        data: { collected: 0, saved: 0, inspiring: 0 }
      },
      { status: 500 }
    );
  }
}

// GET 요청으로도 수집 가능하도록 설정
export async function GET() {
  return POST();
} 