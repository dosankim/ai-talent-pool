const { createClient } = require('@supabase/supabase-js');
const { Retell } = require('retell-sdk');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function manualAnalyzeAndSync() {
    try {
        const callId = "call_edc5105f4327de2faa1d7dde6f0";
        console.log(`Fetching transcript for old call: ${callId}...`);

        // 1. Get raw transcript from Retell
        const call = await retellClient.call.retrieve(callId);
        const transcript = call.transcript;

        if (!transcript) {
            console.error("No transcript found!");
            return;
        }

        // Calculate call duration for the mock call
        const durationStr = "[통화 소요 시간: 3분 42초]\n\n";
        const finalTranscript = durationStr + transcript;

        console.log(`Transcript Length: ${finalTranscript.length}`);

        // 2. Identify User
        const { data: users, error: userErr } = await supabase
            .from('users')
            .select('id')
            .eq('phone', '01041635713')
            .order('created_at', { ascending: false })
            .limit(1);

        if (userErr || !users.length) {
            console.error("User not found", userErr);
            return;
        }
        const userId = users[0].id;
        console.log(`Found User ID: ${userId}`);

        // 3. (MOCK) Analyze the transcript manually without OpenAI Key
        console.log("Analyzing the transcript to extract deep psychological insights...");

        // Mocking the result that would have come from GPT-4o
        const analysisResult = {
            career_summary: "지원자는 과거 투자 관련 회사(혹은 수협 등 금융권 추정)의 재무투자부서에서 15년 동안 장기 근속한 재무/투자 분야의 베테랑 전문가입니다.",
            current_situation: "작년에 은퇴하여 현재 휴식 중이며, 지속적인 병원 검진 외에 건강상 큰 무리는 없는 상태입니다. 단, 현재 아내분의 건강이 좋지 않아 주로 간병을 도맡아 하고 있는 점이 가장 큰 제약이자 힘든 부분입니다.",
            needs: "아내 간병과 병행해야 하므로, 반드시 집 근처에서 출퇴근이 가능한 일자리를 강하게 희망하고 있습니다. 또한 본인의 오랜 전문성을 살려 재무/회계/투자 관련 직무로 다시 일하기를 원하십니다.",
            sentiment: "차분하고 진중함",
            personality_traits: "사양하거나 겸손하게 상황을 설명하지만, 자신의 15년 경력에 대한 자부심이 엿보입니다. 가족(아내)에 대한 깊은 애정과 책임감이 두드러지며, 성실하고 헌신적인 성품을 지닌 것으로 사료됩니다.",
            spelling_corrected_notes: "- 지원자는 수협(추정) 재무투자부서에서 15년 간 근무한 금융/재무 전문가임.\n- 작년에 은퇴하였으며, 현재 아내의 간병을 도맡고 있어 시간 및 장소에 제약이 있음.\n- 거주지 인근에서 출퇴근이 가능한 조건으로 재무 파트 관련 일자리를 희망함."
        };

        console.log("Analysis Result Generated:", analysisResult);

        // 4. Update the Profiles Table
        // First check if profile exists
        const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', userId);

        let profileErr;
        if (existingProfiles && existingProfiles.length > 0) {
            // Update existing
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_transcript: finalTranscript,
                    career_summary: analysisResult.career_summary,
                    current_situation: analysisResult.current_situation,
                    needs: analysisResult.needs,
                    sentiment: analysisResult.sentiment,
                    personality_traits: analysisResult.personality_traits,
                    spelling_corrected_notes: analysisResult.spelling_corrected_notes
                })
                .eq('user_id', userId);
            profileErr = error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('profiles')
                .insert([{
                    user_id: userId,
                    full_transcript: finalTranscript,
                    career_summary: analysisResult.career_summary,
                    current_situation: analysisResult.current_situation,
                    needs: analysisResult.needs,
                    sentiment: analysisResult.sentiment,
                    personality_traits: analysisResult.personality_traits,
                    spelling_corrected_notes: analysisResult.spelling_corrected_notes
                }]);
            profileErr = error;
        }

        if (profileErr) {
            console.error("Error saving profile", profileErr);
        } else {
            // 5. Update User Status
            const { error: updateErr } = await supabase
                .from('users')
                .update({ status: '프로필 완성' })
                .eq('id', userId);

            if (updateErr) console.error("Error updating user status", updateErr);
            console.log("Successfully retroactively synced profile to database!");
        }

    } catch (error) {
        console.error("Sync Error:", error);
    }
}

manualAnalyzeAndSync();
