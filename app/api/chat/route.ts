
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getPatientHistory } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[chat] Auth error:', authError);
            return new Response(JSON.stringify({ error: 'Auth failed', details: authError.message }), { status: 401 });
        }

        if (!user) {
            console.error('[chat] No user found');
            return new Response('Unauthorized', { status: 401 });
        }

        console.log('[chat] User authenticated:', user.id);

        const history = await getPatientHistory(user.id);
        console.log('[chat] Patient history retrieved:', history ? 'yes' : 'no');
        const context = JSON.stringify(history, null, 2);

        console.log('[chat] Calling Gemini API...');
        const result = streamText({
            model: google('gemini-2.5-flash'),
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

        console.log('[chat] Stream started');
        return result.toDataStreamResponse();
    } catch (error) {
        console.error('[chat] Error:', error);
        return new Response(JSON.stringify({ error: 'Chat failed', details: String(error) }), { status: 500 });
    }
}
