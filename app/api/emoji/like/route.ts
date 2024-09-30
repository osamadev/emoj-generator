import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { emojiId, like } = await req.json();

    // First, fetch the current emoji data
    const { data: currentEmoji, error: fetchError } = await supabase
      .from('emojis')
      .select('likes_count')
      .eq('id', emojiId)
      .single();

    if (fetchError) throw fetchError;

    // Calculate the new likes count
    const newLikesCount = like ? currentEmoji.likes_count + 1 : currentEmoji.likes_count - 1;

    // Update likes count in emojis table
    const { data: updatedEmoji, error: updateError } = await supabase
      .from('emojis')
      .update({ likes_count: newLikesCount })
      .eq('id', emojiId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ emoji: updatedEmoji });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
  }
}