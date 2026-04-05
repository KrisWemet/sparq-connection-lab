import Image from "next/image";
import { wisdomArticles } from "@/data/wisdom-articles";

export function LatestWisdomFeed() {
  return (
    <div className="mt-6">
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
        Latest Wisdom
      </p>
      <div className="space-y-3">
        {wisdomArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex gap-3"
          >
            <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-xs text-amethyst-500 uppercase font-semibold mb-1">
                {article.category}
              </p>
              <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                {article.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">{article.readingTime} min read</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
