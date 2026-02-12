
import { createClient } from '@/lib/supabase/server'

export async function getPatientHistory(userId: string) {
    const supabase = await createClient()

    const { data: checkups, error } = await supabase
        .from('checkups')
        .select(`
      id,
      date,
      summary,
      analysis,
      recommendations,
      results (
        marker_name,
        value,
        unit,
        flags
      )
    `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching patient history:', error)
        return []
    }

    return checkups.map(checkup => ({
        date: checkup.date,
        summary: checkup.summary,
        analysis: checkup.analysis,
        results: checkup.results
            .filter((r: any) => r.flags && r.flags.length > 0) // Focus on flagged results
            .map((r: any) => `${r.marker_name}: ${r.value} ${r.unit} (${r.flags.join(', ')})`)
            .join('; ')
    }))
}
