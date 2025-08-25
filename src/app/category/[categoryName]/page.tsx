'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyzedNews } from '@/lib/types';
import { formatDate, getScoreColor } from '@/lib/utils';
import Head from 'next/head';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.categoryName as string);
  
  const [news, setNews] = useState<AnalyzedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [popupUrl, setPopupUrl] = useState<string | null>(null);
  const [popupTitle, setPopupTitle] = useState<string>('');
  const [iframeLoading, setIframeLoading] = useState(false);
  
  const itemsPerPage = 20;

  const fetchCategoryNews = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        category: categoryName,
        limit: (itemsPerPage * 10).toString(), // 더 많은 데이터를 가져와서 페이지네이션
        useDatabase: 'true',
        refresh: 'false'
      });

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();

      if (data.success) {
        // 감동 뉴스를 우선적으로 정렬
        const sortedAllNews = data.data.sort((a: AnalyzedNews, b: AnalyzedNews) => {
          // 감동 뉴스를 먼저 표시
          if (a.isInspiring && !b.isInspiring) return -1;
          if (!a.isInspiring && b.isInspiring) return 1;
          // 감동 뉴스 내에서는 점수 순으로 정렬
          return b.score - a.score;
        });
        
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageNews = sortedAllNews.slice(startIndex, endIndex);
        
        setNews(pageNews);
        setTotalPages(Math.ceil(sortedAllNews.length / itemsPerPage));
      } else {
        setError(data.error || '뉴스를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (err: unknown) {
      console.error('뉴스 불러오기 에러:', err);
      setError('뉴스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchCategoryNews(currentPage);
  }, [fetchCategoryNews, currentPage]);

  // ESC 키로 팝업 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && popupUrl) {
        closePopup();
      }
    };

    if (popupUrl) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [popupUrl]);

  // 팝업 열기
  const openPopup = (url: string, title: string) => {
    setPopupUrl(url);
    setPopupTitle(title);
    setIframeLoading(true);
  };

  // 팝업 닫기
  const closePopup = () => {
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
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
        }} 
      />
    );
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>{categoryName} 뉴스 - Good News Paper</title>
        <meta name="description" content={`${categoryName} 카테고리의 모든 감동적이고 긍정적인 뉴스를 확인하세요.`} />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
        {/* 헤더 */}
        <header className="bg-white shadow-lg border-b-2 border-blue-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-4">
              <div className="mb-2">
                            <Link href="/" className="text-5xl md:text-7xl font-light text-blue-900 tracking-wide mb-2 hover:text-purple-700 transition-colors duration-300">
              GOOD NEWS PAPER
            </Link>
                <div className="w-24 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-2"></div>
                <h1 className="text-2xl md:text-3xl font-normal text-gray-600 tracking-normal">
                  {categoryName.toUpperCase()} NEWS
                </h1>
              </div>
              <div className="border-t border-b border-gray-200 py-2 mb-3">
                <p className="text-sm text-gray-600 font-medium">
                  {categoryName} 카테고리의 모든 뉴스
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-normal space-y-1 sm:space-y-0">
                <span>
                  {new Date().toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </span>
                              <Link href="/" className="text-blue-600 hover:text-purple-600 transition-colors duration-300">
                ← 홈으로 돌아가기
              </Link>
                <span>{categoryName} 섹션</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {error && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 text-amber-800 px-6 py-4 mb-6 rounded-r-lg shadow-md">
              <div className="flex items-center">
                <span className="font-normal">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-900 border-t-transparent"></div>
              <p className="mt-6 text-xl text-gray-600 font-normal">{categoryName} 뉴스를 불러오는 중...</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              {/* 카테고리 제목 */}
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-light text-blue-900 mb-4">
                  {categoryName.toUpperCase()} COLLECTION
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">
                  총 {news.length}개의 {categoryName} 뉴스 (페이지 {currentPage} / {totalPages})
                </p>
              </div>

              {/* 뉴스 그리드 */}
              {news.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                            {item.isInspiring && (
                              <span className="text-pink-500 font-medium">
                                감동
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-3xl font-light text-blue-900 mb-4">NO NEWS FOUND</h3>
                  <p className="text-gray-600 font-normal">{categoryName} 카테고리에 뉴스가 없습니다.</p>
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-300"
                  >
                    이전
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-300"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 푸터 */}
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
    </>
  );
}
