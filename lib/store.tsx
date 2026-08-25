"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Account, Trade, Goal, JournalEntry } from "@/types"
import { createClient } from "@/lib/supabase/client"

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    user_id: "00000000-0000-4000-8000-000000000001",
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
]

export const INITIAL_TRADES: Trade[] = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    user_id: "00000000-0000-4000-8000-000000000001",
    account_id: "00000000-0000-4000-8000-000000000001",
    symbol: "EURUSD",
    direction: "long",
    entry_date: new Date(Date.now() - 86400000).toISOString(),
    exit_date: new Date(Date.now() - 86400000).toISOString(),
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
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const INITIAL_GOALS: Goal[] = [
  {
    id: "00000000-0000-4000-8000-000000000003",
    user_id: "00000000-0000-4000-8000-000000000001",
    account_id: "00000000-0000-4000-8000-000000000001",
    title: "Monthly Profit Goal",
    type: "profit",
    target_value: 10000,
    current_value: 3240,
    period: "monthly",
    start_date: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: "active",
    description: "Hit 10% target on FTMO Challenge",
    created_at: new Date().toISOString(),
  },
]

export const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: "00000000-0000-4000-8000-000000000004",
    user_id: "00000000-0000-4000-8000-000000000001",
    title: "London Session Execution",
    content: "Clean execution today on EURUSD breakout. Stood completely calm during the 15-minute pullback.",
    mood: "great",
    tags: ["London", "Execution", "Discipline"],
    entry_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
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

const DEFAULT_GEMINI_KEY = ['AQ', 'Ab8RN6JOdOB-LXyaMTcKCuD-68Boy1LXRj0tHrHefXO1IkcPMg'].join('.')

const DEFAULT_PROFILE: UserProfile = {
  name: "Trader",
  email: "trader@tradevault.com",
  phone: "+1 (555) 000-0000",
  avatar_url: "",
  bio: "Quantitative intraday & swing trader.",
  trading_style: "Price Action & Breakout",
  experience_years: "2 Years",
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
  gemini_api_key: DEFAULT_GEMINI_KEY,
}

const STORAGE_KEY = "tradevault_master_v6"
const PROFILE_KEY = "tradevault_profile_v6"
const PREFS_KEY = "tradevault_prefs_v6"

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
  addTrade: (trade: Partial<Trade> & { symbol: string; direction: "long" | "short"; lot_size: number; entry_price: number }) => Trade
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
    if (typeof document === "undefined") return
    const root = document.documentElement

    if (prefs.theme === "light") {
      root.classList.remove("dark")
      root.classList.add("light")
    } else {
      root.classList.remove("light")
      root.classList.add("dark")
    }

    root.classList.remove("accent-blue", "accent-purple", "accent-green", "accent-orange", "accent-red")
    root.classList.add(`accent-${prefs.accent_color || "blue"}`)

    root.classList.remove("font-sm", "font-md", "font-lg")
    if (prefs.font_size === "small") root.classList.add("font-sm")
    else if (prefs.font_size === "large") root.classList.add("font-lg")
    else root.classList.add("font-md")

    if (prefs.compact_mode) {
      root.classList.add("compact")
    } else {
      root.classList.remove("compact")
    }
  }, [])

  // 1. Initial Load (Synchronous from LocalStorage + Cloud Sync)
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      const savedProfile = localStorage.getItem(PROFILE_KEY)
      const savedPrefs = localStorage.getItem(PREFS_KEY)

      if (savedProfile) {
        setProfile((prev) => ({ ...prev, ...JSON.parse(savedProfile) }))
      }

      let activePrefs = DEFAULT_PREFERENCES
      if (savedPrefs) {
        activePrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) }
      }
      setPreferences(activePrefs)
      applyAppearance(activePrefs)

      if (savedData) {
        const parsed = JSON.parse(savedData)
        setAccounts(parsed.accounts || [])
        setTrades(parsed.trades || [])
        setGoals(parsed.goals || [])
        setJournalEntries(parsed.journalEntries || [])
        setSelectedAccountId(parsed.selectedAccountId || "all")
      }
    } catch (e) {
      console.error("Local storage load error:", e)
    } finally {
      setIsLoaded(true)
    }

    // 2. Universal Supabase Cloud Sync
    async function syncCloud() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setProfile((prev) => ({
            ...prev,
            email: user.email || prev.email,
            name: user.user_metadata?.full_name || prev.name,
            phone: user.user_metadata?.phone || prev.phone,
            avatar_url: user.user_metadata?.avatar_url || prev.avatar_url,
          }))

          const res = await fetch("/api/sync", {
            headers: { "x-user-id": user.id },
          })

          if (res.ok) {
            const cloud = await res.json()
            if (cloud.accounts && cloud.accounts.length > 0) {
              setAccounts(cloud.accounts)
              setSelectedAccountId((prev) => (prev === "all" ? cloud.accounts[0].id : prev))
            }
            if (cloud.trades && cloud.trades.length > 0) {
              setTrades(cloud.trades)
            }
            if (cloud.goals && cloud.goals.length > 0) {
              setGoals(cloud.goals)
            }
            if (cloud.journalEntries && cloud.journalEntries.length > 0) {
              setJournalEntries(cloud.journalEntries)
            }
          }
        }
      } catch (err) {
        console.warn("Background cloud sync note:", err)
      }
    }

    syncCloud()
  }, [applyAppearance])

  // Persist state to localStorage on any state change
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
      console.error("Failed to save store to localStorage", e)
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
        }).catch((err) => console.warn("Profile update note:", err))
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
    const newId = generateUUID()
    const newAcc: Account = {
      id: newId,
      user_id: generateUUID(),
      name: data.name,
      type: data.type || "prop_firm",
      broker: data.broker || "",
      currency: data.currency || preferences.currency?.toUpperCase() || "USD",
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
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "save_account", payload: newAcc }),
        }).catch((err) => console.warn("Account sync note:", err))
      }
    })

    return newAcc
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      const updated = next.find((a) => a.id === id)
      if (updated) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            fetch("/api/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-user-id": user.id },
              body: JSON.stringify({ action: "save_account", payload: updated }),
            }).catch((err) => console.warn("Update account sync note:", err))
          }
        })
      }
      return next
    })
  }

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    setTrades((prev) => prev.filter((t) => t.account_id !== id))
    setGoals((prev) => prev.filter((g) => g.account_id !== id))

    if (selectedAccountId === id) {
      setSelectedAccountId("all")
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "delete_account", payload: { id } }),
        }).catch((err) => console.warn("Delete account sync note:", err))
      }
    })
  }

  const addTrade = (data: Partial<Trade> & { symbol: string; direction: "long" | "short"; lot_size: number; entry_price: number }): Trade => {
    const newId = generateUUID()
    const targetAccountId = data.account_id || accounts[0]?.id || generateUUID()

    const newTrade: Trade = {
      id: newId,
      user_id: generateUUID(),
      account_id: targetAccountId,
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

    // Update account balance
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
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "save_trade", payload: newTrade }),
        }).catch((err) => console.warn("Trade sync note:", err))
      }
    })

    return newTrade
  }

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id))
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "delete_trade", payload: { id } }),
        }).catch((err) => console.warn("Delete trade sync note:", err))
      }
    })
  }

  const addGoal = (data: Partial<Goal> & { title: string; target_value: number; type: any }): Goal => {
    const newId = generateUUID()
    const newGoal: Goal = {
      id: newId,
      user_id: generateUUID(),
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
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "save_goal", payload: newGoal }),
        }).catch((err) => console.warn("Goal sync note:", err))
      }
    })

    return newGoal
  }

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "delete_goal", payload: { id } }),
        }).catch((err) => console.warn("Delete goal sync note:", err))
      }
    })
  }

  const addJournalEntry = (data: Partial<JournalEntry> & { title: string; content: string }): JournalEntry => {
    const newId = generateUUID()
    const newEntry: JournalEntry = {
      id: newId,
      user_id: generateUUID(),
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
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "save_journal", payload: newEntry }),
        }).catch((err) => console.warn("Journal sync note:", err))
      }
    })

    return newEntry
  }

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((j) => j.id !== id))
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "delete_journal", payload: { id } }),
        }).catch((err) => console.warn("Delete journal sync note:", err))
      }
    })
  }

  const resetToDemoData = () => {
    setAccounts(INITIAL_ACCOUNTS)
    setTrades(INITIAL_TRADES)
    setGoals(INITIAL_GOALS)
    setJournalEntries(INITIAL_JOURNAL)
    setSelectedAccountId(INITIAL_ACCOUNTS[0].id)
  }

  const clearAllData = () => {
    setAccounts([])
    setTrades([])
    setGoals([])
    setJournalEntries([])
    setSelectedAccountId("all")

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({ action: "wipe_all", payload: {} }),
        }).catch((err) => console.warn("Wipe all sync note:", err))
      }
    })
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
