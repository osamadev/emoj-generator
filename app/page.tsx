import EmojiGenerator from "@/components/emoji-generator";
import { auth } from "@clerk/nextjs/server";

export default function Home() {
  const { userId } = auth();

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <span role="img" aria-label="Smiling face with sunglasses emoji">😎</span>
          Emoj maker
        </h1>
        {userId ? (
          <EmojiGenerator />
        ) : (
          <p className="text-center text-lg">Please sign in to generate emojis.</p>
        )}
      </main>
    </div>
  );
}
