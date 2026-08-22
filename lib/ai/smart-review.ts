import { Trade, UserSettings, SmartInsight, SmartReviewResult } from '@/types'
import { calculatePerformanceStats, getSessionPerformance, getStrategyPerformance, getDayOfWeekPerformance } from '@/lib/analytics/calculations'

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Needs Improvement'
  return 'Poor'
}

export function generateSmartReview(trades: Trade[], settings: Partial<UserSettings>): SmartReviewResult {
  if (trades.length < 5) {
    return {
      overall_score: 0,
      risk_score: 0,
      psychology_score: 0,
      consistency_score: 0,
      insights: [{
        type: 'info',
        category: 'Data',
        title: 'Not Enough Data',
        description: 'TradeVault Smart Review needs at least 5 closed trades to generate meaningful analysis.',
        recommendation: 'Add more trades to unlock pattern detection and performance insights.',
      }],
      patterns: [],
      generated_at: new Date().toISOString(),
    }
  }

  const closedTrades = trades.filter(t => t.status === 'closed')
  const stats = calculatePerformanceStats(closedTrades)
  const insights: SmartInsight[] = []
  const maxRisk = settings.max_risk_per_trade ?? 2
  const maxDailyLoss = settings.max_daily_loss ?? 5
  const maxTradesPerDay = settings.max_trades_per_day ?? 5

  // ─── Risk Discipline ───────────────────────────────────────────────────────
  let riskScore = 100

  const tradesWithRisk = closedTrades.filter(t => t.risk_percent !== undefined)
  if (tradesWithRisk.length > 0) {
    const overRisk = tradesWithRisk.filter(t => (t.risk_percent ?? 0) > maxRisk)
    if (overRisk.length > 0) {
      const pct = Math.round((overRisk.length / tradesWithRisk.length) * 100)
      riskScore -= Math.min(40, pct * 2)
      insights.push({
        type: overRisk.length > tradesWithRisk.length * 0.3 ? 'danger' : 'warning',
        category: 'Risk',
        title: 'Risk Limit Exceeded',
        description: `You exceeded your ${maxRisk}% risk limit in ${overRisk.length} of your last ${tradesWithRisk.length} trades (${pct}%).`,
        occurrences: overRisk.length,
        total: tradesWithRisk.length,
        recommendation: 'Calculate your position size before entering every trade. Use the Risk Calculator page.',
      })
    } else {
      insights.push({
        type: 'success',
        category: 'Risk',
        title: 'Risk Discipline',
        description: `You stayed within your ${maxRisk}% risk limit on all ${tradesWithRisk.length} trades analyzed.`,
      })
    }
  }

  // ─── Revenge Trading Detection ─────────────────────────────────────────────
  const sorted = [...closedTrades].sort((a, b) => new Date(a.exit_date ?? 0).getTime() - new Date(b.exit_date ?? 0).getTime())
  let revengeCount = 0
  let revengeTotal = 0

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    if ((prev.net_pnl ?? 0) < 0 && prev.exit_date && curr.entry_date) {
      const gap = (new Date(curr.entry_date).getTime() - new Date(prev.exit_date).getTime()) / (1000 * 60)
      if (gap < 30 && (curr.risk_percent ?? 0) > (prev.risk_percent ?? 0) * 1.3) {
        revengeCount++
      }
      revengeTotal++
    }
  }

  if (revengeTotal > 0) {
    const pct = Math.round((revengeCount / revengeTotal) * 100)
    if (revengeCount > 0) {
      riskScore -= Math.min(30, pct * 1.5)
      insights.push({
        type: revengeCount > revengeTotal * 0.2 ? 'danger' : 'warning',
        category: 'Psychology',
        title: 'Possible Revenge Trading',
        description: `Detected ${revengeCount} instances where risk increased significantly within 30 minutes of a losing trade.`,
        occurrences: revengeCount,
        total: revengeTotal,
        recommendation: 'Take a break after losing trades. Set a daily loss limit and walk away when hit.',
      })
    }
  }

  // ─── Overtrading Detection ─────────────────────────────────────────────────
  const tradesByDay = new Map<string, Trade[]>()
  closedTrades.forEach(t => {
    const day = t.exit_date?.split('T')[0] ?? ''
    if (!day) return
    tradesByDay.set(day, [...(tradesByDay.get(day) ?? []), t])
  })

  const overtradingDays = Array.from(tradesByDay.entries()).filter(([, ts]) => ts.length > maxTradesPerDay)
  if (overtradingDays.length > 0) {
    riskScore -= Math.min(20, overtradingDays.length * 5)
    insights.push({
      type: 'warning',
      category: 'Behavior',
      title: 'Overtrading Detected',
      description: `On ${overtradingDays.length} trading day(s) you exceeded your limit of ${maxTradesPerDay} trades per day.`,
      occurrences: overtradingDays.length,
      total: tradesByDay.size,
      recommendation: 'Set a hard limit on trades per day. Quality over quantity.',
    })
  }

  // ─── Psychology ────────────────────────────────────────────────────────────
  let psychScore = 100
  const emotionTrades = closedTrades.filter(t => t.emotion_before)

  if (emotionTrades.length >= 5) {
    const negativeEmotions = ['anxious', 'fearful', 'frustrated', 'impulsive', 'greedy']
    const negBefore = emotionTrades.filter(t => negativeEmotions.includes(t.emotion_before ?? ''))
    const negBeforeWin = negBefore.filter(t => (t.net_pnl ?? 0) > 0)
    const posBefore = emotionTrades.filter(t => !negativeEmotions.includes(t.emotion_before ?? ''))
    const posBeforeWin = posBefore.filter(t => (t.net_pnl ?? 0) > 0)

    const negWinRate = negBefore.length > 0 ? (negBeforeWin.length / negBefore.length) * 100 : 0
    const posWinRate = posBefore.length > 0 ? (posBeforeWin.length / posBefore.length) * 100 : 0

    if (negWinRate < posWinRate - 15 && negBefore.length >= 3) {
      psychScore -= 25
      insights.push({
        type: 'warning',
        category: 'Psychology',
        title: 'Emotional State Affects Performance',
        description: `Win rate when entering with negative emotions: ${negWinRate.toFixed(0)}% vs ${posWinRate.toFixed(0)}% with positive emotions.`,
        occurrences: negBefore.length,
        total: emotionTrades.length,
        recommendation: 'Avoid trading when feeling anxious, frustrated, or impulsive. Log your emotions consistently.',
      })
    }

    if (negBefore.length > emotionTrades.length * 0.4) {
      psychScore -= 15
      insights.push({
        type: 'warning',
        category: 'Psychology',
        title: 'Frequent Negative Emotions',
        description: `${Math.round((negBefore.length / emotionTrades.length) * 100)}% of your trades were entered in a negative emotional state.`,
        recommendation: 'Develop a pre-trading routine. Meditation, journaling, or exercise before markets open can help.',
      })
    }
  } else {
    insights.push({
      type: 'info',
      category: 'Psychology',
      title: 'Track Your Emotions',
      description: 'Not enough data to identify emotional patterns. Log emotions on every trade for better insights.',
      recommendation: 'Use the psychology section when logging trades to unlock emotional performance analysis.',
    })
  }

  // ─── Strategy Analysis ─────────────────────────────────────────────────────
  const strategyPerf = getStrategyPerformance(closedTrades)
  const negativeStrategies = strategyPerf.filter(s => s.total_pnl < 0 && s.trades >= 5)
  if (negativeStrategies.length > 0) {
    insights.push({
      type: 'danger',
      category: 'Strategy',
      title: 'Negative-Expectancy Strategies',
      description: `${negativeStrategies.map(s => s.strategy).join(', ')} ${negativeStrategies.length === 1 ? 'has' : 'have'} negative total P&L with 5+ trades.`,
      occurrences: negativeStrategies.length,
      recommendation: 'Consider pausing or refining these strategies. Review the conditions where they fail.',
    })
  }

  const positiveStrategies = strategyPerf.filter(s => s.total_pnl > 0 && s.win_rate >= 55 && s.trades >= 5)
  if (positiveStrategies.length > 0) {
    insights.push({
      type: 'success',
      category: 'Strategy',
      title: 'High-Performing Strategies',
      description: `${positiveStrategies.map(s => s.strategy).join(', ')} ${positiveStrategies.length === 1 ? 'shows' : 'show'} positive expectancy with good win rates.`,
      recommendation: 'Focus more of your trading on these setups while market conditions align.',
    })
  }

  // ─── Session Analysis ──────────────────────────────────────────────────────
  const sessionPerf = getSessionPerformance(closedTrades)
  const sorted_sessions = [...sessionPerf].sort((a, b) => b.total_pnl - a.total_pnl)
  if (sorted_sessions.length >= 2 && sorted_sessions[0].total_pnl > 0 && sorted_sessions[sorted_sessions.length - 1].total_pnl < 0) {
    insights.push({
      type: 'info',
      category: 'Session',
      title: 'Best Trading Session',
      description: `Your best results come during the ${sorted_sessions[0].session} session (${sorted_sessions[0].win_rate.toFixed(0)}% win rate). Your worst is the ${sorted_sessions[sorted_sessions.length - 1].session} session.`,
      recommendation: `Consider focusing on the ${sorted_sessions[0].session} session and reducing activity during the ${sorted_sessions[sorted_sessions.length - 1].session} session.`,
    })
  }

  // ─── Consistency ──────────────────────────────────────────────────────────
  let consistencyScore = 100
  const dailyPnls = Array.from(tradesByDay.values()).map(ts => ts.reduce((s, t) => s + (t.net_pnl ?? 0), 0))
  if (dailyPnls.length >= 5) {
    const profitableDays = dailyPnls.filter(p => p > 0).length
    const consistencyRate = (profitableDays / dailyPnls.length) * 100
    consistencyScore = Math.round(consistencyRate)

    if (consistencyRate < 40) {
      insights.push({
        type: 'warning',
        category: 'Consistency',
        title: 'Inconsistent Daily Results',
        description: `Only ${profitableDays} of your ${dailyPnls.length} trading days were profitable (${consistencyRate.toFixed(0)}%).`,
        recommendation: 'Focus on process consistency rather than chasing P&L targets each day.',
      })
    } else if (consistencyRate >= 60) {
      insights.push({
        type: 'success',
        category: 'Consistency',
        title: 'Consistent Performance',
        description: `${profitableDays} of ${dailyPnls.length} trading days were profitable (${consistencyRate.toFixed(0)}%).`,
      })
    }
  }

  // ─── Win Rate ─────────────────────────────────────────────────────────────
  if (stats.total_trades >= 10) {
    if (stats.win_rate >= 55) {
      insights.push({
        type: 'success',
        category: 'Performance',
        title: 'Strong Win Rate',
        description: `Your win rate of ${stats.win_rate.toFixed(1)}% is above the 55% benchmark with ${stats.total_trades} trades.`,
      })
    } else if (stats.win_rate < 40) {
      psychScore -= 10
      insights.push({
        type: 'warning',
        category: 'Performance',
        title: 'Low Win Rate',
        description: `Win rate of ${stats.win_rate.toFixed(1)}% may indicate entry timing issues or insufficient selectivity.`,
        recommendation: 'Review your entry criteria. Consider waiting for higher-probability setups even if it means fewer trades.',
      })
    }
  }

  // ─── Profit Factor ────────────────────────────────────────────────────────
  if (stats.total_trades >= 10) {
    if (stats.profit_factor >= 2) {
      insights.push({
        type: 'success',
        category: 'Performance',
        title: 'Excellent Profit Factor',
        description: `Your profit factor of ${stats.profit_factor.toFixed(2)} is well above the 1.5 benchmark.`,
      })
    } else if (stats.profit_factor < 1) {
      insights.push({
        type: 'danger',
        category: 'Performance',
        title: 'Negative Profit Factor',
        description: `Your profit factor of ${stats.profit_factor.toFixed(2)} means you're losing more than you win overall.`,
        recommendation: 'Review your average win vs. average loss ratio. Widen take profits or tighten stop losses.',
      })
    }
  }

  const overallScore = Math.round((Math.max(0, riskScore) + Math.max(0, psychScore) + Math.max(0, consistencyScore)) / 3)

  const patterns = [
    { label: 'Win Rate', value: stats.win_rate, benchmark: 50 },
    { label: 'Profit Factor', value: Math.min(stats.profit_factor * 20, 100), benchmark: 30 },
    { label: 'Avg R Multiple', value: Math.min((stats.avg_r + 2) * 25, 100), benchmark: 50 },
    { label: 'Consistency', value: consistencyScore, benchmark: 60 },
    { label: 'Risk Discipline', value: Math.max(0, riskScore), benchmark: 80 },
    { label: 'Psychology', value: Math.max(0, psychScore), benchmark: 70 },
  ]

  return {
    overall_score: overallScore,
    risk_score: Math.max(0, riskScore),
    psychology_score: Math.max(0, psychScore),
    consistency_score: Math.max(0, consistencyScore),
    insights,
    patterns,
    generated_at: new Date().toISOString(),
  }
}

export { scoreLabel }
