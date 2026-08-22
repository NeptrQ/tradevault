import { Trade, EquityPoint, DailyPnL, MonthlyPnL, PerformanceStats, SymbolPerformance, StrategyPerformance, SessionPerformance, DayOfWeekPerformance, CalendarDay } from '@/types'
import { format, parseISO, getHours, getDay, startOfDay, differenceInMinutes } from 'date-fns'

export function calculatePerformanceStats(trades: Trade[], initialBalance = 0): PerformanceStats {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.net_pnl !== undefined)
  
  if (closedTrades.length === 0) {
    return {
      total_pnl: 0, win_rate: 0, profit_factor: 0, expectancy: 0,
      avg_r: 0, max_drawdown: 0, avg_win: 0, avg_loss: 0,
      total_trades: 0, winning_trades: 0, losing_trades: 0,
    }
  }

  const winners = closedTrades.filter(t => (t.net_pnl ?? 0) > 0)
  const losers = closedTrades.filter(t => (t.net_pnl ?? 0) <= 0)

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0)
  const grossProfit = winners.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0)
  const grossLoss = Math.abs(losers.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0))

  const winRate = closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
  const avgWin = winners.length > 0 ? grossProfit / winners.length : 0
  const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss

  const rMultiples = closedTrades.filter(t => t.r_multiple !== undefined).map(t => t.r_multiple!)
  const avgR = rMultiples.length > 0 ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : 0

  const maxDrawdown = calculateMaxDrawdown(closedTrades, initialBalance)

  const bestTrade = Math.max(...closedTrades.map(t => t.net_pnl ?? 0))
  const worstTrade = Math.min(...closedTrades.map(t => t.net_pnl ?? 0))

  // Current streak
  const sorted = [...closedTrades].sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime())
  let streak = 0
  if (sorted.length > 0) {
    const lastIsWin = (sorted[sorted.length - 1].net_pnl ?? 0) > 0
    for (let i = sorted.length - 1; i >= 0; i--) {
      const isWin = (sorted[i].net_pnl ?? 0) > 0
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
    .filter(t => t.status === 'closed' && t.exit_date)
    .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime())

  let peak = initialBalance
  let maxDD = 0
  let runningBalance = initialBalance

  for (const trade of sorted) {
    runningBalance += trade.net_pnl ?? 0
    if (runningBalance > peak) peak = runningBalance
    const dd = peak > 0 ? ((peak - runningBalance) / peak) * 100 : 0
    if (dd > maxDD) maxDD = dd
  }

  return maxDD
}

export function getEquityCurve(trades: Trade[], initialBalance: number): EquityPoint[] {
  const sorted = [...trades]
    .filter(t => t.status === 'closed' && t.exit_date)
    .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime())

  const points: EquityPoint[] = [{ date: format(new Date(), 'yyyy-MM-dd'), equity: initialBalance, pnl: 0 }]
  let running = initialBalance

  for (const trade of sorted) {
    running += trade.net_pnl ?? 0
    points.push({
      date: format(parseISO(trade.exit_date!), 'yyyy-MM-dd'),
      equity: running,
      pnl: trade.net_pnl ?? 0,
    })
  }

  if (sorted.length > 0) {
    points[0].date = format(parseISO(sorted[0].exit_date!), 'yyyy-MM-dd')
  }

  return points
}

export function getDailyPnL(trades: Trade[]): DailyPnL[] {
  const map = new Map<string, { pnl: number; trades: number }>()

  trades
    .filter(t => t.status === 'closed' && t.exit_date)
    .forEach(t => {
      const date = format(parseISO(t.exit_date!), 'yyyy-MM-dd')
      const existing = map.get(date) ?? { pnl: 0, trades: 0 }
      map.set(date, { pnl: existing.pnl + (t.net_pnl ?? 0), trades: existing.trades + 1 })
    })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { pnl, trades }]) => ({ date, pnl, trades }))
}

export function getMonthlyPnL(trades: Trade[]): MonthlyPnL[] {
  const map = new Map<string, { pnl: number; trades: number }>()

  trades
    .filter(t => t.status === 'closed' && t.exit_date)
    .forEach(t => {
      const month = format(parseISO(t.exit_date!), 'yyyy-MM')
      const existing = map.get(month) ?? { pnl: 0, trades: 0 }
      map.set(month, { pnl: existing.pnl + (t.net_pnl ?? 0), trades: existing.trades + 1 })
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
  const getSession = (date: string): string => {
    const hour = getHours(parseISO(date))
    if (hour >= 0 && hour < 7) return 'Asian'
    if (hour >= 7 && hour < 12) return 'London'
    if (hour >= 12 && hour < 17) return 'New York'
    return 'After Hours'
  }

  const map = new Map<string, Trade[]>()
  trades.filter(t => t.status === 'closed' && t.entry_date).forEach(t => {
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

  trades.filter(t => t.status === 'closed' && t.entry_date).forEach(t => {
    const day = getDay(parseISO(t.entry_date))
    const existing = map.get(day) ?? []
    map.set(day, [...existing, t])
  })

  return days.map((day, i) => {
    const ts = map.get(i) ?? []
    const stats = calculatePerformanceStats(ts)
    return {
      day,
      trades: ts.length,
      win_rate: stats.win_rate,
      total_pnl: stats.total_pnl,
    }
  })
}

export function getCalendarData(trades: Trade[]): CalendarDay[] {
  const map = new Map<string, Trade[]>()

  trades.filter(t => t.status === 'closed' && t.exit_date).forEach(t => {
    const date = format(parseISO(t.exit_date!), 'yyyy-MM-dd')
    const existing = map.get(date) ?? []
    map.set(date, [...existing, t])
  })

  return Array.from(map.entries()).map(([date, ts]) => {
    const pnl = ts.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0)
    const winners = ts.filter(t => (t.net_pnl ?? 0) > 0)
    const pnls = ts.map(t => t.net_pnl ?? 0)
    const risks = ts.filter(t => t.risk_amount).map(t => t.risk_amount!)
    const rMultiples = ts.filter(t => t.r_multiple !== undefined).map(t => t.r_multiple!)

    return {
      date,
      pnl,
      trades: ts.length,
      win_rate: ts.length > 0 ? (winners.length / ts.length) * 100 : 0,
      best_trade: pnls.length > 0 ? Math.max(...pnls) : 0,
      worst_trade: pnls.length > 0 ? Math.min(...pnls) : 0,
      total_risk: risks.reduce((a, b) => a + b, 0),
      avg_r: rMultiples.length > 0 ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : 0,
    }
  })
}

export function getTodaysPnL(trades: Trade[]): number {
  const today = format(new Date(), 'yyyy-MM-dd')
  return trades
    .filter(t => t.status === 'closed' && t.exit_date && format(parseISO(t.exit_date), 'yyyy-MM-dd') === today)
    .reduce((sum, t) => sum + (t.net_pnl ?? 0), 0)
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatR(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}R`
}

export function getDrawdownProgress(account: { initial_balance: number; current_balance: number; max_total_loss?: number }): number {
  if (!account.max_total_loss) return 0
  const loss = account.initial_balance - account.current_balance
  return Math.min((loss / account.max_total_loss) * 100, 100)
}

export function getProfitProgress(account: { initial_balance: number; current_balance: number; profit_target?: number }): number {
  if (!account.profit_target) return 0
  const profit = account.current_balance - account.initial_balance
  return Math.min(Math.max((profit / account.profit_target) * 100, 0), 100)
}

export function getRMultipleDistribution(trades: Trade[]): { bucket: string; count: number }[] {
  const buckets = [
    { label: '< -2R', min: -Infinity, max: -2 },
    { label: '-2R to -1R', min: -2, max: -1 },
    { label: '-1R to 0R', min: -1, max: 0 },
    { label: '0R to 1R', min: 0, max: 1 },
    { label: '1R to 2R', min: 1, max: 2 },
    { label: '2R to 3R', min: 2, max: 3 },
    { label: '> 3R', min: 3, max: Infinity },
  ]

  return buckets.map(b => ({
    bucket: b.label,
    count: trades.filter(t => t.r_multiple !== undefined && t.r_multiple >= b.min && t.r_multiple < b.max).length,
  }))
}
