"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Plus, MoreHorizontal, AlertCircle, Trash, Edit, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter
} from "@/components/ui/sheet"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, formatCurrency } from "@/lib/utils"
import { useTradeStore } from "@/lib/store"
import { toast } from "sonner"

export default function AccountsPage() {
  const { accounts, trades, deleteAccount, addAccount, isLoaded } = useTradeStore()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; name: string } | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<"prop_firm" | "personal" | "demo">("prop_firm")
  const [formBroker, setFormBroker] = useState("")
  const [formBalance, setFormBalance] = useState("100000")
  const [formTarget, setFormTarget] = useState("10000")
  const [formMaxLoss, setFormMaxLoss] = useState("10000")
  const [formDailyLoss, setFormDailyLoss] = useState("5000")

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error("Please enter an account name")
      return
    }

    const initBal = parseFloat(formBalance) || 100000
    addAccount({
      name: formName,
      type: formType,
      broker: formBroker || undefined,
      currency: "USD",
      initial_balance: initBal,
      current_balance: initBal,
      profit_target: formTarget ? parseFloat(formTarget) : undefined,
      max_total_loss: formMaxLoss ? parseFloat(formMaxLoss) : 5000,
      daily_loss_limit: formDailyLoss ? parseFloat(formDailyLoss) : 2500,
      status: "active",
    })

    setIsSheetOpen(false)
    setFormName("")
    setFormBroker("")
    toast.success(`Account "${formName}" added successfully!`)
  }

  const confirmDelete = () => {
    if (!accountToDelete) return
    deleteAccount(accountToDelete.id)
    toast.success(`Account "${accountToDelete.name}" and all its trades were deleted`)
    setAccountToDelete(null)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading accounts...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">Manage your trading accounts and evaluation challenges.</p>
        </div>
        
        <Button onClick={() => setIsSheetOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                <Input 
                  id="name" 
                  placeholder="e.g. MyFTMO 100k" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Account Type</Label>
                <Select value={formType} onValueChange={(val) => setFormType(val as any)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prop_firm">Prop Firm Evaluation</SelectItem>
                    <SelectItem value="personal">Personal Broker</SelectItem>
                    <SelectItem value="demo">Demo Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="broker">Broker</Label>
                  <Input 
                    id="broker" 
                    placeholder="e.g. Eightcap" 
                    value={formBroker}
                    onChange={(e) => setFormBroker(e.target.value)}
                  />
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
                <Input 
                  id="balance" 
                  type="number" 
                  placeholder="100000" 
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  required 
                />
              </div>
              
              <div className="my-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-4">Risk Parameters (Optional)</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="target">Profit Target</Label>
                    <Input 
                      id="target" 
                      type="number" 
                      placeholder="e.g. 10000" 
                      value={formTarget}
                      onChange={(e) => setFormTarget(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="maxLoss">Max Total Loss</Label>
                      <Input 
                        id="maxLoss" 
                        type="number" 
                        placeholder="e.g. 10000" 
                        value={formMaxLoss}
                        onChange={(e) => setFormMaxLoss(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dailyLoss">Daily Loss Limit</Label>
                      <Input 
                        id="dailyLoss" 
                        type="number" 
                        placeholder="e.g. 5000" 
                        value={formDailyLoss}
                        onChange={(e) => setFormDailyLoss(e.target.value)}
                      />
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
              You haven&apos;t added any trading accounts yet. Add an account to start tracking your performance.
            </p>
            <Button onClick={() => setIsSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add your first account
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const accTrades = trades.filter((t) => t.account_id === account.id)
            const totalPnl = accTrades.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0)
            const currentBalance = (account.initial_balance ?? 0) + totalPnl
            const typeLabel = account.type === 'prop_firm' ? 'Prop Firm' : account.type === 'personal' ? 'Personal' : 'Demo'

            return (
              <Card key={account.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{account.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-muted">{typeLabel}</Badge>
                        <Badge 
                          variant={account.status === 'active' ? 'default' : account.status === 'passed' ? 'secondary' : 'destructive'}
                          className={cn(
                            account.status === 'active' && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
                            account.status === 'passed' && "bg-green-500/10 text-green-500 hover:bg-green-500/20",
                          )}
                        >
                          {account.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => toast.info(`Editing ${account.name}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`Account Settings for ${account.name}`)}>
                          <Settings className="mr-2 h-4 w-4" /> Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                          onClick={() => setAccountToDelete({ id: account.id, name: account.name })}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(currentBalance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                      <p className={cn("text-2xl font-bold", totalPnl > 0 ? "text-green-500" : totalPnl < 0 ? "text-red-500" : "")}>
                        {totalPnl > 0 ? "+" : ""}{formatCurrency(totalPnl)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Profit Target */}
                    {account.profit_target && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Profit Target</span>
                          <span className={cn("font-medium", totalPnl >= account.profit_target ? "text-green-500" : "")}>
                            {formatCurrency(Math.max(0, totalPnl))} / {formatCurrency(account.profit_target)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.max(0, Math.min(100, (totalPnl / account.profit_target) * 100))} 
                          className="h-1.5 [&>div]:bg-green-500" 
                        />
                      </div>
                    )}

                    {/* Max Loss / Drawdown */}
                    {account.max_total_loss && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Max Loss Buffer</span>
                          <span className="font-medium">
                            {formatCurrency(account.max_total_loss - Math.max(0, -totalPnl))} remaining
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(100, (Math.max(0, -totalPnl) / account.max_total_loss) * 100)} 
                          className={cn("h-1.5", (-totalPnl / account.max_total_loss) > 0.8 ? "[&>div]:bg-red-500" : "[&>div]:bg-yellow-500")} 
                        />
                      </div>
                    )}
                    
                    {/* Daily Loss */}
                    {account.daily_loss_limit && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Daily Limit</span>
                          <span className="font-medium">
                            {formatCurrency(account.daily_loss_limit)} / day
                          </span>
                        </div>
                        <Progress 
                          value={0} 
                          className="h-1.5 [&>div]:bg-blue-500" 
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex justify-between mt-4">
                  <Link href={`/accounts/${account.id}`} className="w-[48%]">
                    <Button variant="outline" className="w-full">View Stats</Button>
                  </Link>
                  <Link href={`/trades/new?account=${encodeURIComponent(account.name)}`} className="w-[48%]">
                    <Button variant="secondary" className="w-full">Log Trade</Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{accountToDelete?.name}&rdquo;? All trades and statistics belonging to this account will also be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setAccountToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Account &amp; Trades
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
