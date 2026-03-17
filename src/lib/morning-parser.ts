export function parseMorningContent(raw: string): { story: string; action: string } {
  const match = raw.match(/Today[''\u2019]s Action[:\s]+([\s\S]+?)$/m);
  if (match) {
    return {
      story: raw.substring(0, raw.indexOf(match[0])).trim(),
      action: match[1].trim(),
    };
  }
  return {
    story: raw,
    action: 'Do one small kind thing for your partner today.',
  };
}

