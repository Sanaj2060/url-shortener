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

  const removeWww = (url: string) => {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '$1')
  }

  function handleChange(e: string) {
    setLongURL(e);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // this will prevent auto reload after submit
    const shorturlinput = removeWww(longURL);
    setShortURL(shorturlinput);
    setIsShorten(true);
    console.log(longURL);
  }

  const resetButton = () => {
    setLongURL("");
    setShortURL("");
    setIsShorten(false);
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
              />
              <Button type="submit">Shorten URL</Button>
            </div>
          </div>
        </form>
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
                <Button onClick={() => copyToClipboard(shortURL)} variant="outline" className="flex-1 sm:flex-none">
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
