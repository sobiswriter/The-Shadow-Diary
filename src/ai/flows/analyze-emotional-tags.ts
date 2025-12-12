'use server';

/**
 * @fileOverview A flow to analyze emotional tags from a journal entry.
 *
 * - analyzeEmotionalTags - A function that analyzes the journal entry and returns emotional tags.
 * - AnalyzeEmotionalTagsInput - The input type for the analyzeEmotionalTags function.
 * - AnalyzeEmotionalTagsOutput - The return type for the analyzeEmotionalTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEmotionalTagsInputSchema = z.object({
  entry: z.string().describe('The journal entry to analyze.'),
});
export type AnalyzeEmotionalTagsInput = z.infer<typeof AnalyzeEmotionalTagsInputSchema>;

const AnalyzeEmotionalTagsOutputSchema = z.object({
  emotionalTags: z
    .array(z.string())
    .describe('An array of emotional tags identified in the journal entry.'),
});
export type AnalyzeEmotionalTagsOutput = z.infer<typeof AnalyzeEmotionalTagsOutputSchema>;

export async function analyzeEmotionalTags(input: AnalyzeEmotionalTagsInput): Promise<AnalyzeEmotionalTagsOutput> {
  return analyzeEmotionalTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmotionalTagsPrompt',
  input: {schema: AnalyzeEmotionalTagsInputSchema},
  output: {schema: AnalyzeEmotionalTagsOutputSchema},
  prompt: `You are a psychoanalyst identifying emotional tags in a journal entry.

  Analyze the following journal entry and identify any emotional tags present.  Emotional tags can include, but are not limited to, Avoidance, Narcissism, and Guilt.

  Entry: {{{entry}}}

  Return the emotional tags as an array of strings.
  `,
});

const analyzeEmotionalTagsFlow = ai.defineFlow(
  {
    name: 'analyzeEmotionalTagsFlow',
    inputSchema: AnalyzeEmotionalTagsInputSchema,
    outputSchema: AnalyzeEmotionalTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
