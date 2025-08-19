import { NextResponse } from 'next/server';
import { getAllNews } from '@/lib/database';

export async function GET() {
  try {
    // 최신 뉴스 20개 가져오기
    const news = await getAllNews('all', 20);
    
    const baseUrl = 'https://goodnews-paper.vercel.app';
    const currentDate = new Date().toISOString();
    
    // RSS XML 생성
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Good News Paper - 따뜻하고 희망찬 뉴스</title>
    <description>감동적이고 긍정적인 뉴스만을 엄선하여 전해드리는 Good News Paper</description>
    <link>${baseUrl}</link>
    <language>ko-KR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Good News Paper</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <webMaster>contact@goodnews-paper.com (Good News Paper Team)</webMaster>
    <managingEditor>editor@goodnews-paper.com (Good News Paper Editor)</managingEditor>
    <category>News</category>
    <copyright>© 2024 Good News Paper. All rights reserved.</copyright>
    
    ${news.map((item) => `
    <item>
      <title><![CDATA[${String(item.title || '')}]]></title>
      <description><![CDATA[${String(item.description || '')}]]></description>
      <link>${String(item.link || '')}</link>
      <guid isPermaLink="true">${String(item.link || '')}</guid>
      <pubDate>${new Date(String(item.pubDate || '')).toUTCString()}</pubDate>
      <source url="${baseUrl}/api/rss">Good News Paper</source>
      <category>${String(item.category || '')}</category>
      <content:encoded><![CDATA[
        <h2>${String(item.title || '')}</h2>
        <p>${String(item.description || '')}</p>
        <p><strong>분류:</strong> ${String(item.category || '')}</p>
        <p><strong>출처:</strong> ${String(item.source || '')}</p>
        <p><strong>감동 점수:</strong> ${Number(item.score || 0)}점</p>
        <p><a href="${String(item.link || '')}" target="_blank">원본 기사 보기</a></p>
      ]]></content:encoded>
    </item>`).join('')}
    
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800',
      },
    });
    
  } catch (error) {
    console.error('RSS 피드 생성 오류:', error);
    
    // 에러 시 기본 RSS 피드 반환
    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Good News Paper - 따뜻하고 희망찬 뉴스</title>
    <description>감동적이고 긍정적인 뉴스만을 엄선하여 전해드리는 Good News Paper</description>
    <link>https://goodnews-paper.vercel.app</link>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
    <item>
      <title>서비스 준비 중입니다</title>
      <description>Good News Paper가 곧 멋진 뉴스들로 찾아뵙겠습니다.</description>
      <link>https://goodnews-paper.vercel.app</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;
    
    return new NextResponse(errorRss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}
