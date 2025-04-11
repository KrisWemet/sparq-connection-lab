import React from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { Loader2, AlertCircle, Clock } from 'lucide-react'; // Import Clock icon for "Coming Soon"
import { Card, CardContent } from '@/components/ui/card';

// Define a type for the category data expected from the parent
interface Category {
  id: string;
  name: string;
  description?: string;
  isEnabled?: boolean; // Expect isEnabled from parent
}

// Define the CategoryStatus interface
export interface CategoryStatus {
  inProgress: boolean;
  completed: boolean;
  paused: boolean;
  // REMOVED: enabled: boolean; - This belongs on the Category interface, not status
}

interface CategorySelectionProps {
  categories: Category[]; // Receive categories as a prop
  onSelectCategory: (categoryId: string) => void;
  isLoading?: boolean; // General loading (e.g., starting category)
  isLoadingCategories?: boolean; // Specific loading for category data
  categoryStatuses?: Record<string, CategoryStatus>;
  fetchError?: string | null; // Error fetching categories
}

// Placeholder icon component
const PlaceholderIcon = ({ color = "bg-primary" }: { color?: string }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
    <span className="text-white text-xs font-bold">?</span>
  </div>
);

// Function to get color based on category ID
const getCategoryColor = (categoryId: string) => {
  const colors: Record<string, string> = {
    '98765432-1098-7654-3210-987654321098': 'bg-blue-500',   // Values
    'abcdef12-3456-7890-abcd-ef1234567890': 'bg-purple-500', // Communication
    '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p': 'bg-pink-500',   // Emotional
    'aaaa1111-bbbb-cccc-dddd-eeeeffffffff': 'bg-amber-500',  // Intimacy
    '2cbdeb46-9c77-404f-b175-5e7d51e5e29d': 'bg-green-500',  // Adventure
  };
  return colors[categoryId] || 'bg-gray-500';
};

// REMOVED: Hardcoded ENABLED_CATEGORY_IDS - isEnabled prop is now passed from parent

// Category display order
const CATEGORY_ORDER: { [key: string]: number } = {
  '98765432-1098-7654-3210-987654321098': 1, // Values
  'abcdef12-3456-7890-abcd-ef1234567890': 2, // Communication
  '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p': 3, // Emotional
  'aaaa1111-bbbb-cccc-dddd-eeeeffffffff': 4, // Intimacy
  '2cbdeb46-9c77-404f-b175-5e7d51e5e29d': 5, // Adventure
};

// First 5 questions from Adventure & Fun category
const ADVENTURE_FUN_QUESTIONS = [
  {
    id: "af1",
    text: "If you could instantly teleport us anywhere for a date today, where would we go?",
    level: "Easy"
  },
  {
    id: "af2",
    text: "What was your favorite childhood game, and would you teach it to me?",
    level: "Easy"
  },
  {
    id: "af3",
    text: "If we were superheroes, what would our team name be?",
    level: "Easy"
  },
  {
    id: "af4",
    text: "What's the silliest thing you've ever wanted to try but haven't yet?",
    level: "Easy"
  },
  {
    id: "af5",
    text: "What's your go-to karaoke song? Would you sing it with me?",
    level: "Easy"
  }
];

const CategorySelection: React.FC<CategorySelectionProps> = ({
  categories, // Use received categories
  onSelectCategory,
  isLoading = false,
  isLoadingCategories = false, // Use specific loading state
  categoryStatuses = {},
  fetchError = null, // Use fetch error state
}) => {
  // REMOVED: Filtering logic based on ENABLED_CATEGORY_IDS

  // All categories sorted by order (for display)
  const allCategories = categories
    .sort((a, b) => {
      const orderA = CATEGORY_ORDER[a.id] || 999;
      const orderB = CATEGORY_ORDER[b.id] || 999;
      return orderA - orderB;
    });

  return (
    <AnimatedContainer>
      <div className="space-y-6 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Daily Questions</h2>
          <p className="text-muted-foreground">Explore questions to deepen your connection</p>
        </div>

        {/* Loading State */}
        {isLoadingCategories && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading Categories...</p>
          </div>
        )}

        {/* Error State */}
        {fetchError && !isLoadingCategories && (
          <div className="text-center space-y-2">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="font-semibold text-destructive">Error Loading Categories</p>
            <p className="text-sm text-muted-foreground">{fetchError}</p>
            {/* Optional: Add a retry button if needed */}
          </div>
        )}

        {/* Categories List */}
        {!isLoadingCategories && !fetchError && categories.length === 0 && (
           <div className="text-center p-4 border border-border rounded-md bg-muted/50">
             <p className="text-muted-foreground">No categories available at the moment.</p>
           </div>
        )}

        {!isLoadingCategories && !fetchError && categories.length > 0 && (
          <div className="grid gap-4">
            {allCategories.map((category) => {
              const status = categoryStatuses[category.id];
              const isInProgress = status?.inProgress;
              const isCompleted = status?.completed;
              const isEnabled = category.isEnabled ?? false; // Use passed prop, default to false if undefined
              const categoryColor = getCategoryColor(category.id);

              return (
                <Button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  disabled={isLoading || isCompleted || !isEnabled} // Also disable if not enabled
                  variant={isInProgress ? 'default' : 'outline'}
                  className={`w-full h-auto flex items-center justify-start p-4 space-x-3 text-left ${!isEnabled ? 'opacity-60' : ''}`} // Add opacity for disabled categories
                >
                  <PlaceholderIcon color={categoryColor} />
                  <div className="flex-grow space-y-1">
                    <div className="font-semibold">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground">
                        {category.description}
                      </div>
                    )}
                    {isInProgress && (
                      <div className="text-xs text-blue-600 font-medium">In Progress</div>
                    )}
                    {isCompleted && (
                      <div className="text-xs text-green-600 font-medium">Completed</div>
                    )}
                    {!isEnabled && (
                      <div className="text-xs text-amber-600 font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> Coming Soon
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        )}

      </div>
    </AnimatedContainer>
  );
};

export default CategorySelection;