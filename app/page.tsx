import EmojiGenerator from "@/components/emoji-generator";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <span role="img" aria-label="Smiling face with sunglasses emoji">😎</span>
          Emoj maker
        </h1>
        <EmojiGenerator />
      </main>
    </div>
  );
}
