'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorProgress } from '@/components/ui/color-progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data
const equityData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  equity: 50000 + (Math.random() * 5000 - 1000) + (i * 150),
}));

const dailyPnlData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  pnl: (Math.random() * 800) - 300,
}));

const recentTrades = [
  { id: '1', symbol: 'EURUSD', type: 'Long', lot: 2.5, openTime: '2023-10-24 09:30', closeTime: '2023-10-24 11:45', pnl: 450.2 },
  { id: '2', symbol: 'GBPUSD', type: 'Short', lot: 1.0, openTime: '2023-10-24 14:15', closeTime: '2023-10-24 14:30', pnl: -120.5 },
  { id: '3', symbol: 'XAUUSD', type: 'Long', lot: 0.5, openTime: '2023-10-23 08:00', closeTime: '2023-10-23 15:20', pnl: 890.0 },
  { id: '4', symbol: 'US30', type: 'Short', lot: 5.0, openTime: '2023-10-23 16:30', closeTime: '2023-10-23 17:00', pnl: 1250.0 },
  { id: '5', symbol: 'EURJPY', type: 'Long', lot: 2.0, openTime: '2023-10-20 04:15', closeTime: '2023-10-20 10:10', pnl: -340.0 },
];

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;
  
  // In a real app, fetch account details based on accountId
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/accounts">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">Accounts / <span className="text-foreground">FTMO 50k Challenge</span></div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">FTMO 50k Challenge</h1>
            <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Prop Firm</Badge>
            <Badge variant="outline" className="text-green-500 border-green-500/30">Active</Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Broker: FTMO MT5 <span className="text-xs">•</span> Account: #8492015
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="w-4 h-4" /> View Credentials
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Balance</div>
            <div className="text-xl font-bold">$53,240.50</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Equity</div>
            <div className="text-xl font-bold">$53,240.50</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total P&L</div>
            <div className="text-xl font-bold text-green-500">+$3,240.50</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Win Rate</div>
            <div className="text-xl font-bold">62%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Trades</div>
            <div className="text-xl font-bold">48</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Max Drawdown</div>
            <div className="text-xl font-bold text-red-500">2.1%</div>
          </CardContent>
        </Card>
      </div>

      {/* Prop Firm Progress Section */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Challenge Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit Target (10%)</span>
                <span className="font-medium">$3,240 / $5,000</span>
              </div>
              <ColorProgress value={64.8} className="h-2" indicatorColor="bg-green-500" />
              <p className="text-xs text-muted-foreground text-right">64.8% Completed</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Daily Loss (5%)</span>
                <span className="font-medium">$0 / $2,500</span>
              </div>
              <ColorProgress value={0} className="h-2" indicatorColor="bg-blue-500" />
              <p className="text-xs text-muted-foreground text-right">$2,500 remaining today</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Total Loss (10%)</span>
                <span className="font-medium">Highest DD: $1,050 / $5,000</span>
              </div>
              <ColorProgress value={21} className="h-2" indicatorColor="bg-blue-500" />
              <p className="text-xs text-muted-foreground text-right">21% of limit used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="equity">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Account Performance</h3>
              <TabsList>
                <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                <TabsTrigger value="daily">Daily P&L</TabsTrigger>
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" tickLine={false} axisLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                      <Area type="monotone" dataKey="equity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEquityAcc)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="daily" className="m-0 h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPnlData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                      <Bar 
                        dataKey="pnl" 
                        fill="#3b82f6" 
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props;
                          return <rect x={x} y={y} width={width} height={height} fill={payload.pnl >= 0 ? '#22c55e' : '#ef4444'} rx={2} />;
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Account Rules</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Minimum Trading Days</h4>
                    <p className="text-xs text-muted-foreground mt-1">4 days completed (minimum 4 required).</p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">News Trading</h4>
                    <p className="text-xs text-muted-foreground mt-1">Allowed on this account type.</p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Weekend Holding</h4>
                    <p className="text-xs text-muted-foreground mt-1">Not allowed. All trades must be closed by Friday 4PM EST.</p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Account Expiration</h4>
                    <p className="text-xs text-muted-foreground mt-1">Unlimited time to pass the challenge.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Lot Size</TableHead>
                  <TableHead>Open Time</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={trade.type === 'Long' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}>
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{trade.lot}</TableCell>
                    <TableCell className="text-muted-foreground">{trade.openTime}</TableCell>
                    <TableCell className={cn("text-right font-medium", trade.pnl >= 0 ? "text-green-500" : "text-red-500")}>
                      {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
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
