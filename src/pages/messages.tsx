import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Copy,
  Heart,
  MessageSquare,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const conversationStarters = [
  {
    id: 1,
    category: "Repair",
    question: "I want to understand your side better. What felt hardest for you about that moment?",
  },
  {
    id: 2,
    category: "Appreciation",
    question: "What is one small thing I did lately that made life easier for you?",
  },
  {
    id: 3,
    category: "Closeness",
    question: "What helps you feel most connected to me on an ordinary day?",
  },
  {
    id: 4,
    category: "Clarity",
    question: "What do you wish I understood faster when you are stressed?",
  },
];

const reminderTemplates = [
  {
    id: 1,
    title: "Before a hard talk",
    text: "Pause. Breathe. Start softer than you want to.",
  },
  {
    id: 2,
    title: "Appreciation rep",
    text: "Name one true good thing you noticed today.",
  },
  {
    id: 3,
    title: "Repair after tension",
    text: "Own your part without explaining it away.",
  },
];

export default function Messaging() {
  const router = useRouter();
  const [draft, setDraft] = useState("");

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`, {
        description: "Use it in a real conversation when the moment fits.",
      });
    } catch {
      toast.error("Could not copy that just now.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="mx-auto text-center">
            <h1 className="text-lg font-semibold text-gray-900">Talk Practice</h1>
            <p className="text-xs text-gray-500">Solo-first help for real life</p>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6 space-y-6">
        <Card className="border-brand-primary/15 bg-gradient-to-br from-white to-brand-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-brand-primary" />
              Practice before you text
            </CardTitle>
            <CardDescription>
              Sparq helps you get ready for a real talk. Copy a prompt. Practice your words. Then use them in real life.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="starters" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="starters">Starters</TabsTrigger>
            <TabsTrigger value="rehearse">Rehearse</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="starters" className="space-y-3">
            {conversationStarters.map((starter) => (
              <Card key={starter.id}>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary mb-2">
                    {starter.category}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{starter.question}</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCopy(starter.question, "Starter")}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy for real life
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rehearse" className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-primary" />
                  Rewrite your opening
                </CardTitle>
                <CardDescription>
                  Draft the calmer version of what you want to say. This stays in your browser until you use it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Instead of the reactive version, write the clearer and kinder version here..."
                  className="min-h-[160px]"
                />
                <Button
                  className="w-full"
                  disabled={!draft.trim()}
                  onClick={() => handleCopy(draft.trim(), "Draft")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Copy my calm version
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-3">
            {reminderTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-primary/10 p-2 rounded-full">
                      <Calendar className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{template.title}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{template.text}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => handleCopy(template.text, "Reminder")}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy reminder
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
