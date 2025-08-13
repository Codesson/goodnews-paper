import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/rss';
import { fetchNewsFromRSSProxy } from '@/lib/news-api';
import { filterInspiringNews } from '@/lib/analyzer';
import { DUMMY_NEWS } from '@/lib/dummy-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    
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
      source: allNews === DUMMY_NEWS ? 'dummy' : 'rss',
      message: allNews.length > 0 ? '실시간 뉴스 데이터를 성공적으로 수집했습니다.' : '더미 데이터를 사용하고 있습니다.'
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