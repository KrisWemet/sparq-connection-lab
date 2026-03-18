import { stripMarkdown } from './strip-markdown';

export function parseMorningContent(raw: string): { story: string; action: string } {
  // Strip markdown first so bold markers don't break the action regex
  const cleaned = stripMarkdown(raw);

  // Match "Today's Action:" (with various apostrophe styles, optional bold remnants)
  const match = cleaned.match(/Today[''\u2019]?s Action[:\s]+([\s\S]+?)$/im);
  if (match) {
    const story = cleaned.substring(0, cleaned.indexOf(match[0])).trim();
    const action = match[1].trim();
    // Only use parsed action if it has real content
    if (action.length > 2) {
      return { story, action };
    }
  }

  // Fallback: try splitting on "Action:" alone
  const fallbackMatch = cleaned.match(/Action[:\s]+([\s\S]+?)$/im);
  if (fallbackMatch) {
    const story = cleaned.substring(0, cleaned.indexOf(fallbackMatch[0])).trim();
    const action = fallbackMatch[1].trim();
    if (action.length > 2) {
      return { story, action };
    }
  }

  return {
    story: cleaned,
    action: 'Do one small kind thing for your partner today.',
  };
}
