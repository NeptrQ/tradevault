'use client';

import React, { useState } from 'react';
import { useTradeStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SettingsPage() {
  const { clearAllData, resetToDemoData } = useTradeStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent space-y-1 items-start justify-start p-0">
          <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-muted">Profile</TabsTrigger>
          <TabsTrigger value="trading" className="w-full justify-start data-[state=active]:bg-muted">Trading Preferences</TabsTrigger>
          <TabsTrigger value="risk" className="w-full justify-start data-[state=active]:bg-muted">Risk Settings</TabsTrigger>
          <TabsTrigger value="appearance" className="w-full justify-start data-[state=active]:bg-muted">Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start data-[state=active]:bg-muted">Notifications</TabsTrigger>
          <TabsTrigger value="data" className="w-full justify-start data-[state=active]:bg-muted">Data Management</TabsTrigger>
          <TabsTrigger value="ai" className="w-full justify-start data-[state=active]:bg-muted">AI & Integrations</TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full max-w-3xl">
          {/* Profile Tab */}
          <TabsContent value="profile" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" />
                    <AvatarFallback>TV</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" /> Change Avatar
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Alex Trader" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="alex@example.com" disabled />
                    <p className="text-[0.8rem] text-muted-foreground">Email is managed through your authentication provider.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Trading Preferences Tab */}
          <TabsContent value="trading" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Preferences</CardTitle>
                <CardDescription>Configure your default trading settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4">
                  <Label>Default Risk %</Label>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[1.0]} max={5} step={0.1} className="flex-1" />
                    <Input type="number" defaultValue="1.0" className="w-20" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Default Timezone</Label>
                  <Select defaultValue="est">
                    <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="bst">British Summer Time (BST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Risk Settings Tab */}
          <TabsContent value="risk" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Settings</CardTitle>
                <CardDescription>Set guardrails to protect your capital.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <Label>Max Risk Per Trade %</Label>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[2.0]} max={10} step={0.5} className="flex-1" />
                    <Input type="number" defaultValue="2.0" className="w-20" />
                  </div>
                </div>
                <div className="grid gap-4">
                  <Label>Max Daily Loss %</Label>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[5.0]} max={20} step={0.5} className="flex-1" />
                    <Input type="number" defaultValue="5.0" className="w-20" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max-trades">Max Trades Per Day</Label>
                  <Input id="max-trades" type="number" defaultValue="5" className="max-w-[200px]" />
                </div>
                
                <div className="pt-4 space-y-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Risk Warnings</Label>
                      <p className="text-sm text-muted-foreground">Get alerted when approaching your limits.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Risk on Dashboard</Label>
                      <p className="text-sm text-muted-foreground">Display risk metrics prominently on your dashboard.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Risk Rules</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of TradeVault.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <RadioGroup defaultValue="dark" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" disabled />
                      <Label htmlFor="theme-light" className="text-muted-foreground">Light (Coming Soon)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex gap-3">
                    {['blue', 'purple', 'green', 'orange', 'red'].map((color) => (
                      <div 
                        key={color} 
                        className={`w-8 h-8 rounded-full cursor-pointer ring-offset-background ${color === 'blue' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        style={{ backgroundColor: `var(--${color}-500, ${color})` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Font Size</Label>
                  <RadioGroup defaultValue="medium" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="font-sm" />
                      <Label htmlFor="font-sm">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="font-md" />
                      <Label htmlFor="font-md">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="font-lg" />
                      <Label htmlFor="font-lg">Large</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Reduce spacing to fit more data on screen.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive alerts and updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Loss Warning</Label>
                    <p className="text-sm text-muted-foreground">Alert when daily loss exceeds a threshold.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input type="number" defaultValue="3" className="w-16 h-8" />
                    <span className="text-sm text-muted-foreground">%</span>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Risk Limit Warning</Label>
                    <p className="text-sm text-muted-foreground">Alert when a trade exceeds your max risk %.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Goal Reminder</Label>
                    <p className="text-sm text-muted-foreground">Daily reminder to review your goals.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input type="time" defaultValue="08:00" className="w-28 h-8" />
                    <Switch />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Performance Summary</Label>
                    <p className="text-sm text-muted-foreground">Receive a weekly email summary of your trading.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export & Import Data</CardTitle>
                <CardDescription>Download your data or import trades from brokers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Export</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" /> Export Trades (CSV)
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" /> Export Journal (PDF)
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-sm font-medium">Import from CSV</h3>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium">Drag & drop CSV file or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports MetaTrader, cTrader, and NinjaTrader exports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone &amp; Data Reset
                </CardTitle>
                <CardDescription>Actions related to your saved accounts, trades, goals, and journal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h4 className="font-medium text-sm">Reset to Demo Data</h4>
                    <p className="text-sm text-muted-foreground mt-1">Restore sample accounts, trades, and journaling data.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      resetToDemoData();
                      toast.success("TradeVault reset to demo data!");
                    }}
                  >
                    Restore Demo Data
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-red-500">Delete All Data (Wipe Everything)</h4>
                    <p className="text-sm text-muted-foreground mt-1">This will permanently delete all accounts, trades, goals, and journal entries.</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="gap-2"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4" /> Wipe All Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-500">Wipe All TradeVault Data?</DialogTitle>
                  <DialogDescription>
                    This will permanently clear all accounts, trade logs, calendar entries, analytics, and journal notes from your browser storage.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      clearAllData();
                      setShowClearConfirm(false);
                      toast.success("All data has been wiped.");
                    }}
                  >
                    Yes, Wipe Everything
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* AI & Integrations Tab */}
          <TabsContent value="ai" className="m-0 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>AI Analysis Settings</CardTitle>
                  <CardDescription>Configure how TradeVault analyzes your trading patterns.</CardDescription>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                  Smart Review Active
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Enable AI Deep Dive
                    </h4>
                    <p className="text-sm text-muted-foreground">Use conversational AI for personalized feedback on your trades.</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="grid gap-2">
                    <Label>AI Provider</Label>
                    <Select defaultValue="openai">
                      <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="api-key" type="password" placeholder="Enter your API key" className="pl-9" />
                      </div>
                      <Button variant="secondary">Save Key</Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-md border border-primary/10">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    API keys are stored securely server-side and never exposed to the browser.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
