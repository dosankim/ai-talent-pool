import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Retell from 'retell-sdk';

const retell = new Retell({
    apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(request: Request) {
    try {
        const { userId, phone, name } = await request.json();

        if (!userId || !phone || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`[Manual AI Call Triggered] Calling ${name} at ${phone}...`);

        const agentId = process.env.RETELL_AGENT_ID || "agent_d0b27c4659b0feb0f6eaeeaaaf";
        if (!agentId) throw new Error("Retell Agent ID is missing");

        // Retell AI (and Twilio) requires E.164 format (+CountryCode PhoneNumber)
        let formattedPhone = phone.replace(/[^0-9+]/g, ""); // Remove dashes/spaces but KEEP +
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "+82" + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith("82")) {
            formattedPhone = "+" + formattedPhone;
        } else if (!formattedPhone.startsWith("+")) {
            formattedPhone = "+82" + formattedPhone;
        }

        console.log(`[DEBUG Formatting] Original DB phone: "${phone}"`);
        console.log(`[DEBUG Formatting] Final to_number sent to Retell: "${formattedPhone}"`);

        const callResponse = await retell.call.createPhoneCall({
            from_number: "+12565781774", // Imported Twilio SIP Trunk Number (Requires exact string match without spaces for SIP)
            to_number: formattedPhone,
            override_agent_id: agentId,
            retell_llm_dynamic_variables: {
                user_name: name
            },
            metadata: {
                user_id: userId
            }
        });

        console.log("Retell Call Initiated:", callResponse.call_id);

        // Update DB status to indicate call is in progress/initiated
        await supabase
            .from('users')
            .update({ status: '전화 발신됨' })
            .eq('id', userId);

        return NextResponse.json({ success: true, callId: callResponse.call_id });

    } catch (error: any) {
        console.error('Call Trigger API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
