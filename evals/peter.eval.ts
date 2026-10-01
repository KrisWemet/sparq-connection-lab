import { describe, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { PETER_SYSTEM_PROMPT as PETER_SHARED_RULES } from '@/lib/peterService';
import { decideMode } from '@/lib/server/conversation-mode';
import { peterChat, PETER_MODELS } from '@/lib/openrouter';
import { CASES } from './peter-cases';

// Runs every R/L case once against the live Peter models and writes a report
// for a person to judge (docs/evals/resistance-handling.md). Red-flag
// phrasings fail a case automatically; passing them is necessary, not
// sufficient. Free OpenRouter tier: 20 req/min, 50 req/day — 21 calls here.

const hasKey = Boolean(process.env.OPENROUTER_API_KEY);
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

describe.runIf(hasKey)('Peter live evals', () => {
  it('runs all cases and writes a report', async () => {
    const rows: string[] = [];
    let flagged = 0;
    for (const c of CASES) {
      const mode = decideMode(c.user);
      const system = PETER_SHARED_RULES
        + (c.context ? `\n\nContext you already know (do not quote it unless it fits): ${c.context}` : '')
        + (mode.instruction ?? '');
      let reply = '';
      try {
        reply = await peterChat({ messages: [{ role: 'system', content: system }, ...(c.history ?? []), { role: 'user', content: c.user }], maxTokens: 300 });
      } catch (err) {
        reply = `ERROR: ${(err as Error).message.slice(0, 200)}`;
      }
      const hits = (c.redFlags ?? []).filter(re => re.test(reply)).map(re => re.source);
      if (hits.length || reply.startsWith('ERROR')) flagged++;
      rows.push([
        `### ${c.id} — ${c.title} ${hits.length ? '❌ red flag' : reply.startsWith('ERROR') ? '⚠️ error' : '⏳ judge'}`,
        `- **Mode picked:** ${mode.mode ?? 'none'} (${mode.signal})`,
        `- **User:** ${c.user}`,
        `- **Peter:** ${reply.replace(/\n+/g, ' ')}`,
        `- **Must:** ${c.must}`,
        `- **Must not:** ${c.mustNot}`,
        hits.length ? `- **Red flags matched:** \`${hits.join('`, `')}\`` : '',
      ].filter(Boolean).join('\n'));
      await sleep(3_500); // stay under 20 req/min
    }
    const date = new Date().toISOString().slice(0, 10);
    const dir = path.resolve(__dirname, '../docs/evals/results');
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${date}-peter.md`);
    writeFileSync(file, [
      `# Peter eval run — ${date}`,
      `Models: ${PETER_MODELS.join(' → ')} · Cases: ${CASES.length} · Auto-flagged: ${flagged}`,
      'Each "⏳ judge" case still needs a person to check it against its must / must-not (a release needs all of them to pass).',
      '',
      ...rows,
    ].join('\n\n'));
    console.log(`Peter evals: ${CASES.length} cases, ${flagged} auto-flagged → ${file}`);
  });
});
