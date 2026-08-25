import { Trade, EquityPoint, DailyPnL, MonthlyPnL, PerformanceStats, SymbolPerformance, StrategyPerformance, SessionPerformance, DayOfWeekPerformance, CalendarDay } from '@/types'
import { format, parseISO, getHours, getDay } from 'date-fns'

function parseTradeDate(dStr?: string): Date {
  if (!dStr) return new Date()
  try {
    const d = parseISO(dStr)
    if (!isNaN(d.getTime())) return d
    const fallback = new Date(dStr)
    if (!isNaN(fallback.getTime())) return fallback
  } catch (e) {}
  return new Date()
}

function getTradeDateStr(t: Trade, formatPattern: string): string {
  const d = parseTradeDate(t.exit_date || t.entry_date || t.created_at)
  return format(d, formatPattern)
}

export function calculatePerformanceStats(trades: Trade[], initialBalance = 0): PerformanceStats {
  const closedTrades = trades.filter(t => t.status === 'closed' && (t.net_pnl !== undefined || t.pnl !== undefined))
  
  if (closedTrades.length === 0) {
    return {
      total_pnl: 0, win_rate: 0, profit_factor: 0, expectancy: 0,
      avg_r: 0, max_drawdown: 0, avg_win: 0, avg_loss: 0,
      total_trades: 0, winning_trades: 0, losing_trades: 0,
    }
  }

  const winners = closedTrades.filter(t => (t.net_pnl ?? t.pnl ?? 0) > 0)
  const losers = closedTrades.filter(t => (t.net_pnl ?? t.pnl ?? 0) <= 0)

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.net_pnl ?? t.pnl ?? 0), 0)
  const grossProfit = winners.reduce((sum, t) => sum + (t.net_pnl ?? t.pnl ?? 0), 0)
  const grossLoss = Math.abs(losers.reduce((sum, t) => sum + (t.net_pnl ?? t.pnl ?? 0), 0))

  const winRate = closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
  const avgWin = winners.length > 0 ? grossProfit / winners.length : 0
  const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss

  const rMultiples = closedTrades.filter(t => t.r_multiple !== undefined).map(t => t.r_multiple!)
  const avgR = rMultiples.length > 0 ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : 0

  const maxDrawdown = calculateMaxDrawdown(closedTrades, initialBalance)

  const bestTrade = Math.max(...closedTrades.map(t => t.net_pnl ?? t.pnl ?? 0))
  const worstTrade = Math.min(...closedTrades.map(t => t.net_pnl ?? t.pnl ?? 0))

  // Current streak
  const sorted = [...closedTrades].sort((a, b) => {
    return parseTradeDate(a.exit_date || a.entry_date).getTime() - parseTradeDate(b.exit_date || b.entry_date).getTime()
  })

  let streak = 0
  if (sorted.length > 0) {
    const lastIsWin = (sorted[sorted.length - 1].net_pnl ?? sorted[sorted.length - 1].pnl ?? 0) > 0
    for (let i = sorted.length - 1; i >= 0; i--) {
      const isWin = (sorted[i].net_pnl ?? sorted[i].pnl ?? 0) > 0
      if (isWin === lastIsWin) streak++
      else break
    }
    streak = lastIsWin ? streak : -streak
  }

  return {
    total_pnl: totalPnl,
    win_rate: winRate,
    profit_factor: profitFactor,
    expectancy,
    avg_r: avgR,
    max_drawdown: maxDrawdown,
    avg_win: avgWin,
    avg_loss: avgLoss,
    total_trades: closedTrades.length,
    winning_trades: winners.length,
    losing_trades: losers.length,
    best_trade: bestTrade,
    worst_trade: worstTrade,
    current_streak: streak,
  }
}

export function calculateMaxDrawdown(trades: Trade[], initialBalance = 0): number {
  const sorted = [...trades]
    .filter(t => t.status === 'closed')
    .sort((a, b) => parseTradeDate(a.exit_date || a.entry_date).getTime() - parseTradeDate(b.exit_date || b.entry_date).getTime())

  let peak = initialBalance
  let maxDD = 0
  let runningBalance = initialBalance

  for (const trade of sorted) {
    runningBalance += trade.net_pnl ?? trade.pnl ?? 0
    if (runningBalance > peak) peak = runningBalance
    const dd = peak > 0 ? ((peak - runningBalance) / peak) * 100 : 0
    if (dd > maxDD) maxDD = dd
  }

  return maxDD
}

export function getEquityCurve(trades: Trade[], initialBalance: number): EquityPoint[] {
  const closed = trades.filter(t => t.status === 'closed')
  if (closed.length === 0) {
    return [{ date: format(new Date(), 'yyyy-MM-dd'), equity: initialBalance, pnl: 0 }]
  }

  const sorted = [...closed].sort((a, b) => {
    return parseTradeDate(a.exit_date || a.entry_date).getTime() - parseTradeDate(b.exit_date || b.entry_date).getTime()
  })

  const firstDate = getTradeDateStr(sorted[0], 'yyyy-MM-dd')
  const points: EquityPoint[] = [{ date: firstDate, equity: initialBalance, pnl: 0 }]
  let running = initialBalance

  for (const trade of sorted) {
    const pnl = trade.net_pnl ?? trade.pnl ?? 0
    running += pnl
    points.push({
      date: getTradeDateStr(trade, 'yyyy-MM-dd'),
      equity: running,
      pnl: pnl,
    })
  }

  return points
}

export function getDailyPnL(trades: Trade[]): DailyPnL[] {
  const map = new Map<string, { pnl: number; trades: number }>()

  trades
    .filter(t => t.status === 'closed')
    .forEach(t => {
      const date = getTradeDateStr(t, 'yyyy-MM-dd')
      const existing = map.get(date) ?? { pnl: 0, trades: 0 }
      const pnl = t.net_pnl ?? t.pnl ?? 0
      map.set(date, { pnl: existing.pnl + pnl, trades: existing.trades + 1 })
    })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { pnl, trades }]) => ({ date, pnl, trades }))
}

export function getMonthlyPnL(trades: Trade[]): MonthlyPnL[] {
  const map = new Map<string, { pnl: number; trades: number }>()

  trades
    .filter(t => t.status === 'closed')
    .forEach(t => {
      const month = getTradeDateStr(t, 'yyyy-MM')
      const existing = map.get(month) ?? { pnl: 0, trades: 0 }
      const pnl = t.net_pnl ?? t.pnl ?? 0
      map.set(month, { pnl: existing.pnl + pnl, trades: existing.trades + 1 })
    })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { pnl, trades }]) => ({ month, pnl, trades }))
}

export function getSymbolPerformance(trades: Trade[]): SymbolPerformance[] {
  const map = new Map<string, Trade[]>()

  trades.filter(t => t.status === 'closed').forEach(t => {
    const existing = map.get(t.symbol) ?? []
    map.set(t.symbol, [...existing, t])
  })

  return Array.from(map.entries()).map(([symbol, ts]) => {
    const stats = calculatePerformanceStats(ts)
    return {
      symbol,
      trades: ts.length,
      win_rate: stats.win_rate,
      total_pnl: stats.total_pnl,
      avg_pnl: ts.length > 0 ? stats.total_pnl / ts.length : 0,
      profit_factor: stats.profit_factor,
    }
  }).sort((a, b) => b.total_pnl - a.total_pnl)
}

export function getStrategyPerformance(trades: Trade[]): StrategyPerformance[] {
  const map = new Map<string, Trade[]>()

  trades.filter(t => t.status === 'closed').forEach(t => {
    const key = t.strategy ?? 'Untagged'
    const existing = map.get(key) ?? []
    map.set(key, [...existing, t])
  })

  return Array.from(map.entries()).map(([strategy, ts]) => {
    const stats = calculatePerformanceStats(ts)
    return {
      strategy,
      trades: ts.length,
      win_rate: stats.win_rate,
      total_pnl: stats.total_pnl,
      avg_pnl: ts.length > 0 ? stats.total_pnl / ts.length : 0,
      expectancy: stats.expectancy,
    }
  }).sort((a, b) => b.total_pnl - a.total_pnl)
}

export function getSessionPerformance(trades: Trade[]): SessionPerformance[] {
  const getSession = (dateStr?: string): string => {
    if (!dateStr) return 'London'
    const hour = getHours(parseTradeDate(dateStr))
    if (hour >= 0 && hour < 7) return 'Asian'
    if (hour >= 7 && hour < 12) return 'London'
    if (hour >= 12 && hour < 17) return 'New York'
    return 'After Hours'
  }

  const map = new Map<string, Trade[]>()
  trades.filter(t => t.status === 'closed').forEach(t => {
    const session = getSession(t.entry_date)
    const existing = map.get(session) ?? []
    map.set(session, [...existing, t])
  })

  return Array.from(map.entries()).map(([session, ts]) => {
    const stats = calculatePerformanceStats(ts)
    return {
      session,
      trades: ts.length,
      win_rate: stats.win_rate,
      total_pnl: stats.total_pnl,
      avg_pnl: ts.length > 0 ? stats.total_pnl / ts.length : 0,
    }
  })
}

export function getDayOfWeekPerformance(trades: Trade[]): DayOfWeekPerformance[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const map = new Map<number, Trade[]>()

  trades.filter(t => t.status === 'closed').forEach(t => {
    const day = getDay(parseTradeDate(t.entry_date || t.created_at))
    const existing = map.get(day) ?? []
    map.set(day, [...existing, t])
  })

  return days.map((day, idx) => {
    const ts = map.get(idx) ?? []
    const stats = calculatePerformanceStats(ts)
    return {
      day,
      trades: ts.length,
      win_rate: stats.win_rate,
      total_pnl: stats.total_pnl,
      profit_factor: stats.profit_factor,
    }
  }).filter(d => d.trades > 0)
}

export function getRMultipleDistribution(trades: Trade[]): { r: string; count: number }[] {
  const closed = trades.filter(t => t.status === 'closed')
  const buckets: { [k: string]: number } = {
    '<-2R': 0,
    '-2R to -1R': 0,
    '-1R to 0R': 0,
    '0R to 1R': 0,
    '1R to 2R': 0,
    '2R to 3R': 0,
    '>3R': 0,
  }

  closed.forEach(t => {
    const r = t.r_multiple ?? (t.risk_amount && t.risk_amount > 0 ? (t.net_pnl ?? 0) / t.risk_amount : 1)
    if (r < -2) buckets['<-2R']++
    else if (r < -1) buckets['-2R to -1R']++
    else if (r < 0) buckets['-1R to 0R']++
    else if (r < 1) buckets['0R to 1R']++
    else if (r < 2) buckets['1R to 2R']++
    else if (r < 3) buckets['2R to 3R']++
    else buckets['>3R']++
  })

  return Object.entries(buckets).map(([r, count]) => ({ r, count }))
}
