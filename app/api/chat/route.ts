
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getPatientHistory } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const history = await getPatientHistory(user.id);
    const context = JSON.stringify(history, null, 2);

    const result = streamText({
        model: google('gemini-1.5-pro-latest'),
        system: `
      You are an expert Medical Professional AI.
      
      Your goal is to act as a personal doctor for the user.
      You have access to the user's recent medical history and checkup results:
      ${context}

      INSTRUCTIONS:
      1. Analyze the provided history.
      2. Based on the most critical or recent findings (especially flagged items), DETERMINE your specific medical specialist persona.
         - Example: If they have high cholesterol/BP, be a Cardiologist.
         - Example: If they have blood sugar issues, be an Endocrinologist.
         - If nothing specific stands out, act as an experienced General Practitioner (GP).
      3. ADOPT that persona completely. Use appropriate medical terminology but keep it accessible.
      4. If this is the start of the conversation, introduce yourself and your specialty briefly based on what you see in their data.
         - "Hello! I've reviewed your latest results. As a Cardiologist, I want to discuss your LDL levels..."
      5. Answer the user's questions using the provided history as your knowledge base.
      6. Be empathetic, professional, and encouraging.
      7. Disclaimer: Always remind them you are an AI and they should see a real doctor for emergencies.
    `,
        messages,
    });

    return result.toTextStreamResponse();
}
