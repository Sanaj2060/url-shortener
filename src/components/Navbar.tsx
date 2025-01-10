"use client";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "./ui/button";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap italic">fast.url</span>
          </Link>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className="mr-4"
              onClick={toggleTheme}
            >
              {mounted && (
                resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
