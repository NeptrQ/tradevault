'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTradeStore } from '@/lib/store';

export default function CalendarPage() {
  const { trades, selectedAccountId, isLoaded } = useTradeStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredTrades = useMemo(() => {
    if (selectedAccountId === "all") return trades;
    return trades.filter(t => t.account_id === selectedAccountId);
  }, [trades, selectedAccountId]);

  const dailyData = useMemo(() => {
    const aggregated: Record<string, {
      date: string;
      trades: any[];
      totalPnl: number;
      wins: number;
      losses: number;
      bestTrade: number;
      worstTrade: number;
    }> = {};

    filteredTrades.forEach(trade => {
      const dateKey = trade.entry_date.slice(0, 10);
      const pnlVal = trade.net_pnl ?? trade.pnl ?? 0;

      if (!aggregated[dateKey]) {
        aggregated[dateKey] = {
          date: dateKey,
          trades: [],
          totalPnl: 0,
          wins: 0,
          losses: 0,
          bestTrade: -Infinity,
          worstTrade: Infinity,
        };
      }

      const dayData = aggregated[dateKey];
      dayData.trades.push(trade);
      dayData.totalPnl += pnlVal;

      if (pnlVal > 0) dayData.wins++;
      else if (pnlVal < 0) dayData.losses++;

      if (pnlVal > dayData.bestTrade) dayData.bestTrade = pnlVal;
      if (pnlVal < dayData.worstTrade) dayData.worstTrade = pnlVal;
    });

    return aggregated;
  }, [filteredTrades]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayData = dailyData[selectedDateStr] || { trades: [], totalPnl: 0, wins: 0, losses: 0, bestTrade: 0, worstTrade: 0 };
  const winRate = selectedDayData.trades.length > 0 
    ? Math.round((selectedDayData.wins / selectedDayData.trades.length) * 100) 
    : 0;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-4 md:p-6 lg:p-8 md:flex-row">
      {/* Left Column: Calendar Grid */}
      <div className="flex w-full flex-col gap-4 md:w-[65%]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Day-by-day P&amp;L performance tracker.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="w-36 text-center text-sm sm:text-base font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b bg-muted/30">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="py-2.5 text-center text-xs font-medium text-muted-foreground">
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
                const isToday = isSameDay(day, new Date());
                
                const hasTrades = !!data && data.trades.length > 0;
                const pnl = hasTrades ? data.totalPnl : 0;
                
                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative flex min-h-[95px] sm:min-h-[115px] cursor-pointer flex-col border-b border-r p-2 transition-colors hover:bg-muted/50",
                      !isCurrentMonth && "opacity-30 bg-muted/10",
                      isSelected && "ring-2 ring-primary ring-inset z-10 bg-primary/5",
                      i % 7 === 6 && "border-r-0"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-xs sm:text-sm font-medium",
                        isToday && "flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs"
                      )}>
                        {format(day, dateFormat)}
                      </span>
                      {hasTrades && (
                        <span className="text-[10px] text-muted-foreground font-medium">{data.trades.length}t</span>
                      )}
                    </div>
                    
                    {hasTrades && (
                      <div className="mt-auto flex justify-center pt-1">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] sm:text-xs w-full justify-center border-transparent py-0.5 sm:py-1",
                            pnl > 0 ? "bg-green-500/15 text-green-500 font-semibold" : 
                            pnl < 0 ? "bg-red-500/15 text-red-500 font-semibold" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
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
            <CardTitle className="text-xl">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
            <CardDescription>Daily Breakdown</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            
            {selectedDayData.trades.length > 0 ? (
              <>
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-6">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Net Day P&amp;L</div>
                  <div className={cn(
                    "text-3xl font-bold",
                    selectedDayData.totalPnl > 0 ? "text-green-500" : 
                    selectedDayData.totalPnl < 0 ? "text-red-500" : "text-foreground"
                  )}>
                    {selectedDayData.totalPnl > 0 ? '+' : ''}{formatCurrency(selectedDayData.totalPnl)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    <div className="text-lg font-semibold text-green-500">
                      {selectedDayData.bestTrade !== -Infinity ? `+${formatCurrency(selectedDayData.bestTrade)}` : "$0.00"}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Worst Trade</div>
                    <div className="text-lg font-semibold text-red-500">
                      {selectedDayData.worstTrade !== Infinity ? formatCurrency(selectedDayData.worstTrade) : "$0.00"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-sm mb-3">Trades for this day</h3>
                  <ScrollArea className="h-[220px] pr-4">
                    <div className="space-y-2.5">
                      {selectedDayData.trades.map((trade: any) => {
                        const pnlVal = trade.net_pnl ?? trade.pnl ?? 0;
                        return (
                          <div key={trade.id} className="flex flex-col gap-1.5 rounded-lg border p-3 hover:bg-muted/40 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{trade.symbol}</span>
                                <Badge variant={trade.direction === 'long' ? 'default' : 'outline'} className="text-[10px] uppercase">
                                  {trade.direction}
                                </Badge>
                                {trade.strategy && (
                                  <Badge variant="secondary" className="text-[10px]">{trade.strategy}</Badge>
                                )}
                              </div>
                              <span className={cn(
                                "font-bold text-sm",
                                pnlVal > 0 ? "text-green-500" : pnlVal < 0 ? "text-red-500" : ""
                              )}>
                                {pnlVal > 0 ? '+' : ''}{formatCurrency(pnlVal)}
                              </span>
                            </div>
                            {trade.entry_reason && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {trade.entry_reason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </>
            ) : (
              <div className="flex h-[350px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <CalendarIcon className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold">No Trades Recorded</h3>
                <p className="mt-1.5 text-xs text-muted-foreground max-w-[220px]">
                  No trade executions were logged on this date.
                </p>
                <Link href="/trades/new" className="mt-5">
                  <Button size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Log a Trade
                  </Button>
                </Link>
              </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
