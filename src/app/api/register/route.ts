import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Retell from 'retell-sdk';

// Initialize Retell SDK
const retell = new Retell({
    apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(request: Request) {
    try {
        const { name, phone, agreed } = await request.json();

        if (!name || !phone || !agreed) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Save user to database (Supabase)
        const { data: user, error: dbError } = await supabase
            .from('users')
            .insert([
                { name, phone, agreed, status: '통화 대기' }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Registration API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
