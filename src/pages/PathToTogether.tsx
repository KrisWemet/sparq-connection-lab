
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, MessageCircle, Shield } from 'lucide-react';

interface Journey {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  sequence: number;
  icon: React.ReactNode;
}

export default function PathToTogether() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Define the journeys we have available
    const availableJourneys: Journey[] = [
      {
        id: 'communication',
        title: 'Effective Communication',
        description: 'Learn to understand each other deeply through proven communication methods',
        duration: '3 weeks',
        category: 'Skills',
        sequence: 2,
        icon: <MessageCircle className="h-8 w-8 text-blue-500" />
      },
      {
        id: 'conflict',
        title: 'Healthy Conflict Resolution',
        description: 'Transform disagreements into opportunities for growth and understanding',
        duration: '4 weeks',
        category: 'Skills',
        sequence: 3,
        icon: <Shield className="h-8 w-8 text-orange-500" />
      },
      {
        id: 'intimacy',
        title: 'Deepening Intimacy',
        description: 'Build stronger emotional and physical connection through proven approaches',
        duration: '5 weeks',
        category: 'Connection',
        sequence: 4,
        icon: <Heart className="h-8 w-8 text-rose-500" />
      }
    ];

    // Sort journeys by sequence
    const sortedJourneys = [...availableJourneys].sort((a, b) => a.sequence - b.sequence);
    setJourneys(sortedJourneys);
    setLoading(false);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'skills':
        return 'bg-blue-100 text-blue-800';
      case 'connection':
        return 'bg-rose-100 text-rose-800';
      case 'growth':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="container py-12">Loading journeys...</div>;
  }

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Path to Together</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore guided journeys to strengthen your relationship through research-backed approaches
          and practical activities you can do together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journeys.map((journey) => (
          <Card key={journey.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-shrink-0 p-2 rounded-lg bg-slate-50">
                  {journey.icon}
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getCategoryColor(journey.category)}`}>
                  {journey.category}
                </span>
              </div>
              <CardTitle className="mt-4">{journey.title}</CardTitle>
              <CardDescription>{journey.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {journey.duration}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/journeys/${journey.id}`} className="w-full">
                <Button variant="default" className="w-full">
                  Start Journey
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
