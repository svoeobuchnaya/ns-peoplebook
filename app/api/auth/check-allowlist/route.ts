import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ allowed: false }, { status: 400 });
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase
      .from('allowed_emails')
      .select('email, is_admin')
      .ilike('email', email.trim())
      .single();

    if (error || !data) {
      return NextResponse.json({ allowed: false, isAdmin: false });
    }

    return NextResponse.json({ 
      allowed: true, 
      isAdmin: data.is_admin || false 
    });
  } catch (error) {
    console.error('Allowlist check error:', error);
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}
