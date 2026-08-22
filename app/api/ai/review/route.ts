import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateSmartReview } from '@/lib/ai/smart-review'
import { Trade, UserSettings } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const account_id = searchParams.get('account_id')

  // Fetch last 90 days of trades
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'closed')
    .gte('exit_date', ninetyDaysAgo.toISOString())

  if (account_id) tradesQuery = tradesQuery.eq('account_id', account_id)

  const { data: trades, error: tradesError } = await tradesQuery
  if (tradesError) return NextResponse.json({ error: tradesError.message }, { status: 500 })

  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const review = generateSmartReview(trades as Trade[], (settings ?? {}) as Partial<UserSettings>)

  // If AI is enabled and API key exists, optionally call external AI
  // The API key is read server-side only - never exposed to browser
  if (settings?.ai_enabled && settings.ai_provider !== 'smart_review') {
    // Future: call OpenAI/Anthropic here with server-side key
    // For now, return Smart Review
  }

  return NextResponse.json(review)
}
