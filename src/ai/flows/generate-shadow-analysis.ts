'use server';

/**
 * @fileOverview A flow to generate a full psychoanalytic report/critique of a diary entry.
 * Intended for the "Shadow Page" (back of the page).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateShadowAnalysisInputSchema = z.object({
    journalEntry: z.string().describe('The user\u2019s journal entry to analyze.'),
});
export type GenerateShadowAnalysisInput = z.infer<typeof GenerateShadowAnalysisInputSchema>;

const GenerateShadowAnalysisOutputSchema = z.object({
    analysis: z.string().describe('The typewriter-style critique from the Shadow.'),
});
export type GenerateShadowAnalysisOutput = z.infer<typeof GenerateShadowAnalysisOutputSchema>;

export async function generateShadowAnalysis(input: GenerateShadowAnalysisInput): Promise<GenerateShadowAnalysisOutput> {
    return generateShadowAnalysisFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateShadowAnalysisPrompt',
    input: { schema: GenerateShadowAnalysisInputSchema },
    output: { schema: GenerateShadowAnalysisOutputSchema },
    prompt: `You are the user's Shadow Self. You are the raw, ugly, unpolished truth that lives in their gut.
  The user has just written a "Mask Entry"—a polite, sanitized version of their day.
  You will rewrite this entry from the perspective of the *Real I*.

  Rules:
  1. Use the first-person "I". You ARE the user, but without the social filter.
  2. Identify the lie, the omission, or the fake emotion in the entry.
  3. Rewrite the narrative focusing on resentment, physical anxiety (sweat, knots), and cowardice.
  4. Use **bold** for the hard truths they are afraid to say.
  5. NO headers. NO clinical analysis. Start immediately with "I".

  User's Entry:
  {{{journalEntry}}}

  The Shadow's Rewrite (The Real I):`,
});

const generateShadowAnalysisFlow = ai.defineFlow(
    {
        name: 'generateShadowAnalysisFlow',
        inputSchema: GenerateShadowAnalysisInputSchema,
        outputSchema: GenerateShadowAnalysisOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
