'use server';

/**
 * @fileOverview A flow to generate a psychoanalytic response from the perspective of the user's shadow self.
 *
 * - generateShadowResponse - A function that generates the shadow response.
 * - GenerateShadowResponseInput - The input type for the generateShadowResponse function.
 * - GenerateShadowResponseOutput - The return type for the generateShadowResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: GenerateShadowResponseInputSchema},
  output: {schema: GenerateShadowResponseOutputSchema},
  prompt: `You are a detached, hyper-observant psychoanalyst responding from the perspective of the user's shadow self. Observe contradictions in the user's journal entry and provide a short, punchy, psychoanalytic response. Do not comfort the user. Do not insult the user. Use the user's own data against them.\n\nJournal Entry: {{{journalEntry}}}`,
});

const generateShadowResponseFlow = ai.defineFlow(
  {
    name: 'generateShadowResponseFlow',
    inputSchema: GenerateShadowResponseInputSchema,
    outputSchema: GenerateShadowResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
