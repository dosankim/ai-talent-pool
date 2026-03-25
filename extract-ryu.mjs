import { createClient } from '@supabase/supabase-js';
import Retell from 'retell-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function extractRyu() {
    try {
        const userId = '4f8c3fa0-1ce8-48fe-a33b-6eaaf3a767ac'; // 류미선

        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
        console.log("Original Transcript in DB:");
        console.log("===============================");
        console.log(profile?.full_transcript);
        console.log("===============================");

    } catch (err) {
        console.error("Error:", err);
    }
}

extractRyu();
