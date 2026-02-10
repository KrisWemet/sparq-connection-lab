import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/bottom-nav';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';
import { ACHIEVEMENT_DEFINITIONS } from '@/types/streaks';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  streaks: { label: 'Streaks', color: 'text-orange-500' },
  completions: { label: 'Completions', color: 'text-blue-500' },
  engagement: { label: 'Engagement', color: 'text-purple-500' },
};

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { progress, loading, error, refetchAchievements } = useAchievements();
  const [activeTab, setActiveTab] = useState('all');

  // Calculate stats
  const earnedCount = progress.filter(p => p.earned).length;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;
  const completionPercent = Math.round((earnedCount / totalCount) * 100);

  // Filter achievements based on active tab
  const filteredProgress = activeTab === 'all' 
    ? progress 
    : progress.filter(p => p.definition.category === activeTab);

  // Group by category
  const groupedByCategory = {
    streaks: progress.filter(p => p.definition.category === 'streaks'),
    completions: progress.filter(p => p.definition.category === 'completions'),
    engagement: progress.filter(p => p.definition.category === 'engagement'),
  };

  if (loading) {
    return <LoadingState message="Loading achievements..." />;
  }

  if (error) {
    return (
      <ErrorState 
        error={new Error(error)} 
        onRetry={refetchAchievements}
        message="Failed to load achievements"
      />
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold">Achievements</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Overall Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Progress</CardTitle>
            <CardDescription>
              {earnedCount} of {totalCount} achievements earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Object.entries(groupedByCategory).map(([category, items]) => {
                const earned = items.filter(i => i.earned).length;
                const total = items.length;
                const { label, color } = CATEGORY_LABELS[category];
                
                return (
                  <div key={category} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className={cn('font-bold text-lg', color)}>
                      {earned}/{total}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="completions">Done</TabsTrigger>
            <TabsTrigger value="engagement">Engage</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <AchievementGrid progress={filteredProgress} />
          </TabsContent>
          
          <TabsContent value="streaks" className="mt-4">
            <AchievementGrid progress={filteredProgress} />
          </TabsContent>
          
          <TabsContent value="completions" className="mt-4">
            <AchievementGrid progress={filteredProgress} />
          </TabsContent>
          
          <TabsContent value="engagement" className="mt-4">
            <AchievementGrid progress={filteredProgress} />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}

// Achievement Grid Component
interface AchievementGridProps {
  progress: {
    definition: typeof ACHIEVEMENT_DEFINITIONS[0];
    earned: boolean;
    progress: number;
    awardedAt: string | null;
  }[];
}

function AchievementGrid({ progress }: AchievementGridProps) {
  if (progress.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No achievements in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {progress.map((item) => (
        <AchievementBadge
          key={item.definition.id}
          definition={item.definition}
          earned={item.earned}
          progress={item.progress}
          awardedAt={item.awardedAt}
          size="md"
          showProgress={true}
        />
      ))}
    </div>
  );
}
