'use client';

import { useState, useEffect } from 'react';

interface CollectionLog {
  source: string;
  status: string;
  count: number;
  errorMessage?: string;
  createdAt: string;
}

interface CollectionStats {
  total: number;
  success: number;
  failed: number;
  error: number;
  totalCollected: number;
  lastCollection?: string;
}

export default function AdminPage() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionResult, setCollectionResult] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<CollectionLog[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(false);

  // 수집 로그 조회
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/collection-logs');
      const result = await response.json();
      
      if (result.success) {
        setLogs(result.data.logs);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('로그 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 뉴스 수집 실행
  const collectNews = async () => {
    try {
      setIsCollecting(true);
      setCollectionResult(null);
      
      const response = await fetch('/api/collect-news', {
        method: 'POST'
      });
      
      const result = await response.json();
      setCollectionResult(result);
      
      // 수집 완료 후 로그 새로고침
      if (result.success) {
        setTimeout(() => {
          fetchLogs();
        }, 1000);
      }
      
    } catch (error) {
      console.error('뉴스 수집 오류:', error);
      setCollectionResult({
        success: false,
        error: '뉴스 수집 중 오류가 발생했습니다.'
      });
    } finally {
      setIsCollecting(false);
    }
  };

  // 컴포넌트 마운트 시 로그 조회
  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'error': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 뉴스 수집 관리</h1>
          <p className="text-gray-600 mt-2">
            RSS 피드에서 뉴스를 수집하고 데이터베이스에 저장합니다.
          </p>
        </div>

        {/* 수집 실행 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔄 뉴스 수집 실행
          </h2>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={collectNews}
              disabled={isCollecting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCollecting ? '수집 중...' : '뉴스 수집 시작'}
            </button>
            
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? '로딩 중...' : '로그 새로고침'}
            </button>
          </div>

          {/* 수집 결과 */}
          {collectionResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              collectionResult.success 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="font-semibold mb-2">
                {collectionResult.success ? '✅ 수집 완료' : '❌ 수집 실패'}
              </div>
              <div className="text-sm">
                {String(collectionResult.message || collectionResult.error || '')}
              </div>
              {collectionResult.data && (
                <div className="mt-2 text-sm">
                  <div>📊 수집된 뉴스: {collectionResult.data.collected}개</div>
                  <div>💾 저장된 뉴스: {collectionResult.data.saved}개</div>
                  <div>✨ 감동적인 뉴스: {collectionResult.data.inspiring}개</div>
                  <div>📅 수집 시간: {formatDate(collectionResult.data.timestamp)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 통계 섹션 */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📈 수집 통계
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">총 수집 횟수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                <div className="text-sm text-gray-600">성공</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">실패</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.error}</div>
                <div className="text-sm text-gray-600">오류</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalCollected}</div>
                <div className="text-sm text-gray-600">총 수집 뉴스</div>
              </div>
            </div>
            
            {stats.lastCollection && (
              <div className="mt-4 text-sm text-gray-600">
                마지막 수집: {formatDate(stats.lastCollection)}
              </div>
            )}
          </div>
        )}

        {/* 수집 로그 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 수집 로그
          </h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              수집 로그가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소스
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수집 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      오류 메시지
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.errorMessage || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 