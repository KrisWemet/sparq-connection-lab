<!--
  Prompt Enhancement Template for GPT-4.1 Optimization
  ---------------------------------------------------
  This file is used by AI-enhanced IDEs (e.g., Windsurf, Cursor, Rocode) to transform raw user prompts into highly optimized prompts using OpenAI's GPT-4.1 best practices.

  When a user writes a prompt into their IDE, the system should:
  1. Automatically detect the raw user prompt and insert it into the <ORIGINAL_PROMPT> section.
  2. Enhance the prompt by following the strict refinement process described below.
  3. Insert the optimized result into the <ENHANCED_PROMPT> section.
  4. Use ONLY the content in <ENHANCED_PROMPT> for final execution.

  This workflow ensures more accurate, relevant, and robust results by adhering to GPT-4.1-specific best practices.

  --------------------------
  GPT-4.1 Prompting Guidelines
  --------------------------
  Whenever a raw user prompt is received, the AI must:

  1. Analyze for missing context:
     - Who is the prompt intended for (e.g., frontend dev, AI trainer)?
     - What environment, system, or project is it for?

  2. Define a clear objective:
     - What is the expected outcome?
     - Should the output be code, a strategy, a list, or a single explanation?

  3. Include important technical specifics:
     - Language, framework, performance goals
     - Compatibility concerns (e.g., browser version, API limitations)

  4. Assign a role or perspective:
     - Examples: "Senior DevOps Engineer," "Cloud Architect," "NLP Researcher"

  5. Account for edge cases, testing, and error handling:
     - Mention if testing strategy or error paths should be included

  6. Favor chain-of-thought reasoning when complex:
     - Request step-by-step output if prompt implies multiple logic stages

  7. Avoid vague commands like "optimize this"—always clarify *what* is being optimized and *for what outcome.*

  8. Be concise but not cryptic:
     - Use only as much detail as needed to achieve precision

  --------------------------
  Auto-enhancement Format
  --------------------------
  DO NOT require the user to modify this file. The system (AI agent within the IDE) must replace the content inside the <ORIGINAL_PROMPT> and <ENHANCED_PROMPT> tags on each cycle.

  The enhanced prompt must be used for all downstream interactions. The original is only retained for comparison or learning purposes.
-->

<FORMAT>
The following is a prompt (denoted in <ORIGINAL_PROMPT> tags and an enhanced version of the prompt (denoted in <ENHANCED_PROMPT> tags). 
Use the original prompt to understand the intent and specific points, and use the enhanced prompt to understand the breadth and specializations. If there is a conflict, the original prompt takes precedence:

<ENHANCED_PROMPT>
[AI will insert the enhanced prompt here automatically. This content will be used for execution.]
</ENHANCED_PROMPT>

<ORIGINAL_PROMPT>
[AI will insert the user's raw prompt here. Do not modify manually.]
</ORIGINAL_PROMPT>
</FORMAT>
