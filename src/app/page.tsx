'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyzedNews } from '@/lib/types';
import { formatDate, getScoreColor } from '@/lib/utils';

export default function Home() {
  const [news, setNews] = useState<AnalyzedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [error, setError] = useState('');
  const [isDummyData, setIsDummyData] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);

  const categories = [
    { id: 'all', name: '전체' },
    { id: '국내', name: '국내' },
    { id: '국제', name: '국제' },
    { id: '인물', name: '인물' },
    { id: '사회', name: '사회' },
    { id: '환경', name: '환경' },
    { id: '과학', name: '과학' },
    { id: '교육', name: '교육' }
  ];

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        category: category,
        limit: '300', // 267개 뉴스를 모두 가져오기 위해 300으로 설정
        ...(forceRefresh && { forceRefresh: 'true' })
      });

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();

      if (data.success) {
        setNews(data.data);
        setIsDummyData(data.isDummyData || false);
        setIsCached(data.isCached || false);
        setCacheInfo(data.cacheInfo || null);
      } else {
        setError(data.error || '뉴스를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('뉴스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // HTML을 안전하게 렌더링하는 컴포넌트
  const SafeHtml = ({ html, className }: { html: string; className?: string }) => {
    if (!html) return null;
    
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ 
          __html: html
            .replace(/<script[^>]*>.*?<\/script>/gi, '') // script 태그 제거
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // iframe 태그 제거
            .replace(/javascript:/gi, '') // javascript: 프로토콜 제거
            .replace(/on\w+\s*=/gi, '') // 이벤트 핸들러 제거
        }} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🌟 감동 뉴스
              </h1>
              <p className="text-gray-600 mt-1">
                따뜻하고 희망찬 뉴스만 모아서 전해드립니다
              </p>
            </div>
            <div className="flex space-x-2">
              <a
                href="/admin"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                📊 관리자
              </a>
              <button
                onClick={() => fetchNews(true)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? '새로고침 중...' : '강제 새로고침'}
              </button>
              <button
                onClick={() => fetchNews(false)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? '로딩 중...' : '새로고침'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 카테고리 필터 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  category === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {isDummyData && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="mr-2">ℹ️</span>
              <span>현재 테스트용 샘플 뉴스를 보여드리고 있습니다. RSS 피드 연결이 완료되면 실시간 뉴스로 업데이트됩니다.</span>
            </div>
          </div>
        )}

        {isCached && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚡</span>
              <span>캐시된 데이터를 빠르게 로드했습니다. 최신 뉴스를 보려면 "강제 새로고침"을 클릭하세요.</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">감동적인 뉴스를 찾고 있습니다...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <article
                key={`${item.source}-${index}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{item.source}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold ${getScoreColor(item.score)}`}>
                        ⭐ {item.score}점
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <SafeHtml 
                    html={item.title}
                    className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2"
                  />
                  
                  <SafeHtml 
                    html={item.description}
                    className="text-gray-600 text-sm mb-4 line-clamp-3 prose prose-sm"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatDate(item.pubDate)}
                    </span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      원문 보기 →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">해당 카테고리의 감동적인 뉴스가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
