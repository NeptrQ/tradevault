"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Target, Activity,
  Briefcase, CheckCircle2, AlertTriangle, XCircle, BrainCircuit, FileText, Plus, Wallet
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, formatCurrency } from "@/lib/utils"
import { useTradeStore } from "@/lib/store"
import { calculatePerformanceStats, getEquityCurve, getDailyPnL } from "@/lib/analytics/calculations"

export default function DashboardPage() {
  const { accounts, trades, goals, journalEntries, selectedAccountId, setSelectedAccountId, isLoaded } = useTradeStore()

  const currentAccount = useMemo(() => {
    return accounts.find(a => a.id === selectedAccountId)
  }, [accounts, selectedAccountId])

  const filteredTrades = useMemo(() => {
    if (selectedAccountId === "all") return trades
    return trades.filter(t => t.account_id === selectedAccountId)
  }, [trades, selectedAccountId])

  const initialBal = currentAccount?.initial_balance || accounts.reduce((sum, a) => sum + (a.initial_balance || 0), 0) || 100000

  const stats = useMemo(() => {
    return calculatePerformanceStats(filteredTrades, initialBal)
  }, [filteredTrades, initialBal])

  const equityData = useMemo(() => {
    if (filteredTrades.length === 0) {
      return [{ date: "Today", equity: initialBal, pnl: 0 }]
    }
    return getEquityCurve(filteredTrades, initialBal)
  }, [filteredTrades, initialBal])

  const dailyPnlData = useMemo(() => {
    if (filteredTrades.length === 0) return []
    return getDailyPnL(filteredTrades)
  }, [filteredTrades])

  const recentTrades = useMemo(() => {
    return [...filteredTrades]
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
      .slice(0, 5)
  }, [filteredTrades])

  const activeGoals = useMemo(() => {
    return goals.filter(g => selectedAccountId === "all" || g.account_id === selectedAccountId || !g.account_id)
  }, [goals, selectedAccountId])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Wallet className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">No active trading accounts</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven&apos;t added any trading accounts yet. Add an account to see your performance metrics and live analytics.
            </p>
            <Link href="/accounts">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {currentAccount ? currentAccount.name : "All Accounts Combined"} Overview
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts ({accounts.length})</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/trades/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Log Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Row - Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stats.total_pnl > 0 ? "text-green-500" : stats.total_pnl < 0 ? "text-red-500" : "")}>
              {stats.total_pnl > 0 ? "+" : ""}{formatCurrency(stats.total_pnl)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {stats.total_pnl >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span>{initialBal > 0 ? ((stats.total_pnl / initialBal) * 100).toFixed(2) : 0}% return</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.win_rate.toFixed(1)}%</div>
            <Progress value={stats.win_rate} className="h-2 mt-2 [&>div]:bg-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stats.profit_factor >= 1.5 ? "text-green-500" : "")}>
              {stats.profit_factor === Infinity ? "∞" : stats.profit_factor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.profit_factor >= 1.5 ? "Solid Edge" : stats.profit_factor >= 1 ? "Breakeven / Fair" : "Needs Review"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stats.max_drawdown > 5 ? "text-red-500" : "text-yellow-500")}>
              {stats.max_drawdown.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Max peak drop</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg R-Multiple</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stats.avg_r > 0 ? "text-green-500" : "")}>
              {stats.avg_r > 0 ? "+" : ""}{stats.avg_r.toFixed(2)}R
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per trade reward</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_trades}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.winning_trades}W / {stats.losing_trades}L
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 - Charts */}
      <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-7">
        <Card className="md:col-span-3 lg:col-span-4">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
            <CardDescription>Cumulative portfolio value over time.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} domain={['dataMin - 500', 'dataMax + 500']} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: any) => [formatCurrency(value as number), 'Equity']}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily P&L</CardTitle>
            <CardDescription>Profit and loss per trading day.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[280px]">
              {dailyPnlData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyPnlData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      formatter={(value: any) => [formatCurrency(value as number), 'P&L']}
                    />
                    <Bar dataKey="pnl">
                      {dailyPnlData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No trade history to chart yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Trades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Latest logged positions.</CardDescription>
            </div>
            <Link href="/trades" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No trades logged yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Dir</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">
                        <div>{trade.symbol}</div>
                        <div className="text-xs text-muted-foreground">{trade.entry_date.slice(0, 10)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trade.direction === 'long' ? 'default' : 'outline'} className={trade.direction === 'long' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-transparent'}>
                          {trade.direction.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-right font-semibold", (trade.net_pnl ?? 0) > 0 ? "text-green-500" : (trade.net_pnl ?? 0) < 0 ? "text-red-500" : "")}>
                        {(trade.net_pnl ?? 0) > 0 ? '+' : ''}{formatCurrency(trade.net_pnl ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Account Evaluation / Target */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge &amp; Limits</CardTitle>
            <CardDescription>{currentAccount ? currentAccount.name : "Active Rules"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center"><Target className="w-4 h-4 mr-2" /> Profit Target</span>
                <span className="text-green-500 font-medium">
                  {currentAccount?.profit_target ? `${formatCurrency(Math.max(0, stats.total_pnl))} / ${formatCurrency(currentAccount.profit_target)}` : "No Target"}
                </span>
              </div>
              <Progress 
                value={currentAccount?.profit_target ? Math.min(100, Math.max(0, (stats.total_pnl / currentAccount.profit_target) * 100)) : 0} 
                className="h-2 [&>div]:bg-green-500" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Daily Loss Limit</span>
                <span className="text-muted-foreground">
                  {currentAccount?.daily_loss_limit ? `${formatCurrency(currentAccount.daily_loss_limit)} Limit` : "Configured in Settings"}
                </span>
              </div>
              <Progress value={100} className="h-2 [&>div]:bg-blue-500" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center"><XCircle className="w-4 h-4 mr-2" /> Max Drawdown Buffer</span>
                <span className="text-muted-foreground">
                  {currentAccount?.max_total_loss ? `${formatCurrency(currentAccount.max_total_loss - Math.max(0, -stats.total_pnl))} left` : "Safe"}
                </span>
              </div>
              <Progress 
                value={currentAccount?.max_total_loss ? Math.min(100, (Math.max(0, -stats.total_pnl) / currentAccount.max_total_loss) * 100) : 0} 
                className="h-2 [&>div]:bg-blue-500" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Track objectives.</CardDescription>
            </div>
            <Link href="/goals" className="text-xs text-primary hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No goals set yet.</p>
            ) : (
              activeGoals.slice(0, 3).map((goal) => {
                const pct = Math.min(100, Math.round((goal.current_value / (goal.target_value || 1)) * 100))
                return (
                  <div key={goal.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{goal.title}</div>
                      <div className="text-xs text-muted-foreground">{pct}%</div>
                    </div>
                    <Progress value={pct} className="h-1.5 [&>div]:bg-primary" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Journal Entries</CardTitle>
              <CardDescription>Latest trading notes &amp; reflections.</CardDescription>
            </div>
            <Link href="/journal" className="text-xs text-primary hover:underline">
              View Journal
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {journalEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No journal entries written yet.</p>
            ) : (
              journalEntries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 p-2 bg-muted rounded-full">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{entry.title}</h4>
                      <p className="text-xs text-muted-foreground">{entry.entry_date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {entry.mood || "Note"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <BrainCircuit className="w-5 h-5 mr-2 text-primary" />
              <div>
                <CardTitle>Smart Review AI</CardTitle>
                <CardDescription>Performance pattern feedback.</CardDescription>
              </div>
            </div>
            <Link href="/ai-review" className="text-xs text-primary hover:underline">
              Full AI Report
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.win_rate >= 55 ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-500">Positive Edge &amp; Win Rate</h4>
                  <p className="text-xs text-green-500/80 mt-1">Your win rate of {stats.win_rate.toFixed(1)}% is outperforming the benchmark. Keep following your setups.</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-500">Win Rate Optimization Needed</h4>
                  <p className="text-xs text-yellow-500/80 mt-1">Review losing trades in your journal to filter out low-probability setups.</p>
                </div>
              </div>
            )}
            <div className="bg-muted border rounded-lg p-3 flex items-start space-x-3">
              <Activity className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-medium">Risk Discipline Check</h4>
                <p className="text-xs text-muted-foreground mt-1">Average R reward is {stats.avg_r.toFixed(2)}R. Ensure stop losses are consistently respected.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
