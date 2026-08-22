"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Account, Trade, Goal, JournalEntry } from "@/types"

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
    emotion_before: "focused",
    emotion_during: "calm",
    emotion_after: "confident",
    confidence: 8,
    entry_reason: "Opening bell breakdown below premarket low",
    tags: ["Indices", "NY Open"],
    screenshots: [],
    created_at: formatDateStr(5),
  },
  {
    id: "t5",
    user_id: "user-1",
    account_id: "1",
    symbol: "NASDAQ",
    direction: "long",
    entry_date: formatDateStr(7),
    exit_date: formatDateStr(7),
    entry_price: 18200,
    exit_price: 18140,
    lot_size: 0.8,
    stop_loss: 18140,
    take_profit: 18350,
    risk_amount: 480,
    risk_percent: 0.48,
    planned_rr: 2.5,
    pnl: -480,
    net_pnl: -495,
    commission: 15,
    r_multiple: -1.0,
    strategy: "Scalp",
    status: "closed",
    tags: ["NQ", "Loss"],
    screenshots: [],
    created_at: formatDateStr(7),
  },
  {
    id: "t6",
    user_id: "user-1",
    account_id: "2",
    symbol: "EURUSD",
    direction: "short",
    entry_date: formatDateStr(4),
    exit_date: formatDateStr(4),
    entry_price: 1.0890,
    exit_price: 1.0920,
    lot_size: 1.0,
    stop_loss: 1.0920,
    take_profit: 1.0820,
    risk_amount: 300,
    risk_percent: 1.2,
    planned_rr: 2.3,
    pnl: -300,
    net_pnl: -310,
    commission: 10,
    r_multiple: -1.0,
    strategy: "Reversal",
    status: "closed",
    tags: ["Personal", "Loss"],
    screenshots: [],
    created_at: formatDateStr(4),
  },
  {
    id: "t7",
    user_id: "user-1",
    account_id: "2",
    symbol: "GBPUSD",
    direction: "long",
    entry_date: formatDateStr(8),
    exit_date: formatDateStr(8),
    entry_price: 1.2600,
    exit_price: 1.2545,
    lot_size: 1.0,
    stop_loss: 1.2545,
    take_profit: 1.2720,
    risk_amount: 550,
    risk_percent: 2.2,
    planned_rr: 2.1,
    pnl: -550,
    net_pnl: -560,
    commission: 10,
    r_multiple: -1.0,
    strategy: "Trend Follow",
    status: "closed",
    tags: ["Personal"],
    screenshots: [],
    created_at: formatDateStr(8),
  },
  {
    id: "t8",
    user_id: "user-1",
    account_id: "3",
    symbol: "EURUSD",
    direction: "long",
    entry_date: formatDateStr(2),
    exit_date: formatDateStr(2),
    entry_price: 1.0820,
    exit_price: 1.0880,
    lot_size: 1.0,
    stop_loss: 1.0790,
    take_profit: 1.0900,
    risk_amount: 300,
    risk_percent: 3.0,
    planned_rr: 2.6,
    pnl: 600,
    net_pnl: 590,
    commission: 10,
    r_multiple: 2.0,
    strategy: "Breakout",
    status: "closed",
    tags: ["Demo", "Tester"],
    screenshots: [],
    created_at: formatDateStr(2),
  },
  {
    id: "t9",
    user_id: "user-1",
    account_id: "3",
    symbol: "XAUUSD",
    direction: "long",
    entry_date: formatDateStr(6),
    exit_date: formatDateStr(6),
    entry_price: 2390,
    exit_price: 2402,
    lot_size: 0.5,
    stop_loss: 2382,
    take_profit: 2410,
    risk_amount: 400,
    risk_percent: 4.0,
    planned_rr: 2.5,
    pnl: 600,
    net_pnl: 590,
    commission: 10,
    r_multiple: 1.5,
    strategy: "Scalp",
    status: "closed",
    tags: ["Demo"],
    screenshots: [],
    created_at: formatDateStr(6),
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
  {
    id: "g2",
    user_id: "user-1",
    account_id: "1",
    title: "Max Drawdown Buffer",
    type: "drawdown",
    target_value: 10000,
    current_value: 1500,
    period: "monthly",
    start_date: formatDateStr(30).slice(0, 10),
    end_date: formatDateStr(-1).slice(0, 10),
    status: "active",
    description: "Stay below 5% max drawdown",
    created_at: formatDateStr(30),
  },
  {
    id: "g3",
    user_id: "user-1",
    account_id: "1",
    title: "Trade Journaling Discipline",
    type: "journaling",
    target_value: 20,
    current_value: 18,
    period: "weekly",
    start_date: formatDateStr(7).slice(0, 10),
    end_date: formatDateStr(-1).slice(0, 10),
    status: "active",
    description: "Journal emotions & lessons on every trade",
    created_at: formatDateStr(7),
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
  {
    id: "j2",
    user_id: "user-1",
    title: "Post-CPI Review & Revenge Trade Reflection",
    content: "Took an impulsive reversal short on GBPUSD right before CPI. Lost 1R. Lesson: stay away from screens 15m before news.",
    mood: "bad",
    tags: ["Psychology", "News", "Mistake"],
    entry_date: formatDateStr(2).slice(0, 10),
    created_at: formatDateStr(2),
  },
]

const STORAGE_KEY = "tradevault_store_v1"

interface StoreContextType {
  accounts: Account[]
  trades: Trade[]
  goals: Goal[]
  journalEntries: JournalEntry[]
  selectedAccountId: string
  setSelectedAccountId: (id: string) => void
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
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setAccounts(parsed.accounts ?? [])
        setTrades(parsed.trades ?? [])
        setGoals(parsed.goals ?? [])
        setJournalEntries(parsed.journalEntries ?? [])
        setSelectedAccountId(parsed.selectedAccountId ?? "all")
      } else {
        // First time initialization with demo data
        setAccounts(INITIAL_ACCOUNTS)
        setTrades(INITIAL_TRADES)
        setGoals(INITIAL_GOALS)
        setJournalEntries(INITIAL_JOURNAL)
        setSelectedAccountId("1")
      }
    } catch (e) {
      console.error("Failed to load TradeVault data from localStorage", e)
      setAccounts(INITIAL_ACCOUNTS)
      setTrades(INITIAL_TRADES)
      setGoals(INITIAL_GOALS)
      setJournalEntries(INITIAL_JOURNAL)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save changes
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
    } catch (e) {
      console.error("Failed to save TradeVault store to localStorage", e)
    }
  }, [accounts, trades, goals, journalEntries, selectedAccountId, isLoaded])

  const addAccount = (data: Partial<Account> & { name: string; initial_balance: number }): Account => {
    const newAcc: Account = {
      id: Date.now().toString(),
      user_id: "user-1",
      name: data.name,
      type: data.type || "prop_firm",
      broker: data.broker || "",
      currency: data.currency || "USD",
      initial_balance: data.initial_balance,
      current_balance: data.initial_balance,
      profit_target: data.profit_target,
      max_total_loss: data.max_total_loss,
      daily_loss_limit: data.daily_loss_limit,
      status: "active",
      created_at: new Date().toISOString(),
      ...data,
    }
    setAccounts((prev) => [newAcc, ...prev])
    return newAcc
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }

  const deleteAccount = (id: string) => {
    // Cascade delete: remove the account AND all associated trades and goals
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    setTrades((prev) => prev.filter((t) => t.account_id !== id))
    setGoals((prev) => prev.filter((g) => g.account_id !== id))

    if (selectedAccountId === id) {
      setSelectedAccountId("all")
    }
  }

  const addTrade = (data: Partial<Trade> & { symbol: string; direction: 'long' | 'short'; lot_size: number; entry_price: number }): Trade => {
    const newTrade: Trade = {
      id: Date.now().toString(),
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

    // Update account balance
    if (newTrade.net_pnl && newTrade.account_id) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === newTrade.account_id
            ? { ...acc, current_balance: acc.current_balance + (newTrade.net_pnl ?? 0) }
            : acc
        )
      )
    }
    return newTrade
  }

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id))
  }

  const addGoal = (data: Partial<Goal> & { title: string; target_value: number; type: any }): Goal => {
    const newGoal: Goal = {
      id: Date.now().toString(),
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
    return newGoal
  }

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const addJournalEntry = (data: Partial<JournalEntry> & { title: string; content: string }): JournalEntry => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
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
    return newEntry
  }

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((j) => j.id !== id))
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
        selectedAccountId,
        setSelectedAccountId,
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
