"use client"

import React, { useState } from "react"
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Target, Activity,
  Briefcase, CheckCircle2, AlertTriangle, XCircle, BrainCircuit, FileText, ChevronDown
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Helper functions (mock implementations of what would be in @/lib/utils)
const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
const getPnLColor = (value: number) => value > 0 ? "text-green-500" : value < 0 ? "text-red-500" : "text-muted-foreground"

// Mock Data
const ACCOUNTS = [
  { id: "1", name: "FTMO 100K", balance: 103240, pnl: 3240 },
  { id: "2", name: "Personal 25K", balance: 24150, pnl: -850 },
]

const EQUITY_DATA = Array.from({ length: 30 }).map((_, i) => ({
  date: `2024-03-${String(i + 1).padStart(2, '0')}`,
  equity: 100000 + Math.random() * 5000 + (i * 100)
}))

const DAILY_PNL_DATA = Array.from({ length: 14 }).map((_, i) => ({
  date: `2024-03-${String(17 + i).padStart(2, '0')}`,
  pnl: (Math.random() * 2000) - 800
}))

const RECENT_TRADES = [
  { id: "t1", symbol: "EURUSD", direction: "long", pnl: 450, date: "2024-03-30", status: "win" },
  { id: "t2", symbol: "GBPUSD", direction: "short", pnl: -120, date: "2024-03-29", status: "loss" },
  { id: "t3", symbol: "XAUUSD", direction: "long", pnl: 1200, date: "2024-03-29", status: "win" },
  { id: "t4", symbol: "US30", direction: "short", pnl: 340, date: "2024-03-28", status: "win" },
  { id: "t5", symbol: "NQ100", direction: "long", pnl: -550, date: "2024-03-27", status: "loss" },
]

export default function DashboardPage() {
  const [selectedAccount, setSelectedAccount] = useState("1")

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNTS.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>Download Report</Button>
        </div>
      </div>

      {/* Top Row - Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$450.00</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">1.2%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$3,240.00</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">3.24%</span> all time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">64.5%</div>
            <Progress value={64.5} className="h-2 mt-2 [&>div]:bg-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">1.85</div>
            <p className="text-xs text-muted-foreground mt-1">Excellent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">2.1%</div>
            <p className="text-xs text-muted-foreground mt-1">Max 5.0%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">3 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 - Charts */}
      <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-7">
        <Card className="md:col-span-3 lg:col-span-4">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
            <CardDescription>Your account balance over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={EQUITY_DATA} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [formatCurrency(value), 'Equity']}
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
            <CardDescription>Profit and loss per day.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAILY_PNL_DATA} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    formatter={(value: number) => [formatCurrency(value), 'P&L']}
                  />
                  <Bar dataKey="pnl">
                    {DAILY_PNL_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your latest closed positions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Dir</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_TRADES.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">
                      <div>{trade.symbol}</div>
                      <div className="text-xs text-muted-foreground">{trade.date}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.direction === 'long' ? 'default' : 'outline'} className={trade.direction === 'long' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-transparent'}>
                        {trade.direction.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-semibold", getPnLColor(trade.pnl))}>
                      {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Prop Firm Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Progress</CardTitle>
            <CardDescription>FTMO 100K Challenge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center"><Target className="w-4 h-4 mr-2" /> Profit Target</span>
                <span className="text-green-500 font-medium">$3,240 / $10,000 (32%)</span>
              </div>
              <Progress value={32} className="h-2 [&>div]:bg-green-500" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Daily Loss Limit</span>
                <span className="text-muted-foreground">$5,000 Remaining</span>
              </div>
              <Progress value={100} className="h-2 [&>div]:bg-blue-500" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center"><XCircle className="w-4 h-4 mr-2" /> Max Drawdown</span>
                <span className="text-muted-foreground">$8,500 Remaining (15% used)</span>
              </div>
              <Progress value={85} className="h-2 [&>div]:bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
            <CardDescription>Stay focused on your objectives.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">Trade 20 Days Consecutively</div>
                <div className="text-xs text-muted-foreground">12/20 Days</div>
              </div>
              <Progress value={60} className="h-1.5" />
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">Keep Win Rate &gt; 60%</div>
                <div className="text-xs text-green-500">64.5%</div>
              </div>
              <Progress value={64.5} className="h-1.5 [&>div]:bg-green-500" />
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">No Revenge Trades</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                {[1,2,3,4,5].map(day => (
                  <div key={day} className={cn("h-6 flex-1 rounded-sm flex items-center justify-center", day <= 3 ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground")}>
                    {day <= 3 && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Journal Entries</CardTitle>
            <CardDescription>Your latest trading notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "FOMC Volatility Session", date: "Today, 2:30 PM", mood: "Focused", type: "neutral" },
              { title: "Over-traded London Session", date: "Yesterday", mood: "Frustrated", type: "negative" },
              { title: "Perfect Setup Execution", date: "Mar 28", mood: "Confident", type: "positive" }
            ].map((entry, i) => (
              <div key={i} className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 p-2 bg-muted rounded-full">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{entry.title}</h4>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  entry.type === 'positive' && "bg-green-500/10 text-green-500 border-green-500/20",
                  entry.type === 'negative' && "bg-red-500/10 text-red-500 border-red-500/20",
                )}>
                  {entry.mood}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BrainCircuit className="w-5 h-5 mr-2 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>Personalized analytics based on your trading data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-500">Strong Performance in London Session</h4>
                <p className="text-xs text-green-500/80 mt-1">Your win rate is 72% between 8AM-11AM GMT. Consider focusing your risk here.</p>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-500">Revenge Trading Pattern Detected</h4>
                <p className="text-xs text-yellow-500/80 mt-1">You often increase position size by 1.5x after two consecutive losses. Stick to your risk plan.</p>
              </div>
            </div>
            <div className="bg-muted border rounded-lg p-3 flex items-start space-x-3">
              <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">XAUUSD Volatility Warning</h4>
                <p className="text-xs text-muted-foreground mt-1">Average holding time on Gold has decreased. Are you cutting winners too early?</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
