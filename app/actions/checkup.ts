'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getCheckupDetails(id: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { data, error } = await supabase
        .from('checkups')
        .select(`
      *,
      results (*)
    `)
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function updateCheckup(id: string, updates: any) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { error } = await supabase
        .from('checkups')
        .update(updates)
        .eq('id', id)

    if (error) throw error
    revalidatePath(`/checkup/${id}`)
    revalidatePath('/')
}

export async function updateResult(id: string, updates: any) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { error } = await supabase
        .from('results')
        .update(updates)
        .eq('id', id)

    if (error) throw error
    revalidatePath(`/checkup/${updates.checkup_id}`) // Need checkup_id to reval the page properly
}

export async function verifyCheckup(id: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { error } = await supabase
        .from('checkups')
        .update({ status: 'verified', flags: [] }) // Clear flags on verification
        .eq('id', id)

    if (error) throw error
    revalidatePath('/')
}

export async function deleteCheckup(id: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { error } = await supabase
        .from('checkups')
        .delete()
        .eq('id', id)

    if (error) throw error
    revalidatePath('/')
}
