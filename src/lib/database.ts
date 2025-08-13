import { sql } from '@vercel/postgres';
import { NewsItem, AnalyzedNews } from './types';

// 데이터베이스 테이블 생성
export async function createTables() {
  try {
    // 뉴스 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        link TEXT NOT NULL UNIQUE,
        pub_date TIMESTAMP NOT NULL,
        source VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        is_inspiring BOOLEAN DEFAULT false,
        score INTEGER DEFAULT 0,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 사용자 북마크 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 뉴스 수집 로그 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS collection_logs (
        id SERIAL PRIMARY KEY,
        source VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL,
        count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('데이터베이스 테이블 생성 완료');
  } catch (error) {
    console.error('데이터베이스 테이블 생성 오류:', error);
  }
}

// 뉴스 데이터 저장
export async function saveNews(newsItems: AnalyzedNews[]): Promise<void> {
  try {
    for (const news of newsItems) {
      await sql`
        INSERT INTO news (title, description, link, pub_date, source, category, is_inspiring, score, reason)
        VALUES (${news.title}, ${news.description}, ${news.link}, ${news.pubDate}, ${news.source}, ${news.category}, ${news.isInspiring}, ${news.score}, ${news.reason})
        ON CONFLICT (link) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          pub_date = EXCLUDED.pub_date,
          category = EXCLUDED.category,
          is_inspiring = EXCLUDED.is_inspiring,
          score = EXCLUDED.score,
          reason = EXCLUDED.reason,
          updated_at = CURRENT_TIMESTAMP
      `;
    }
    console.log(`${newsItems.length}개의 뉴스 저장 완료`);
  } catch (error) {
    console.error('뉴스 저장 오류:', error);
  }
}

// 감동적인 뉴스 조회
export async function getInspiringNews(category?: string, limit: number = 20): Promise<AnalyzedNews[]> {
  try {
    let result;
    
    if (category && category !== 'all') {
      result = await sql`
        SELECT * FROM news 
        WHERE is_inspiring = true AND category = ${category}
        ORDER BY score DESC, pub_date DESC 
        LIMIT ${limit}
      `;
    } else {
      result = await sql`
        SELECT * FROM news 
        WHERE is_inspiring = true
        ORDER BY score DESC, pub_date DESC 
        LIMIT ${limit}
      `;
    }
    
    return result.rows.map((row: any) => ({
      title: row.title,
      description: row.description,
      link: row.link,
      pubDate: row.pub_date,
      source: row.source,
      category: row.category,
      isInspiring: row.is_inspiring,
      score: row.score,
      reason: row.reason
    }));
  } catch (error) {
    console.error('뉴스 조회 오류:', error);
    return [];
  }
}

// 뉴스 수집 로그 저장
export async function saveCollectionLog(source: string, status: string, count: number = 0, errorMessage?: string): Promise<void> {
  try {
    await sql`
      INSERT INTO collection_logs (source, status, count, error_message)
      VALUES (${source}, ${status}, ${count}, ${errorMessage})
    `;
  } catch (error) {
    console.error('수집 로그 저장 오류:', error);
  }
}

// 데이터베이스 통계 조회
export async function getDatabaseStats() {
  try {
    const totalNews = await sql`SELECT COUNT(*) as total FROM news`;
    const inspiringNews = await sql`SELECT COUNT(*) as inspiring FROM news WHERE is_inspiring = true`;
    const recentNews = await sql`SELECT COUNT(*) as recent FROM news WHERE created_at > NOW() - INTERVAL '24 hours'`;
    
    return {
      total: totalNews.rows[0].total,
      inspiring: inspiringNews.rows[0].inspiring,
      recent: recentNews.rows[0].recent
    };
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return { total: 0, inspiring: 0, recent: 0 };
  }
} 