import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define a type for the Path To Together Journey summary data expected by the card
// This should align with the data fetched from the 'journeys' function (backend function name unchanged)
// and potentially include user progress status.
// TODO: Align this type more closely with the actual API response and spec
export type PathToTogetherSummary = { // Renamed type
  id: string;
  title: string;
  description: string;
  category?: string;
  theme?: string;
  image?: string;
  // Add fields for progress later if needed
  // userProgressStatus?: 'not-started' | 'in-progress' | 'completed';
};

type JourneyCardProps = {
  pathToTogetherSummary: PathToTogetherSummary; // Renamed prop and type
  // Add userProgress prop later
};

export const JourneyCard: React.FC<JourneyCardProps> = ({ pathToTogetherSummary }) => { // Use renamed prop
  const navigate = useNavigate();

  const handleNavigate = () => {
    // TODO: Check user progress status to navigate correctly
    // If started -> navigate to /journey/{id}/details or /journey/{id}/day/{currentDay}
    // If not started -> navigate to /journey/{id}/start
    navigate(`/journey/${pathToTogetherSummary.id}/start`); // Use renamed prop
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer flex flex-col h-full" onClick={handleNavigate}>
      {pathToTogetherSummary.image && ( // Use renamed prop
        <img
          src={pathToTogetherSummary.image} // Use renamed prop
          alt={pathToTogetherSummary.title} // Use renamed prop
          className="w-full h-32 object-cover" // Fixed height for consistency
        />
      )}
      <CardHeader className="flex-grow">
        <CardTitle className="text-lg">{pathToTogetherSummary.title}</CardTitle> // Use renamed prop
        {/* Display category or theme if available */}
        {(pathToTogetherSummary.category || pathToTogetherSummary.theme) && ( // Use renamed prop
          <Badge variant="outline" className="mt-1 w-fit">{pathToTogetherSummary.category || pathToTogetherSummary.theme}</Badge> // Use renamed prop
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3"> {/* Increased line clamp */}
          {pathToTogetherSummary.description} // Use renamed prop
        </p>
      </CardContent>
      <CardFooter className="flex justify-end pt-4"> {/* Added padding top */}
         {/* TODO: Button text/action could change based on progress */}
         <Button variant="ghost" size="sm" className="mt-auto"> {/* Ensure button aligns bottom */}
           View Details <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </CardFooter>
    </Card>
  );
};