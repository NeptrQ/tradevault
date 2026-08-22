'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorProgress } from '@/components/ui/color-progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useTradeStore } from '@/lib/store';
import { calculatePerformanceStats, getEquityCurve, getDailyPnL } from '@/lib/analytics/calculations';

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;
  const { accounts, trades, isLoaded } = useTradeStore();

  const account = useMemo(() => accounts.find(a => a.id === accountId), [accounts, accountId]);
  const accountTrades = useMemo(() => trades.filter(t => t.account_id === accountId), [trades, accountId]);
  const stats = useMemo(() => calculatePerformanceStats(accountTrades, account?.initial_balance || 100000), [accountTrades, account]);
  const equityData = useMemo(() => getEquityCurve(accountTrades, account?.initial_balance || 100000), [accountTrades, account]);
  const dailyPnlData = useMemo(() => getDailyPnL(accountTrades), [accountTrades]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading account...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-4">
        <ShieldAlert className="w-12 h-12 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-bold">Account Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This account may have been deleted or does not exist.
        </p>
        <Link href="/accounts">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Accounts
          </Button>
        </Link>
      </div>
    );
  }

  const profitTarget = account.profit_target || 5000;
  const targetPct = Math.min(100, Math.max(0, Math.round((stats.total_pnl / profitTarget) * 100)));
  const dailyLimit = account.daily_loss_limit || 2500;
  const maxTotalLoss = account.max_total_loss || 5000;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-2">
        <Link href="/accounts">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">Accounts / <span className="text-foreground">{account.name}</span></div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
            <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 capitalize">{account.type.replace('_', ' ')}</Badge>
            <Badge variant="outline" className="text-green-500 border-green-500/30 capitalize">{account.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Broker: {account.broker || 'Default'} <span className="text-xs">•</span> Currency: {account.currency}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Balance</div>
            <div className="text-xl font-bold">{formatCurrency(account.current_balance || account.initial_balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Initial Balance</div>
            <div className="text-xl font-bold">{formatCurrency(account.initial_balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total P&amp;L</div>
            <div className={cn("text-xl font-bold", stats.total_pnl >= 0 ? "text-green-500" : "text-red-500")}>
              {stats.total_pnl >= 0 ? '+' : ''}{formatCurrency(stats.total_pnl)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Win Rate</div>
            <div className="text-xl font-bold">{stats.win_rate.toFixed(0)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Trades</div>
            <div className="text-xl font-bold">{accountTrades.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Max Drawdown</div>
            <div className="text-xl font-bold text-red-500">{stats.max_drawdown.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Prop Firm Progress Section */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Account Objectives &amp; Risk Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit Target</span>
                <span className="font-medium">{formatCurrency(stats.total_pnl > 0 ? stats.total_pnl : 0)} / {formatCurrency(profitTarget)}</span>
              </div>
              <ColorProgress value={targetPct} className="h-2" indicatorColor="bg-green-500" />
              <p className="text-xs text-muted-foreground text-right">{targetPct}% Completed</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Daily Loss Limit</span>
                <span className="font-medium">{formatCurrency(dailyLimit)}</span>
              </div>
              <ColorProgress value={0} className="h-2" indicatorColor="bg-blue-500" />
              <p className="text-xs text-muted-foreground text-right">{formatCurrency(dailyLimit)} safe buffer</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Total Drawdown</span>
                <span className="font-medium">{formatCurrency(maxTotalLoss)} limit</span>
              </div>
              <ColorProgress value={Math.min(100, Math.round(stats.max_drawdown * 5))} className="h-2" indicatorColor="bg-red-500" />
              <p className="text-xs text-muted-foreground text-right">{stats.max_drawdown.toFixed(1)}% used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="equity">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance Analytics</h3>
              <TabsList>
                <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                <TabsTrigger value="daily">Daily P&amp;L</TabsTrigger>
              </TabsList>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <TabsContent value="equity" className="m-0 h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEquityAcc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 500', 'dataMax + 500']} tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        formatter={(value: any) => [formatCurrency(value as number), 'Equity']}
                      />
                      <Area type="monotone" dataKey="equity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEquityAcc)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="daily" className="m-0 h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPnlData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        formatter={(value: any) => [formatCurrency(value as number), 'P&L']}
                      />
                      <Bar dataKey="pnl" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Rules &amp; Discipline</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Risk Per Setup</h4>
                    <p className="text-xs text-muted-foreground mt-1">Keep risk under 1-2% of current balance.</p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Daily Trade Limit</h4>
                    <p className="text-xs text-muted-foreground mt-1">Max {account.max_trades_per_day || 5} trades per trading session.</p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Mandatory Stop Loss</h4>
                    <p className="text-xs text-muted-foreground mt-1">Every trade must have a predefined hard stop.</p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Post-Loss Buffer</h4>
                    <p className="text-xs text-muted-foreground mt-1">Wait 15 minutes after any loss before re-entering.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Account Trades</h3>
        <Card>
          <CardContent className="p-0">
            {accountTrades.length === 0 ? (
              <p className="p-6 text-sm text-center text-muted-foreground">No trades recorded for this account yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Lot Size</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Exit Price</TableHead>
                    <TableHead className="text-right">P&amp;L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountTrades.slice(0, 10).map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={trade.direction === 'long' ? 'text-blue-500 border-blue-500/20' : 'text-orange-500 border-orange-500/20'}>
                          {trade.direction.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{trade.lot_size}</TableCell>
                      <TableCell>{trade.entry_price}</TableCell>
                      <TableCell>{trade.exit_price || '-'}</TableCell>
                      <TableCell className={cn("text-right font-medium", (trade.net_pnl ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
                        {(trade.net_pnl ?? 0) >= 0 ? '+' : ''}{formatCurrency(trade.net_pnl ?? 0)}
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
