export type AccountType = 'prop_firm' | 'personal' | 'demo' | 'live'
export type AccountStatus = 'active' | 'passed' | 'failed' | 'inactive'
export type TradeDirection = 'long' | 'short'
export type TradeStatus = 'open' | 'closed' | 'cancelled'
export type GoalType = 'profit' | 'drawdown' | 'risk' | 'trades' | 'journaling' | 'behavior'
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom'
export type GoalStatus = 'active' | 'completed' | 'failed'
export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
export type EmotionType = 'calm' | 'confident' | 'anxious' | 'fearful' | 'greedy' | 'frustrated' | 'euphoric' | 'bored' | 'focused' | 'impulsive'

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  broker?: string
  currency: string
  initial_balance: number
  current_balance: number
  profit_target?: number
  max_total_loss?: number
  daily_loss_limit?: number
  max_trades_per_day?: number
  status: AccountStatus
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  account_id: string
  symbol: string
  direction: TradeDirection
  entry_date: string
  exit_date?: string
  entry_price: number
  exit_price?: number
  lot_size: number
  stop_loss?: number
  take_profit?: number
  risk_amount?: number
  risk_percent?: number
  planned_rr?: number
  pnl?: number
  commission?: number
  swap?: number
  net_pnl?: number
  r_multiple?: number
  strategy?: string
  status: TradeStatus
  emotion_before?: EmotionType
  emotion_during?: EmotionType
  emotion_after?: EmotionType
  confidence?: number
  entry_reason?: string
  exit_reason?: string
  what_went_well?: string
  what_went_wrong?: string
  lesson_learned?: string
  tags?: string[]
  screenshots?: string[]
  created_at: string
  account?: Account
}

export interface Goal {
  id: string
  user_id: string
  account_id?: string
  title: string
  type: GoalType
  target_value: number
  current_value: number
  period?: GoalPeriod
  start_date: string
  end_date: string
  status: GoalStatus
  description?: string
  created_at: string
  account?: Account
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood?: MoodType
  tags?: string[]
  entry_date: string
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  default_currency: string
  default_risk_percent: number
  default_timezone: string
  default_account_id?: string
  max_risk_per_trade: number
  max_daily_loss: number
  max_trades_per_day: number
  dark_mode: boolean
  theme: string
  notif_daily_loss: boolean
  notif_risk_warning: boolean
  notif_goal_reminder: boolean
  ai_enabled: boolean
  ai_provider: string
  created_at: string
  updated_at: string
}

// Analytics types
export interface EquityPoint {
  date: string
  equity: number
  pnl: number
}

export interface DailyPnL {
  date: string
  pnl: number
  trades: number
}

export interface MonthlyPnL {
  month: string
  pnl: number
  trades: number
}

export interface SymbolPerformance {
  symbol: string
  trades: number
  win_rate: number
  total_pnl: number
  avg_pnl: number
  profit_factor: number
}

export interface StrategyPerformance {
  strategy: string
  trades: number
  win_rate: number
  total_pnl: number
  avg_pnl: number
  expectancy: number
}

export interface SessionPerformance {
  session: string
  trades: number
  win_rate: number
  total_pnl: number
  avg_pnl: number
}

export interface DayOfWeekPerformance {
  day: string
  trades: number
  win_rate: number
  total_pnl: number
}

export interface PerformanceStats {
  total_pnl: number
  win_rate: number
  profit_factor: number
  expectancy: number
  avg_r: number
  max_drawdown: number
  avg_win: number
  avg_loss: number
  total_trades: number
  winning_trades: number
  losing_trades: number
  avg_holding_time?: number
  best_trade?: number
  worst_trade?: number
  current_streak?: number
}

// AI Review types
export interface SmartInsight {
  type: 'success' | 'warning' | 'danger' | 'info'
  category: string
  title: string
  description: string
  occurrences?: number
  total?: number
  recommendation?: string
}

export interface SmartReviewResult {
  overall_score: number
  risk_score: number
  psychology_score: number
  consistency_score: number
  insights: SmartInsight[]
  patterns: {
    label: string
    value: number
    benchmark?: number
  }[]
  generated_at: string
}

// Filter types
export interface TradeFilters {
  account_id?: string
  symbol?: string
  strategy?: string
  direction?: TradeDirection
  status?: TradeStatus
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface CalendarDay {
  date: string
  pnl: number
  trades: number
  win_rate: number
  best_trade: number
  worst_trade: number
  total_risk: number
  avg_r: number
}
