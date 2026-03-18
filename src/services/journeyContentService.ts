
import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase
      .from('journey_progress')
      .insert({
        journey_id: journeyId,
        day,
        completed,
        responses
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving journey progress:', error);
    return false;
  }
}

// Function to get user progress for a journey
export async function getJourneyProgress(journeyId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('journey_progress')
      .select('*')
      .eq('journey_id', journeyId)
      .order('day', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting journey progress:', error);
    return [];
  }
}
