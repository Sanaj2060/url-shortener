import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Redis from "ioredis";

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shortUrl = url.pathname.split("/").pop();

  if (!shortUrl) {
    return NextResponse.json(
      { error: "Short URL is required" },
      { status: 400 }
    );
  }

  try {
    // Check Redis cache for the short URL
    const cachedOriginalUrl = await redis.get(shortUrl);

    if (cachedOriginalUrl) {
      console.log(`Cache hit for ${shortUrl}`);
      return NextResponse.redirect(cachedOriginalUrl);
    }

    console.log(`Cache miss for ${shortUrl}. Querying database...`);

    // Look up the original URL by the short URL in Supabase
    const { data, error } = await supabase
      .from("urls")
      .select("original_url")
      .eq("short_url", shortUrl)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    const originalUrl = data.original_url;

    // Cache the result in Redis for future lookups
    await redis.set(shortUrl, originalUrl, "EX", 3600); // Cache for 1 hour

    // Redirect to the original URL
    return NextResponse.redirect(originalUrl);
  } catch (err) {
    console.error("Error redirecting:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
