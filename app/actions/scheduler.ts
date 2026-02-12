'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )
}

export async function getMedications() {
    const supabase = await getClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('medications')
        .select(`
      *,
      schedules (*)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching medications:', error)
        return []
    }

    return data
}

export async function addMedication(formData: FormData) {
    const supabase = await getClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const name = formData.get('name') as string
    const dosage = formData.get('dosage') as string
    const time = formData.get('time') as string // "08:00"

    // 1. Create Medication
    const { data: med, error: medError } = await supabase
        .from('medications')
        .insert({
            user_id: user.id,
            name,
            dosage,
        })
        .select()
        .single()

    if (medError) throw new Error(medError.message)

    // 2. Create Schedule (Defaulting to Daily for MVP)
    const { error: schedError } = await supabase
        .from('schedules')
        .insert({
            medication_id: med.id,
            time: time,
            // days: null // implies daily
        })

    if (schedError) throw new Error(schedError.message)

    revalidatePath('/scheduler')
    return { success: true }
}

export async function logMedicationTaken(scheduleId: string, status: 'taken' | 'skipped' | 'snoozed') {
    const supabase = await getClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('medication_logs')
        .insert({
            user_id: user.id,
            schedule_id: scheduleId,
            status,
            taken_at: new Date().toISOString()
        })

    if (error) throw new Error(error.message)

    revalidatePath('/scheduler')
    return { success: true }
}

export async function getTodayLogs() {
    const supabase = await getClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Simple query for logs created today
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('medication_logs')
        .select('schedule_id, status, taken_at')
        .gte('taken_at', `${today}T00:00:00`)
        .lte('taken_at', `${today}T23:59:59`)

    if (error) return []
    return data
}
