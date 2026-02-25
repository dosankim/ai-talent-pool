import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Retell AI Webhook Endpoint
export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // Retell AI sends different event types. We only care when the call analysis is ready.
        const eventType = payload.event;
        if (eventType !== 'call_analyzed' && eventType !== 'call_ended') {
            // Ignore other events like 'call_started'
            return NextResponse.json({ success: true, message: 'Event ignored' });
        }

        const callData = payload.data || payload.call; // Fallback depending on webhooks v1 or v2
        if (!callData) {
            return NextResponse.json({ error: '유효하지 않은 Webhook Payload' }, { status: 400 });
        }

        const user_id = callData.metadata?.user_id;
        const call_status = callData.call_status; // e.g., 'ended', 'registered', 'error'

        let transcript = callData.transcript || '';

        // Calculate call duration
        if (callData.start_timestamp && callData.end_timestamp) {
            const diffMs = callData.end_timestamp - callData.start_timestamp;
            const minutes = Math.floor(diffMs / 60000);
            const seconds = Math.floor((diffMs % 60000) / 1000);
            const durationStr = `[통화 소요 시간: ${minutes}분 ${seconds}초]\n`;
            transcript = durationStr + transcript;
        }

        const analysis = callData.call_analysis || {};

        if (!user_id) {
            return NextResponse.json({ error: 'Metadata에 user_id가 없습니다.' }, { status: 400 });
        }

        const isSuccess = call_status === 'ended' || call_status === 'completed';

        // 1. users 테이블의 상태 업데이트 ('통화 완료')
        await supabase
            .from('users')
            .update({ status: isSuccess ? '통화 완료' : '통화 실패' })
            .eq('id', user_id);

        // 분석 완료 시 프로필 저장 로직 (call_analyzed 이벤트일 경우 주로)
        if (eventType === 'call_analyzed' && isSuccess) {

            // Retell의 기본 요약본을 상황에 맞게 매핑 (커스텀 데이터 스키마가 설정 안된 경우를 대비한 Fallback)
            const career_summary = analysis.custom_analysis_data?.career_summary || analysis.call_summary || '내용 없음';
            const current_situation = analysis.custom_analysis_data?.current_situation || '요약본 참조';
            const needs = analysis.custom_analysis_data?.needs || '의향 수집됨';
            const sentiment = analysis.custom_analysis_data?.sentiment || '분석 중';
            const personality_traits = analysis.custom_analysis_data?.personality_traits || '분석 중';
            const spelling_corrected_notes = analysis.custom_analysis_data?.spelling_corrected_notes || '보정 내용 없음';

            const { data: profile, error } = await supabase
                .from('profiles')
                .insert([{
                    user_id: user_id,
                    full_transcript: transcript,
                    career_summary: career_summary,
                    current_situation: current_situation,
                    needs: needs,
                    sentiment: sentiment,
                    personality_traits: personality_traits,
                    spelling_corrected_notes: spelling_corrected_notes,
                }])
                .select()
                .single();

            if (error) {
                console.error('Profile 저장 오류:', error);
                return NextResponse.json({ error: 'Profile 저장 실패' }, { status: 500 });
            }

            // 최종적으로 users 테이블 상태를 '프로필 완성'으로 업데이트
            await supabase
                .from('users')
                .update({ status: '프로필 완성' })
                .eq('id', user_id);

            return NextResponse.json({ success: true, profile });
        }

        return NextResponse.json({ success: true, message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
