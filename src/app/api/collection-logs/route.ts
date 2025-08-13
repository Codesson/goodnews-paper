import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // 최근 30일간의 수집 로그 조회
    const result = await sql`
      SELECT 
        source,
        status,
        count,
        error_message,
        created_at
      FROM collection_logs 
      WHERE created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const logs = result.rows.map((row: any) => ({
      source: row.source,
      status: row.status,
      count: row.count,
      errorMessage: row.error_message,
      createdAt: row.created_at
    }));

    // 통계 계산
    const stats = {
      total: logs.length,
      success: logs.filter(log => log.status === 'success').length,
      failed: logs.filter(log => log.status === 'failed').length,
      error: logs.filter(log => log.status === 'error').length,
      totalCollected: logs.reduce((sum, log) => sum + (log.count || 0), 0),
      lastCollection: logs[0]?.createdAt || null
    };

    return NextResponse.json({
      success: true,
      data: {
        logs,
        stats
      },
      message: '수집 로그를 성공적으로 조회했습니다.'
    });

  } catch (error) {
    console.error('수집 로그 조회 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: '수집 로그 조회 중 오류가 발생했습니다.',
        data: { logs: [], stats: {} }
      },
      { status: 500 }
    );
  }
} 