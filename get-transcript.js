const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchTranscript() {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('full_transcript')
            .limit(1);

        if (error) console.error("Error", error);
        else console.log(profiles[0].full_transcript);
    } catch (e) {
        console.error(e);
    }
}
fetchTranscript();
