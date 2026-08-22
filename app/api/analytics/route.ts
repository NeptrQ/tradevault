import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculatePerformanceStats, getEquityCurve, getDailyPnL, getMonthlyPnL, getSymbolPerformance, getStrategyPerformance, getSessionPerformance, getDayOfWeekPerformance } from '@/lib/analytics/calculations'
import { Trade } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const account_id = searchParams.get('account_id')
  const date_from = searchParams.get('date_from')
  const date_to = searchParams.get('date_to')

  let query = supabase
    .from('trades')
    .select('*, account:accounts(id, name, initial_balance)')
    .eq('user_id', user.id)
    .eq('status', 'closed')

  if (account_id) query = query.eq('account_id', account_id)
  if (date_from) query = query.gte('exit_date', date_from)
  if (date_to) query = query.lte('exit_date', date_to + 'T23:59:59')

  const { data: trades, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const typedTrades = trades as Trade[]

  // Get initial balance for equity curve
  const initialBalance = typedTrades.length > 0
    ? (typedTrades[0].account as { initial_balance?: number } | undefined)?.initial_balance ?? 0
    : 0

  return NextResponse.json({
    stats: calculatePerformanceStats(typedTrades, initialBalance),
    equity_curve: getEquityCurve(typedTrades, initialBalance),
    daily_pnl: getDailyPnL(typedTrades),
    monthly_pnl: getMonthlyPnL(typedTrades),
    symbol_performance: getSymbolPerformance(typedTrades),
    strategy_performance: getStrategyPerformance(typedTrades),
    session_performance: getSessionPerformance(typedTrades),
    day_of_week: getDayOfWeekPerformance(typedTrades),
  })
}
