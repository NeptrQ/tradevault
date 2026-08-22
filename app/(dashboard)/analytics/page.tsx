'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Activity, DollarSign, Crosshair, Plus
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTradeStore } from '@/lib/store';
import { 
  calculatePerformanceStats, 
  getEquityCurve, 
  getDailyPnL, 
  getMonthlyPnL, 
  getSymbolPerformance, 
  getStrategyPerformance, 
  getSessionPerformance, 
  getDayOfWeekPerformance,
  getRMultipleDistribution
} from '@/lib/analytics/calculations';

export default function AnalyticsPage() {
  const { accounts, trades, selectedAccountId, setSelectedAccountId, isLoaded } = useTradeStore();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('All');

  const symbolList = useMemo(() => {
    return ['all', ...Array.from(new Set(trades.map(t => t.symbol)))];
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchAcc = selectedAccountId === 'all' || trade.account_id === selectedAccountId;
      const matchSym = selectedSymbol === 'all' || trade.symbol === selectedSymbol;
      return matchAcc && matchSym;
    });
  }, [trades, selectedAccountId, selectedSymbol]);

  const currentAcc = accounts.find(a => a.id === selectedAccountId);
  const initialBal = currentAcc?.initial_balance || accounts.reduce((sum, a) => sum + (a.initial_balance || 0), 0) || 100000;

  const stats = useMemo(() => {
    return calculatePerformanceStats(filteredTrades, initialBal);
  }, [filteredTrades, initialBal]);

  const equityData = useMemo(() => {
    return getEquityCurve(filteredTrades, initialBal);
  }, [filteredTrades, initialBal]);

  const dailyPnlData = useMemo(() => {
    return getDailyPnL(filteredTrades);
  }, [filteredTrades]);

  const monthlyData = useMemo(() => {
    return getMonthlyPnL(filteredTrades);
  }, [filteredTrades]);

  const rDistData = useMemo(() => {
    return getRMultipleDistribution(filteredTrades);
  }, [filteredTrades]);

  const symbolStats = useMemo(() => {
    return getSymbolPerformance(filteredTrades);
  }, [filteredTrades]);

  const strategyStats = useMemo(() => {
    return getStrategyPerformance(filteredTrades);
  }, [filteredTrades]);

  const sessionStats = useMemo(() => {
    return getSessionPerformance(filteredTrades);
  }, [filteredTrades]);

  const dayOfWeekStats = useMemo(() => {
    return getDayOfWeekPerformance(filteredTrades);
  }, [filteredTrades]);

  const winLossData = useMemo(() => {
    const closed = filteredTrades.filter(t => t.status === 'closed');
    const wins = closed.filter(t => (t.net_pnl ?? 0) > 0).length;
    const losses = closed.filter(t => (t.net_pnl ?? 0) < 0).length;
    const be = closed.filter(t => (t.net_pnl ?? 0) === 0).length;
    return [
      { name: 'Wins', value: wins, color: '#22c55e' },
      { name: 'Losses', value: losses, color: '#ef4444' },
      { name: 'Breakeven', value: be, color: '#94a3b8' },
    ];
  }, [filteredTrades]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  if (filteredTrades.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        </div>
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Activity className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">No Trade Data Found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {accounts.length === 0 
                ? "You haven't added any trading accounts yet. Add an account and log trades to generate analytics."
                : "No closed trades match the selected account filter. Log a trade to populate the performance charts."
              }
            </p>
            <Link href="/trades/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Log a Trade
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive statistical analysis of your closed trades.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Symbol" />
            </SelectTrigger>
            <SelectContent>
              {symbolList.map(sym => (
                <SelectItem key={sym} value={sym}>{sym === 'all' ? 'All Symbols' : sym}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center rounded-md border p-1 bg-muted/50">
            {['1W', '1M', '3M', '6M', 'YTD', 'All'].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "ghost"}
                size="sm"
                className={cn("h-7 px-3 text-xs", dateRange === range ? "shadow-sm" : "")}
                onClick={() => setDateRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        <MetricCard 
          title="Total P&amp;L" 
          value={`${stats.total_pnl > 0 ? '+' : ''}${formatCurrency(stats.total_pnl)}`} 
          icon={<DollarSign />} 
          trend={stats.total_pnl >= 0 ? "up" : "down"} 
        />
        <MetricCard title="Win Rate" value={`${stats.win_rate.toFixed(1)}%`} icon={<Target />} trend={stats.win_rate >= 50 ? "up" : "down"} />
        <MetricCard title="Profit Factor" value={stats.profit_factor === Infinity ? "∞" : stats.profit_factor.toFixed(2)} icon={<TrendingUp />} trend={stats.profit_factor >= 1.5 ? "up" : "down"} />
        <MetricCard title="Expectancy" value={`${stats.expectancy > 0 ? '+' : ''}${formatCurrency(stats.expectancy)}`} icon={<Activity />} />
        <MetricCard title="Avg R" value={`${stats.avg_r > 0 ? '+' : ''}${stats.avg_r.toFixed(2)}R`} icon={<Crosshair />} />
        <MetricCard title="Max Drawdown" value={`-${stats.max_drawdown.toFixed(1)}%`} icon={<TrendingDown />} trend="down" negative />
        <MetricCard title="Avg Win" value={`+${formatCurrency(stats.avg_win)}`} icon={<TrendingUp className="text-green-500" />} />
        <MetricCard title="Avg Loss" value={`-${formatCurrency(stats.avg_loss)}`} icon={<TrendingDown className="text-red-500" />} />
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Performance Visualizations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="equity" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="equity">Equity Curve</TabsTrigger>
              <TabsTrigger value="daily">Daily P&amp;L</TabsTrigger>
              <TabsTrigger value="monthly">Monthly P&amp;L</TabsTrigger>
              <TabsTrigger value="rdist">R Distribution</TabsTrigger>
              <TabsTrigger value="winloss">Win/Loss Ratio</TabsTrigger>
            </TabsList>

            <TabsContent value="equity" className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: any) => [formatCurrency(value as number), 'Equity']}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="daily" className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnlData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    formatter={(value: any) => [formatCurrency(value as number), 'P&L']}
                  />
                  <Bar dataKey="pnl">
                    {dailyPnlData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="monthly" className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    formatter={(value: any) => [formatCurrency(value as number), 'P&L']}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="rdist" className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rDistData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="r" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="winloss" className="h-[380px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={130}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Symbol Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Symbol Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {symbolStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No symbol history</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    <TableHead className="text-right">P&amp;L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {symbolStats.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell className="text-right">{item.trades}</TableCell>
                      <TableCell className="text-right">{item.win_rate.toFixed(0)}%</TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold",
                        item.total_pnl > 0 ? "text-green-500" : item.total_pnl < 0 ? "text-red-500" : ""
                      )}>
                        {item.total_pnl > 0 ? '+' : ''}{formatCurrency(item.total_pnl)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Strategy Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strategy Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {strategyStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No strategy history</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    <TableHead className="text-right">P&amp;L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategyStats.map((item) => (
                    <TableRow key={item.strategy}>
                      <TableCell className="font-medium">{item.strategy}</TableCell>
                      <TableCell className="text-right">{item.trades}</TableCell>
                      <TableCell className="text-right">{item.win_rate.toFixed(0)}%</TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold",
                        item.total_pnl > 0 ? "text-green-500" : item.total_pnl < 0 ? "text-red-500" : ""
                      )}>
                        {item.total_pnl > 0 ? '+' : ''}{formatCurrency(item.total_pnl)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Session Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No session history</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    <TableHead className="text-right">P&amp;L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionStats.map((item) => (
                    <TableRow key={item.session}>
                      <TableCell className="font-medium">{item.session}</TableCell>
                      <TableCell className="text-right">{item.trades}</TableCell>
                      <TableCell className="text-right">{item.win_rate.toFixed(0)}%</TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold",
                        item.total_pnl > 0 ? "text-green-500" : item.total_pnl < 0 ? "text-red-500" : ""
                      )}>
                        {item.total_pnl > 0 ? '+' : ''}{formatCurrency(item.total_pnl)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Day of Week Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Day of Week Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {dayOfWeekStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No day history</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    <TableHead className="text-right">P&amp;L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayOfWeekStats.map((item) => (
                    <TableRow key={item.day}>
                      <TableCell className="font-medium">{item.day}</TableCell>
                      <TableCell className="text-right">{item.trades}</TableCell>
                      <TableCell className="text-right">{item.win_rate.toFixed(0)}%</TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold",
                        item.total_pnl > 0 ? "text-green-500" : item.total_pnl < 0 ? "text-red-500" : ""
                      )}>
                        {item.total_pnl > 0 ? '+' : ''}{formatCurrency(item.total_pnl)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, negative }: { title: string, value: string, icon: React.ReactNode, trend?: 'up' | 'down', negative?: boolean }) {
  return (
    <Card className="flex flex-col justify-center p-3.5">
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
        <div className="text-muted-foreground opacity-50 flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className={cn(
          "text-base font-bold",
          trend === 'up' && !negative ? 'text-green-500' : '',
          trend === 'down' && negative ? 'text-red-500' : ''
        )}>
          {value}
        </span>
      </div>
    </Card>
  );
}
