import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testSb() {
    const { data: users, error } = await supabase.from('users').select('id, name, call_duration_seconds, call_initiated_at, disconnection_reason');
    if (error) console.log(error);
    else console.log(users);
}
testSb();
