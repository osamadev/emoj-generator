'use client'
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Loader2, Copy, Download, Heart } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function EmojiGenerator() {
  const [prompt, setPrompt] = useState("");
  const [emojis, setEmojis] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likedEmojis, setLikedEmojis] = useState<Set<number>>(new Set());

  const generateEmoji = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.output) {
        setEmojis([...emojis, data.output[0]]);
      } else {
        throw new Error('Failed to generate emoji');
      }
    } catch (error) {
      console.error(error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  };

  const downloadEmoji = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `emoji-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleLike = (index: number) => {
    setLikedEmojis((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div>
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Enter a prompt to generate an emoji"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={generateEmoji} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {emojis.map((emoji, index) => (
          <Card key={index} className="p-4 relative group">
            <Image src={emoji} alt={`Generated emoji ${index + 1}`} width={200} height={200} />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white text-center">
                <p className="mb-2">{prompt}</p>
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => copyPrompt(prompt)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => downloadEmoji(emoji, index)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleLike(index)}
                    className={likedEmojis.has(index) ? "text-red-500" : ""}
                  >
                    <Heart className="h-4 w-4" fill={likedEmojis.has(index) ? "currentColor" : "none"} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}