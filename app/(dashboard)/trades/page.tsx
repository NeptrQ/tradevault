'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Eye, Pencil, Trash2, FilterX, ArrowUpDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
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
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Demo Data
const DEMO_TRADES = [
  { id: '1', date: 'Aug 22, 2026', account: 'FTMO 100k', symbol: 'EURUSD', direction: 'Long', entry: 1.1050, exit: 1.1080, lot: 5.0, pnl: 1500, rMultiple: 2.5, strategy: 'Breakout', status: 'Closed' },
  { id: '2', date: 'Aug 21, 2026', account: 'Personal', symbol: 'GBPUSD', direction: 'Short', entry: 1.2500, exit: 1.2450, lot: 2.0, pnl: 1000, rMultiple: 1.5, strategy: 'Trend Follow', status: 'Closed' },
  { id: '3', date: 'Aug 20, 2026', account: 'FTMO 100k', symbol: 'XAUUSD', direction: 'Long', entry: 1950.5, exit: 1945.0, lot: 1.0, pnl: -550, rMultiple: -1.0, strategy: 'Reversal', status: 'Closed' },
  { id: '4', date: 'Aug 19, 2026', account: 'FundedNext', symbol: 'NASDAQ', direction: 'Short', entry: 15200, exit: 15100, lot: 0.5, pnl: 1000, rMultiple: 2.0, strategy: 'Breakout', status: 'Closed' },
  { id: '5', date: 'Aug 18, 2026', account: 'Personal', symbol: 'EURUSD', direction: 'Short', entry: 1.0950, exit: null, lot: 3.0, pnl: 300, rMultiple: 0.5, strategy: 'Trend Follow', status: 'Open' },
  { id: '6', date: 'Aug 17, 2026', account: 'FTMO 100k', symbol: 'GBPUSD', direction: 'Long', entry: 1.2600, exit: 1.2550, lot: 4.0, pnl: -2000, rMultiple: -1.0, strategy: 'Breakout', status: 'Closed' },
  { id: '7', date: 'Aug 16, 2026', account: 'Personal', symbol: 'XAUUSD', direction: 'Short', entry: 1920.0, exit: 1910.0, lot: 2.0, pnl: 2000, rMultiple: 3.0, strategy: 'Reversal', status: 'Closed' },
  { id: '8', date: 'Aug 15, 2026', account: 'FundedNext', symbol: 'NASDAQ', direction: 'Long', entry: 14800, exit: 14950, lot: 1.0, pnl: 3000, rMultiple: 4.0, strategy: 'Trend Follow', status: 'Closed' },
  { id: '9', date: 'Aug 14, 2026', account: 'FTMO 100k', symbol: 'EURUSD', direction: 'Long', entry: 1.1100, exit: 1.1090, lot: 5.0, pnl: -500, rMultiple: -0.5, strategy: 'Scalp', status: 'Closed' },
  { id: '10', date: 'Aug 13, 2026', account: 'Personal', symbol: 'GBPUSD', direction: 'Short', entry: 1.2700, exit: 1.2600, lot: 2.0, pnl: 2000, rMultiple: 2.0, strategy: 'Breakout', status: 'Closed' },
  { id: '11', date: 'Aug 12, 2026', account: 'FundedNext', symbol: 'XAUUSD', direction: 'Long', entry: 1900.0, exit: 1905.0, lot: 3.0, pnl: 1500, rMultiple: 1.5, strategy: 'Trend Follow', status: 'Closed' },
  { id: '12', date: 'Aug 11, 2026', account: 'FTMO 100k', symbol: 'NASDAQ', direction: 'Short', entry: 15500, exit: 15550, lot: 0.5, pnl: -500, rMultiple: -1.0, strategy: 'Reversal', status: 'Closed' },
  { id: '13', date: 'Aug 10, 2026', account: 'Personal', symbol: 'EURUSD', direction: 'Long', entry: 1.0800, exit: 1.0850, lot: 4.0, pnl: 2000, rMultiple: 2.5, strategy: 'Breakout', status: 'Closed' },
  { id: '14', date: 'Aug 09, 2026', account: 'FTMO 100k', symbol: 'GBPUSD', direction: 'Short', entry: 1.2800, exit: 1.2800, lot: 3.0, pnl: 0, rMultiple: 0, strategy: 'Trend Follow', status: 'Closed' },
  { id: '15', date: 'Aug 08, 2026', account: 'FundedNext', symbol: 'XAUUSD', direction: 'Long', entry: 1880.0, exit: 1880.0, lot: 2.0, pnl: 0, rMultiple: 0, strategy: 'Reversal', status: 'Cancelled' },
];

export default function TradesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('All');
  const [symbolFilter, setSymbolFilter] = useState('All');
  const [strategyFilter, setStrategyFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Derive unique options
  const accounts = ['All', ...Array.from(new Set(DEMO_TRADES.map(t => t.account)))];
  const symbols = ['All', ...Array.from(new Set(DEMO_TRADES.map(t => t.symbol)))];
  const strategies = ['All', ...Array.from(new Set(DEMO_TRADES.map(t => t.strategy)))];

  const clearFilters = () => {
    setSearchTerm('');
    setAccountFilter('All');
    setSymbolFilter('All');
    setStrategyFilter('All');
    setDirectionFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredTrades = useMemo(() => {
    return DEMO_TRADES.filter(trade => {
      const matchSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trade.strategy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAccount = accountFilter === 'All' || trade.account === accountFilter;
      const matchSymbol = symbolFilter === 'All' || trade.symbol === symbolFilter;
      const matchStrategy = strategyFilter === 'All' || trade.strategy === strategyFilter;
      const matchDirection = directionFilter === 'All' || trade.direction === directionFilter;
      const matchStatus = statusFilter === 'All' || trade.status === statusFilter;
      return matchSearch && matchAccount && matchSymbol && matchStrategy && matchDirection && matchStatus;
    }).sort((a, b) => {
      // Very basic sort logic for demo
      const valA = a[sortConfig.key as keyof typeof a];
      const valB = b[sortConfig.key as keyof typeof b];
      if (valA === valB) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;
      
      const comparison = valA < valB ? -1 : 1;
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [searchTerm, accountFilter, symbolFilter, strategyFilter, directionFilter, statusFilter, sortConfig]);

  const summary = useMemo(() => {
    const closed = filteredTrades.filter(t => t.status === 'Closed' && t.pnl !== 0);
    const wins = closed.filter(t => t.pnl > 0).length;
    const totalPnl = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);
    const avgR = closed.length > 0 ? (closed.reduce((acc, t) => acc + t.rMultiple, 0) / closed.length).toFixed(2) : 0;
    const winRate = closed.length > 0 ? Math.round((wins / closed.length) * 100) : 0;
    
    return { count: filteredTrades.length, totalPnl, winRate, avgR };
  }, [filteredTrades]);

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const paginatedTrades = filteredTrades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Trades</h1>
        <Link href="/trades/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Add Trade</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search symbol or strategy..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
              <SelectContent>
                {accounts.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={symbolFilter} onValueChange={setSymbolFilter}>
              <SelectTrigger><SelectValue placeholder="Symbol" /></SelectTrigger>
              <SelectContent>
                {symbols.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={strategyFilter} onValueChange={setStrategyFilter}>
              <SelectTrigger><SelectValue placeholder="Strategy" /></SelectTrigger>
              <SelectContent>
                {strategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger><SelectValue placeholder="Direction" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Directions</SelectItem>
                <SelectItem value="Long">Long</SelectItem>
                <SelectItem value="Short">Short</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} className="lg:col-start-4">
              <FilterX className="w-4 h-4 mr-2" /> Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Trades Shown</span>
            <span className="text-2xl font-bold">{summary.count}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Total P&L</span>
            <span className={cn("text-2xl font-bold", summary.totalPnl > 0 ? "text-green-500" : summary.totalPnl < 0 ? "text-red-500" : "")}>
              {summary.totalPnl > 0 ? '+' : ''}{summary.totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Win Rate</span>
            <span className="text-2xl font-bold">{summary.winRate}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Avg R</span>
            <span className={cn("text-2xl font-bold", Number(summary.avgR) > 0 ? "text-green-500" : Number(summary.avgR) < 0 ? "text-red-500" : "")}>
              {Number(summary.avgR) > 0 ? '+' : ''}{summary.avgR}R
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('date')}>
                <div className="flex items-center">Date <SortIcon columnKey="date" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('account')}>
                <div className="flex items-center">Account <SortIcon columnKey="account" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('symbol')}>
                <div className="flex items-center">Symbol <SortIcon columnKey="symbol" /></div>
              </TableHead>
              <TableHead>Direction</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Exit</TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('lot')}>
                <div className="flex items-center justify-end">Lot <SortIcon columnKey="lot" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('pnl')}>
                <div className="flex items-center justify-end">P&L <SortIcon columnKey="pnl" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('rMultiple')}>
                <div className="flex items-center justify-end">R Mult <SortIcon columnKey="rMultiple" /></div>
              </TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center h-32 text-muted-foreground">
                  No trades found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrades.map((trade) => (
                <TableRow key={trade.id} className="hover:bg-muted/50 cursor-default">
                  <TableCell className="whitespace-nowrap">{trade.date}</TableCell>
                  <TableCell>{trade.account}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <div className={cn("w-2 h-2 rounded-full", trade.symbol.includes('USD') ? "bg-blue-500" : "bg-purple-500")} />
                      {trade.symbol}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.direction === 'Long' ? 'default' : 'secondary'} className={cn(
                      trade.direction === 'Long' ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                    )}>
                      {trade.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{trade.entry}</TableCell>
                  <TableCell className="text-right">{trade.exit || '-'}</TableCell>
                  <TableCell className="text-right">{trade.lot}</TableCell>
                  <TableCell className={cn("text-right font-medium", trade.pnl > 0 ? "text-green-500" : trade.pnl < 0 ? "text-red-500" : "")}>
                    {trade.pnl > 0 ? '+' : ''}{trade.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </TableCell>
                  <TableCell className={cn("text-right font-medium", trade.rMultiple > 0 ? "text-green-500" : trade.rMultiple < 0 ? "text-red-500" : "")}>
                    {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple}R
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{trade.strategy}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      trade.status === 'Open' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                      trade.status === 'Closed' && "bg-gray-500/10 text-gray-500 border-gray-500/20",
                      trade.status === 'Cancelled' && "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {trade.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Link href={`/trades/${trade.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      <Link href={`/trades/${trade.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
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
                            <AlertDialogAction className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTrades.length)} of {filteredTrades.length} trades
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <div className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
