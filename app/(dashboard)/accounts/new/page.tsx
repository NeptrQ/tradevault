"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function NewAccountPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save
    router.push('/accounts')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Account</h2>
          <p className="text-muted-foreground">Add a new trading account to track your progress.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your trading account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input id="name" placeholder="e.g. MyFTMO 100k Challenge" required />
                </div>
                <div className="space-y-2">
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
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="broker">Broker</Label>
                  <Input id="broker" placeholder="e.g. Eightcap" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select defaultValue="mt4">
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mt4">MetaTrader 4</SelectItem>
                      <SelectItem value="mt5">MetaTrader 5</SelectItem>
                      <SelectItem value="ctrader">cTrader</SelectItem>
                      <SelectItem value="tradingview">TradingView</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
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

              <div className="space-y-2 md:w-1/3">
                <Label htmlFor="balance">Initial Balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input id="balance" type="number" placeholder="100000" className="pl-7" required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Parameters & Goals</CardTitle>
              <CardDescription>Set your targets and loss limits to track your progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target">Profit Target</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input id="target" type="number" placeholder="e.g. 10000" className="pl-7" />
                  </div>
                  <p className="text-xs text-muted-foreground">Leave blank if no specific target.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTrades">Max Trades Per Day</Label>
                  <Input id="maxTrades" type="number" placeholder="e.g. 5" />
                  <p className="text-xs text-muted-foreground">Helps prevent overtrading.</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxLoss">Max Total Loss Limit</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input id="maxLoss" type="number" placeholder="e.g. 10000" className="pl-7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyLoss">Daily Loss Limit</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input id="dailyLoss" type="number" placeholder="e.g. 5000" className="pl-7" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-6 mt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit"><Save className="w-4 h-4 mr-2" /> Save Account</Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
