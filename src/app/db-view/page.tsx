'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyzedNews } from '@/lib/types';
import { formatDate, getScoreColor } from '@/lib/utils';

export default function DatabaseView() {
  const [news, setNews] = useState<AnalyzedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [inspiringOnly, setInspiringOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, inspiring: 0, recent: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const categories = [
    { id: 'all', name: '전체' },
    { id: '정치', name: '정치' },
    { id: '국제', name: '국제' },
    { id: '경제', name: '경제' },
    { id: '사회', name: '사회' },
    { id: '문화', name: '문화' },
    { id: '과학', name: '과학' },
    { id: '환경', name: '환경' },
    { id: '교육', name: '교육' },
    { id: '인물', name: '인물' },
    { id: '기타', name: '기타' }
  ];

  // 통계 조회
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('통계 조회 오류:', err);
    }
  }, []);

  // 뉴스 조회
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        category: category,
        limit: '1000', // 충분한 데이터를 가져오기 위해 큰 값 설정
      });

      if (inspiringOnly) {
        params.append('inspiring', 'true');
      }

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();

      if (data.success) {
        setNews(data.data);
      } else {
        setError(data.error || '뉴스를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (err: unknown) {
      console.error('뉴스 불러오기 에러:', err);
      setError('뉴스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [category, inspiringOnly]);

  useEffect(() => {
    fetchStats();
    fetchNews();
  }, [fetchStats, fetchNews]);

  // 검색 필터링
  const filteredNews = news.filter(item => {
    if (!searchTerm) return true;
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  // 소스별 통계
  const sourceStats = news.reduce((acc, item) => {
    acc[item.source] = (acc[item.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 카테고리별 통계
  const categoryStats = news.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-white shadow-lg border-b-2 border-blue-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-6">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              📊 데이터베이스 뉴스 조회
            </h1>
            <p className="text-gray-600">
              DB에 저장된 뉴스 데이터를 조회하고 관리합니다
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 뉴스</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-pink-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pink-100">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">감동 뉴스</p>
                <p className="text-2xl font-bold text-pink-700">{stats.inspiring}</p>
                <p className="text-xs text-gray-400">
                  전체의 {stats.total > 0 ? Math.round((stats.inspiring / stats.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">최근 24시간</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 감동 뉴스 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                감동 뉴스만
              </label>
              <div className="flex items-center p-3 bg-pink-50 rounded-lg border border-pink-200">
                <input
                  type="checkbox"
                  checked={inspiringOnly}
                  onChange={(e) => setInspiringOnly(e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-pink-300 rounded"
                />
                <label className="ml-2 text-sm text-pink-700 font-medium">
                  감동적인 뉴스만 표시
                </label>
              </div>
            </div>

            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="제목, 내용, 소스 검색..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 새로고침 버튼 */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  fetchStats();
                  fetchNews();
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* 소스별 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">소스별 통계</h3>
            <div className="space-y-2">
              {Object.entries(sourceStats)
                .sort(([,a], [,b]) => b - a)
                .map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{source}</span>
                    <span className="text-sm font-medium text-gray-900">{count}개</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 통계</h3>
            <div className="space-y-2">
              {Object.entries(categoryStats)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-gray-900">{count}개</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 뉴스 목록 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              뉴스 목록 ({filteredNews.length}개)
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">뉴스를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        소스
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        점수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        발행일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        링크
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentNews.map((item, index) => (
                      <tr key={`${item.source}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-normal">
                          <div className="text-sm font-medium text-gray-900 max-w-xs">
                            {item.title}
                          </div>
                          {item.isInspiring && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 mt-1">
                              감동
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(item.score)}`}>
                            {item.score}점
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.pubDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            보기
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {startIndex + 1} - {Math.min(endIndex, filteredNews.length)} / {filteredNews.length}개
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        이전
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
