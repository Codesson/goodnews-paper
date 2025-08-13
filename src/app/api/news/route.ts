import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/rss';
import { filterInspiringNews } from '@/lib/analyzer';
import { DUMMY_NEWS } from '@/lib/dummy-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // RSS 피드에서 뉴스 수집 시도
    let allNews = await fetchAllNews();
    
    // RSS 피드가 실패한 경우 더미 데이터 사용
    if (allNews.length === 0) {
      console.log('RSS 피드 실패, 더미 데이터 사용');
      allNews = DUMMY_NEWS;
    }
    
    // 감동적인 뉴스만 필터링
    const inspiringNews = filterInspiringNews(allNews);
    
    // 카테고리 필터링
    let filteredNews = inspiringNews;
    if (category && category !== 'all') {
      filteredNews = inspiringNews.filter(news => news.category === category);
    }
    
    // 개수 제한
    const limitedNews = filteredNews.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: limitedNews,
      total: filteredNews.length,
      category: category || 'all',
      source: allNews === DUMMY_NEWS ? 'dummy' : 'rss'
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
      error: 'RSS 피드 오류로 더미 데이터를 제공합니다.'
    });
  }
} 