import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import crypto from 'crypto';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!);

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
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    // Check if the original URL exists in Redis
    const cachedShortUrl = await redis.get(`originalUrl:${originalUrl}`);
    if (cachedShortUrl) {
      console.log(`Cache hit for original URL: ${originalUrl}`);
      return NextResponse.json({ shortUrl: cachedShortUrl });
    }

    // Check if the original URL already exists in the database
    const { data: existingRecord, error: fetchError } = await supabase
      .from('urls')
      .select('*')
      .eq('original_url', originalUrl)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingRecord) {
      const existingShortUrl = existingRecord.short_url;

      // Cache the result in Redis
      await redis.set(`originalUrl:${originalUrl}`, existingShortUrl, 'EX', 3600); // Cache for 1 hour
      await redis.set(`shortUrl:${existingShortUrl}`, originalUrl, 'EX', 3600);

      // Return the existing short URL
      return NextResponse.json({ shortUrl: existingShortUrl });
    }

    // Generate a new short URL
    let shortUrl;
    let isUnique = false;

    while (!isUnique) {
      shortUrl = generateShortUrl();

      // Check Redis and database for uniqueness
      const cachedOriginalUrl = await redis.get(`shortUrl:${shortUrl}`);
      if (!cachedOriginalUrl) {
        const { data: conflictRecord } = await supabase
          .from('urls')
          .select('id')
          .eq('short_url', shortUrl)
          .single();

        if (!conflictRecord) {
          isUnique = true;
        }
      }
    }

    // Insert the new URL pair into the database
    const { error: insertError } = await supabase
      .from('urls')
      .insert({
        original_url: originalUrl,
        short_url: shortUrl,
      });

    if (insertError) {
      throw insertError;
    }

    // Cache the new short URL and original URL
    if (originalUrl && shortUrl) {
      await redis.set(`originalUrl:${originalUrl}`, shortUrl, 'EX', 3600); // Cache for 1 hour
    }
    await redis.set(`shortUrl:${shortUrl}`, originalUrl, 'EX', 3600);

    // Return the newly created short URL
    return NextResponse.json({ shortUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}