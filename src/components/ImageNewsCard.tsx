'use client';

import { AnalyzedNews } from '@/lib/types';
import { formatDate, getScoreColor } from '@/lib/utils';
import Image from 'next/image';

interface ImageNewsCardProps {
  news: AnalyzedNews;
  onNewsClick: (url: string, title: string, category: string, isInspiring: boolean) => void;
}

export default function ImageNewsCard({ news, onNewsClick }: ImageNewsCardProps) {
  const handleClick = () => {
    onNewsClick(news.link, news.title, news.category, news.isInspiring);
  };

  const cleanTitle = news.title.replace(/<[^>]*>/g, '');
  const cleanDescription = news.description.replace(/<[^>]*>/g, '');

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      onClick={handleClick}
    >
      {/* 이미지 영역 */}
      <div className="relative h-48 w-full overflow-hidden">
        {news.imageUrl ? (
          <Image
            src={news.imageUrl}
            alt={cleanTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // 이미지 로드 실패 시 기본 이미지로 대체
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/400/200';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">뉴스 이미지</p>
            </div>
          </div>
        )}
        
        {/* 오버레이 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 카테고리 태그 */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
            {news.category}
          </span>
        </div>
        
        {/* 감동 점수 */}
        <div className="absolute top-3 right-3">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getScoreColor(news.score)}`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {news.score}
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-5">
        {/* 제목 */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {cleanTitle}
        </h3>
        
        {/* 설명 */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed">
          {cleanDescription}
        </p>
        
        {/* 하단 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{news.source}</span>
            <span>•</span>
            <span>{formatDate(news.pubDate)}</span>
          </div>
          
          {/* 읽기 버튼 */}
          <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
            <span>읽기</span>
            <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
