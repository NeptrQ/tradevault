'use client';

import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Demo Data Generation ---
// Generate trades for the last 3 months, current month is August 2026
const generateDemoTrades = () => {
  const trades = [];
  const startDate = new Date(2026, 5, 1); // June 1, 2026
  const endDate = new Date(2026, 7, 31); // August 31, 2026
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const symbols = ['EURUSD', 'GBPUSD', 'XAUUSD', 'NQ', 'ES'];
  
  days.forEach((day) => {
    // Only trade Mon-Fri
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return;
    
    // 80% chance to trade on a weekday
    if (Math.random() > 0.8) return;
    
    const numTrades = Math.floor(Math.random() * 4) + 1; // 1 to 4 trades
    // 60% chance of profitable day
    const isProfitableDay = Math.random() < 0.6;
    
    for (let i = 0; i < numTrades; i++) {
      const isWin = isProfitableDay ? Math.random() < 0.7 : Math.random() < 0.3;
      let pnl = isWin 
        ? Math.floor(Math.random() * 400) + 100 // Win: $100 to $500
        : -(Math.floor(Math.random() * 200) + 50); // Loss: -$50 to -$250
        
      trades.push({
        id: `trade-${format(day, 'yyyyMMdd')}-${i}`,
        date: format(day, 'yyyy-MM-dd'),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        direction: Math.random() > 0.5 ? 'Long' : 'Short',
        pnl: pnl,
        notes: isWin ? 'Followed plan perfectly.' : 'Entered too early, chopped out.',
      });
    }
  });
  
  return trades;
};

const allTrades = generateDemoTrades();

const aggregateTradesByDay = (trades: any[]) => {
  const aggregated: Record<string, any> = {};
  
  trades.forEach(trade => {
    if (!aggregated[trade.date]) {
      aggregated[trade.date] = {
        date: trade.date,
        trades: [],
        totalPnl: 0,
        wins: 0,
        losses: 0,
        bestTrade: -Infinity,
        worstTrade: Infinity,
      };
    }
    
    const dayData = aggregated[trade.date];
    dayData.trades.push(trade);
    dayData.totalPnl += trade.pnl;
    
    if (trade.pnl > 0) dayData.wins++;
    else if (trade.pnl < 0) dayData.losses++;
    
    if (trade.pnl > dayData.bestTrade) dayData.bestTrade = trade.pnl;
    if (trade.pnl < dayData.worstTrade) dayData.worstTrade = trade.pnl;
  });
  
  return aggregated;
};

const dailyData = aggregateTradesByDay(allTrades);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 7, 22)); // August 22, 2026

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayData = dailyData[selectedDateStr] || { trades: [], totalPnl: 0, wins: 0, losses: 0 };
  const winRate = selectedDayData.trades.length > 0 
    ? Math.round((selectedDayData.wins / selectedDayData.trades.length) * 100) 
    : 0;

  return (
    <div className="flex h-full flex-col gap-6 p-6 md:flex-row">
      {/* Left Column: Calendar Grid */}
      <div className="flex w-full flex-col gap-4 md:w-[65%]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">View your daily performance.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="w-40 text-center text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="flex-1">
          <CardContent className="p-0">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const data = dailyData[dateStr];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date(2026, 7, 22)); // Mock today
                
                const hasTrades = !!data;
                const pnl = hasTrades ? data.totalPnl : 0;
                
                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative flex min-h-[120px] cursor-pointer flex-col border-b border-r p-2 transition-colors hover:bg-muted/50",
                      !isCurrentMonth && "opacity-40",
                      isSelected && "ring-2 ring-primary ring-inset z-10",
                      i % 7 === 6 && "border-r-0"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-sm font-medium",
                        isToday && "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      )}>
                        {format(day, dateFormat)}
                      </span>
                      {hasTrades && (
                        <span className="text-xs text-muted-foreground">{data.trades.length} trades</span>
                      )}
                    </div>
                    
                    {hasTrades && (
                      <div className="mt-auto flex justify-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-sm w-full justify-center border-transparent py-1",
                            pnl > 0 ? "bg-green-500/10 text-green-500" : 
                            pnl < 0 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {pnl > 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Day Detail Panel */}
      <div className="w-full md:w-[35%]">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
            <CardDescription>Daily Summary</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            
            {selectedDayData.trades.length > 0 ? (
              <>
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Net P&L</div>
                  <div className={cn(
                    "text-4xl font-bold",
                    selectedDayData.totalPnl > 0 ? "text-green-500" : 
                    selectedDayData.totalPnl < 0 ? "text-red-500" : "text-foreground"
                  )}>
                    {selectedDayData.totalPnl > 0 ? '+' : ''}${Math.abs(selectedDayData.totalPnl).toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Trades</div>
                    <div className="text-lg font-semibold">{selectedDayData.trades.length}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                    <div className="text-lg font-semibold">{winRate}%</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Best Trade</div>
                    <div className="text-lg font-semibold text-green-500">${selectedDayData.bestTrade.toFixed(2)}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Worst Trade</div>
                    <div className="text-lg font-semibold text-red-500">-${Math.abs(selectedDayData.worstTrade).toFixed(2)}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Trades</h3>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                      {selectedDayData.trades.map((trade: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{trade.symbol}</Badge>
                              <Badge variant={trade.direction === 'Long' ? 'default' : 'secondary'} className="text-xs">
                                {trade.direction}
                              </Badge>
                            </div>
                            <span className={cn(
                              "font-bold",
                              trade.pnl > 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {trade.pnl > 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                            </span>
                          </div>
                          {trade.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              "{trade.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Trades</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-[200px]">
                  You didn't take any trades on this day.
                </p>
                <Button className="mt-6" variant="outline">Add Manual Trade</Button>
              </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
