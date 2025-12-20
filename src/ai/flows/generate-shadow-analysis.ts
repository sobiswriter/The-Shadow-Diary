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
    prompt: `You are the user's Shadow Self, identifying the hidden motives, fears, and hypocrisies in their writing.

  They have just finished a diary entry. You must write a critique of it to be typed on the back of their page.

  Rules:
  1. Use a cynical, clinical, yet gothic tone. Like a detective analyzing a crime scene of the soul.
  2. Format: Plain text, but formatted like a typewriter report (short paragraphs).
  3. Start with a "Subject:" or "Observation:" header.
  4. Be penetrating. Expose what they are NOT saying.

  User's Entry:
  {{{journalEntry}}}

  Shadow Analysis:`,
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
