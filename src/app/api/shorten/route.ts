import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to generate a short URL
const generateShortUrl = () => {
  return crypto.randomBytes(3).toString('hex'); // Generates a 6-character hash
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalUrl } = body;

    if (!originalUrl) {
      return NextResponse.json({ error: 'Original URL is required' }, { status: 400 });
    }

    // Check if the original URL already exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from('urls')
      .select('*')
      .eq('original_url', originalUrl)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingRecord) {
      // Return the existing short URL
      return NextResponse.json({ shortUrl: existingRecord.short_url });
    }

    // Generate a new short URL
    let shortUrl;
    let isUnique = false;

    while (!isUnique) {
      shortUrl = generateShortUrl();

      // Check for uniqueness
      const { data: conflictRecord } = await supabase
        .from('urls')
        .select('id')
        .eq('short_url', shortUrl)
        .single();

      if (!conflictRecord) {
        isUnique = true;
      }
    }

    // Insert the new URL pair
    const { error: insertError } = await supabase
      .from('urls')
      .insert({
        original_url: originalUrl,
        short_url: shortUrl,
      });

    if (insertError) {
      throw insertError;
    }

    // Return the newly created short URL
    return NextResponse.json({ shortUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}