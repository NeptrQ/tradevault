'use client';

import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Filter, Calendar as CalendarIcon, TrendingUp, TrendingDown, 
  Percent, Target, Activity, DollarSign, Crosshair
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// --- Demo Data ---

const equityData = Array.from({ length: 90 }, (_, i) => ({
  day: i + 1,
  equity: 10000 + (Math.sin(i / 10) * 500) + (i * 20) + (Math.random() * 200 - 100)
}));

const dailyPnlData = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-08-${(i + 1).toString().padStart(2, '0')}`,
  pnl: Math.random() > 0.4 ? Math.floor(Math.random() * 500) : -Math.floor(Math.random() * 300)
}));

const monthlyData = [
  { month: 'Jan', pnl: 1200 }, { month: 'Feb', pnl: -400 }, { month: 'Mar', pnl: 2100 },
  { month: 'Apr', pnl: 1500 }, { month: 'May', pnl: -800 }, { month: 'Jun', pnl: 3200 },
  { month: 'Jul', pnl: 2800 }, { month: 'Aug', pnl: 1800 },
];

const drawdownData = Array.from({ length: 90 }, (_, i) => {
  const dd = Math.min(0, Math.sin(i / 5) * 5 - (Math.random() * 2));
  return { day: i + 1, drawdown: dd };
});

const rDistributionData = [
  { r: '< -1R', count: 12 }, { r: '-1R', count: 35 }, { r: '-0.5R', count: 15 },
  { r: 'Break Even', count: 20 }, { r: '+1R', count: 25 }, { r: '+2R', count: 18 },
  { r: '+3R', count: 10 }, { r: '> +3R', count: 5 }
];

const winLossData = [
  { name: 'Wins', value: 58, color: '#22c55e' },
  { name: 'Losses', value: 35, color: '#ef4444' },
  { name: 'Break Even', value: 7, color: '#94a3b8' }
];

const symbolPerformance = [
  { symbol: 'EURUSD', trades: 40, winRate: 65, pnl: 1250, avgPnl: 31.25, pf: 2.4 },
  { symbol: 'GBPUSD', trades: 30, winRate: 55, pnl: 850, avgPnl: 28.33, pf: 1.8 },
  { symbol: 'XAUUSD', trades: 25, winRate: 45, pnl: -350, avgPnl: -14.00, pf: 0.8 },
  { symbol: 'NASDAQ', trades: 20, winRate: 70, pnl: 2100, avgPnl: 105.00, pf: 3.2 },
  { symbol: 'US30', trades: 35, winRate: 52, pnl: 450, avgPnl: 12.85, pf: 1.2 },
];

const strategyPerformance = [
  { strategy: 'Breakout', trades: 50, winRate: 62, pnl: 1800, expectancy: 36.0 },
  { strategy: 'Trend Follow', trades: 40, winRate: 55, pnl: 1200, expectancy: 30.0 },
  { strategy: 'Reversal', trades: 30, winRate: 40, pnl: -250, expectancy: -8.3 },
  { strategy: 'Scalp', trades: 30, winRate: 72, pnl: 1550, expectancy: 51.6 },
];

const sessionPerformance = [
  { session: 'London', trades: 60, winRate: 60, pnl: 2100 },
  { session: 'New York', trades: 50, winRate: 58, pnl: 1850 },
  { session: 'Asian', trades: 25, winRate: 45, pnl: -350 },
  { session: 'After Hours', trades: 15, winRate: 50, pnl: 100 },
];

const dayOfWeekPerformance = [
  { day: 'Monday', trades: 35, winRate: 55, pnl: 850 },
  { day: 'Tuesday', trades: 28, winRate: 68, pnl: 1400 },
  { day: 'Wednesday', trades: 32, winRate: 60, pnl: 1100 },
  { day: 'Thursday', trades: 25, winRate: 40, pnl: -400 },
  { day: 'Friday', trades: 30, winRate: 65, pnl: 1350 },
];

// --- Components ---

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('3M');

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your trading performance metrics.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="all-accounts">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-accounts">All Accounts</SelectItem>
              <SelectItem value="live-1">Live Account 1</SelectItem>
              <SelectItem value="prop-1">Prop Firm 1</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-symbols">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Symbol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-symbols">All Symbols</SelectItem>
              <SelectItem value="eurusd">EURUSD</SelectItem>
              <SelectItem value="nq">NASDAQ</SelectItem>
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
        <MetricCard title="Total P&L" value="$4,300" icon={<DollarSign />} trend="up" />
        <MetricCard title="Win Rate" value="58%" icon={<Target />} trend="up" />
        <MetricCard title="Profit Factor" value="2.1" icon={<TrendingUp />} trend="up" />
        <MetricCard title="Expectancy" value="$28.6" icon={<Activity />} />
        <MetricCard title="Avg R" value="1.4R" icon={<Crosshair />} />
        <MetricCard title="Max Drawdown" value="-4.2%" icon={<TrendingDown />} trend="down" negative />
        <MetricCard title="Avg Win" value="$245" icon={<TrendingUp className="text-green-500" />} />
        <MetricCard title="Avg Loss" value="-$115" icon={<TrendingDown className="text-red-500" />} />
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Performance Charts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="equity" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="equity">Equity Curve</TabsTrigger>
              <TabsTrigger value="daily">Daily P&L</TabsTrigger>
              <TabsTrigger value="monthly">Monthly P&L</TabsTrigger>
              <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
              <TabsTrigger value="rdist">R Distribution</TabsTrigger>
              <TabsTrigger value="winloss">Win/Loss</TabsTrigger>
            </TabsList>

            <TabsContent value="equity" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" hide />
                  <YAxis domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
                    labelFormatter={() => ''}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="daily" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnlData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(val) => val.substring(8,10)} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    formatter={(value: number) => [`$${value}`, 'P&L']}
                  />
                  <Bar dataKey="pnl">
                    {dailyPnlData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="monthly" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="drawdown" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drawdownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" hide />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
                  />
                  <Area type="step" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#colorDd)" />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="rdist" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

            <TabsContent value="winloss" className="h-[400px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
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
            <CardTitle className="text-lg">Symbol Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {symbolPerformance.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell className="font-medium">{item.symbol}</TableCell>
                    <TableCell className="text-right">{item.trades}</TableCell>
                    <TableCell className="text-right">{item.winRate}%</TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      item.pnl > 0 ? "text-green-500" : item.pnl < 0 ? "text-red-500" : ""
                    )}>
                      {item.pnl > 0 ? '+' : ''}${item.pnl}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Strategy Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strategy Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Strategy</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategyPerformance.map((item) => (
                  <TableRow key={item.strategy}>
                    <TableCell className="font-medium">{item.strategy}</TableCell>
                    <TableCell className="text-right">{item.trades}</TableCell>
                    <TableCell className="text-right">{item.winRate}%</TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      item.pnl > 0 ? "text-green-500" : item.pnl < 0 ? "text-red-500" : ""
                    )}>
                      {item.pnl > 0 ? '+' : ''}${item.pnl}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Session Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionPerformance.map((item) => (
                  <TableRow key={item.session}>
                    <TableCell className="font-medium">{item.session}</TableCell>
                    <TableCell className="text-right">{item.trades}</TableCell>
                    <TableCell className="text-right">{item.winRate}%</TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      item.pnl > 0 ? "text-green-500" : item.pnl < 0 ? "text-red-500" : ""
                    )}>
                      {item.pnl > 0 ? '+' : ''}${item.pnl}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Day of Week Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Day of Week Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayOfWeekPerformance.map((item) => (
                  <TableRow key={item.day}>
                    <TableCell className="font-medium">{item.day}</TableCell>
                    <TableCell className="text-right">{item.trades}</TableCell>
                    <TableCell className="text-right">{item.winRate}%</TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      item.pnl > 0 ? "text-green-500" : item.pnl < 0 ? "text-red-500" : ""
                    )}>
                      {item.pnl > 0 ? '+' : ''}${item.pnl}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// --- Helper Component ---
function MetricCard({ title, value, icon, trend, negative }: { title: string, value: string, icon: React.ReactNode, trend?: 'up' | 'down', negative?: boolean }) {
  return (
    <Card className="flex flex-col justify-center p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
        <div className="text-muted-foreground opacity-50 flex-shrink-0 w-4 h-4 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn(
          "text-lg font-bold",
          trend === 'up' && !negative ? 'text-green-500' : '',
          trend === 'down' && negative ? 'text-red-500' : '' // e.g. Max Drawdown
        )}>
          {value}
        </span>
      </div>
    </Card>
  );
}
