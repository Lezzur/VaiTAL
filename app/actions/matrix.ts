'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface MatrixRow {
    marker: string
    unit: string
    // mapping date YYYY-MM-DD to value (number or string)
    values: Record<string, number | string>
}

export async function getMatrixData() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { rows: [], dates: [] }

    // Fetch all results joined with checkups
    const { data: results, error } = await supabase
        .from('results')
        .select(`
      marker_name,
      value,
      text_value,
      unit,
      checkups!inner (
        date
      )
    `)
        .eq('checkups.user_id', user.id)
        .order('marker_name', { ascending: true })

    if (error || !results) {
        console.error('Matrix fetch error:', error)
        return { rows: [], dates: [] }
    }

    // 1. Extract Unique Dates (Columns)
    const dateSet = new Set<string>()
    results.forEach((r: any) => dateSet.add(r.checkups.date))
    const sortedDates = Array.from(dateSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Newest first

    // 2. Pivot Rows (Markers)
    const rowMap = new Map<string, MatrixRow>()

    results.forEach((r: any) => {
        const marker = r.marker_name
        if (!rowMap.has(marker)) {
            rowMap.set(marker, {
                marker,
                unit: r.unit,
                values: {}
            })
        }
        const row = rowMap.get(marker)!
        // If text_value exists, prefer it, otherwise use value
        // Prioritize text_value if value is null
        const cellValue = r.text_value ? r.text_value : Number(r.value)

        row.values[r.checkups.date] = cellValue
    })

    return {
        rows: Array.from(rowMap.values()),
        dates: sortedDates
    }
}
