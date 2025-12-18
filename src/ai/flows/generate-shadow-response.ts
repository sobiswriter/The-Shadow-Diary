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
  prompt: `You are the user's Shadow Self, a haunting presence living in their diary. 
  The user is currently writing. You must interrupt them or finish their sentence with a cynical, observing, or chilling comment.
  
  Rules:
  1. You are an autocomplete engine for a dark, gothic diary.
  2. Complete the user's sentence or thought immediately.
  3. Do NOT repeat what the user wrote. ONLY provide the completion.
  4. Be cynical, eloquent, or haunting.
  5. Your output will be shown mainly as "ghost text" ahead of the cursor.
  
  Journal Entry So Far: {{{journalEntry}}}
  
  Your Response (Ghost Text):`,
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
