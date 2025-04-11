import React, { useState, useEffect, useCallback } from 'react';
import { sharedEventService } from '../services/supabase';
import { SharedEvent, SharedEventCreateParams } from '../services/supabase/types';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; // Assuming useToast hook exists
import { format } from 'date-fns'; // For date formatting

const SharedPlanner: React.FC = () => {
  const [events, setEvents] = useState<SharedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDateTime, setNewEventDateTime] = useState(''); // Store as string for input type="datetime-local"

  const { toast } = useToast(); // Initialize toast

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEvents = await sharedEventService.getSharedEvents();
      setEvents(fetchedEvents);
    } catch (err: any) {
      setError('Failed to fetch events. Please try again.');
      console.error(err);
      toast({ title: "Error", description: "Could not fetch shared events.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      toast({ title: "Validation Error", description: "Event title cannot be empty.", variant: "destructive" });
      return;
    }

    const params: SharedEventCreateParams = {
      title: newEventTitle.trim(),
      description: newEventDescription.trim() || undefined,
      // Convert local datetime string to ISO string if a date is selected
      eventDatetime: newEventDateTime ? new Date(newEventDateTime).toISOString() : undefined,
    };

    setIsLoading(true); // Indicate loading state during creation
    const createdEvent = await sharedEventService.createSharedEvent(params);
    setIsLoading(false); // Reset loading state

    if (createdEvent) {
      setEvents(prevEvents => [...prevEvents, createdEvent].sort((a, b) => {
        const dateA = a.eventDatetime ? new Date(a.eventDatetime).getTime() : Infinity;
        const dateB = b.eventDatetime ? new Date(b.eventDatetime).getTime() : Infinity;
        return dateA - dateB;
      }));
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventDateTime('');
      toast({ title: "Success", description: "Shared event created!" });
    } else {
      toast({ title: "Error", description: "Failed to create shared event.", variant: "destructive" });
    }
  };

  // TODO: Add functionality for updating and deleting events

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Shared Planner</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Shared Event</CardTitle>
        </CardHeader>
        <form onSubmit={handleAddEvent}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="E.g., Date Night, Weekly Check-in"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Optional details about the event"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="event-datetime">Date & Time</Label>
              <Input
                id="event-datetime"
                type="datetime-local"
                value={newEventDateTime}
                onChange={(e) => setNewEventDateTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Event'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Past Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading events...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && events.length === 0 && (
            <p>No shared events planned yet. Add one above!</p>
          )}
          {!isLoading && !error && events.length > 0 && (
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="p-4 border rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  {event.eventDatetime && (
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.eventDatetime), "PPPp")} {/* Format: Sep 15, 2023, 4:30 PM */}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-1 text-gray-700">{event.description}</p>
                  )}
                  <p className="text-xs mt-2 capitalize">Status: {event.status}</p>
                  {/* TODO: Add Edit/Delete/Complete buttons here */}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedPlanner;