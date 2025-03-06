import { supabase } from '@/lib/supabase';

export interface JourneyContent {
  id: string;
  title: string;
  content: string;
  metadata: {
    duration: string;
    category: string;
    sequence: number;
    phases: any[];
    description?: string;
  };
}

export async function loadJourneyContent(journeyId: string): Promise<JourneyContent | null> {
  try {
    // First try to load from Supabase if available
    const { data: journeyData, error } = await supabase
      .from('journeys')
      .select('*')
      .eq('id', journeyId)
      .single();

    if (journeyData && !error) {
      return journeyData as JourneyContent;
    }

    // Fallback to local markdown files
    const response = await fetch(`/Path to Together/${journeyId}.md`);
    if (!response.ok) {
      console.error(`Failed to load journey content for ${journeyId}`);
      return null;
    }

    const content = await response.text();
    
    // Parse metadata from markdown frontmatter if exists
    const metadata = parseMetadata(content);
    
    return {
      id: journeyId,
      title: metadata.title || journeyId,
      content: content,
      metadata: {
        duration: metadata.duration || "2 weeks",
        category: metadata.category || "Foundation",
        sequence: metadata.sequence || 1,
        phases: metadata.phases || [],
        description: metadata.description
      }
    };
  } catch (error) {
    console.error('Error loading journey content:', error);
    return null;
  }
}

function parseMetadata(content: string) {
  const metadata: any = {};
  
  // Look for frontmatter between --- markers
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const lines = frontmatter.split('\n');
    
    lines.forEach(line => {
      const [key, ...values] = line.split(':');
      if (key && values.length) {
        metadata[key.trim()] = values.join(':').trim();
      }
    });
  }
  
  return metadata;
} 