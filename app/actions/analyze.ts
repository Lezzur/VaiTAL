'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { extractDataFromImage } from '@/lib/gemini'
import { revalidatePath } from 'next/cache'

export async function processDocument(formData: FormData) {
    const file = formData.get('file') as File

    if (!file) {
        throw new Error('No file uploaded')
    }

    // 1. Auth Check
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Prepare for AI
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')
    const mimeType = file.type

    try {
        // 3. AI Extraction
        console.log('Sending to Gemini...')
        const extractedData = await extractDataFromImage(base64Image, mimeType)
        console.log('Extracted:', extractedData)

        // 4. Database Insertions
        // C. Anomaly Detection
        const checkupFlags: string[] = []

        // 1. Date Check
        const extractedDate = new Date(extractedData.date)
        const today = new Date()
        // Allow 1 day buffer for timezone differences
        const futureLimit = new Date()
        futureLimit.setDate(today.getDate() + 1)

        if (extractedDate > futureLimit) {
            checkupFlags.push('Future Date Detected')
        }
        // Very old data check (e.g. > 10 years or default 1970/2000 if extraction fails weirdly)
        if (extractedDate.getFullYear() < 2000) {
            checkupFlags.push('Suspiciously Old Date')
        }

        // Insert Checkup
        const { data: checkup, error: checkupError } = await supabase
            .from('checkups')
            .insert({
                user_id: user.id,
                date: extractedData.date,
                summary: extractedData.summary,
                analysis: extractedData.analysis || null,
                recommendations: extractedData.recommendations || [],
                status: checkupFlags.length > 0 ? 'needs_review' : 'needs_review', // Default to needs_review for now to force user verification as requested
                flags: checkupFlags,
                original_files: []
            })
            .select()
            .single()

        if (checkupError) throw new Error(`Failed to save checkup: ${checkupError.message}`)

        console.log("Checkup created successfully:", checkup)
        if (!checkup?.id) console.error("CRITICAL: Checkup ID is missing!", checkup)

        // D. Insert Results with Flags
        const resultsToInsert = extractedData.results.map(r => {
            const resultFlags: string[] = []

            // Confidence Check
            if (r.confidence < 0.8) resultFlags.push('Low Confidence')

            // Zero Value Check for important numeric markers
            if (typeof r.value === 'number' && r.value === 0 && !r.text_value) {
                resultFlags.push('Zero Value')
            }

            return {
                checkup_id: checkup.id,
                marker_name: r.marker_name,
                value: r.value || null,
                text_value: r.text_value || null,
                unit: r.unit,
                reference_range_min: r.reference_range_min,
                reference_range_max: r.reference_range_max,
                confidence: r.confidence,
                flags: resultFlags
            }
        })

        if (resultsToInsert.length > 0) {
            const { error: resultsError } = await supabase
                .from('results')
                .insert(resultsToInsert)

            if (resultsError) throw resultsError
        }

        revalidatePath('/')
        return { success: true, checkupId: checkup.id }

    } catch (error: any) {
        console.error('Processing failed:', error)
        return { success: false, error: error.message }
    }
}
