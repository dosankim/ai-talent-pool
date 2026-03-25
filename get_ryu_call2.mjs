import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const res = await fetch('https://api.retellai.com/v2/list-calls', { // or similar endpoint, let's try direct curl GET https://api.retellai.com/v2/call
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.RETELL_API_KEY}`
        }
    });
    
    // Actually Retell API uses https://api.retellai.com/v2/call to list calls
    const res2 = await fetch('https://api.retellai.com/v2/call', {
        headers: { 'Authorization': `Bearer ${process.env.RETELL_API_KEY}` }
    });
    
    if (res2.ok) {
        const calls = await res2.json();
        const userCalls = calls.filter(c => c.metadata && c.metadata.user_id === '4f8c3fa0-1ce8-48fe-a33b-6eaaf3a767ac');
        console.log("Found calls for user:", userCalls);
        if(userCalls.length > 0) {
            console.log("Found target call:", userCalls[0].call_id);
            // Print status
            console.log("Call status:", userCalls[0].call_status);
            console.log("Call transcript:", userCalls[0].transcript);
        }
    } else {
        console.log("Failed to fetch calls:", await res2.text());
    }
}
run();
