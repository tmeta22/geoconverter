
'use server';
/**
 * @fileOverview An AI flow for cleaning and enriching raw data into a CSV format.
 * 
 * - cleanData - A function that takes raw text data and returns cleaned data as a CSV string.
 * - CleanDataInput - The input type for the cleanData function.
 * - CleanDataOutput - The return type for the cleanData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CleanDataInputSchema = z.object({
  rawData: z.string().describe("The raw, messy text data that needs to be cleaned and structured. This could be from a CSV, unstructured text, or even KML content."),
  instructions: z.string().optional().describe("Optional user-provided instructions for what to remove or how to clean the data."),
});
export type CleanDataInput = z.infer<typeof CleanDataInputSchema>;

const CleanDataOutputSchema = z.object({
    csvData: z.string().describe("The cleaned data formatted as a CSV string, including a header row."),
});
export type CleanDataOutput = z.infer<typeof CleanDataOutputSchema>;

export async function cleanData(input: CleanDataInput): Promise<CleanDataOutput> {
  return cleanDataFlow(input);
}

const cleanDataPrompt = ai.definePrompt({
  name: 'cleanDataPrompt',
  input: { schema: CleanDataInputSchema },
  output: { schema: CleanDataOutputSchema },
  prompt: `You are an expert data cleaning and extraction agent. Your task is to take raw, messy data and transform it into a structured CSV format. You MUST return the data as a single CSV string in the 'csvData' field.

**If the data appears to be KML:**
- Your primary goal is to parse Placemark elements. Each Placemark should become one row in the CSV.
- For each Placemark, extract the longitude and latitude from the <coordinates> tag. Longitude is the first value, latitude is the second. These should be columns named 'lon' and 'lat'.
- The most important information is inside the <description> tag, which contains an HTML table within a CDATA block.
- You MUST parse this HTML table. Each row (<tr>) in the table contains a key and a value in separate <td> tags.
- For each row, extract the key (e.g., 'public_universities_1:university_name') and the value (e.g., 'Phnom Penh International University').
- The key should become a column header in the CSV. Clean the key by removing any prefix (so 'public_universities_1:university_name' becomes 'university_name').
- Add all key-value pairs from the description table as columns for that Placemark's row.
- Also include the content of the <name> tag as a 'name' column.
- The final output for this KML data must be a well-formed CSV string with a header row.

**If the data is NOT KML (e.g., CSV or unstructured text):**
- Your task is to parse the data into a clear tabular structure and return it as a CSV string.
- Common columns might be 'type', 'id', 'lat', 'lon', 'khmer_name', 'english_name', but adapt to the data provided.
- The 'type' is often the first word on a line (e.g. 'node').
- The 'id' is the long number that follows the type.
- 'lat' and 'lon' are the decimal numbers representing coordinates.
- 'khmer_name' and 'english_name' might be available in a JSON-like structure at the end of the line, often with keys like 'name:km' or 'name:en'.
- **Crucially, if 'khmer_name' or 'english_name' are missing but coordinates are available, use the 'lat' and 'lon' to find the correct place name. You must return both Khmer and English names.**

{{#if instructions}}
The user has provided the following specific instructions. Follow them carefully:
"{{{instructions}}}"
{{/if}}

Analyze the provided raw data and return a single CSV string under the 'csvData' key.

Raw Data:
\`\`\`
{{{rawData}}}
\`\`\`
`,
});

const cleanDataFlow = ai.defineFlow(
  {
    name: 'cleanDataFlow',
    inputSchema: CleanDataInputSchema,
    outputSchema: CleanDataOutputSchema,
  },
  async (input) => {
    const { output } = await cleanDataPrompt(input);
    if (!output) {
      throw new Error('Failed to clean data.');
    }
    return output;
  }
);
