
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  imagePath: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function CategoryCard({
  title,
  imagePath,
  onClick,
  className,
  children
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex-shrink-0 rounded-2xl bg-white shadow-md overflow-hidden w-[280px] h-[180px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <div className="absolute inset-0">
        <img 
          src={imagePath} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      {children}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <div className="flex items-center">
          <span className="inline-flex items-center text-sm text-white/90">
            Tap to explore
          </span>
        </div>
      </div>
    </button>
  );
}
