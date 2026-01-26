import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "mock-key-for-build";
// Initialize with possibly mock key to prevent constructor crash
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

/**
 * Extracts health data from an image file (converted to base64)
 * @param {string} base64Image - Base64 encoded image string (without data:image/... prefix)
 * @param {string} mimeType - Image mime type (e.g. 'image/jpeg')
 * @returns {Promise<Object>} - Extracted JSON data
 */
export async function extractHealthData(base64Image, mimeType) {
  if (apiKey === "mock-key-for-build") {
    throw new Error("GEMINI_API_KEY is missing via process.env");
  }

  try {
    const prompt = `
      You are an expert medical data analyst. Your task is to extract lab results from the provided image of a medical report.
      
      Please return a JSON object with the following structure:
      {
        "market_results": [
          {
            "marker_name": "Name of the biomarker (e.g., HbA1c, Total Cholesterol)",
            "value": 5.7,
            "unit": "mg/dL",
            "reference_range_min": 4.0,
            "reference_range_max": 6.0,
            "confidence": 0.95 (Your confidence score in this extraction, 0-1)
          }
        ],
        "checkup_summary": "A brief summary of the overall report findings based on values outside the reference range."
      }

      Rules:
      1. Normalize marker names to standard medical terminology where possible.
      2. If a value is "Not Detected" or similar, use null or a specific notation if numeric is required.
      3. Extract the reference range if printed. If only a single limit is given (e.g. < 100), treat it as max.
      4. Return ONLY the JSON. Do not include markdown formatting.
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting from the response
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
