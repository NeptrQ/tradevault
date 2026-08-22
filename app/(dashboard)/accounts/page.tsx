"use client"

import React, { useState } from "react"
import { Plus, MoreHorizontal, AlertCircle, CheckCircle2, XCircle, Settings, Trash, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

// Mock Data
const ACCOUNTS = [
  { 
    id: "1", 
    name: "FTMO 100K Challenge", 
    type: "Prop Firm", 
    status: "Active", 
    balance: 103240, 
    initialBalance: 100000,
    pnl: 3240,
    profitTarget: 10000,
    maxDrawdown: 10000,
    dailyLoss: 5000,
    currentDrawdown: 1500,
    todayPnl: 450,
  },
  { 
    id: "2", 
    name: "Personal 25K", 
    type: "Personal", 
    status: "Active", 
    balance: 24150, 
    initialBalance: 25000,
    pnl: -850,
    profitTarget: null,
    maxDrawdown: 5000,
    dailyLoss: 1000,
    currentDrawdown: 850,
    todayPnl: -120,
  },
  { 
    id: "3", 
    name: "Demo Strategy Tester", 
    type: "Demo", 
    status: "Passed", 
    balance: 11200, 
    initialBalance: 10000,
    pnl: 1200,
    profitTarget: 1000,
    maxDrawdown: 1000,
    dailyLoss: 500,
    currentDrawdown: 0,
    todayPnl: 0,
  },
]

export default function AccountsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [accounts, setAccounts] = useState(ACCOUNTS)

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSheetOpen(false)
    // Handle form submission logic here
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">Manage your trading accounts and evaluation challenges.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[425px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Account</SheetTitle>
              <SheetDescription>
                Connect a new trading account or start tracking a new evaluation.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleAddAccount} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Account Name</Label>
                <Input id="name" placeholder="e.g. MyFTMO 100k" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Account Type</Label>
                <Select required defaultValue="prop">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prop">Prop Firm Evaluation</SelectItem>
                    <SelectItem value="funded">Funded Prop Account</SelectItem>
                    <SelectItem value="personal">Personal Broker</SelectItem>
                    <SelectItem value="demo">Demo Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="broker">Broker</Label>
                  <Input id="broker" placeholder="e.g. Eightcap" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Initial Balance</Label>
                <Input id="balance" type="number" placeholder="100000" required />
              </div>
              
              <div className="my-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-4">Risk Parameters (Optional)</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="target">Profit Target</Label>
                    <Input id="target" type="number" placeholder="e.g. 10000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="maxLoss">Max Total Loss</Label>
                      <Input id="maxLoss" type="number" placeholder="e.g. 10000" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dailyLoss">Daily Loss Limit</Label>
                      <Input id="dailyLoss" type="number" placeholder="e.g. 5000" />
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                <Button type="submit">Create Account</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {accounts.length === 0 ? (
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No accounts added</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't added any trading accounts yet. Add an account to start tracking your performance.
            </p>
            <Button onClick={() => setIsSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add your first account
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{account.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-muted">{account.type}</Badge>
                      <Badge 
                        variant={account.status === 'Active' ? 'default' : account.status === 'Passed' ? 'secondary' : 'destructive'}
                        className={cn(
                          account.status === 'Active' && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
                          account.status === 'Passed' && "bg-green-500/10 text-green-500 hover:bg-green-500/20",
                        )}
                      >
                        {account.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                      <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600"><Trash className="mr-2 h-4 w-4" /> Delete Account</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                    <p className={cn("text-2xl font-bold", account.pnl > 0 ? "text-green-500" : account.pnl < 0 ? "text-red-500" : "")}>
                      {account.pnl > 0 ? "+" : ""}{formatCurrency(account.pnl)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Profit Target */}
                  {account.profitTarget && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Profit Target</span>
                        <span className={cn("font-medium", account.pnl >= account.profitTarget ? "text-green-500" : "")}>
                          {formatCurrency(Math.max(0, account.pnl))} / {formatCurrency(account.profitTarget)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, (account.pnl / account.profitTarget) * 100))} 
                        className="h-1.5 [&>div]:bg-green-500" 
                      />
                    </div>
                  )}

                  {/* Drawdown */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Max Drawdown</span>
                      <span className={cn("font-medium", (account.currentDrawdown / account.maxDrawdown) > 0.8 ? "text-red-500" : "")}>
                        {formatCurrency(account.maxDrawdown - account.currentDrawdown)} left
                      </span>
                    </div>
                    <Progress 
                      value={(account.currentDrawdown / account.maxDrawdown) * 100} 
                      className={cn("h-1.5", (account.currentDrawdown / account.maxDrawdown) > 0.8 ? "[&>div]:bg-red-500" : "[&>div]:bg-yellow-500")} 
                    />
                  </div>
                  
                  {/* Daily Loss */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Daily Limit</span>
                      <span className="font-medium">
                        {formatCurrency(account.dailyLoss + (account.todayPnl < 0 ? account.todayPnl : 0))} left
                      </span>
                    </div>
                    <Progress 
                      value={account.todayPnl < 0 ? (Math.abs(account.todayPnl) / account.dailyLoss) * 100 : 0} 
                      className="h-1.5 [&>div]:bg-blue-500" 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t flex justify-between mt-4">
                <Button variant="outline" className="w-[48%]">View Stats</Button>
                <Button variant="secondary" className="w-[48%]">Log Trade</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
