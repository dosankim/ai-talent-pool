import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SolapiMessageService } from 'solapi';

// 환경 변수 설정 (없을 경우를 대비해 콘솔 출력으로 대체)
const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || '';
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || '';
const SENDER_NUMBER = process.env.SOLAPI_SENDER_NUMBER || '01000000000'; // 발신번호 사전 등록 필요

let messageService: SolapiMessageService | null = null;
if (SOLAPI_API_KEY && SOLAPI_API_SECRET) {
    messageService = new SolapiMessageService(SOLAPI_API_KEY, SOLAPI_API_SECRET);
}

export async function POST(request: Request) {
    try {
        const { name, phone, agreed } = await request.json();

        if (!name || !phone) {
            return NextResponse.json({ error: '이름과 연락처는 필수 항목입니다.' }, { status: 400 });
        }

        // 1. Supabase 접속 및 유저 생성
        const { data: user, error: dbError } = await supabase
            .from('users')
            .insert([
                { name, phone, agreed: !!agreed, status: '웹 상담 대기' }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: '유저 데이터 저장 실패' }, { status: 500 });
        }

        // 2. 고유 접속 링크 생성 (환경 변수가 없으면 localhost 우선, 프로덕션에선 VERCEL_URL 등 활용)
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const callLink = `${baseUrl}/call/${user.id}`;
        const messageText = `[SAI PLUS]\n\n안녕하세요 ${name} 선생님.\nAI 시니어 캐스팅 인터뷰 신청이 완료되었습니다.\n\n아래 전용 링크를 눌러 편하신 시간에 언제든 AI 인터뷰를 진행해 주세요.\n\n▶ 인터뷰 시작하기:\n${callLink}\n\n문의사항이 있으시면 언제든 연락바랍니다. 감사합니다.`;

        // 3. Solapi 알림톡/문자 발송
        if (messageService && SENDER_NUMBER !== '01000000000') {
            try {
                await messageService.sendOne({
                    to: phone.replace(/[^0-9]/g, ''),
                    from: SENDER_NUMBER,
                    text: messageText,
                });
                console.log(`[SMS 발송 성공] ${phone} -> ${callLink}`);
            } catch (smsError) {
                console.error('[SMS 발송 실패]', smsError);
                // 발송 실패해도 사용자는 알 필요 없이, 내부 로그만 남김. (나중에 어드민에서 재발송 가능)
            }
        } else {
            // API Key가 없거나 발신번호가 기본값인 경우 개발 모드로 판단하고 콘솔에 링크 출력
            console.log('\n--- [DEV MODE] SMS 알림톡 시뮬레이션 ---');
            console.log(`[To]: ${phone}`);
            console.log(messageText);
            console.log('----------------------------------------\n');
        }

        return NextResponse.json({
            success: true,
            userId: user.id
        });

    } catch (error: any) {
        console.error('Register API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
