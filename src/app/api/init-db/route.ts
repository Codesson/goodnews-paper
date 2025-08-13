import { NextResponse } from 'next/server';
import { createTables } from '@/lib/database';

export async function POST() {
  try {
    await createTables();
    
    return NextResponse.json({
      success: true,
      message: '데이터베이스 테이블이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '데이터베이스 초기화 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
} 