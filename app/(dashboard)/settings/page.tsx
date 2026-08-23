'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, Upload, Download, Trash2, Key, CheckCircle2, ShieldAlert, Sparkles, User, Settings2, Palette, Bell, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTradeStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
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
  const { accounts, trades, journalEntries, addTrade, clearAllData, resetToDemoData } = useTradeStore();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Dialog State
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState('Trader');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Trading Preferences State
  const [currency, setCurrency] = useState('usd');
  const [defaultRiskPercent, setDefaultRiskPercent] = useState(1.0);
  const [timezone, setTimezone] = useState('est');
  const [defaultAccountId, setDefaultAccountId] = useState('all');

  // Risk Settings State
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState(2.0);
  const [maxDailyLoss, setMaxDailyLoss] = useState(5.0);
  const [maxTradesPerDay, setMaxTradesPerDay] = useState(5);
  const [enableRiskWarnings, setEnableRiskWarnings] = useState(true);
  const [showRiskOnDashboard, setShowRiskOnDashboard] = useState(true);

  // Appearance State
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);

  // Notifications State
  const [dailyLossWarning, setDailyLossWarning] = useState(true);
  const [dailyLossThreshold, setDailyLossThreshold] = useState(3);
  const [riskLimitWarning, setRiskLimitWarning] = useState(true);
  const [goalReminder, setGoalReminder] = useState(false);
  const [goalReminderTime, setGoalReminderTime] = useState('08:00');
  const [weeklySummary, setWeeklySummary] = useState(true);

  // AI & Integrations State
  const [aiProvider, setAiProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [enableAiDeepDive, setEnableAiDeepDive] = useState(true);

  // Load saved preferences & Supabase user data
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          if (user.user_metadata?.full_name) setFullName(user.user_metadata.full_name);
          if (user.user_metadata?.phone) setPhone(user.user_metadata.phone);
          if (user.user_metadata?.avatar_url) setAvatarUrl(user.user_metadata.avatar_url);
        }

        const savedPrefs = localStorage.getItem('tradevault_user_preferences');
        if (savedPrefs) {
          const p = JSON.parse(savedPrefs);
          if (p.currency) setCurrency(p.currency);
          if (p.defaultRiskPercent !== undefined) setDefaultRiskPercent(p.defaultRiskPercent);
          if (p.timezone) setTimezone(p.timezone);
          if (p.defaultAccountId) setDefaultAccountId(p.defaultAccountId);
          if (p.maxRiskPerTrade !== undefined) setMaxRiskPerTrade(p.maxRiskPerTrade);
          if (p.maxDailyLoss !== undefined) setMaxDailyLoss(p.maxDailyLoss);
          if (p.maxTradesPerDay !== undefined) setMaxTradesPerDay(p.maxTradesPerDay);
          if (p.enableRiskWarnings !== undefined) setEnableRiskWarnings(p.enableRiskWarnings);
          if (p.showRiskOnDashboard !== undefined) setShowRiskOnDashboard(p.showRiskOnDashboard);
          if (p.accentColor) setAccentColor(p.accentColor);
          if (p.fontSize) setFontSize(p.fontSize);
          if (p.compactMode !== undefined) setCompactMode(p.compactMode);
          if (p.dailyLossWarning !== undefined) setDailyLossWarning(p.dailyLossWarning);
          if (p.dailyLossThreshold !== undefined) setDailyLossThreshold(p.dailyLossThreshold);
          if (p.riskLimitWarning !== undefined) setRiskLimitWarning(p.riskLimitWarning);
          if (p.goalReminder !== undefined) setGoalReminder(p.goalReminder);
          if (p.goalReminderTime) setGoalReminderTime(p.goalReminderTime);
          if (p.weeklySummary !== undefined) setWeeklySummary(p.weeklySummary);
          if (p.apiKey) setApiKey(p.apiKey);
          if (p.aiProvider) setAiProvider(p.aiProvider);
        }
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    }
    loadUserData();
  }, []);

  const savePreferencesToStorage = (updates: Record<string, any>) => {
    try {
      const current = JSON.parse(localStorage.getItem('tradevault_user_preferences') || '{}');
      const next = { ...current, ...updates };
      localStorage.setItem('tradevault_user_preferences', JSON.stringify(next));
    } catch (e) {
      console.error('Error saving to storage:', e);
    }
  };

  // 1. Save Profile
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone, avatar_url: avatarUrl },
      });
      if (error) throw error;
      savePreferencesToStorage({ fullName, phone, avatarUrl });
      toast.success('Profile updated successfully!');
    } catch (e: any) {
      savePreferencesToStorage({ fullName, phone, avatarUrl });
      toast.success('Profile saved locally!');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Save Trading Preferences
  const handleSaveTradingPrefs = () => {
    savePreferencesToStorage({
      currency,
      defaultRiskPercent,
      timezone,
      defaultAccountId,
    });
    toast.success('Trading preferences saved!');
  };

  // 3. Save Risk Rules
  const handleSaveRiskRules = () => {
    savePreferencesToStorage({
      maxRiskPerTrade,
      maxDailyLoss,
      maxTradesPerDay,
      enableRiskWarnings,
      showRiskOnDashboard,
    });
    toast.success('Risk guardrails saved!');
  };

  // 4. Save Appearance
  const handleSaveAppearance = () => {
    savePreferencesToStorage({
      theme,
      accentColor,
      fontSize,
      compactMode,
    });
    toast.success('Appearance settings applied!');
  };

  // 5. Save Notifications
  const handleSaveNotifications = () => {
    savePreferencesToStorage({
      dailyLossWarning,
      dailyLossThreshold,
      riskLimitWarning,
      goalReminder,
      goalReminderTime,
      weeklySummary,
    });
    toast.success('Notification preferences updated!');
  };

  // 6. Save AI Settings
  const handleSaveAiSettings = () => {
    savePreferencesToStorage({
      aiProvider,
      apiKey,
      enableAiDeepDive,
    });
    toast.success('AI configuration saved successfully!');
  };

  // Export Trades CSV
  const handleExportTrades = () => {
    if (trades.length === 0) {
      toast.error('No trades to export.');
      return;
    }
    const headers = 'ID,Symbol,Direction,Lot Size,Entry Price,Exit Price,P&L,Net P&L,R Multiple,Strategy,Status,Date,Notes\n';
    const rows = trades
      .map(
        (t) =>
          `"${t.id}","${t.symbol}","${t.direction}","${t.lot_size}","${t.entry_price}","${t.exit_price || ''}","${t.pnl || 0}","${t.net_pnl || 0}","${t.r_multiple || 0}","${t.strategy || ''}","${t.status || 'closed'}","${t.entry_date || ''}","${(t.entry_reason || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradevault_trades_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${trades.length} trades to CSV!`);
  };

  // Export Journal Entries
  const handleExportJournal = () => {
    if (journalEntries.length === 0) {
      toast.error('No journal entries to export.');
      return;
    }
    const text = journalEntries
      .map(
        (j) =>
          `==============================\nDate: ${j.entry_date}\nTitle: ${j.title}\nMood: ${j.mood || 'N/A'}\nTags: ${(j.tags || []).join(', ')}\n\n${j.content}\n`
      )
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradevault_journal_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${journalEntries.length} journal entries!`);
  };

  // Import CSV Handler
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          toast.error('CSV file is empty or has no data rows.');
          return;
        }

        let importedCount = 0;
        // Parse CSV rows
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 4) {
            const symbol = cols[1] || cols[0] || 'EURUSD';
            const direction = (cols[2] || cols[1] || 'long').toLowerCase().includes('short') ? 'short' : 'long';
            const lotSize = parseFloat(cols[3] || cols[2]) || 1.0;
            const entryPrice = parseFloat(cols[4] || cols[3]) || 1.0;
            const exitPrice = parseFloat(cols[5] || cols[4]) || undefined;
            const pnl = parseFloat(cols[6] || cols[5]) || 0;

            addTrade({
              symbol,
              direction,
              lot_size: lotSize,
              entry_price: entryPrice,
              exit_price: exitPrice,
              pnl,
              net_pnl: pnl,
              status: 'closed',
            });
            importedCount++;
          }
        }

        toast.success(`Successfully imported ${importedCount} trades from CSV!`);
      } catch (err) {
        toast.error('Failed to parse CSV file. Ensure it has standard columns.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Avatar change handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
      savePreferencesToStorage({ avatarUrl: dataUrl });
      toast.success('Avatar image updated!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, risk rules, appearance, and API integrations.</p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex flex-col h-auto w-full md:w-64 bg-card border rounded-lg p-2 space-y-1 items-start justify-start">
          <TabsTrigger value="profile" className="w-full justify-start gap-2.5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="trading" className="w-full justify-start gap-2.5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings2 className="w-4 h-4" /> Trading Preferences
          </TabsTrigger>
          <TabsTrigger value="risk" className="w-full justify-start gap-2.5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ShieldAlert className="w-4 h-4" /> Risk Settings
          </TabsTrigger>
          <TabsTrigger value="appearance" className="w-full justify-start gap-2.5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Palette className="w-4 h-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start gap-2.5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="data" className="w-full justify-start gap-2.5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="w-4 h-4" /> Data Management
          </TabsTrigger>
          <TabsTrigger value="ai" className="w-full justify-start gap-2.5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="w-4 h-4" /> AI &amp; Gemini
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full max-w-3xl">
          {/* TAB 1: Profile */}
          <TabsContent value="profile" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal trader identity and contact info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 border-2 border-primary/20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                      {fullName.slice(0, 2).toUpperCase() || 'TV'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" /> Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={email} disabled className="bg-muted/50" />
                    <p className="text-xs text-muted-foreground">Managed through your Supabase account.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 2: Trading Preferences */}
          <TabsContent value="trading" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Preferences</CardTitle>
                <CardDescription>Configure your default lot calculations, currency, and timezone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <Label>Default Risk % Per Trade</Label>
                    <span className="text-sm font-semibold text-primary">{defaultRiskPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[defaultRiskPercent]}
                      onValueChange={(val) => setDefaultRiskPercent(val[0])}
                      max={5}
                      step={0.1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={defaultRiskPercent}
                      onChange={(e) => setDefaultRiskPercent(parseFloat(e.target.value) || 0.5)}
                      className="w-20"
                      step={0.1}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Default Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (New York - UTC-5)</SelectItem>
                      <SelectItem value="utc">UTC (London GMT)</SelectItem>
                      <SelectItem value="bst">British Summer Time (BST)</SelectItem>
                      <SelectItem value="jst">Tokyo / Asia (JST - UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Primary Account</Label>
                  <Select value={defaultAccountId} onValueChange={setDefaultAccountId}>
                    <SelectTrigger><SelectValue placeholder="Select primary account" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts (Consolidated)</SelectItem>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSaveTradingPrefs}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 3: Risk Settings */}
          <TabsContent value="risk" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Management Guardrails</CardTitle>
                <CardDescription>Configure account loss limits and safety alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <Label>Max Risk Per Trade %</Label>
                    <span className="text-sm font-semibold text-primary">{maxRiskPerTrade.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[maxRiskPerTrade]}
                      onValueChange={(val) => setMaxRiskPerTrade(val[0])}
                      max={10}
                      step={0.5}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={maxRiskPerTrade}
                      onChange={(e) => setMaxRiskPerTrade(parseFloat(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <Label>Max Daily Loss %</Label>
                    <span className="text-sm font-semibold text-primary">{maxDailyLoss.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[maxDailyLoss]}
                      onValueChange={(val) => setMaxDailyLoss(val[0])}
                      max={20}
                      step={0.5}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={maxDailyLoss}
                      onChange={(e) => setMaxDailyLoss(parseFloat(e.target.value) || 2)}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max-trades">Max Trades Per Day Limit</Label>
                  <Input
                    id="max-trades"
                    type="number"
                    value={maxTradesPerDay}
                    onChange={(e) => setMaxTradesPerDay(parseInt(e.target.value) || 5)}
                    className="max-w-[200px]"
                  />
                </div>

                <div className="pt-4 space-y-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Risk Warnings</Label>
                      <p className="text-sm text-muted-foreground">Alert when trade risk exceeds configured % parameter.</p>
                    </div>
                    <Switch checked={enableRiskWarnings} onCheckedChange={setEnableRiskWarnings} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Risk on Dashboard</Label>
                      <p className="text-sm text-muted-foreground">Display risk metrics and drawdown buffers prominently.</p>
                    </div>
                    <Switch checked={showRiskOnDashboard} onCheckedChange={setShowRiskOnDashboard} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSaveRiskRules}>Save Risk Rules</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 4: Appearance */}
          <TabsContent value="appearance" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance &amp; Theme</CardTitle>
                <CardDescription>Customize the dark aesthetic and color accents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark" className="cursor-pointer">Dark Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light" className="cursor-pointer">Light Mode</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Accent Color Palette</Label>
                  <div className="flex gap-3">
                    {[
                      { id: 'blue', color: '#3b82f6', name: 'Blue' },
                      { id: 'purple', color: '#8b5cf6', name: 'Purple' },
                      { id: 'green', color: '#22c55e', name: 'Green' },
                      { id: 'orange', color: '#f97316', name: 'Orange' },
                      { id: 'red', color: '#ef4444', name: 'Red' },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setAccentColor(item.id)}
                        className={`w-9 h-9 rounded-full cursor-pointer transition-all flex items-center justify-center ${
                          accentColor === item.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      >
                        {accentColor === item.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Font Size</Label>
                  <RadioGroup value={fontSize} onValueChange={setFontSize} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="font-sm" />
                      <Label htmlFor="font-sm" className="cursor-pointer">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="font-md" />
                      <Label htmlFor="font-md" className="cursor-pointer">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="font-lg" />
                      <Label htmlFor="font-lg" className="cursor-pointer">Large</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Reduce table row height and padding to fit more trades.</p>
                  </div>
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSaveAppearance}>Save Appearance</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 5: Notifications */}
          <TabsContent value="notifications" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage your daily risk alerts and journaling reminders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Loss Warning</Label>
                    <p className="text-sm text-muted-foreground">Alert when daily loss exceeds a specific % threshold.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={dailyLossThreshold}
                      onChange={(e) => setDailyLossThreshold(parseFloat(e.target.value) || 3)}
                      className="w-16 h-8"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    <Switch checked={dailyLossWarning} onCheckedChange={setDailyLossWarning} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Risk Limit Warning</Label>
                    <p className="text-sm text-muted-foreground">Alert when a trade setup exceeds your max risk %.</p>
                  </div>
                  <Switch checked={riskLimitWarning} onCheckedChange={setRiskLimitWarning} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Goal &amp; Journal Reminder</Label>
                    <p className="text-sm text-muted-foreground">Daily reminder to review closed trades and write journal entries.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={goalReminderTime}
                      onChange={(e) => setGoalReminderTime(e.target.value)}
                      className="w-28 h-8"
                    />
                    <Switch checked={goalReminder} onCheckedChange={setGoalReminder} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Performance Summary</Label>
                    <p className="text-sm text-muted-foreground">Generate a weekly statistical summary of your executions.</p>
                  </div>
                  <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 6: Data Management */}
          <TabsContent value="data" className="m-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export &amp; Import Data</CardTitle>
                <CardDescription>Download your data in CSV/TXT or import past trade records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Export Records</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="gap-2" onClick={handleExportTrades}>
                      <Download className="w-4 h-4 text-primary" /> Export Trades (CSV)
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleExportJournal}>
                      <Download className="w-4 h-4 text-primary" /> Export Journal (TXT)
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-sm font-medium">Import Trades from CSV</h3>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv"
                    onChange={handleImportCsv}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-primary mb-3" />
                    <p className="text-sm font-medium">Click to browse and upload CSV file</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports MetaTrader (MT4/MT5), TradingView, and cTrader exports</p>
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
                    <h4 className="font-medium text-sm">Restore Sample Demo Data</h4>
                    <p className="text-sm text-muted-foreground mt-1">Populate 3 sample accounts, trades, and journal entries for testing.</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetToDemoData();
                      toast.success('TradeVault reset to demo data!');
                    }}
                  >
                    Restore Demo Data
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-red-500">Wipe All TradeVault Data</h4>
                    <p className="text-sm text-muted-foreground mt-1">Permanently remove all accounts, trades, goals, and journal notes.</p>
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
                    This will permanently clear all accounts, trade logs, calendar entries, analytics, and journal notes from your database and browser storage.
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
                      toast.success('All data has been wiped.');
                    }}
                  >
                    Yes, Wipe Everything
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* TAB 7: AI & Integrations */}
          <TabsContent value="ai" className="m-0 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>AI Analysis &amp; Coach Integration</CardTitle>
                  <CardDescription>Configure Google Gemini for personalized trade coaching.</CardDescription>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Gemini Active
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Enable AI Deep Dive Coach
                    </h4>
                    <p className="text-sm text-muted-foreground">Conversational analysis on your trade logs, psychology, and risk.</p>
                  </div>
                  <Switch checked={enableAiDeepDive} onCheckedChange={setEnableAiDeepDive} />
                </div>

                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="grid gap-2">
                    <Label>AI Engine Provider</Label>
                    <Select value={aiProvider} onValueChange={setAiProvider}>
                      <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini 2.5 Flash (Recommended)</SelectItem>
                        <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude 3.5 Sonnet)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="api-key">Gemini / AI API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="api-key"
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your API key"
                          className="pl-9 font-mono text-sm"
                        />
                      </div>
                      <Button variant="secondary" onClick={handleSaveAiSettings}>
                        Save Key
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3.5 rounded-lg border border-primary/10">
                    <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                    API keys are securely transmitted to your backend endpoint for server-side evaluation.
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSaveAiSettings}>Save AI Configuration</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
