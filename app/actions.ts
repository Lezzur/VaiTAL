'use server'

import { extractHealthData } from '@/lib/gemini'

/**
 * Server Action to analyze a medical document image.
 * Wraps the library function to expose it to the client.
 */
export async function analyzeImageAction(base64Data: string, mimeType: string) {
    try {
        console.log("Analyzing image with Gemini...")
        const data = await extractHealthData(base64Data, mimeType)
        return { success: true, data }
    } catch (error: any) {
        console.error("Gemini analysis failed:", error)
        return { success: false, error: error.message }
    }
}
