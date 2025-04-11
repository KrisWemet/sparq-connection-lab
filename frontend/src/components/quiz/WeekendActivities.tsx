
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekendActivity } from "@/types/quiz";
import { BottomNav } from "@/components/bottom-nav";

interface WeekendActivitiesProps {
  activities: WeekendActivity[];
}

export function WeekendActivities({ activities }: WeekendActivitiesProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="text-primary w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-900">
              Weekend Activities
            </h1>
          </div>
        </header>

        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{activity.title}</h3>
                <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {activity.modality}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{activity.description}</p>
              {activity.explanation && (
                <p className="text-sm text-gray-500 italic mb-4">{activity.explanation}</p>
              )}
              <Button className="w-full">Plan This Activity</Button>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

