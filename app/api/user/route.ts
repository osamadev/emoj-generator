/* eslint-disable prefer-const */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET() {

  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create a new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      profile = newProfile;
    } else if (error) {
      throw error;
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}