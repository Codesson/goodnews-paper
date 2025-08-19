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
  // const [cacheInfo, setCacheInfo] = useState<Record<string, unknown> | null>(null);
  const [popupUrl, setPopupUrl] = useState<string | null>(null);
  const [popupTitle, setPopupTitle] = useState<string>('');
  const [iframeLoading, setIframeLoading] = useState(false);

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

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        category: category,
        limit: '300', // 267개 뉴스를 모두 가져오기 위해 300으로 설정
      });

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();

      if (data.success) {
        setNews(data.data);
        setIsDummyData(data.isDummyData || false);
        setIsCached(data.isCached || false);
        // setCacheInfo(data.cacheInfo || null);
      } else {
        setError(data.error || '뉴스를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (err: unknown) {
      console.error('뉴스 불러오기 에러:', err);
      setError('뉴스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // ESC 키로 팝업 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && popupUrl) {
        closePopup();
      }
    };

    if (popupUrl) {
      document.addEventListener('keydown', handleEscKey);
      // 팝업이 열려있을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [popupUrl]);

  // 팝업 열기
  const openPopup = (url: string, title: string) => {
    console.log('팝업 열기 시도:', { url, title });
    setPopupUrl(url);
    setPopupTitle(title);
    setIframeLoading(true);
    console.log('팝업 상태 설정 완료');
  };

  // 팝업 닫기
  const closePopup = () => {
    console.log('팝업 닫기');
    setPopupUrl(null);
    setPopupTitle('');
    setIframeLoading(false);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      {/* 간략한 신문 헤더 */}
      <header className="bg-white shadow-lg border-b-2 border-blue-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-4">
            <div className="mb-2">
              <h1 className="text-5xl md:text-7xl font-light text-blue-900 tracking-wide mb-2">
                GOOD NEWS PAPER
              </h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-2"></div>
              <h2 className="text-xl md:text-2xl font-normal text-gray-600 tracking-normal">
                감동을 전하는 따뜻한 이야기
              </h2>
            </div>
            <div className="border-t border-b border-gray-200 py-2 mb-3">
              <p className="text-sm text-gray-600 font-medium">
                따뜻하고 희망찬 뉴스만 모아서 전해드리는 감동 신문
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-normal space-y-1 sm:space-y-0">
              <span className="flex items-center">
                <span className="mr-1">📅</span>
                {new Date().toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </span>
              <span className="flex items-center">
                <span className="mr-1">📰</span>
                Vol. 1 No. 1
              </span>
                             <span className="flex items-center">
                <span className="mr-1">🌟</span>
                감동 뉴스 페이퍼
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 간략한 카테고리 선택 */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center py-3">
            <div className="flex flex-wrap justify-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-normal transition-all duration-300 transform hover:scale-105 ${
                    category === cat.id
                      ? 'bg-white text-blue-900 shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 세련된 알림 메시지들 */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {error && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 text-amber-800 px-6 py-4 mb-6 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="font-normal">{error}</span>
            </div>
          </div>
        )}

        {isDummyData && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-800 px-6 py-4 mb-6 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">ℹ️</span>
              <span className="font-normal">현재 테스트용 샘플 뉴스를 보여드리고 있습니다. RSS 피드 연결이 완료되면 실시간 뉴스로 업데이트됩니다.</span>
            </div>
          </div>
        )}

        {isCached && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-800 px-6 py-4 mb-6 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚡</span>
              <span className="font-normal">캐시된 데이터를 빠르게 로드했습니다.</span>
            </div>
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 - 세련된 카드 레이아웃 */}
      <main className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-900 border-t-transparent"></div>
            <p className="mt-6 text-xl text-gray-600 font-normal">감동적인 뉴스를 찾고 있습니다...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
            {/* 헤드라인 섹션 */}
            {category === 'all' && news.length > 0 && (
              <div className="border-b-4 border-gradient-to-r from-blue-600 to-purple-600 pb-8 mb-8">
                <div className="text-center mb-8">
                                     <h2 className="text-4xl md:text-5xl font-light text-blue-900 mb-4">TODAY&apos;S HEADLINES</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
                </div>
                
                {/* 헤드라인 카드 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {news.slice(0, 8).map((item, index) => (
                    <article
                      key={`headline-${item.source}-${index}`}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full transform hover:-translate-y-2 border border-gray-100"
                      onClick={() => openPopup(item.link, item.title)}
                    >
                      <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 text-xs text-gray-500 font-normal">
                          <span className="uppercase tracking-wide">{item.source}</span>
                          <span className={`${getScoreColor(item.score)}`}>
                            {item.score}점
                          </span>
                        </div>
                        <SafeHtml 
                          html={item.title}
                          className="text-lg font-bold text-gray-900 mb-4 leading-tight line-clamp-3 flex-grow"
                        />
                        <SafeHtml 
                          html={item.description}
                          className="text-gray-600 text-sm leading-relaxed line-clamp-4 flex-grow"
                        />
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500 font-normal">
                            <span>{formatDate(item.pubDate)}</span>
                            <span className="text-blue-600 font-medium">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 카테고리별 섹션 */}
            {category !== 'all' && news.length > 0 && (
              <div>
                <div className="text-center mb-8">
                                     <h2 className="text-4xl md:text-5xl font-light text-blue-900 mb-4">
                     {category.toUpperCase()} NEWS
                   </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
                </div>
                
                {/* 카드 그리드 레이아웃 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {news.map((item, index) => (
                    <article
                      key={`${item.source}-${index}`}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full transform hover:-translate-y-2 border border-gray-100"
                      onClick={() => openPopup(item.link, item.title)}
                    >
                      <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 text-xs text-gray-500 font-normal">
                          <span className="uppercase tracking-wide">{item.source}</span>
                          <span className={`${getScoreColor(item.score)}`}>
                            {item.score}점
                          </span>
                        </div>
                        <SafeHtml 
                          html={item.title}
                          className="text-lg font-bold text-gray-900 mb-4 leading-tight line-clamp-3 flex-grow"
                        />
                        <SafeHtml 
                          html={item.description}
                          className="text-gray-600 text-sm leading-relaxed line-clamp-4 flex-grow"
                        />
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500 font-normal">
                            <span>{formatDate(item.pubDate)}</span>
                            <span className="text-blue-600 font-medium">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 카테고리별 그룹화된 섹션 (전체 보기일 때) */}
            {category === 'all' && news.length > 0 && (
              <div>
                {/* 뉴스를 카테고리별로 그룹화 */}
                {(() => {
                  const groupedNews = news.slice(4).reduce((acc, item) => {
                    if (!acc[item.category]) {
                      acc[item.category] = [];
                    }
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, AnalyzedNews[]>);

                  return Object.entries(groupedNews).map(([cat, catNews]) => (
                    <div key={cat} className="mb-12">
                      <div className="text-center mb-8">
                                                 <h3 className="text-3xl md:text-4xl font-light text-blue-900 mb-4">
                           {cat.toUpperCase()} SECTION
                         </h3>
                        <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
                      </div>
                      
                      {/* 카드 그리드 레이아웃 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {catNews.slice(0, 8).map((item, index) => (
                          <article
                            key={`${cat}-${item.source}-${index}`}
                            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full transform hover:-translate-y-2 border border-gray-100"
                            onClick={() => openPopup(item.link, item.title)}
                          >
                            <div className="p-4 h-full flex flex-col">
                              <div className="flex items-center justify-between mb-3 text-xs text-gray-500 font-normal">
                                <span className="uppercase tracking-wide">{item.source}</span>
                                <span className={`${getScoreColor(item.score)}`}>
                                  {item.score}점
                                </span>
                              </div>
                              <SafeHtml 
                                html={item.title}
                                className="text-base font-bold text-gray-900 mb-3 leading-tight line-clamp-2 flex-grow"
                              />
                              <SafeHtml 
                                html={item.description}
                                className="text-gray-600 text-xs leading-relaxed line-clamp-3 flex-grow"
                              />
                              <div className="mt-auto pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-500 font-normal">
                                  <span>{formatDate(item.pubDate)}</span>
                                  <span className="text-blue-600 font-medium">
                                    {item.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                         <h2 className="text-3xl font-light text-blue-900 mb-4">NO NEWS TODAY</h2>
            <p className="text-gray-600 font-normal">해당 카테고리의 감동적인 뉴스가 없습니다.</p>
          </div>
        )}
      </main>

      {/* 세련된 신문 푸터 */}
      <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
                         <h3 className="text-3xl font-light mb-4">GOOD NEWS PAPER</h3>
            <p className="text-lg text-blue-100 mb-6 leading-relaxed">
              따뜻하고 희망찬 뉴스만 모아서 전해드리는 감동 신문
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-6"></div>
            <div className="text-sm text-blue-200 font-normal">
              © 2024 Good News Paper. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* 팝업 모달 */}
      {popupUrl && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={closePopup}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '90%',
              height: '90%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '2px solid #e5e7eb',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontWeight: 'bold',
                fontSize: '18px',
                flex: 1,
                marginRight: '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'serif',
                color: '#1e293b'
              }}>
                {popupTitle}
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <a
                  href={popupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '10px 20px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  새 탭에서 열기
                </a>
                <button 
                  onClick={closePopup}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* iframe 컨테이너 */}
            <div style={{ flex: 1, position: 'relative' }}>
              {iframeLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid #e5e7eb',
                      borderTop: '4px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px'
                    }}></div>
                    <p style={{ color: '#374151', margin: 0, fontWeight: 'bold' }}>뉴스 내용을 불러오는 중입니다...</p>
                  </div>
                </div>
              )}
              <iframe
                src={popupUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title={popupTitle}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
