"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Calculator, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useTradeStore } from "@/lib/store";

export default function RiskManagementPage() {
  const { accounts, trades, selectedAccountId, setSelectedAccountId, isLoaded } = useTradeStore();

  const currentAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const initialBal = currentAccount?.current_balance || currentAccount?.initial_balance || 100000;

  const [balance, setBalance] = useState(initialBal);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);

  const [riskAmount, setRiskAmount] = useState(0);
  const [positionSize, setPositionSize] = useState(0);
  const [stopLossDistance, setStopLossDistance] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);
  const [rrRatio, setRrRatio] = useState(0);

  const maxRiskPercent = 2.0;

  useEffect(() => {
    if (currentAccount) {
      setBalance(currentAccount.current_balance || currentAccount.initial_balance || 100000);
    }
  }, [currentAccount]);

  useEffect(() => {
    const riskAmt = (balance * riskPercent) / 100;
    setRiskAmount(riskAmt);
    setPotentialLoss(riskAmt);

    if (entryPrice > 0 && stopLoss > 0) {
      const distance = Math.abs(entryPrice - stopLoss);
      setStopLossDistance(distance);
      
      if (distance > 0) {
        setPositionSize(riskAmt / distance);
      } else {
        setPositionSize(0);
      }

      if (takeProfit > 0) {
        const profitDistance = Math.abs(takeProfit - entryPrice);
        const profit = (riskAmt / distance) * profitDistance;
        setPotentialProfit(profit);
        setRrRatio(profitDistance / distance);
      } else {
        setPotentialProfit(0);
        setRrRatio(0);
      }
    } else {
      setStopLossDistance(0);
      setPositionSize(0);
      setPotentialProfit(0);
      setRrRatio(0);
    }
  }, [balance, riskPercent, entryPrice, stopLoss, takeProfit]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading risk calculator...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
          <p className="text-muted-foreground">Calculate position sizes and manage your risk parameters.</p>
        </div>
        {accounts.length > 0 && (
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Combined</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {riskPercent > maxRiskPercent && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Risk Warning</AlertTitle>
          <AlertDescription>
            Risk exceeds your configured {maxRiskPercent}% limit. Current risk: {riskPercent}%
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5 text-primary" /> Account Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-semibold">{formatCurrency(balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Risk/Trade:</span>
                <span className="font-medium">{maxRiskPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Risk $:</span>
                <span className="font-medium">{formatCurrency((balance * maxRiskPercent) / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Loss Limit:</span>
                <span className="font-medium">{currentAccount?.daily_loss_limit ? formatCurrency(currentAccount.daily_loss_limit) : "$3,000"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Drawdown:</span>
                <span className="font-medium">{currentAccount?.max_total_loss ? formatCurrency(currentAccount.max_total_loss) : "$10,000"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Trades/Day:</span>
                <span className="font-medium">{currentAccount?.max_trades_per_day || 5}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5 text-primary" /> Position Size Calculator
              </CardTitle>
              <CardDescription>Plan exact lot and unit sizes before executing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="balance">Account Balance ($)</Label>
                    <Input 
                      id="balance" 
                      type="number" 
                      value={balance} 
                      onChange={(e) => setBalance(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Risk %</Label>
                      <span className="text-sm font-medium">{riskPercent}%</span>
                    </div>
                    <Slider
                      value={[riskPercent]}
                      onValueChange={(val) => setRiskPercent(val[0])}
                      max={5}
                      step={0.1}
                      className="py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry">Entry Price</Label>
                    <Input 
                      id="entry" 
                      type="number" 
                      placeholder="1.0850"
                      value={entryPrice || ""} 
                      onChange={(e) => setEntryPrice(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss Price</Label>
                    <Input 
                      id="stopLoss" 
                      type="number" 
                      placeholder="1.0820"
                      value={stopLoss || ""} 
                      onChange={(e) => setStopLoss(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">Take Profit Price (Optional)</Label>
                    <Input 
                      id="takeProfit" 
                      type="number" 
                      placeholder="1.0920"
                      value={takeProfit || ""} 
                      onChange={(e) => setTakeProfit(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg space-y-4 flex flex-col justify-center border">
                  <h3 className="font-semibold text-base border-b pb-2">Calculated Execution</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Risk Amount:</span>
                    <span className="font-bold text-base">{formatCurrency(riskAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">SL Distance:</span>
                    <span className="font-medium text-sm">{stopLossDistance.toFixed(4)} points</span>
                  </div>
                  <div className="flex justify-between items-center bg-card p-3 rounded-md border">
                    <span className="font-semibold text-sm">Position Size:</span>
                    <span className="font-bold text-lg text-primary">{positionSize > 0 ? `${positionSize.toFixed(2)} units` : "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Potential Return:</span>
                    <span className="font-bold text-sm text-green-500">{potentialProfit > 0 ? `+${formatCurrency(potentialProfit)}` : "$0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Planned R:R:</span>
                    <span className="font-bold text-sm">{rrRatio > 0 ? `1 : ${rrRatio.toFixed(2)}` : "1 : 0.0"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
