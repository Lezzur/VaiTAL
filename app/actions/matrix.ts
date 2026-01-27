'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface MatrixValue {
    value: number | string
    textValue?: string | null
    min?: number | null
    max?: number | null
    unit?: string | null
}

export interface MatrixRow {
    marker: string
    unit: string
    // mapping date YYYY-MM-DD to rich value object
    values: Record<string, MatrixValue>
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
      reference_range_min,
      reference_range_max,
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

        // Construct rich value object
        const cellValue: MatrixValue = {
            value: r.value !== null ? Number(r.value) : (r.text_value || '-'),
            textValue: r.text_value,
            min: r.reference_range_min !== null ? Number(r.reference_range_min) : undefined,
            max: r.reference_range_max !== null ? Number(r.reference_range_max) : undefined,
            unit: r.unit
        }

        row.values[r.checkups.date] = cellValue
    })

    return {
        rows: Array.from(rowMap.values()),
        dates: sortedDates
    }
}
