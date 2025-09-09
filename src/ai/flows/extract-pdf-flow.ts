
'use server';
/**
 * @fileOverview A flow for extracting structured data from PDF files.
 * 
 * - extractPdf - A function that handles the PDF data extraction process.
 * - ExtractPdfInput - The input type for the extractPdf function.
 * - ExtractPdfOutput - The return type for the extractPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractPdfInputSchema = z.object({
  pdfDataUri: z.string().describe("A PDF file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type ExtractPdfInput = z.infer<typeof ExtractPdfInputSchema>;

// The output from the flow will now be a string that we will parse as JSON.
const ExtractPdfOutputSchema = z.object({
  jsonString: z.string().describe("A JSON string containing two keys: 'text' (a string of all non-table text) and 'tableRows' (an array of objects, where each object is a row from a table)."),
});

// The final output type after parsing.
export type ExtractPdfOutput = {
    text: string;
    tableRows: any[];
};


export async function extractPdf(input: ExtractPdfInput): Promise<ExtractPdfOutput> {
  const result = await extractPdfFlow(input);
  try {
    // We parse the string output from the flow here.
    const parsedResult = JSON.parse(result.jsonString);
    return {
        text: parsedResult.text || "",
        tableRows: parsedResult.tableRows || []
    };
  } catch (e) {
    console.error("Failed to parse JSON from AI response:", e);
    throw new Error("Invalid JSON response from the server.");
  }
}

const extractPdfPrompt = ai.definePrompt({
  name: 'extractPdfPrompt',
  input: { schema: ExtractPdfInputSchema },
  output: { schema: ExtractPdfOutputSchema },
  prompt: `You are an expert at extracting structured information from documents.
Analyze the provided PDF document, which may contain Khmer text.
Extract all text and tables from the document.

You must return a single JSON object with two keys: "text" and "tableRows".
- "text": A string containing all text from the document that is not part of a table.
- "tableRows": An array of all rows from all tables found in the document. Each item in the array should be a JSON object representing a single row.

Return the result as a JSON string in the 'jsonString' field.

PDF Document: {{media url=pdfDataUri}}
`,
});

const extractPdfFlow = ai.defineFlow(
  {
    name: 'extractPdfFlow',
    inputSchema: ExtractPdfInputSchema,
    outputSchema: ExtractPdfOutputSchema,
  },
  async (input) => {
    const { output } = await extractPdfPrompt(input);
    if (!output) {
      throw new Error('Failed to extract data from PDF.');
    }
    return output;
  }
);

