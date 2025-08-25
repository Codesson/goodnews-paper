// Google Analytics 이벤트 추적 유틸리티

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

// 페이지뷰 추적
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }
};

// 뉴스 클릭 이벤트 추적
export const trackNewsClick = (newsTitle: string, category: string, isInspiring: boolean) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'news_click', {
      event_category: 'engagement',
      event_label: category,
      value: isInspiring ? 1 : 0,
      custom_parameters: {
        news_title: newsTitle,
        category: category,
        is_inspiring: isInspiring,
      },
    });
  }
};

// 카테고리 이동 이벤트 추적
export const trackCategoryNavigation = (category: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'category_navigation', {
      event_category: 'navigation',
      event_label: category,
    });
  }
};

// 감동 뉴스 필터 이벤트 추적
export const trackInspiringFilter = (enabled: boolean) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'inspiring_filter', {
      event_category: 'filter',
      event_label: enabled ? 'enabled' : 'disabled',
    });
  }
};

// 검색 이벤트 추적
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      event_category: 'engagement',
      event_label: searchTerm,
      value: resultsCount,
    });
  }
};

// 외부 링크 클릭 이벤트 추적
export const trackExternalLink = (url: string, source: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'external_link_click', {
      event_category: 'engagement',
      event_label: source,
      custom_parameters: {
        external_url: url,
        source: source,
      },
    });
  }
};
