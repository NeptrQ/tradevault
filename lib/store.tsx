"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Account, Trade, Goal, JournalEntry } from "@/types"
import { createClient } from "@/lib/supabase/client"

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: "1",
    user_id: "user-1",
    name: "FTMO 100K Challenge",
    type: "prop_firm",
    broker: "Eightcap",
    currency: "USD",
    initial_balance: 100000,
    current_balance: 103240,
    profit_target: 10000,
    max_total_loss: 10000,
    daily_loss_limit: 5000,
    max_trades_per_day: 5,
    status: "active",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "2",
    user_id: "user-1",
    name: "Personal 25K",
    type: "personal",
    broker: "Interactive Brokers",
    currency: "USD",
    initial_balance: 25000,
    current_balance: 24150,
    max_total_loss: 5000,
    daily_loss_limit: 1000,
    status: "active",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "3",
    user_id: "user-1",
    name: "Demo Strategy Tester",
    type: "demo",
    broker: "OANDA",
    currency: "USD",
    initial_balance: 10000,
    current_balance: 11200,
    profit_target: 1000,
    max_total_loss: 1000,
    daily_loss_limit: 500,
    status: "passed",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
]

const now = new Date()
const formatDateStr = (daysAgo: number) => {
  const d = new Date(now.getTime() - daysAgo * 86400000)
  return d.toISOString()
}

export const INITIAL_TRADES: Trade[] = [
  {
    id: "t1",
    user_id: "user-1",
    account_id: "1",
    symbol: "EURUSD",
    direction: "long",
    entry_date: formatDateStr(1),
    exit_date: formatDateStr(1),
    entry_price: 1.0845,
    exit_price: 1.0890,
    lot_size: 2.0,
    stop_loss: 1.0820,
    take_profit: 1.0900,
    risk_amount: 500,
    risk_percent: 0.5,
    planned_rr: 2.2,
    pnl: 900,
    net_pnl: 880,
    commission: 20,
    r_multiple: 1.8,
    strategy: "Breakout",
    status: "closed",
    emotion_before: "confident",
    emotion_during: "calm",
    emotion_after: "euphoric",
    confidence: 8,
    entry_reason: "London session breakout above key 4H resistance",
    exit_reason: "Target hit at 1.0890",
    what_went_well: "Waited patiently for confirmation candle",
    lesson_learned: "Breakout setups with volume have higher follow-through",
    tags: ["London", "Breakout", "EURUSD"],
    screenshots: [],
    created_at: formatDateStr(1),
  },
  {
    id: "t2",
    user_id: "user-1",
    account_id: "1",
    symbol: "GBPUSD",
    direction: "short",
    entry_date: formatDateStr(2),
    exit_date: formatDateStr(2),
    entry_price: 1.2650,
    exit_price: 1.2680,
    lot_size: 1.5,
    stop_loss: 1.2680,
    take_profit: 1.2580,
    risk_amount: 450,
    risk_percent: 0.45,
    planned_rr: 2.3,
    pnl: -450,
    net_pnl: -465,
    commission: 15,
    r_multiple: -1.0,
    strategy: "Reversal",
    status: "closed",
    emotion_before: "anxious",
    emotion_during: "frustrated",
    emotion_after: "frustrated",
    confidence: 5,
    entry_reason: "Attempted to catch top of NY push",
    exit_reason: "Stopped out by CPI spike",
    what_went_wrong: "Traded right into high-impact news",
    lesson_learned: "Never open new positions 15 min before red folder events",
    tags: ["NY Session", "News", "Mistake"],
    screenshots: [],
    created_at: formatDateStr(2),
  },
  {
    id: "t3",
    user_id: "user-1",
    account_id: "1",
    symbol: "XAUUSD",
    direction: "long",
    entry_date: formatDateStr(3),
    exit_date: formatDateStr(3),
    entry_price: 2410.50,
    exit_price: 2428.00,
    lot_size: 1.0,
    stop_loss: 2402.00,
    take_profit: 2435.00,
    risk_amount: 850,
    risk_percent: 0.85,
    planned_rr: 2.8,
    pnl: 1750,
    net_pnl: 1720,
    commission: 30,
    r_multiple: 2.0,
    strategy: "Trend Follow",
    status: "closed",
    emotion_before: "calm",
    emotion_during: "focused",
    emotion_after: "confident",
    confidence: 9,
    entry_reason: "Daily trend continuation bounce from 50 EMA",
    exit_reason: "Trailing stop hit at $2428",
    what_went_well: "Let winners run with trailing stop",
    tags: ["Gold", "Trend", "BigWin"],
    screenshots: [],
    created_at: formatDateStr(3),
  },
  {
    id: "t4",
    user_id: "user-1",
    account_id: "1",
    symbol: "US30",
    direction: "short",
    entry_date: formatDateStr(5),
    exit_date: formatDateStr(5),
    entry_price: 39800,
    exit_price: 39680,
    lot_size: 0.5,
    stop_loss: 39880,
    take_profit: 39550,
    risk_amount: 400,
    risk_percent: 0.4,
    planned_rr: 3.1,
    pnl: 600,
    net_pnl: 585,
    commission: 15,
    r_multiple: 1.5,
    strategy: "Breakout",
    status: "closed",
    tags: ["Indices", "NY Open"],
    screenshots: [],
    created_at: formatDateStr(5),
  },
]

export const INITIAL_GOALS: Goal[] = [
  {
    id: "g1",
    user_id: "user-1",
    account_id: "1",
    title: "Monthly Profit Goal",
    type: "profit",
    target_value: 10000,
    current_value: 3240,
    period: "monthly",
    start_date: formatDateStr(30).slice(0, 10),
    end_date: formatDateStr(-1).slice(0, 10),
    status: "active",
    description: "Hit 10% target on FTMO Challenge",
    created_at: formatDateStr(30),
  },
]

export const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: "j1",
    user_id: "user-1",
    title: "London Session Gold & EURUSD Execution",
    content: "Clean execution today on EURUSD breakout and Gold continuation. Stood completely calm during the 15-minute pullback.",
    mood: "great",
    tags: ["London", "Execution", "Discipline"],
    entry_date: formatDateStr(1).slice(0, 10),
    created_at: formatDateStr(1),
  },
]

export interface UserProfile {
  name: string
  email: string
  phone: string
  avatar_url: string
  bio: string
  trading_style: string
  experience_years: string
}

export interface UserPreferences {
  currency: string
  default_risk_percent: number
  timezone: string
  default_account_id: string
  max_risk_per_trade: number
  max_daily_loss: number
  max_trades_per_day: number
  enable_risk_warnings: boolean
  show_risk_on_dashboard: boolean
  theme: "dark" | "light"
  accent_color: "blue" | "purple" | "green" | "orange" | "red"
  font_size: "small" | "medium" | "large"
  compact_mode: boolean
  daily_loss_warning: boolean
  daily_loss_threshold: number
  risk_limit_warning: boolean
  goal_reminder: boolean
  goal_reminder_time: string
  weekly_summary: boolean
  gemini_api_key: string
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Alex Trader",
  email: "trader@tradevault.com",
  phone: "+1 (555) 000-0000",
  avatar_url: "",
  bio: "Quantitative intraday & swing trader specializing in London & NY breakouts.",
  trading_style: "Price Action & Breakout",
  experience_years: "3 Years",
}

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: "usd",
  default_risk_percent: 1.0,
  timezone: "est",
  default_account_id: "all",
  max_risk_per_trade: 2.0,
  max_daily_loss: 5.0,
  max_trades_per_day: 5,
  enable_risk_warnings: true,
  show_risk_on_dashboard: true,
  theme: "dark",
  accent_color: "blue",
  font_size: "medium",
  compact_mode: false,
  daily_loss_warning: true,
  daily_loss_threshold: 3,
  risk_limit_warning: true,
  goal_reminder: false,
  goal_reminder_time: "08:00",
  weekly_summary: true,
  gemini_api_key: "",
}

const STORAGE_KEY = "tradevault_store_v4"
const PROFILE_KEY = "tradevault_profile_v4"
const PREFS_KEY = "tradevault_prefs_v4"

interface StoreContextType {
  accounts: Account[]
  trades: Trade[]
  goals: Goal[]
  journalEntries: JournalEntry[]
  profile: UserProfile
  preferences: UserPreferences
  selectedAccountId: string
  setSelectedAccountId: (id: string) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  addAccount: (account: Partial<Account> & { name: string; initial_balance: number }) => Account
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void
  addTrade: (trade: Partial<Trade> & { symbol: string; direction: 'long' | 'short'; lot_size: number; entry_price: number }) => Trade
  deleteTrade: (id: string) => void
  addGoal: (goal: Partial<Goal> & { title: string; target_value: number; type: any }) => Goal
  deleteGoal: (id: string) => void
  addJournalEntry: (entry: Partial<JournalEntry> & { title: string; content: string }) => JournalEntry
  deleteJournalEntry: (id: string) => void
  resetToDemoData: () => void
  clearAllData: () => void
  isLoaded: boolean
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all")
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()

  // Apply appearance styles to HTML
  const applyAppearance = useCallback((prefs: UserPreferences) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    // Theme
    if (prefs.theme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }

    // Accent Color
    root.classList.remove('accent-blue', 'accent-purple', 'accent-green', 'accent-orange', 'accent-red')
    root.classList.add(`accent-${prefs.accent_color || 'blue'}`)

    // Font Size
    root.classList.remove('font-sm', 'font-md', 'font-lg')
    if (prefs.font_size === 'small') root.classList.add('font-sm')
    else if (prefs.font_size === 'large') root.classList.add('font-lg')
    else root.classList.add('font-md')

    // Compact Mode
    if (prefs.compact_mode) {
      root.classList.add('compact')
    } else {
      root.classList.remove('compact')
    }
  }, [])

  // Load state on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const savedData = localStorage.getItem(STORAGE_KEY)
        const savedProfile = localStorage.getItem(PROFILE_KEY)
        const savedPrefs = localStorage.getItem(PREFS_KEY)

        // Load profile & preferences
        let currentProfile = DEFAULT_PROFILE
        if (savedProfile) {
          currentProfile = { ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) }
        }
        if (user) {
          currentProfile.email = user.email || currentProfile.email
          if (user.user_metadata?.full_name) currentProfile.name = user.user_metadata.full_name
          if (user.user_metadata?.phone) currentProfile.phone = user.user_metadata.phone
          if (user.user_metadata?.avatar_url) currentProfile.avatar_url = user.user_metadata.avatar_url
        }
        setProfile(currentProfile)

        let currentPrefs = DEFAULT_PREFERENCES
        if (savedPrefs) {
          currentPrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) }
        }
        setPreferences(currentPrefs)
        applyAppearance(currentPrefs)

        if (user) {
          // If user is authenticated, query Supabase database as the primary source of truth
          const [accRes, tradeRes, goalRes, journalRes] = await Promise.all([
            supabase.from('accounts').select('*').eq('user_id', user.id),
            supabase.from('trades').select('*').eq('user_id', user.id),
            supabase.from('goals').select('*').eq('user_id', user.id),
            supabase.from('journal_entries').select('*').eq('user_id', user.id),
          ])

          if (accRes.data) {
            setAccounts(accRes.data)
            setTrades(tradeRes.data || [])
            setGoals(goalRes.data || [])
            setJournalEntries(journalRes.data || [])
            setSelectedAccountId(accRes.data[0]?.id || "all")
          } else if (savedData) {
            const parsed = JSON.parse(savedData)
            setAccounts(parsed.accounts ?? [])
            setTrades(parsed.trades ?? [])
            setGoals(parsed.goals ?? [])
            setJournalEntries(parsed.journalEntries ?? [])
            setSelectedAccountId(parsed.selectedAccountId ?? "all")
          } else {
            setAccounts([])
            setTrades([])
            setGoals([])
            setJournalEntries([])
            setSelectedAccountId("all")
          }
        } else {
          // Unauthenticated guest user
          if (savedData) {
            const parsed = JSON.parse(savedData)
            setAccounts(parsed.accounts ?? [])
            setTrades(parsed.trades ?? [])
            setGoals(parsed.goals ?? [])
            setJournalEntries(parsed.journalEntries ?? [])
            setSelectedAccountId(parsed.selectedAccountId ?? "all")
          } else {
            setAccounts(INITIAL_ACCOUNTS)
            setTrades(INITIAL_TRADES)
            setGoals(INITIAL_GOALS)
            setJournalEntries(INITIAL_JOURNAL)
            setSelectedAccountId("1")
          }
        }
      } catch (e) {
        console.error("Failed to load TradeVault data", e)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [applyAppearance])

  // Persist state to localStorage
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accounts,
          trades,
          goals,
          journalEntries,
          selectedAccountId,
        })
      )
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
      localStorage.setItem(PREFS_KEY, JSON.stringify(preferences))
    } catch (e) {
      console.error("Failed to save TradeVault store to localStorage", e)
    }
  }, [accounts, trades, goals, journalEntries, profile, preferences, selectedAccountId, isLoaded])

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
      return next
    })

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.auth.updateUser({
          data: {
            full_name: updates.name,
            phone: updates.phone,
            avatar_url: updates.avatar_url,
            bio: updates.bio,
          },
        }).catch(err => console.warn('Supabase auth profile update note:', err))
      }
    })
  }

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      applyAppearance(next)
      return next
    })
  }

  const addAccount = (data: Partial<Account> & { name: string; initial_balance: number }): Account => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
    const newAcc: Account = {
      id: newId,
      user_id: "user-1",
      name: data.name,
      type: data.type || "prop_firm",
      broker: data.broker || "",
      currency: data.currency || preferences.currency.toUpperCase() || "USD",
      initial_balance: data.initial_balance,
      current_balance: data.initial_balance,
      profit_target: data.profit_target,
      max_total_loss: data.max_total_loss,
      daily_loss_limit: data.daily_loss_limit,
      max_trades_per_day: data.max_trades_per_day || preferences.max_trades_per_day || 5,
      status: "active",
      created_at: new Date().toISOString(),
      ...data,
    }

    setAccounts((prev) => [newAcc, ...prev])
    setSelectedAccountId(newAcc.id)

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        newAcc.user_id = user.id
        supabase.from('accounts').insert({
          id: newAcc.id,
          user_id: user.id,
          name: newAcc.name,
          type: newAcc.type,
          broker: newAcc.broker,
          currency: newAcc.currency,
          initial_balance: newAcc.initial_balance,
          current_balance: newAcc.current_balance,
          profit_target: newAcc.profit_target,
          max_total_loss: newAcc.max_total_loss,
          daily_loss_limit: newAcc.daily_loss_limit,
          status: newAcc.status,
        }).catch(err => console.warn('Supabase account insert note:', err))
      }
    })

    return newAcc
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
    supabase.from('accounts').update(updates).eq('id', id).catch(err => console.warn('Supabase account update note:', err))
  }

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    setTrades((prev) => prev.filter((t) => t.account_id !== id))
    setGoals((prev) => prev.filter((g) => g.account_id !== id))

    if (selectedAccountId === id) {
      setSelectedAccountId("all")
    }

    supabase.from('accounts').delete().eq('id', id).catch(err => console.warn('Supabase account delete note:', err))
    supabase.from('trades').delete().eq('account_id', id).catch(err => console.warn('Supabase trades delete note:', err))
    supabase.from('goals').delete().eq('account_id', id).catch(err => console.warn('Supabase goals delete note:', err))
  }

  const addTrade = (data: Partial<Trade> & { symbol: string; direction: 'long' | 'short'; lot_size: number; entry_price: number }): Trade => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
    const newTrade: Trade = {
      id: newId,
      user_id: "user-1",
      account_id: data.account_id || (accounts[0]?.id ?? "1"),
      symbol: data.symbol,
      direction: data.direction,
      entry_date: data.entry_date || new Date().toISOString(),
      exit_date: data.exit_date,
      entry_price: data.entry_price,
      exit_price: data.exit_price,
      lot_size: data.lot_size,
      status: data.status || "closed",
      pnl: data.pnl ?? 0,
      net_pnl: data.net_pnl ?? data.pnl ?? 0,
      r_multiple: data.r_multiple ?? 1.0,
      created_at: new Date().toISOString(),
      ...data,
    }

    setTrades((prev) => [newTrade, ...prev])

    if (newTrade.net_pnl && newTrade.account_id) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === newTrade.account_id
            ? { ...acc, current_balance: (acc.current_balance || acc.initial_balance) + (newTrade.net_pnl ?? 0) }
            : acc
        )
      )
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        newTrade.user_id = user.id
        supabase.from('trades').insert({
          id: newTrade.id,
          user_id: user.id,
          account_id: newTrade.account_id,
          symbol: newTrade.symbol,
          direction: newTrade.direction,
          entry_date: newTrade.entry_date,
          exit_date: newTrade.exit_date,
          entry_price: newTrade.entry_price,
          exit_price: newTrade.exit_price,
          lot_size: newTrade.lot_size,
          stop_loss: newTrade.stop_loss,
          take_profit: newTrade.take_profit,
          risk_amount: newTrade.risk_amount,
          commission: newTrade.commission,
          swap: newTrade.swap,
          pnl: newTrade.pnl,
          net_pnl: newTrade.net_pnl,
          r_multiple: newTrade.r_multiple,
          strategy: newTrade.strategy,
          status: newTrade.status,
          emotion_before: newTrade.emotion_before,
          emotion_during: newTrade.emotion_during,
          emotion_after: newTrade.emotion_after,
          confidence: newTrade.confidence,
          entry_reason: newTrade.entry_reason,
          exit_reason: newTrade.exit_reason,
          what_went_well: newTrade.what_went_well,
          what_went_wrong: newTrade.what_went_wrong,
          lesson_learned: newTrade.lesson_learned,
          tags: newTrade.tags,
        }).catch(err => console.warn('Supabase trade insert note:', err))
      }
    })

    return newTrade
  }

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id))
    supabase.from('trades').delete().eq('id', id).catch(err => console.warn('Supabase trade delete note:', err))
  }

  const addGoal = (data: Partial<Goal> & { title: string; target_value: number; type: any }): Goal => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
    const newGoal: Goal = {
      id: newId,
      user_id: "user-1",
      account_id: data.account_id,
      title: data.title,
      type: data.type,
      target_value: data.target_value,
      current_value: data.current_value || 0,
      period: data.period || "monthly",
      start_date: data.start_date || new Date().toISOString().slice(0, 10),
      end_date: data.end_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: "active",
      created_at: new Date().toISOString(),
      ...data,
    }

    setGoals((prev) => [newGoal, ...prev])

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        newGoal.user_id = user.id
        supabase.from('goals').insert({
          id: newGoal.id,
          user_id: user.id,
          account_id: newGoal.account_id,
          title: newGoal.title,
          type: newGoal.type,
          target_value: newGoal.target_value,
          current_value: newGoal.current_value,
          period: newGoal.period,
          start_date: newGoal.start_date,
          end_date: newGoal.end_date,
          status: newGoal.status,
        }).catch(err => console.warn('Supabase goal insert note:', err))
      }
    })

    return newGoal
  }

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    supabase.from('goals').delete().eq('id', id).catch(err => console.warn('Supabase goal delete note:', err))
  }

  const addJournalEntry = (data: Partial<JournalEntry> & { title: string; content: string }): JournalEntry => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
    const newEntry: JournalEntry = {
      id: newId,
      user_id: "user-1",
      title: data.title,
      content: data.content,
      mood: data.mood || "good",
      tags: data.tags || [],
      entry_date: data.entry_date || new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
      ...data,
    }

    setJournalEntries((prev) => [newEntry, ...prev])

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        newEntry.user_id = user.id
        supabase.from('journal_entries').insert({
          id: newEntry.id,
          user_id: user.id,
          title: newEntry.title,
          content: newEntry.content,
          mood: newEntry.mood,
          tags: newEntry.tags,
          entry_date: newEntry.entry_date,
        }).catch(err => console.warn('Supabase journal insert note:', err))
      }
    })

    return newEntry
  }

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((j) => j.id !== id))
    supabase.from('journal_entries').delete().eq('id', id).catch(err => console.warn('Supabase journal delete note:', err))
  }

  const resetToDemoData = () => {
    setAccounts(INITIAL_ACCOUNTS)
    setTrades(INITIAL_TRADES)
    setGoals(INITIAL_GOALS)
    setJournalEntries(INITIAL_JOURNAL)
    setSelectedAccountId("1")
  }

  const clearAllData = () => {
    setAccounts([])
    setTrades([])
    setGoals([])
    setJournalEntries([])
    setSelectedAccountId("all")
  }

  return (
    <StoreContext.Provider
      value={{
        accounts,
        trades,
        goals,
        journalEntries,
        profile,
        preferences,
        selectedAccountId,
        setSelectedAccountId,
        updateProfile,
        updatePreferences,
        addAccount,
        updateAccount,
        deleteAccount,
        addTrade,
        deleteTrade,
        addGoal,
        deleteGoal,
        addJournalEntry,
        deleteJournalEntry,
        resetToDemoData,
        clearAllData,
        isLoaded,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useTradeStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useTradeStore must be used within a StoreProvider")
  }
  return context
}
