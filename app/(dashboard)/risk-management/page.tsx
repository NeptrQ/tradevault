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

export default function RiskManagementPage() {
  const [balance, setBalance] = useState(100000);
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

  const maxRiskPercent = 1;

  useEffect(() => {
    const riskAmt = (balance * riskPercent) / 100;
    setRiskAmount(riskAmt);
    setPotentialLoss(riskAmt);

    if (entryPrice > 0 && stopLoss > 0) {
      const distance = Math.abs(entryPrice - stopLoss);
      setStopLossDistance(distance);
      
      // Simple unit calculation
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

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
        <p className="text-muted-foreground">Calculate position sizes and manage your risk parameters.</p>
      </div>

      {riskPercent > maxRiskPercent && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Risk Warning</AlertTitle>
          <AlertDescription>
            Risk exceeds your {maxRiskPercent}% limit. Current risk: {riskPercent}%
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5" /> Account Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-medium">${balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Risk/Trade:</span>
                <span className="font-medium">{maxRiskPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Risk $:</span>
                <span className="font-medium">${(balance * maxRiskPercent / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Loss Limit:</span>
                <span className="font-medium">$3,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today's Loss:</span>
                <span className="text-red-500 font-medium">-$450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Daily Loss:</span>
                <span className="font-medium">$2,550</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Trades/Day:</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today's Trades:</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Streak:</span>
                <span className="text-green-500 font-medium">+2</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" /> Position Size Calculator
              </CardTitle>
              <CardDescription>Plan your trade parameters</CardDescription>
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
                      value={entryPrice || ""} 
                      onChange={(e) => setEntryPrice(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss Price</Label>
                    <Input 
                      id="stopLoss" 
                      type="number" 
                      value={stopLoss || ""} 
                      onChange={(e) => setStopLoss(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">Take Profit Price (Optional)</Label>
                    <Input 
                      id="takeProfit" 
                      type="number" 
                      value={takeProfit || ""} 
                      onChange={(e) => setTakeProfit(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="bg-muted p-6 rounded-lg space-y-4 flex flex-col justify-center">
                  <h3 className="font-semibold text-lg border-b pb-2">Results</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Risk Amount:</span>
                    <span className="font-bold text-lg">${riskAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Stop Loss Distance:</span>
                    <span className="font-medium">{stopLossDistance.toFixed(4)} units</span>
                  </div>
                  <div className="flex justify-between items-center bg-background p-3 rounded border">
                    <span className="font-medium">Position Size:</span>
                    <span className="font-bold text-xl text-primary">
                      {positionSize > 0 ? positionSize.toFixed(2) : "0.00"} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Potential Loss:</span>
                    <span className="font-medium text-red-500">${potentialLoss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Potential Profit:</span>
                    <span className="font-medium text-green-500">${potentialProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Risk:Reward Ratio:</span>
                    <span className="font-medium">
                      1 : {rrRatio > 0 ? rrRatio.toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk History (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Risk Taken</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Aug 22, 2026</TableCell>
                <TableCell>0.8%</TableCell>
                <TableCell>1.0%</TableCell>
                <TableCell><Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">OK</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Aug 21, 2026</TableCell>
                <TableCell>1.2%</TableCell>
                <TableCell>1.0%</TableCell>
                <TableCell><Badge variant="outline" className="text-red-500 border-red-500 bg-red-500/10">Exceeded</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Aug 20, 2026</TableCell>
                <TableCell>0.5%</TableCell>
                <TableCell>1.0%</TableCell>
                <TableCell><Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">OK</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
