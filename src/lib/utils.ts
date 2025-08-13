// HTML 태그 제거 및 텍스트 정리
export function stripHtml(html: string): string {
  if (!html) return '';
  
  // HTML 태그 제거
  let text = html.replace(/<[^>]*>/g, '');
  
  // HTML 엔티티 디코딩
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'");
  
  // 연속된 공백 정리
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// 안전한 HTML 렌더링을 위한 함수
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // 허용할 HTML 태그만 남기고 나머지는 제거
  const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const allowedAttributes = ['class', 'style'];
  
  // 위험한 태그와 속성 제거
  let sanitized = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // script 태그 제거
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // iframe 태그 제거
    .replace(/<object[^>]*>.*?<\/object>/gi, '') // object 태그 제거
    .replace(/<embed[^>]*>/gi, '') // embed 태그 제거
    .replace(/javascript:/gi, '') // javascript: 프로토콜 제거
    .replace(/on\w+\s*=/gi, '') // 이벤트 핸들러 제거
    .replace(/<a[^>]*>/gi, '') // a 태그 제거 (외부 링크 방지)
    .replace(/<\/a>/gi, '');
  
  // 허용되지 않은 태그 제거
  const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  sanitized = sanitized.replace(tagRegex, (match, slash, tagName, attributes) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // 허용된 태그의 경우 위험한 속성만 제거
      let cleanAttributes = attributes;
      const attrRegex = /(\w+)\s*=\s*["'][^"']*["']/g;
      cleanAttributes = cleanAttributes.replace(attrRegex, (attrMatch: string, attrName: string) => {
        if (allowedAttributes.includes(attrName.toLowerCase())) {
          return attrMatch;
        }
        return '';
      });
      return `<${slash}${tagName}${cleanAttributes}>`;
    }
    return ''; // 허용되지 않은 태그 제거
  });
  
  return sanitized;
}

// 텍스트 길이 제한
export function truncateText(text: string, maxLength: number = 200): string {
  if (!text) return '';
  
  const cleanText = stripHtml(text);
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  return cleanText.substring(0, maxLength) + '...';
}

// HTML 텍스트 길이 제한 (HTML 태그 유지)
export function truncateHtml(html: string, maxLength: number = 200): string {
  if (!html) return '';
  
  const cleanText = stripHtml(html);
  
  if (cleanText.length <= maxLength) {
    return html;
  }
  
  // HTML 태그를 고려하여 자르기
  const truncatedText = cleanText.substring(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    const finalText = truncatedText.substring(0, lastSpaceIndex);
    return `<p>${finalText}...</p>`;
  }
  
  return `<p>${truncatedText}...</p>`;
}

// 날짜 포맷팅
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

// 점수에 따른 색상 반환
export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-red-500';
  if (score >= 6) return 'text-orange-500';
  return 'text-yellow-500';
} 