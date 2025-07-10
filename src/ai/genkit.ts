import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GOOGLE_API_KEY})],
  // This default model is used for text generation.
  // Specific models for images, etc., are defined where they are used.
  model: 'googleai/gemini-1.5-flash-latest',
});
