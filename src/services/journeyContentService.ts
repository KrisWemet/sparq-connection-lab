
import { supabase } from "@/integrations/supabase/client";

const JOURNEY_PROGRESS_STORAGE_KEY = "sparq_journey_progress";

type StoredJourneyProgress = {
  journey_id: string;
  day: number;
  completed: boolean;
  responses: Record<string, any>;
  created_at: string;
};

function readStoredJourneyProgress(): Record<string, StoredJourneyProgress[]> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(JOURNEY_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredJourneyProgress(progress: Record<string, StoredJourneyProgress[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(JOURNEY_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export interface JourneyContent {
  title: string;
  duration: string;
  category: string;
  sequence: number;
  description: string;
  content: string;
  days: JourneyDay[];
}

export interface JourneyDay {
  number: number;
  title: string;
  content: string;
  activity?: {
    title: string;
    instructions: string;
    reflectionQuestions: string[];
  };
}

// Function to fetch journey content from markdown files
export async function getJourneyContent(journeyId: string): Promise<JourneyContent | null> {
  try {
    // Fetch markdown content from the public directory
    // encodeURIComponent handles the space in "Path to Together"
    const response = await fetch(`/Path%20to%20Together/${encodeURIComponent(journeyId)}.md`);

    if (!response.ok) {
      console.error(`Failed to load journey content for ${journeyId}`);
      return null;
    }

    const markdownContent = await response.text();
    return parseJourneyContent(markdownContent, journeyId);
  } catch (error) {
    console.error(`Error loading journey content for ${journeyId}:`, error);
    return null;
  }
}

// Function to parse journey content from markdown
function parseJourneyContent(markdown: string, journeyId: string): JourneyContent {
  // Extract frontmatter (metadata)
  const metadataRegex = /^---\n([\s\S]*?)\n---/;
  const metadataMatch = markdown.match(metadataRegex);

  const metadata: Record<string, string> = {};
  if (metadataMatch && metadataMatch[1]) {
    const metadataLines = metadataMatch[1].split('\n');
    for (const line of metadataLines) {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        metadata[key] = value;
      }
    }
  }

  // Remove frontmatter from content
  const contentWithoutFrontmatter = markdown.replace(metadataRegex, '').trim();

  // Parse days from content — split on ## Day headers to avoid regex infinite loop
  const days: JourneyDay[] = [];
  const daySections = contentWithoutFrontmatter.split(/(?=^## Day \d+:)/m);

  for (const section of daySections) {
    const headerMatch = section.match(/^## Day (\d+): (.*)/);
    if (!headerMatch) continue;

    const dayNumber = parseInt(headerMatch[1]);
    const dayTitle = headerMatch[2].trim();
    const dayContent = section.trim();

    // Extract reflection questions if they exist
    const reflectionQuestionsMatch = dayContent.match(/### Reflection Questions\n\n([\s\S]*?)(?=\n##|$)/);
    const reflectionQuestions: string[] = [];

    if (reflectionQuestionsMatch && reflectionQuestionsMatch[1]) {
      const questionsText = reflectionQuestionsMatch[1];
      const questionMatches = questionsText.match(/\d+\.\s*(.*?)(?=\n\d+\.|\n##|$)/g);

      if (questionMatches) {
        questionMatches.forEach(q => {
          const question = q.replace(/^\d+\.\s*/, '').trim();
          reflectionQuestions.push(question);
        });
      }
    }

    // Extract activity if it exists
    const activityMatch = dayContent.match(/### Today's Activity\n\n([\s\S]*?)(?=\n### Reflection Questions|$)/);
    let activity = undefined;

    if (activityMatch && activityMatch[1]) {
      activity = {
        title: "Today's Activity",
        instructions: activityMatch[1].trim(),
        reflectionQuestions
      };
    }

    days.push({
      number: dayNumber,
      title: dayTitle,
      content: dayContent,
      activity
    });
  }

  return {
    title: metadata.title || '',
    duration: metadata.duration || '',
    category: metadata.category || '',
    sequence: parseInt(metadata.sequence || '0'),
    description: metadata.description || '',
    content: contentWithoutFrontmatter,
    days
  };
}

// Function to save user progress for a journey
export async function saveJourneyProgress(
  journeyId: string,
  day: number,
  completed: boolean = true,
  responses: Record<string, any> = {}
): Promise<boolean> {
  try {
    const progress = readStoredJourneyProgress();
    const entries = progress[journeyId] || [];
    const createdAt = new Date().toISOString();

    const nextEntries = entries.some((entry) => entry.day === day)
      ? entries.map((entry) =>
          entry.day === day
            ? { ...entry, completed, responses, created_at: createdAt }
            : entry
        )
      : [
          ...entries,
          {
            journey_id: journeyId,
            day,
            completed,
            responses,
            created_at: createdAt,
          },
        ];

    progress[journeyId] = nextEntries.sort((a, b) => a.day - b.day);
    writeStoredJourneyProgress(progress);
    return true;
  } catch (error) {
    console.error('Error saving journey progress:', error);
    return false;
  }
}

// Function to get user progress for a journey
export async function getJourneyProgress(journeyId: string): Promise<any[]> {
  try {
    const progress = readStoredJourneyProgress();
    return progress[journeyId] || [];
  } catch (error) {
    console.error('Error getting journey progress:', error);
    return [];
  }
}

// Function to check journey velocity limits (1 active journey, 1 day per day)
export async function getJourneyVelocityStatus(journeyId?: string) {
  try {
    const progress = readStoredJourneyProgress();
    const journeyIds = Object.keys(progress);

    const activeJourneyId =
      journeyIds.find((id) => {
        const entries = progress[id] || [];
        const highestCompletedDay = entries.reduce(
          (max, entry) => (entry.completed ? Math.max(max, entry.day) : max),
          0
        );
        return highestCompletedDay > 0 && highestCompletedDay < 14;
      }) || null;

    const cannotStartDifferentJourney = activeJourneyId && activeJourneyId !== journeyId;

    let canDoNextDay = true;

    if (journeyId) {
      const recentProgress = (progress[journeyId] || []).filter((entry) => entry.completed);
      const latestEntry = recentProgress[recentProgress.length - 1];

      if (latestEntry?.created_at) {
        const lastCompletedAt = new Date(latestEntry.created_at);
        const today = new Date();

        if (
          lastCompletedAt.getDate() === today.getDate() &&
          lastCompletedAt.getMonth() === today.getMonth() &&
          lastCompletedAt.getFullYear() === today.getFullYear()
        ) {
          canDoNextDay = false;
        }
      }
    }

    return {
      canStartNewJourney: !cannotStartDifferentJourney,
      activeJourneyId,
      canDoNextDay,
    };
  } catch (error) {
    console.error('Error checking velocity status:', error);
    return { canStartNewJourney: true, canDoNextDay: true, activeJourneyId: null };
  }
}
