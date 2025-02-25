
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { CategoryCard } from "@/components/category-card";
import { BottomNav } from "@/components/bottom-nav";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    title: "Making Long-Distance Work",
    image: "/lovable-uploads/c083302d-9da5-416b-a8ac-4e5a4c6285d1.png"
  },
  {
    title: "Communication",
    image: "/lovable-uploads/4598ee82-a0b5-40df-8e9d-14bc621abde2.png"
  },
  {
    title: "Trust & Support",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&h=600"
  },
  {
    title: "Future Goals",
    image: "https://images.unsplash.com/photo-1501286353178-1ec871214838?auto=format&fit=crop&w=800&h=600"
  },
  {
    title: "Shared Activities",
    image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=800&h=600"
  }
];

const actionRoadmap = [
  {
    title: "Vision & Values Journey",
    image: "/lovable-uploads/18894602-f224-4cab-8f07-f6701ec2b7f4.png",
    steps: "4 steps",
    description: "Define your shared vision and values as a couple"
  },
  {
    title: "How to Be a Better Partner",
    image: "/lovable-uploads/18894602-f224-4cab-8f07-f6701ec2b7f4.png",
    steps: "5 steps"
  },
  {
    title: "The Five Love Languages",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&h=600",
    steps: "5 steps",
    description: "Discover and explore each other's love languages to deepen your connection"
  },
  {
    title: "36 Questions to Fall in Love",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&h=600",
    steps: "3 sets",
    description: "Dr. Arthur Aron's famous questions that can create closeness between two people"
  },
  {
    title: "Building Trust Together",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&h=600",
    steps: "4 steps"
  }
];

export default function Index() {
  const navigate = useNavigate();

  const scrollToPathToTogether = () => {
    const section = document.getElementById('path-to-together');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <HeartHandshake className="w-8 h-8 text-primary" />
            <span className="font-semibold text-xl text-primary">Sparq</span>
          </button>
        </div>
      </div>

      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ignite Your Love Story
          </h1>
          <p className="text-gray-600 mb-8">
            Strengthen your bond through meaningful conversations and shared experiences
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={scrollToPathToTogether}>
            <HeartHandshake className="mr-2" />
            Begin Your Journey
          </Button>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Daily Connection</h2>
          
          <ActivityCard 
            title="Daily Relationship Quiz" 
            type="quiz"
            description="Mon-Fri: Two relationship questions daily (AM & PM). Weekend Connection Challenge on Sat & Sun. Complete today's quiz to earn points!"
            progress={75}
            actionLabel="Start Quiz"
            onAction={() => navigate("/quiz")}
          />

          <ActivityCard 
            title="Conversation Starter" 
            type="question"
            description="What's your idea of a perfect weekend together? Share your thoughts and dreams."
            onAction={() => console.log("Answer opened")}
            actionLabel="Share Answer"
          />

          <ActivityCard 
            title="Love Language Game" 
            type="game"
            description="A fun way to learn and practice each other's love languages through interactive challenges."
            locked
            actionLabel="Play Game"
            onAction={() => console.log("Game started")}
          />

          <ActivityCard 
            title="Expert Tips & Exercises" 
            type="quiz"
            description="Research-based relationship exercises from relationship experts."
            locked
            actionLabel="View Exercises"
            onAction={() => console.log("Exercises opened")}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quiz Categories</h2>
          <div className="overflow-x-auto -mx-4 px-4 pb-6">
            <div className="flex gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.title}
                  title={category.title}
                  imagePath={category.image}
                  onClick={() => navigate("/quiz")}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12" id="path-to-together">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Path to Together</h2>
          <div className="overflow-x-auto -mx-4 px-4 pb-6">
            <div className="flex gap-4">
              {actionRoadmap.map((action) => (
                <CategoryCard
                  key={action.title}
                  title={action.title}
                  imagePath={action.image}
                  onClick={() => navigate("/journeys")}
                  className="relative"
                >
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-purple-700">
                    {action.steps}
                  </div>
                </CategoryCard>
              ))}
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

