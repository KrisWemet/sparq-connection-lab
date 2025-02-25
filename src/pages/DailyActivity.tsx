
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BottomNav } from "@/components/bottom-nav";

export default function DailyActivity() {
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!notes.trim()) {
      toast.error("Please add some notes before continuing");
      return;
    }

    // Store notes in localStorage for now (we'll add proper storage later)
    localStorage.setItem("dailyActivityNotes", notes);
    navigate("/reflect");
  };

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
            Daily Activity
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Pencil className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Activity</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Take a moment to reflect on your values and write down your thoughts about today's journey.
            What resonated with you? What insights did you gain?
          </p>
          <Textarea
            placeholder="Write your notes here..."
            className="min-h-[200px] mb-4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button 
            className="w-full"
            onClick={handleSubmit}
          >
            Submit Reflection
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
