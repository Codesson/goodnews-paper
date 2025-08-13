import { NextResponse } from 'next/server';
import { getDatabaseStats } from '@/lib/database';

export async function GET() {
  try {
    const stats = await getDatabaseStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: '데이터베이스 통계를 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '통계 조회 중 오류가 발생했습니다.',
        data: { total: 0, inspiring: 0, recent: 0 }
      },
      { status: 500 }
    );
  }
} 