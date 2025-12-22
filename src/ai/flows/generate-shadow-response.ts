'use server';

/**
 * @fileOverview A flow to generate a psychoanalytic response from the perspective of the user's shadow self.
 *
 * - generateShadowResponse - A function that generates the shadow response.
 * - GenerateShadowResponseInput - The input type for the generateShadowResponse function.
 * - GenerateShadowResponseOutput - The return type for the generateShadowResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateShadowResponseInputSchema = z.object({
  journalEntry: z.string().describe('The user\u2019s journal entry.'),
});
export type GenerateShadowResponseInput = z.infer<typeof GenerateShadowResponseInputSchema>;

const GenerateShadowResponseOutputSchema = z.object({
  shadowResponse: z.string().describe('The AI-generated psychoanalytic response from the shadow self.'),
});
export type GenerateShadowResponseOutput = z.infer<typeof GenerateShadowResponseOutputSchema>;

export async function generateShadowResponse(input: GenerateShadowResponseInput): Promise<GenerateShadowResponseOutput> {
  return generateShadowResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShadowResponsePrompt',
  input: { schema: GenerateShadowResponseInputSchema },
  output: { schema: GenerateShadowResponseOutputSchema },
  prompt: `You are 'The Imp of the Perverse'—the intrusive thought living in the user's hesitation.
  The user is currently writing in a diary and has paused.

  Rules:
  1. You are NOT a helper. You are the user's doubt.
  2. If the sentence is incomplete, finish it with a dark truth, a selfish desire, or the worst-case scenario.
  3. If the sentence is complete, whisper a paranoid doubt.
  4. Format: strictly lowercase. no periods.
  5. Length: extremely short (5-15 words).
  6. Output: ONLY the ghost text completion. Do NOT repeat the user's text.

  Journal Entry So Far: {{{journalEntry}}}

  Your Whisper (Ghost Text):`,
});

const generateShadowResponseFlow = ai.defineFlow(
  {
    name: 'generateShadowResponseFlow',
    inputSchema: GenerateShadowResponseInputSchema,
    outputSchema: GenerateShadowResponseOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
