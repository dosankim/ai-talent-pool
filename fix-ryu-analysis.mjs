import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fixRyu() {
    const userId = '4f8c3fa0-1ce8-48fe-a33b-6eaaf3a767ac'; // 류미선

    const factualProfile = {
        career_summary: "- 지역사회에서 문화 탐방 및 탐험 등 다수의 봉사활동 진행\n- 청년 창업 및 사회적 경제 창업 지원 업무 수행",
        current_situation: "- 체력이 예전 같지 않아 전일제(하루 종일) 근무는 어려운 상태임\n- 현재 거주 지역 내에 중장년 커뮤니티를 개설하여 캘리그라피 모임을 운영하고 있음",
        needs: "- 거주지 인근에서 주 1~2회 정도 함께 산책이나 운동을 할 수 있는 또래 여성(말벗 및 동행 파트너)을 구하는 형태의 활동을 강하게 희망함",
        sentiment: "매우 안정적이고 차분하나, 관계 형성에 적극적임",
        personality_traits: "지역 사회 활동에 적극적 참여하시며 타인과 어울려 활동하는 것을 좋아하시는 외향적이고 다정한 성향입니다.",
        spelling_corrected_notes: "- 지역 사회 봉사 및 청년/사회 경제 창업 지원 경력 보유\n- 체력적 한계로 종일반 근무 불가\n- 현재 지역에서 중장년 캘리그라피 커뮤니티 운영 중\n- 주 1~2회 거주지 인근에서 동년배 여성과 산책 및 운동을 동행하는 파트너 활동 희망"
    };

    const { error } = await supabase
        .from('profiles')
        .update(factualProfile)
        .eq('user_id', userId);

    if (error) {
        console.error("Error updating Ryu:", error);
    } else {
        console.log("Successfully manually updated Ryu's profile strictly based on factual transcript.");
    }
}

fixRyu();
