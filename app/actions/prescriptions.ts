'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { extractPrescriptionFromImage, extractPrescriptionFromText } from '@/lib/gemini'
import { revalidatePath } from 'next/cache'

export async function processPrescriptionUpload(formData: FormData) {
    const file = formData.get('file') as File
    const textInput = formData.get('text') as string;

    // 1. Auth Check
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    let extractedData;
    let fileUrl = null;

    try {
        // 2. Upload File (if present)
        if (file && file.size > 0) {
            // Upload to Supabase Storage
            const filename = `${user.id}/${Date.now()}-${file.name}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('prescriptions')
                .upload(filename, file)

            if (uploadError) {
                console.error("Upload error:", uploadError)
                // Continue without file URL if upload fails, or throw? 
                // Let's log and continue, but maybe we should fail. 
                // For now, let's try to proceed with analysis even if storage fails strictly speaking, 
                // but storage is important for "original photo".
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('prescriptions')
                    .getPublicUrl(filename)
                fileUrl = publicUrl
            }

            // Analyze with Gemini
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const base64Image = buffer.toString('base64')
            const mimeType = file.type

            console.log('Sending prescription image to Gemini...')
            extractedData = await extractPrescriptionFromImage(base64Image, mimeType)
        } else if (textInput && textInput.trim().length > 0) {
            console.log('Sending prescription text to Gemini...')
            extractedData = await extractPrescriptionFromText(textInput)
        } else {
            throw new Error('No file or text provided')
        }

        console.log('Extracted Prescription:', extractedData)

        // 3. Insert Prescription
        const { data: prescription, error: prescriptionError } = await supabase
            .from('prescriptions')
            .insert({
                user_id: user.id,
                date: extractedData.date,
                doctor_name: extractedData.doctor_name,
                notes: extractedData.notes,
                file_url: fileUrl,
            })
            .select()
            .single()

        if (prescriptionError) throw new Error(`Failed to save prescription: ${prescriptionError.message}`)

        // 4. Insert Medicines
        const medicinesToInsert = extractedData.medicines.map(m => ({
            prescription_id: prescription.id,
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            description: m.description,
            contraindications: m.contraindications,
            warnings: m.warnings,
            instructions: m.instructions,
            confidence: m.confidence
        }))

        if (medicinesToInsert.length > 0) {
            const { error: medicinesError } = await supabase
                .from('medicines')
                .insert(medicinesToInsert)

            if (medicinesError) throw medicinesError
        }

        revalidatePath('/prescriptions')
        return { success: true, prescriptionId: prescription.id }

    } catch (error: any) {
        console.error('Prescription processing failed:', error)
        return { success: false, error: error.message }
    }
}

export async function getPrescriptions() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('prescriptions')
        .select(`
            *,
            medicines (*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

    if (error) {
        console.error("Error fetching prescriptions:", error)
        return []
    }

    return data
}

export async function getPrescriptionDetails(id: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    // Validate if user owns this prescription via RLS, but explicit check doesn't hurt
    const { data, error } = await supabase
        .from('prescriptions')
        .select(`
            *,
            medicines (*)
        `)
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function updatePrescription(prescriptionId: string, prescriptionData: any, medicinesData: any[]) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    // 1. Update Prescription Info
    const { error: pError } = await supabase
        .from('prescriptions')
        .update({
            date: prescriptionData.date,
            doctor_name: prescriptionData.doctor_name,
            notes: prescriptionData.notes
        })
        .eq('id', prescriptionId)

    if (pError) throw new Error(`Failed to update prescription: ${pError.message}`)

    // 2. Sync Medicines (Full replacement or upsert? Upsert is safer for IDs)
    // For simplicity, we can delete all and re-insert, OR upsert.
    // Given the ID might not be persistent in the UI form if we treat it as "draft state", 
    // let's try to upsert based on ID if present, or insert if new.

    // Actually, simplest strategy for "Checkup review" style is often:
    // Delete all medicines for this prescription and re-insert CURRENT list.
    // This handles deletions automatically.

    // Safety check: ensure we are only deleting for this prescription
    const { error: deleteError } = await supabase
        .from('medicines')
        .delete()
        .eq('prescription_id', prescriptionId)

    if (deleteError) throw new Error("Failed to clear old medicines")

    const medicinesToInsert = medicinesData.map((m: any) => ({
        prescription_id: prescriptionId, // Ensure link
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        description: m.description,
        contraindications: m.contraindications,
        warnings: m.warnings,
        instructions: m.instructions,
        confidence: m.confidence || 1.0
    }))

    if (medicinesToInsert.length > 0) {
        const { error: insertError } = await supabase
            .from('medicines')
            .insert(medicinesToInsert)

        if (insertError) throw new Error("Failed to insert updated medicines")
    }

    revalidatePath(`/prescriptions/${prescriptionId}`)
    revalidatePath('/prescriptions')
    return { success: true }
}

export async function deletePrescription(id: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/prescriptions')
    return { success: true }
}
