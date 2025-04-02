import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns'; // For date formatting

// Define the structure of the event prop based on Dashboard.tsx and SharedEvent type
// Assuming SharedEvent type from '@/services/supabase/types' has these fields
interface SharedEvent {
  id: string | number; // Assuming id is present
  title: string;
  eventDatetime?: string | null; // Optional event date/time
  location?: string | null; // Optional location
  category?: string | null; // Optional category like 'Date Night', 'Anniversary'
  // Add other relevant fields if needed based on the actual SharedEvent type
}

// Define the structure for colors (same as previous components)
interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  cardGradient: string;
  featureGradient: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  borderAccent: string;
  bgSubtle: string;
}

interface EventListItemProps {
  event: SharedEvent;
  colors: ColorTheme;
  onNavigate: (path: string) => void; // Function to handle navigation
}

export const EventListItem: React.FC<EventListItemProps> = ({ event, colors, onNavigate }) => {
  const eventPath = `/shared-planner#event-${event.id}`; // Example path, adjust as needed

  return (
    <Card
      key={event.id}
      className="mb-3 transition-all duration-200 ease-in-out cursor-pointer hover:shadow-md hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
      onClick={() => onNavigate(eventPath)}
      role="button"
      tabIndex={0}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${colors.bgSubtle} dark:bg-opacity-20`}>
            <Calendar className={`w-5 h-5 ${colors.textAccent}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              {event.eventDatetime && (
                <span>{format(parseISO(event.eventDatetime), 'EEE, MMM d, yyyy h:mm a')}</span>
              )}
              {event.location && (
                <span>@ {event.location}</span>
              )}
              {event.category && (
                 <Badge variant="outline" className={`text-xs ${colors.borderAccent} ${colors.textAccent}`}>{event.category}</Badge>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </CardContent>
    </Card>
  );
};