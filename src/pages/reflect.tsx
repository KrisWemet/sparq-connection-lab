import { SceneAccent } from '@/components/emotion/EmotionalEnvironment';

import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { ChevronLeft, BookOpen, AlignCenter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reflect() {
  const [notes, setNotes] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedNotes = localStorage.getItem("dailyActivityNotes");
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  return (
    <div className="emotion-page min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-50 bg-popover border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-foreground mx-auto">
            Daily Reflection
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        {/* Notes Recap */}
        <section className="emotion-paper relative overflow-hidden bg-popover rounded-2xl p-6 shadow-sm mb-6">
          <SceneAccent kind="flow" quiet className="-mt-3 mb-2 h-20 w-full" />
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Your Notes</h2>
          </div>
          <div className="bg-background rounded-lg p-4 text-foreground whitespace-pre-wrap">
            {notes}
          </div>
        </section>

        {/* Align Section */}
        <section className="emotion-paper bg-popover rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlignCenter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Align</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Now that you&apos;ve reflected on today&apos;s journey, take a moment to align your thoughts with your partner.
            Share your insights and discuss how you can incorporate these values into your relationship.
          </p>
          <Button 
            className="w-full"
            onClick={() => router.push("/quiz")}
          >
            Complete Today&apos;s Journey
          </Button>
        </section>
      </main>
    </div>
  );
}
