import Image from "next/image";
import { wisdomArticles } from "@/data/wisdom-articles";

export function WeeklyReflectionFeature() {
  const weekIndex = Math.floor(Date.now() / (7 * 24 * 3600 * 1000)) % wisdomArticles.length;
  const article = wisdomArticles[weekIndex];

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden h-52 mb-4">
      <Image
        src={article.imageUrl}
        alt={article.title}
        fill
        unoptimized
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <span className="inline-block self-start bg-gold-100 text-gold-500 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1">
          {article.category}
        </span>
        <div>
          <p className="font-serif italic text-white text-xl leading-snug mb-1">
            {article.title}
          </p>
          <p className="text-gray-300 text-xs">{article.author}</p>
        </div>
      </div>
    </div>
  );
}
