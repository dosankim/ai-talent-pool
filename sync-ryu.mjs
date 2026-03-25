import { createClient } from '@supabase/supabase-js';
import Retell from 'retell-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function syncRyu() {
    try {
        const userId = '4f8c3fa0-1ce8-48fe-a33b-6eaaf3a767ac'; // 류미선

        console.log("Fetching recent calls from Retell API...");

        let calls = [];
        try {
            calls = await retellClient.call.list({ limit: 50, filter_criteria: { statuses: ["ended", "completed", "error"] } });
        } catch (e) {
            console.log("Error with retellClient.call.list(), trying direct fetch POST /v2/list-calls");
            const response = await fetch('https://api.retellai.com/v2/list-calls', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ limit: 100 })
            });
            if (!response.ok) {
                throw new Error("Failed to fetch from list-calls: " + await response.text());
            }
            calls = await response.json();
        }

        // Find Ryu Mi-sun's call
        let arrCalls = Array.isArray(calls) ? calls : (calls.data || []);
        console.log(`Retrieved ${arrCalls.length} calls.`);

        const userCalls = arrCalls.filter(c => c.metadata && c.metadata.user_id === userId);
        if (userCalls.length === 0) {
            console.log("No calls found for user", userId);
            console.log("Recent calls user_ids:", arrCalls.slice(0, 5).map(c => c.metadata?.user_id));
            return;
        }

        const targetCall = userCalls[0];
        console.log(`Found Target Call: ${targetCall.call_id}, status: ${targetCall.call_status}`);

        const callData = targetCall;

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

        const { data: profileExists } = await supabase.from('profiles').select('id').eq('user_id', userId).single();

        const profileData = {
            user_id: userId,
            full_transcript: transcript,
            career_summary: career_summary,
            current_situation: current_situation,
            needs: needs,
            sentiment: sentiment,
            personality_traits: personality_traits,
            spelling_corrected_notes: spelling_corrected_notes,
        };

        if (profileExists) {
            await supabase.from('profiles').update(profileData).eq('user_id', userId);
        } else {
            await supabase.from('profiles').insert([profileData]);
        }

        // update user status
        await supabase.from('users').update({ status: '프로필 완성' }).eq('id', userId);

        console.log("Successfully synced Ryu Mi-sun's call and updated profile!");

    } catch (err) {
        console.error("Error:", err);
    }
}

syncRyu();
