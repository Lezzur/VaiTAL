import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Missing GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "placeholder_key");

// Models
export const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface ExtractedResult {
  marker_name: string;
  value?: number;
  text_value?: string;
  unit: string;
  reference_range_min?: number;
  reference_range_max?: number;
  confidence: number;
}

export interface ExtractedCheckup {
  date: string; // ISO date string YYYY-MM-DD
  summary: string;
  analysis?: string;
  recommendations: string[];
  results: ExtractedResult[];
}

export async function extractDataFromImage(base64Image: string, mimeType: string): Promise<ExtractedCheckup> {
  const prompt = `
    You are an expert medical data analyst. Your task is to extract structured lab results from the provided image of a medical report.

    Extract the following information:
    1. The date of the checkup (YYYY-MM-DD). If ambiguous, estimate from context or return today's date.
    2. A brief, 1-sentence summary of the overall health status (for list views).
    3. A "Patient-Friendly Analysis" (paragraph): A comforting, medically accurate narrative. 
       - Highlight what is GOOD (e.g. "Your HDL of 82 is excellent").
       - Gently explain what is OUT OF RANGE (e.g. "Triglycerides are slightly elevated, but...").
       - Use a tone that is professional yet personal ("Based on these results...").
    4. A list of 3-5 short, actionable recommendations.
    5. A list of ALL test results found.

    For each result, extract... (same as before)

    Return strictly valid JSON with this structure:
    {
      "date": "YYYY-MM-DD",
      "summary": "...",
      "analysis": "...",
      "recommendations": ["..."],
      "results": [...]
    }
    ...
    - Marker Name (e.g., "Hemoglobin", "ECG Rhythm") - Normalize this to a standard English name if possible.
    - Value (Numeric). If the result is purely text (e.g., "Normal", "Negative"), set this to null or 0.
    - Text Value (String). Use this for qualitative findings (e.g., "Normal Sinus Rhythm", "Not Detected"). If the result is numeric, you can leave this empty or put the qualitative interpretation here.
    - Unit (e.g., "mg/dL", "%")
    - Reference Range Min (Lower bound of normal, if present)
    - Reference Range Max (Upper bound of normal, if present)
    - Confidence (0.0 to 1.0) - How confident are you in this specific read?

    Return strictly valid JSON with this structure:
    {
      "date": "YYYY-MM-DD",
      "summary": "...",
      "analysis": "Based on your results, your cholesterol is...",
      "recommendations": ["..."],
      "results": [
        { 
          "marker_name": "...", 
          "value": 123.4, 
          "text_value": "...",
          "unit": "...", 
          "reference_range_min": 10, 
          "reference_range_max": 20, 
          "confidence": 0.95 
        }
      ]
    }
    
    Do not include markdown code blocks. Return ONLY the raw JSON string.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const result = await visionModel.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  // Clean up any markdown fencing if it slips through
  const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(jsonString) as ExtractedCheckup;
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("AI extraction failed to produce valid JSON.");
  }
}

