"use client";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/utils/clipboard";

export default function MainForm() {
  const [longURL, setLongURL] = useState<string>("");
  const [shortURL, setShortURL] = useState<string>("");
  const [isShorten, setIsShorten] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const base_url = process.env.NEXT_PUBLIC_BASE_URL

  const handleChange = (e: string) => {
    setLongURL(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent auto reload after submit
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: longURL }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL. Please try again.");
      }

      const data = await response.json();
      const fullShortURL = base_url + '/' + data.shortUrl
      setShortURL(fullShortURL); // Assuming the API returns { shortUrl: "..." }
      setIsShorten(true);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetButton = () => {
    setLongURL("");
    setShortURL("");
    setIsShorten(false);
    setError(null);
  };

  return (
    <Card className="w-full md:w-1/2 mx-auto mt-8">
      <CardHeader>
        <CardTitle>Shorten your URL</CardTitle>
        <CardDescription>Enter your long URL to shorten it</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full gap-4 items-center">
            <div className="flex flex-row gap-4">
              <Input
                type="url"
                id="longurl"
                placeholder="Long URL"
                value={longURL}
                onChange={(e) => handleChange(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Shortening..." : "Shorten URL"}
              </Button>
            </div>
          </div>
        </form>
        {error && (
          <div className="text-red-500 mt-2">
            <p>{error}</p>
          </div>
        )}
        {isShorten && (
          <div className="grid w-full gap-4 items-center border-t pt-4 mt-4">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="shorturl" className="text-md font-semibold">
                  Your Short URL
                </Label>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input type="url" id="shorturl" value={shortURL} readOnly />
                <Button
                  onClick={() => copyToClipboard(shortURL)}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <Copy className="h-4 w-4 m-2" />
                  <span className="sm:hidden">Copy</span>
                </Button>
                <Button onClick={resetButton}>Shorten Another</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
