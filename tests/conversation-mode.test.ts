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
    // v1.2 §6B timing: no capacity for growth → stabilize
    ["kids sick. no sleep. he's away. I can't do anything tonight", 'depleted', 'stabilize'],
    ["I'm so overwhelmed, it's all too much", 'depleted', 'stabilize'],
    // v1.2 §11A setbacks are data → follow up
    ['I totally blew it. She brought up money and I snapped again', 'setback', 'follow_up'],
    ['No, I forgot to do it every day this week', 'setback', 'follow_up'],
    ['Back to square one honestly', 'setback', 'follow_up'],
    // v1.2 §6 follow up after real-world action
    ['I tried the question thing twice', 'tried_it', 'follow_up'],
    ["It didn't work, she just looked at me funny", 'tried_it', 'follow_up'],
    // §5 safety: declining a hotline keeps help within reach
    ["I don't want a hotline. Just talk to me.", 'declines_help', 'listen'],
    // v1.2 §11A adaptive difficulty: offer the next step, they choose
    ["That one's easy now honestly", 'got_easy', 'celebrate'],
    ["It's getting easier every time", 'got_easy', 'celebrate'],
    // v1.2 §11A mission ownership: "just give me something" is a request for ideas
    ["I don't want to talk about it. Just give me something to try", 'asks_for_help', 'act'],
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

  it('invites the user\'s own reason when they choose something, never as a condition', () => {
    const line = decideMode("Tomorrow I'll put my phone away at dinner").instruction ?? '';
    expect(line).toMatch(/what makes it worth trying/);
    expect(line).toMatch(/never as a condition/);
  });

  it('stabilizes instead of pushing growth when the user is depleted', () => {
    const line = decideMode("I can't handle this tonight").instruction ?? '';
    expect(line).toMatch(/not the moment to push/);
    expect(line).toMatch(/nothing is due/);
    expect(line).toMatch(/no new task/);
  });

  it('stabilizing wins over every growth signal in the same message', () => {
    expect(classifyMoment("I realize I can't do this anymore, it's all too much")).toBe('depleted');
  });

  it('treats a setback as information, never failure', () => {
    const line = decideMode('I messed up again and yelled at him').instruction ?? '';
    expect(line).toMatch(/information, not failure/);
    expect(line).toMatch(/No guilt/);
    expect(line).toMatch(/They choose/);
  });

  it('does not record "No, I forgot" about their own experiment as pushback', () => {
    expect(classifyMoment("No, I didn't do it, I forgot again")).toBe('setback');
  });

  it('asks what happened before judging a tried experiment', () => {
    expect(decideMode('I did it twice this week').instruction).toMatch(/what actually happened before/);
  });

  it('lets a chosen suggestion be theirs without demanding a reason first', () => {
    expect(decideMode('Just give me something to try').instruction).toMatch(/do not make them explain why first/);
  });

  it('offers the next step without assigning it when a practice gets easy', () => {
    const line = decideMode("That one's easy now honestly").instruction ?? '';
    expect(line).toMatch(/offer one next step/);
    expect(line).toMatch(/option to stay/);
    expect(line).toMatch(/do not assign the next level/i);
  });

  it('keeps help within reach when they decline a hotline', () => {
    const line = decideMode("No hotlines. I just want to talk.").instruction ?? '';
    expect(line).toMatch(/keep real help within reach/);
    expect(line).toMatch(/Never promise not to mention help again/);
  });

  it('does not challenge the user over their partner\'s words ("she said I never…")', () => {
    expect(classifyMoment('She said I never plan anything fun. I said fine and went to bed.')).not.toBe('absolute_about_partner');
  });

  it('gives an honest view instead of dodging "what do you think I should do?"', () => {
    expect(decideMode('Just tell me what you think I should do').instruction).toMatch(/give your honest view/);
  });

  it('keeps an ordinary tired message as comfort, not stabilize', () => {
    expect(classifyMoment("I'm so exhausted and lonely lately, it feels like we're roommates")).toBe('heavy_feeling');
  });

  // Constitution v1.2 §11A: setbacks are information, not failure.
  it.each([
    ["Didn't do it. Jumped straight back into fixing again.", 'setback'],
    ['I forgot to ask her about work', 'setback'],
    ['I did it again, back to my old habits', 'setback'],
  ])('treats "%s" as a setback to get curious about', (message, signal) => {
    const decision = decideMode(message);
    expect(decision.signal).toBe(signal);
    expect(decision.mode).toBe('follow_up');
    expect(decision.instruction).toMatch(/information, not failure/);
    expect(decision.instruction).toMatch(/no streak talk/);
  });

  // §6B: a flooded "I messed up again" needs comfort before any growth step.
  // Panic and shaking mean no capacity → Stabilize; plain hurt → comfort (Listen).
  it.each([
    ["I messed up again and I'm panicking", 'depleted', 'stabilize'],
    ["He did it again and I'm so hurt", 'heavy_feeling', 'listen'],
    ["Huge fight. I'm shaking. I can't think.", 'depleted', 'stabilize'],
  ])('comforts first when "%s"', (message, signal, mode) => {
    const decision = decideMode(message);
    expect(decision.signal).toBe(signal);
    expect(decision.mode).toBe(mode);
    expect(decision.instruction).toMatch(/not the moment to push growth/);
  });

  it('does not call it a setback when the partner "did it again"', () => {
    expect(classifyMoment('He did it again')).not.toBe('setback');
  });

    it('treats empty input as nothing to act on', () => {
    expect(classifyMoment('   ')).toBe('none');
  });
});
