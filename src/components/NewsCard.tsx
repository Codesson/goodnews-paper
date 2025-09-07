'use client';

import { AnalyzedNews } from '@/lib/types';
import { formatDate, getScoreColor } from '@/lib/utils';

interface NewsCardProps {
  news: AnalyzedNews;
  onNewsClick: (url: string, title: string, category: string, isInspiring: boolean) => void;
}

export default function NewsCard({ news, onNewsClick }: NewsCardProps) {
  const handleClick = () => {
    onNewsClick(news.link, news.title, news.category, news.isInspiring);
  };

  const cleanTitle = news.title.replace(/<[^>]*>/g, '');
  const cleanDescription = news.description.replace(/<[^>]*>/g, '');

  return (
    <div 
      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-blue-200"
      onClick={handleClick}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {news.category}
          </span>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getScoreColor(news.score)}`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {news.score}
          </div>
        </div>
      </div>

      {/* 제목 */}
      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
        {cleanTitle}
      </h3>
      
      {/* 설명 */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
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
  );
}
