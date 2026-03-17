
import { ChevronLeft } from "lucide-react";
import { useRouter } from 'next/router';

export function ProfileHeader() {
  const router = useRouter();
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 mx-auto">
          Profile
        </h1>
      </div>
    </header>
  );
}
