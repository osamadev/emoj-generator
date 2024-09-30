import { NextResponse } from 'next/server';
import Replicate from "replicate";
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prompt } = await req.json();

    // Generate emoji using Replicate
    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      {
        input: {
          width: 1024,
          height: 1024,
          prompt: "A TOK emoji of " + prompt,
          refine: "no_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: "",
          prompt_strength: 0.8,
        }
      }
    );

    if (!Array.isArray(output) || output.length === 0) {
      throw new Error('Invalid output from Replicate');
    }

    const imageUrl = output[0];

    // Upload emoji to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(`${userId}/${Date.now()}.png`, await fetch(imageUrl).then(res => res.blob()));

    if (uploadError) throw uploadError;

    // Get public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('emojis')
      .getPublicUrl(uploadData.path);

    // Add emoji to the 'emojis' table
    const { data: emojiData, error: insertError } = await supabase
      .from('emojis')
      .insert({
        image_url: publicUrl,
        prompt: prompt,
        creator_user_id: userId,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ emoji: emojiData });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate emoji' }, { status: 500 });
  }
}