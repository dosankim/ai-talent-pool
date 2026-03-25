import { createClient } from '@supabase/supabase-js';
import Retell from 'retell-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function run() {
    // get Ryu Mi-sun's user record
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .like('name', '%류미선%')
        .order('created_at', { ascending: false });
        
    if (error || !users || users.length === 0) {
        console.log("No user found for 류미선");
        return;
    }
    
    const user = users[0];
    console.log("Found user:", user);

    // List recent calls from Retell to find hers
    console.log("Fetching recent calls from Retell...");
    const callsResponse = await retellClient.call.list();
    const calls = callsResponse; // Assuming list() returns an array or it has a data property
    
    // It might be paginated, let's just check the first few.
    let targetCall = null;
    for (const call of calls) {
        if (call.metadata && call.metadata.user_id === user.id) {
            targetCall = call;
            break;
        }
    }
    
    if (!targetCall) {
        console.log("No call found for this user in recent Retell calls.");
        console.log(calls.slice(0, 3).map(c => ({ id: c.call_id, metadata: c.metadata })));
        return;
    }
    
    console.log("Found call:", targetCall.call_id, targetCall.call_status);
    
    // Now simulate the webhook behavior to update her profile
    const callData = targetCall;
    
    const user_id = user.id;
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
    
    const career_summary = analysis.custom_analysis_data?.career_summary || analysis.call_summary || '내용 없음';
    const current_situation = analysis.custom_analysis_data?.current_situation || '요약본 참조';
    const needs = analysis.custom_analysis_data?.needs || '의향 수집됨';
    const sentiment = analysis.custom_analysis_data?.sentiment || '분석 중';
    const personality_traits = analysis.custom_analysis_data?.personality_traits || '분석 중';
    const spelling_corrected_notes = analysis.custom_analysis_data?.spelling_corrected_notes || '보정 내용 없음';

    const { data: profileExists } = await supabase.from('profiles').select('id').eq('user_id', user_id).single();

    const profileData = {
        user_id: user_id,
        full_transcript: transcript,
        career_summary: career_summary,
        current_situation: current_situation,
        needs: needs,
        sentiment: sentiment,
        personality_traits: personality_traits,
        spelling_corrected_notes: spelling_corrected_notes,
    };

    if (profileExists) {
        await supabase.from('profiles').update(profileData).eq('user_id', user_id);
    } else {
        await supabase.from('profiles').insert([profileData]);
    }

    await supabase.from('users').update({ status: '프로필 완성' }).eq('id', user_id);
    console.log("Profile updated successfully for 류미선!");
}

run().catch(console.error);
