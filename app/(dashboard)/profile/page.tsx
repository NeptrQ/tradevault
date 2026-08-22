'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Award, Lock, Edit, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const equityData = [
  { month: 'Jan', equity: 10000 },
  { month: 'Feb', equity: 10200 },
  { month: 'Mar', equity: 10150 },
  { month: 'Apr', equity: 10800 },
  { month: 'May', equity: 11200 },
  { month: 'Jun', equity: 11050 },
  { month: 'Jul', equity: 11900 },
  { month: 'Aug', equity: 12450 },
];

const topSymbols = [
  { symbol: 'EURUSD', trades: 45, winRate: 62, pnl: 3200 },
  { symbol: 'XAUUSD', trades: 38, winRate: 55, pnl: 4100 },
  { symbol: 'GBPUSD', trades: 28, winRate: 48, pnl: -450 },
  { symbol: 'US30', trades: 15, winRate: 71, pnl: 2850 },
  { symbol: 'BTCUSD', trades: 12, winRate: 58, pnl: 1150 },
];

const achievements = [
  { title: 'First Profitable Month', desc: 'Finished a month in green.', unlocked: true },
  { title: '50 Trades Logged', desc: 'Consistency is key.', unlocked: true },
  { title: '30-Day Journaling Streak', desc: 'Journaled every day for a month.', unlocked: false },
  { title: 'Risk Discipline Master', desc: '100 trades adhering to risk rules.', unlocked: false },
  { title: 'Funded Trader', desc: 'Passed a prop firm challenge.', unlocked: true },
  { title: '10R Trade', desc: 'Caught a 1:10 RR move.', unlocked: false },
];

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl">AT</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Alex Trader</h1>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                alex@example.com <span className="text-xs text-muted-foreground/50">•</span> 
                <Calendar className="w-3 h-3" /> Member since Jan 2024
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58.4%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$12,450</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trading Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 months</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Your equity curve over the last 8 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                    formatter={(value: number) => [`$${value}`, 'Equity']}
                  />
                  <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Symbols */}
        <Card>
          <CardHeader>
            <CardTitle>Top Symbols</CardTitle>
            <CardDescription>By profitability</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSymbols.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell className="font-medium">{item.symbol}</TableCell>
                    <TableCell className="text-right">{item.winRate}%</TableCell>
                    <TableCell className={cn("text-right font-medium", item.pnl > 0 ? "text-green-500" : "text-red-500")}>
                      {item.pnl > 0 ? '+' : ''}${Math.abs(item.pnl)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements & Badges</CardTitle>
          <CardDescription>Unlock badges by hitting milestones and maintaining discipline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((acc, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-4 rounded-lg border flex gap-4 items-start transition-colors",
                  acc.unlocked ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30 opacity-70 grayscale"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full",
                  acc.unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {acc.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-medium text-sm flex items-center gap-1.5">
                    {acc.title}
                    {acc.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{acc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
