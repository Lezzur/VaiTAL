'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper to get auth client
async function getClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )
}

export async function getRecentCheckups() {
    const supabase = await getClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('checkups')
        .select(`
      id,
      date,
      summary,
      analysis,
      recommendations,
      results (count)
    `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching checkups:', error)
        return []
    }

    return data.map((c: any) => ({
        ...c,
        result_count: c.results[0]?.count || 0
    }))
}

export async function getAllMarkers(): Promise<string[]> {
    const supabase = await getClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get distinct marker names for this user by fetching all and deduping in JS
    const { data: rawData, error: rawError } = await supabase
        .from('results')
        .select('marker_name')

    if (rawError) return []

    // Dedup and sort
    const markers = Array.from(new Set(rawData.map((r: any) => r.marker_name as string))).sort()
    return markers
}

export async function getMarkerHistory(markerName: string) {
    const supabase = await getClient()

    const { data, error } = await supabase
        .from('results')
        .select(`
      marker_name,
      value,
      unit,
      reference_range_min,
      reference_range_max,
      checkups!inner (
        date
      )
    `)
        .eq('marker_name', markerName)
        .order('checkups(date)', { ascending: true }) // syntax might need adjustment for specialized sorting on joined table

    if (error) {
        console.error('Error fetching history:', error)
        return []
    }

    // Flatten structure
    return data
        .map((r: any) => ({
            date: r.checkups.date,
            value: r.value,
            unit: r.unit,
            min: r.reference_range_min,
            max: r.reference_range_max
        }))
        // Sort in JS to be safe if Supabase join sort is flaky
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
