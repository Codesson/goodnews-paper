import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://goodnews-paper.vercel.app'
  
  // 카테고리 목록
  const categories = [
    '국내',
    '국제', 
    '인물',
    '사회',
    '환경',
    '과학',
    '교육'
  ]

  // 기본 페이지들
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
  ]

  // 카테고리별 페이지들 추가
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}?category=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  return [...routes, ...categoryRoutes]
}
