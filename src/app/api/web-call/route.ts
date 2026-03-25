import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Retell from 'retell-sdk';

const retell = new Retell({
    apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: '유저 ID가 필요합니다.' }, { status: 400 });
        }

        // 1. Supabase에서 유저 정보 조회
        const { data: user, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (dbError || !user) {
            console.error('User not found:', dbError);
            return NextResponse.json({ error: '유저를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: '유저 데이터 저장 실패' }, { status: 500 });
        }

        // 2. Retell AI Web Call 생성
        // Vercel 환경 변수에 과거 에이전트 ID가 캐싱되어 있을 수 있으므로 명시적으로 최신 ID를 하드코딩합니다.
        const agentId = "agent_cca4333d1b63d905ee50c810c7";

        const webCallResponse = await retell.call.createWebCall({
            agent_id: agentId,
            metadata: {
                user_id: user.id
            },
            retell_llm_dynamic_variables: {
                user_name: user.name
            }
        });

        console.log(`[Web Call Created] User: ${user.name}, Call ID: ${webCallResponse.call_id}`);

        // 3. 유저 상태 업데이트
        await supabase
            .from('users')
            .update({
                status: '웹 상담 시작',
                call_initiated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        return NextResponse.json({
            success: true,
            accessToken: webCallResponse.access_token,
            callId: webCallResponse.call_id,
            userId: user.id
        });

    } catch (error: any) {
        console.error('Web Call API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
