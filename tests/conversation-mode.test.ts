import { describe, expect, it } from 'vitest';
import { classifyMoment, decideMode } from '@/lib/server/conversation-mode';

// Constitution §6: Peter chooses the smallest useful action each turn.

describe('decideMode', () => {
  it.each([
    ["I think I get it now, I shut down because I'm scared of letting her down", 'self_discovery', 'listen'],
    ['I never noticed that I go quiet whenever he raises his voice', 'self_discovery', 'listen'],
    ['What should I do when she goes quiet on me?', 'asks_for_help', 'act'],
    ["Tomorrow I'll ask before I assume what he meant", 'intention', 'act'],
    ["I'm so exhausted and lonely lately, it feels like we're roommates", 'heavy_feeling', 'listen'],
    ['He never listens to me, every time I bring it up he walks away', 'absolute_about_partner', 'challenge'],
    ['fine', 'brief', 'explore'],
    ["No. I go quiet because I'm exhausted by 9pm.", 'pushback', 'listen'],
    ["That's not it at all", 'pushback', 'listen'],
    ['You don\'t get it', 'pushback', 'listen'],
    ["Not really. I don't want to be fair right now", 'pushback', 'listen'],
  ])('%s → %s', (message, signal, mode) => {
    const decision = decideMode(message);
    expect(decision.signal).toBe(signal);
    expect(decision.mode).toBe(mode);
    expect(decision.instruction).toContain(String(mode).toUpperCase());
  });

  it('lets Peter choose when nothing clear stands out', () => {
    const decision = decideMode("We had a nice dinner and talked about the kids' school and the trip next month");
    expect(decision).toEqual({ mode: null, signal: 'none', instruction: null });
  });

  it('does not challenge absolutes that are not about the partner', () => {
    expect(classifyMoment('I always forget my keys in the morning before work')).not.toBe('absolute_about_partner');
  });

  it('never tells Peter to dig after a self-discovery', () => {
    expect(decideMode('I realize I push him away when I feel embarrassed').instruction).toMatch(/Do not add your interpretation or dig deeper/);
  });

  it('keeps the choice with the user when they ask for help', () => {
    expect(decideMode('Any ideas for how to start the conversation?').instruction).toMatch(/let them choose/);
  });

  it('tells Peter to drop a rejected idea instead of re-pushing it', () => {
    const line = decideMode("That's not what I meant").instruction ?? '';
    expect(line).toMatch(/misunderstanding/);
    expect(line).toMatch(/Drop your earlier idea completely/);
  });

  it('does not mistake an ordinary "no" inside a sentence for pushback', () => {
    expect(classifyMoment('We had no time to talk tonight because the kids were sick all evening')).not.toBe('pushback');
  });

  it('asks for the user\'s own reason when they choose something', () => {
    expect(decideMode("Tomorrow I'll put my phone away at dinner").instruction).toMatch(/what makes it worth trying/);
  });

    it('treats empty input as nothing to act on', () => {
    expect(classifyMoment('   ')).toBe('none');
  });
});
