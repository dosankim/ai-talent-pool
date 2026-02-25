const { createClient } = require('@supabase/supabase-js');
const { Retell } = require('retell-sdk');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function syncProfile() {
    try {
        const callId = "call_edc5105f4327de2faa1d7dde6f0";
        console.log(`Fetching data for: ${callId}...`);

        // 1. Get Call Data
        const call = await retellClient.call.retrieve(callId);

        // 2. Find the user ID for 김영우
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

        // 3. Extract Transcript & Summary
        const transcript = call.transcript || "대화 내용 없음";
        const analysis = call.call_analysis || {};
        const customAnalysis = analysis.custom_analysis_data || {};

        // Map Retell summary variables to DB if available, else use generic
        const career = customAnalysis.career_summary || "요약 정보 없음";
        const situation = customAnalysis.current_situation || "상황 정보 없음";
        const needs = customAnalysis.needs || "니즈 정보 없음";
        const sentiment = customAnalysis.sentiment || "분석 항목 없음";
        const personality_traits = customAnalysis.personality_traits || "분석 항목 없음";
        const spelling_corrected_notes = customAnalysis.spelling_corrected_notes || "보정 내용 없음";

        console.log(`Transcript Length: ${transcript.length}`);

        // 4. Save to Profiles Table
        const { error: profileErr } = await supabase
            .from('profiles')
            .insert([{
                user_id: userId,
                full_transcript: transcript,
                career_summary: career,
                current_situation: situation,
                needs: needs,
                sentiment: sentiment,
                personality_traits: personality_traits,
                spelling_corrected_notes: spelling_corrected_notes
            }]);

        if (profileErr) console.error("Error saving profile", profileErr);

        // 5. Update User Status
        const { error: updateErr } = await supabase
            .from('users')
            .update({ status: '프로필 완성' })
            .eq('id', userId);

        if (updateErr) console.error("Error updating user status", updateErr);

        console.log("Successfully synced profile to database!");

    } catch (error) {
        console.error("Sync Error:", error);
    }
}

syncProfile();
