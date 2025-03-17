
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { UserBadge } from "@/types/profile";
import { AchievementBadge } from "@/components/AchievementBadge";

interface AchievementsCardProps {
  badges: UserBadge[];
}

export function AchievementsCard({ badges }: AchievementsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {badges.map(badge => (
            badge.achieved && (
              <AchievementBadge 
                key={badge.id}
                type={badge.badge_type as any}
                achieved={badge.achieved}
                level={badge.badge_level as any}
              />
            )
          ))}
          
          {badges.filter(b => b.achieved).length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Complete daily activities and quizzes to earn badges!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
