import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    // Look up the original URL by the short URL
    const { data, error } = await supabase
      .from("urls")
      .select("original_url")
      .eq("short_url", shortUrl)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    const originalUrl = data.original_url;

    // Redirect to the original URL
    return NextResponse.redirect(originalUrl);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
