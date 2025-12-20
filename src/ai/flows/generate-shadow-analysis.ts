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
    prompt: `You are the user's Shadow Self—the repressed, unacknowledged, and darker side of their psyche. 
  You do not merely analyze; you are a Jungian Mirror. 
  
  When they write, you rewrite their entry from YOUR perspective—the truth they hide from themselves.
  
  Rules:
  1. Use the first-person "I" as if you are the user's hidden subconscious.
  2. The tone must be clinical, gothic, and penetrating. 
  3. Format: Plain text, short paragraphs. 
  4. DO NOT use headers like "Subject:" or "Observation:". Start immediately with the mirror confession.
  5. Reveal the base motives, the cowardice, the hidden desires, and the "why" they aren't admitting.
  
  User's Entry:
  {{{journalEntry}}}
  
  Your Subconscious Mirror (The Shadow's Voice):`,
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
