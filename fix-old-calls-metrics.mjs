import { createClient } from '@supabase/supabase-js';
import Retell from 'retell-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function backfillMetrics() {
    console.log("Fetching users from DB...");
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) {
        console.error("DB Error:", error);
        return;
    }

    console.log(`Found ${users.length} users.`);

    console.log("Fetching recent calls from Retell API...");
    let calls = [];
    try {
        calls = await retellClient.call.list({ limit: 100 });
    } catch (e) {
        console.log("Fallback fetching POST /v2/list-calls");
        const response = await fetch('https://api.retellai.com/v2/list-calls', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ limit: 100 })
        });
        if (response.ok) {
            calls = await response.json();
        }
    }

    const arrCalls = Array.isArray(calls) ? calls : (calls.data || []);
    console.log(`Retrieved ${arrCalls.length} calls from Retell.`);

    for (const user of users) {
        // Skip those already having duration filled (if any)
        if (user.call_duration_seconds !== null) {
            continue;
        }

        // Find the latest call for this user
        const userCalls = arrCalls.filter(c => c.metadata && c.metadata.user_id === user.id);
        if (userCalls.length > 0) {
            // Sort to get the most recent one just in case
            userCalls.sort((a, b) => b.start_timestamp - a.start_timestamp);
            const targetCall = userCalls[0];

            let durationSeconds = null;
            if (targetCall.start_timestamp && targetCall.end_timestamp) {
                const diffMs = targetCall.end_timestamp - targetCall.start_timestamp;
                durationSeconds = Math.floor(diffMs / 1000);
            }

            const disconnection_reason = targetCall.disconnection_reason || null;
            
            // For call_initiated_at, if it's missing, let's backfill roughly with the start_timestamp of the call
            let initiatedAt = user.call_initiated_at;
            if (!initiatedAt && targetCall.start_timestamp) {
               initiatedAt = new Date(targetCall.start_timestamp).toISOString();
            }

            console.log(`Updating metrics for ${user.name} (${user.id}): Duration=${durationSeconds}s, Reason=${disconnection_reason}`);
            
            const updatePayload = {
                call_duration_seconds: durationSeconds,
                disconnection_reason: disconnection_reason,
            };
            if (initiatedAt) updatePayload.call_initiated_at = initiatedAt;

            const { error: updateErr } = await supabase
                .from('users')
                .update(updatePayload)
                .eq('id', user.id);
                
            if (updateErr) {
                console.error(`Failed to update user ${user.name}:`, updateErr);
            }
        }
    }
    
    console.log("Backfill complete.");
}

backfillMetrics();
