/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client'
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Loader2, Copy, Download, Heart } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

interface Emoji {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
}

export default function EmojiGenerator() {
  const { isSignedIn } = useUser();
  const [prompt, setPrompt] = useState("");
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likedEmojis, setLikedEmojis] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isSignedIn) {
      fetchUserProfile();
      fetchEmojis();
    }
  }, [isSignedIn]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const profile = await response.json();
        console.log('User profile:', profile);
        // You can use the profile data here if needed
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchEmojis = async () => {
    try {
      const response = await fetch('/api/emoji');
      const data = await response.json();
      setEmojis(data.emojis);
    } catch (error) {
      console.error('Failed to fetch emojis:', error);
    }
  };

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
      if (data.emoji) {
        setEmojis([data.emoji, ...emojis]);
        setPrompt("");
      } else {
        throw new Error('Failed to generate emoji');
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate emoji");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  };

  const downloadEmoji = (url: string, fileName: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Error downloading emoji:', error);
        toast.error("Failed to download emoji");
      });
  };

  const toggleLike = async (emojiId: number) => {
    const isLiked = likedEmojis.has(emojiId);
    try {
      const response = await fetch('/api/emoji/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emojiId, like: !isLiked }),
      });
      const data = await response.json();
      if (data.emoji) {
        setEmojis(emojis.map(emoji => emoji.id === emojiId ? data.emoji : emoji));
        setLikedEmojis((prev) => {
          const newSet = new Set(prev);
          isLiked ? newSet.delete(emojiId) : newSet.add(emojiId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to update like:', error);
      toast.error("Failed to update like");
    }
  };

  return (
    <div>
      {isSignedIn ? (
        <>
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
          <div className="mb-4 text-lg font-semibold">
            Total Emojis Generated: {emojis.length}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {emojis.map((emoji) => (
              <Card key={emoji.id} className="p-4 relative group">
                <Image src={emoji.image_url} alt={`Generated emoji ${emoji.id}`} width={200} height={200} />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-center">
                    <p className="mb-2">{emoji.prompt}</p>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => copyPrompt(emoji.prompt)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => downloadEmoji(emoji.image_url, `emoji-${emoji.id}.png`)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleLike(emoji.id)}
                        className={likedEmojis.has(emoji.id) ? "text-red-500" : ""}
                      >
                        <Heart className="h-4 w-4" fill={likedEmojis.has(emoji.id) ? "currentColor" : "none"} />
                        <span className="ml-1">{emoji.likes_count}</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 flex items-center justify-center">
                  <Heart className="h-4 w-4 mr-1" /> {emoji.likes_count} likes
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-lg">Please sign in to generate emojis.</p>
      )}
    </div>
  );
}