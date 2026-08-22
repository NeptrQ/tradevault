'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Eye, Trash2, FilterX, ArrowUpDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown
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
import { cn, formatCurrency } from '@/lib/utils';
import { useTradeStore } from '@/lib/store';
import { toast } from 'sonner';

export default function TradesList() {
  const { trades, accounts, deleteTrade, isLoaded } = useTradeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('All');
  const [symbolFilter, setSymbolFilter] = useState('All');
  const [strategyFilter, setStrategyFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [sortConfig, setSortConfig] = useState({ key: 'entry_date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Account mapping
  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach(a => map.set(a.id, a.name));
    return map;
  }, [accounts]);

  // Unique filter options
  const accountNames = ['All', ...Array.from(new Set(accounts.map(a => a.name)))];
  const symbols = ['All', ...Array.from(new Set(trades.map(t => t.symbol)))];
  const strategies = ['All', ...Array.from(new Set(trades.map(t => t.strategy).filter(Boolean)))];

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
    return trades.filter(trade => {
      const accName = accountMap.get(trade.account_id) || 'Unknown';
      const matchSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (trade.strategy && trade.strategy.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchAccount = accountFilter === 'All' || accName === accountFilter;
      const matchSymbol = symbolFilter === 'All' || trade.symbol === symbolFilter;
      const matchStrategy = strategyFilter === 'All' || trade.strategy === strategyFilter;
      const matchDirection = directionFilter === 'All' || trade.direction.toLowerCase() === directionFilter.toLowerCase();
      const matchStatus = statusFilter === 'All' || trade.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchAccount && matchSymbol && matchStrategy && matchDirection && matchStatus;
    }).sort((a: any, b: any) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      
      const comparison = valA < valB ? -1 : 1;
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [trades, accountMap, searchTerm, accountFilter, symbolFilter, strategyFilter, directionFilter, statusFilter, sortConfig]);

  const summary = useMemo(() => {
    const closed = filteredTrades.filter(t => t.status === 'closed');
    const wins = closed.filter(t => (t.net_pnl ?? 0) > 0).length;
    const totalPnl = filteredTrades.reduce((acc, t) => acc + (t.net_pnl ?? t.pnl ?? 0), 0);
    const rValues = closed.filter(t => t.r_multiple !== undefined).map(t => t.r_multiple!);
    const avgR = rValues.length > 0 ? (rValues.reduce((acc, v) => acc + v, 0) / rValues.length).toFixed(2) : '0.00';
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

  const handleDelete = (id: string, symbol: string) => {
    deleteTrade(id);
    toast.success(`Trade ${symbol} deleted`);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trades</h1>
          <p className="text-muted-foreground">Manage and filter your entire trading history.</p>
        </div>
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
            
            <Select value={accountFilter} onValueChange={(v) => v && setAccountFilter(v)}>
              <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
              <SelectContent>
                {accountNames.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={symbolFilter} onValueChange={(v) => v && setSymbolFilter(v)}>
              <SelectTrigger><SelectValue placeholder="Symbol" /></SelectTrigger>
              <SelectContent>
                {symbols.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={strategyFilter} onValueChange={(v) => v && setStrategyFilter(v)}>
              <SelectTrigger><SelectValue placeholder="Strategy" /></SelectTrigger>
              <SelectContent>
                {strategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={directionFilter} onValueChange={(v) => v && setDirectionFilter(v)}>
              <SelectTrigger><SelectValue placeholder="Direction" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Directions</SelectItem>
                <SelectItem value="Long">Long</SelectItem>
                <SelectItem value="Short">Short</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
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
            <span className="text-sm font-medium text-muted-foreground">Total P&amp;L</span>
            <span className={cn("text-2xl font-bold", summary.totalPnl > 0 ? "text-green-500" : summary.totalPnl < 0 ? "text-red-500" : "")}>
              {summary.totalPnl > 0 ? '+' : ''}{formatCurrency(summary.totalPnl)}
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
            <span className="text-sm font-medium text-muted-foreground">Avg R-Multiple</span>
            <span className={cn("text-2xl font-bold", parseFloat(summary.avgR) > 0 ? "text-green-500" : "")}>
              {parseFloat(summary.avgR) > 0 ? '+' : ''}{summary.avgR}R
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Trade Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('entry_date')}>
                <div className="flex items-center">Date <SortIcon columnKey="entry_date" /></div>
              </TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('symbol')}>
                <div className="flex items-center">Symbol <SortIcon columnKey="symbol" /></div>
              </TableHead>
              <TableHead>Direction</TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('entry_price')}>
                <div className="flex items-center justify-end">Entry <SortIcon columnKey="entry_price" /></div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('exit_price')}>
                <div className="flex items-center justify-end">Exit <SortIcon columnKey="exit_price" /></div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('lot_size')}>
                <div className="flex items-center justify-end">Lots <SortIcon columnKey="lot_size" /></div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('net_pnl')}>
                <div className="flex items-center justify-end">P&amp;L <SortIcon columnKey="net_pnl" /></div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('r_multiple')}>
                <div className="flex items-center justify-end">R <SortIcon columnKey="r_multiple" /></div>
              </TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                  No trades found. {trades.length === 0 ? "You haven't logged any trades yet." : "Try adjusting your filters."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrades.map((trade) => {
                const accName = accountMap.get(trade.account_id) || 'Account';
                const pnlVal = trade.net_pnl ?? trade.pnl ?? 0;
                return (
                  <TableRow key={trade.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium whitespace-nowrap">
                      {trade.entry_date ? trade.entry_date.slice(0, 10) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {accName}
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", pnlVal > 0 ? "bg-green-500" : pnlVal < 0 ? "bg-red-500" : "bg-muted-foreground")} />
                        {trade.symbol}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.direction === 'long' ? 'default' : 'outline'} className={cn(
                        trade.direction === 'long' ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                      )}>
                        {trade.direction.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{trade.entry_price}</TableCell>
                    <TableCell className="text-right">{trade.exit_price || '-'}</TableCell>
                    <TableCell className="text-right">{trade.lot_size}</TableCell>
                    <TableCell className={cn("text-right font-medium", pnlVal > 0 ? "text-green-500" : pnlVal < 0 ? "text-red-500" : "")}>
                      {pnlVal > 0 ? '+' : ''}{formatCurrency(pnlVal)}
                    </TableCell>
                    <TableCell className={cn("text-right font-medium", (trade.r_multiple ?? 0) > 0 ? "text-green-500" : (trade.r_multiple ?? 0) < 0 ? "text-red-500" : "")}>
                      {(trade.r_multiple ?? 0) > 0 ? '+' : ''}{trade.r_multiple ?? 0}R
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{trade.strategy || 'Discretionary'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        trade.status === 'open' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                        trade.status === 'closed' && "bg-gray-500/10 text-gray-500 border-gray-500/20",
                        trade.status === 'cancelled' && "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {trade.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Link href={`/trades/${trade.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <div className="h-8 w-8 flex items-center justify-center rounded-md text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this {trade.symbol} trade? This action will update your account balance and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDelete(trade.id, trade.symbol)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
