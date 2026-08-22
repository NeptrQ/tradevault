'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Pencil, Trash2, Clock, CalendarDays, TrendingUp, TrendingDown,
  Target, AlertTriangle, CheckCircle2, XCircle, BrainCircuit, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Demo data for a single trade
const DEMO_TRADE = {
  id: '1',
  account: 'FTMO 100k',
  symbol: 'EURUSD',
  direction: 'Long',
  status: 'Closed',
  strategy: 'Breakout',
  entryDate: 'Aug 22, 2026',
  entryTime: '09:30 AM',
  exitDate: 'Aug 22, 2026',
  exitTime: '11:45 AM',
  duration: '2h 15m',
  entryPrice: 1.10500,
  exitPrice: 1.10800,
  stopLoss: 1.10300,
  takeProfit: 1.11000,
  lotSize: 5.0,
  riskAmount: 1000,
  riskPercentage: 1.0,
  plannedRR: 2.5,
  pnl: 1500,
  commission: 15,
  swap: 0,
  netPnl: 1485,
  rMultiple: 1.48,
  emotions: {
    before: 'Focused',
    during: 'Calm',
    after: 'Confident',
    confidence: 8
  },
  notes: {
    entry: 'Clear breakout of 1H resistance with strong volume confirmation.',
    exit: 'Price started stalling near minor resistance, decided to take profits manually.',
    wentWell: 'Followed my plan and waited for the candle close before entering.',
    wentWrong: 'Exited a bit too early, missed full TP.',
    lesson: 'Trust the higher timeframe targets when momentum is strong.'
  },
  tags: ['Morning Session', 'Trend Continuation', 'A+ Setup']
};

export default function TradeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const trade = DEMO_TRADE; // In real app, fetch based on params.id

  const isWin = trade.netPnl > 0;
  const isLoss = trade.netPnl < 0;

  const handleDelete = () => {
    toast.success('Trade deleted successfully');
    router.push('/trades');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{trade.symbol}</h1>
              <Badge variant={trade.direction === 'Long' ? 'default' : 'secondary'} className={cn(
                trade.direction === 'Long' ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
              )}>
                {trade.direction}
              </Badge>
              <Badge variant="outline" className={cn(
                trade.status === 'Open' && "bg-yellow-500/10 text-yellow-500",
                trade.status === 'Closed' && "bg-gray-500/10 text-gray-500",
              )}>
                {trade.status}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <CalendarDays className="w-4 h-4" /> {trade.entryDate} • {trade.account} • {trade.strategy}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/trades/${trade.id}/edit`}>
            <Button variant="outline">
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this trade? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trade Details & Risk */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Execution Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> Entry Price</span>
                  <span className="font-medium">{trade.entryPrice}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><TrendingDown className="w-4 h-4 text-orange-500"/> Exit Price</span>
                  <span className="font-medium">{trade.exitPrice || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4"/> Lot Size</span>
                  <span className="font-medium">{trade.lotSize}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Entry Time</span>
                    <span className="text-sm font-medium">{trade.entryTime}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Exit Time</span>
                    <span className="text-sm font-medium">{trade.exitTime || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Duration</span>
                    <span className="text-sm font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> {trade.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Risk Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500"/> Stop Loss</span>
                  <span className="font-medium text-red-500">{trade.stopLoss}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4 text-green-500"/> Take Profit</span>
                  <span className="font-medium text-green-500">{trade.takeProfit}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Risk Amount</span>
                  <span className="font-medium">${trade.riskAmount} ({trade.riskPercentage}%)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Planned R:R</span>
                  <span className="font-medium">1:{trade.plannedRR}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Journal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Why did I enter?</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded-md min-h-20">{trade.notes.entry}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Why did I exit?</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded-md min-h-20">{trade.notes.exit}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> What went well?
                  </h4>
                  <p className="text-sm bg-green-500/5 p-3 rounded-md border border-green-500/10 min-h-20">{trade.notes.wentWell}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> What went wrong?
                  </h4>
                  <p className="text-sm bg-red-500/5 p-3 rounded-md border border-red-500/10 min-h-20">{trade.notes.wentWrong}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                  <BrainCircuit className="w-4 h-4" /> Lesson Learned
                </h4>
                <p className="text-sm bg-blue-500/5 p-3 rounded-md border border-blue-500/10 font-medium">{trade.notes.lesson}</p>
              </div>
              <div className="flex gap-2 pt-2">
                {trade.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Screenshots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Before Trade</span>
                  <div className="aspect-video bg-muted/50 rounded-md border flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <p className="text-muted-foreground text-sm">Image Placeholder</p>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-sm font-medium">Click to expand</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">After Trade</span>
                  <div className="aspect-video bg-muted/50 rounded-md border flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <p className="text-muted-foreground text-sm">Image Placeholder</p>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-sm font-medium">Click to expand</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result & Psychology */}
        <div className="space-y-6">
          <Card className={cn(
            isWin ? "border-green-500/30 bg-green-500/5" : 
            isLoss ? "border-red-500/30 bg-red-500/5" : ""
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-center">Trade Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={cn(
                  "text-5xl font-bold mb-2 tracking-tighter",
                  isWin ? "text-green-500" : isLoss ? "text-red-500" : ""
                )}>
                  {isWin ? '+' : ''}{trade.netPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
                <Badge className={cn(
                  "text-base px-3 py-1",
                  isWin ? "bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30" : 
                  isLoss ? "bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30" : ""
                )} variant="outline">
                  {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple}R Multiple
                </Badge>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross P&L</span>
                  <span>{isWin ? '+' : ''}${trade.pnl}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Commission</span>
                  <span className="text-red-400">-${trade.commission}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Swap</span>
                  <span>${trade.swap}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Psychology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Before Entry</span>
                  <Badge variant="outline">{trade.emotions.before}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">During Trade</span>
                  <Badge variant="outline">{trade.emotions.during}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">After Exit</span>
                  <Badge variant="outline">{trade.emotions.after}</Badge>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Confidence Level</span>
                  <span className="font-bold">{trade.emotions.confidence}/10</span>
                </div>
                <Progress value={trade.emotions.confidence * 10} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
