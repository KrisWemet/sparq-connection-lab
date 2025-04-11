
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, BookOpen, AlignCenter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";

export default function Reflect() {
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedNotes = localStorage.getItem("dailyActivityNotes");
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 mx-auto">
            Daily Reflection
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        {/* Notes Recap */}
        <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Your Notes</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
            {notes}
          </div>
        </section>

        {/* Align Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlignCenter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Align</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Now that you've reflected on today's journey, take a moment to align your thoughts with your partner.
            Share your insights and discuss how you can incorporate these values into your relationship.
          </p>
          <Button 
            className="w-full"
            onClick={() => navigate("/quiz")}
          >
            Complete Today's Journey
          </Button>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
