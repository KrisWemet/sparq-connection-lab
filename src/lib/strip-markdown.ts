/**
 * Strip common markdown formatting from AI-generated text.
 * Peter's responses are rendered as plain text in the mobile UI,
 * so all markdown syntax must be removed before display.
 *
 * Shared utility — use this everywhere Peter's text reaches the UI.
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove headings (# ## ###)
    .replace(/^#{1,3}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italics (*text* or _text_) — but not mid-word apostrophes
    .replace(/(?<!\w)\*(.+?)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_(.+?)_(?!\w)/g, '$1')
    // Remove stray leading/trailing asterisks or underscores left over
    .replace(/^\*{1,2}\s*/gm, '')
    .replace(/\s*\*{1,2}$/gm, '')
    // Collapse multiple blank lines into one
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
