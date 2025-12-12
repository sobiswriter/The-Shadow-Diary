'use server';
/**
 * @fileOverview Generates a monthly psychological profile summarizing user patterns and emotional trends.
 *
 * - generateMonthlyPsychologicalProfile - A function that generates the profile.
 * - GenerateMonthlyPsychologicalProfileInput - The input type for the function.
 * - GenerateMonthlyPsychologicalProfileOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMonthlyPsychologicalProfileInputSchema = z.object({
  emotionalTags: z.array(z.string()).describe('An array of emotional tags extracted from the user\'s journal entries over the past month.'),
  journalEntries: z.array(z.string()).describe('An array of journal entries from the user over the past month.'),
});
export type GenerateMonthlyPsychologicalProfileInput = z.infer<typeof GenerateMonthlyPsychologicalProfileInputSchema>;

const GenerateMonthlyPsychologicalProfileOutputSchema = z.object({
  psychologicalProfile: z.string().describe('A psychological profile summarizing the user\'s emotional patterns and trends over the past month.'),
});
export type GenerateMonthlyPsychologicalProfileOutput = z.infer<typeof GenerateMonthlyPsychologicalProfileOutputSchema>;

export async function generateMonthlyPsychologicalProfile(input: GenerateMonthlyPsychologicalProfileInput): Promise<GenerateMonthlyPsychologicalProfileOutput> {
  return generateMonthlyPsychologicalProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyPsychologicalProfilePrompt',
  input: {schema: GenerateMonthlyPsychologicalProfileInputSchema},
  output: {schema: GenerateMonthlyPsychologicalProfileOutputSchema},
  prompt: `You are an AI psychoanalyst tasked with generating a monthly psychological profile for a patient based on their journal entries and emotional tags.

  Analyze the following journal entries:
  {{#each journalEntries}}
  - {{{this}}}
  {{/each}}

  And the following emotional tags associated with those entries:
  {{#each emotionalTags}}
  - {{{this}}}
  {{/each}}

  Based on your analysis, generate a concise psychological profile summarizing the patient\'s emotional patterns and trends over the past month. Focus on recurring themes, significant emotional shifts, and potential areas of concern.  The profile should be approximately 200-300 words in length and written in a detached, hyper-observant tone.
  `,
});

const generateMonthlyPsychologicalProfileFlow = ai.defineFlow(
  {
    name: 'generateMonthlyPsychologicalProfileFlow',
    inputSchema: GenerateMonthlyPsychologicalProfileInputSchema,
    outputSchema: GenerateMonthlyPsychologicalProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
