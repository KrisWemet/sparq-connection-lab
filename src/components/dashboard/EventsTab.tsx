import React from 'react';
import { EventListItem } from './EventListItem'; // Assuming EventListItem exists
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from 'lucide-react'; // Icon for EmptyState
import { SharedEvent } from '@/services/supabase/types'; // Import SharedEvent type
import type { colorThemes } from "@/lib/colorThemes"; // Corrected import path

// Define the props for the component
interface EventsTabProps {
  events: SharedEvent[];
  colors: typeof colorThemes.azure; // Use a specific theme structure or a general Record<string, string>
  onNavigate: (path: string, eventId?: string | number) => void; // Allow optional eventId for flexibility
}

export const EventsTab: React.FC<EventsTabProps> = ({
  events,
  colors,
  onNavigate,
}) => {
  // Filter for upcoming events (similar logic to Dashboard.tsx, but maybe simplified here)
  // Or assume the parent component already filtered the events passed in props
  const upcomingEvents = events; // Assuming 'events' prop already contains only upcoming ones

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-12 h-12 text-gray-400" />}
        message="No upcoming events found. Plan something fun together!"
        actionText="Go to Planner"
        onAction={() => onNavigate('/shared-planner')} // Navigate to the shared planner page
      />
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent mt-0">
      <CardContent className="p-0">
        <ul className="space-y-3">
          {upcomingEvents.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              colors={colors}
              // Pass the onNavigate function; EventListItem handles the click
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default EventsTab;