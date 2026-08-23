'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Award, Lock, Edit, CheckCircle2, ShieldCheck, Target, Zap, Upload, UserCheck, Briefcase } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useTradeStore } from '@/lib/store';
import { calculatePerformanceStats, getSymbolPerformance, getEquityCurve } from '@/lib/analytics/calculations';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProfilePage() {
  const { profile, updateProfile, accounts, trades, isLoaded } = useTradeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name || 'Alex Trader');
  const [editPhone, setEditPhone] = useState(profile.phone || '');
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editStyle, setEditStyle] = useState(profile.trading_style || 'Price Action & Breakout');
  const [editExp, setEditExp] = useState(profile.experience_years || '3 Years');
  const [editAvatar, setEditAvatar] = useState(profile.avatar_url || '');

  const openEditModal = () => {
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setEditBio(profile.bio);
    setEditStyle(profile.trading_style);
    setEditExp(profile.experience_years);
    setEditAvatar(profile.avatar_url);
    setIsEditOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim() || 'Trader',
      phone: editPhone.trim(),
      bio: editBio.trim(),
      trading_style: editStyle.trim(),
      experience_years: editExp.trim(),
      avatar_url: editAvatar,
    });
    setIsEditOpen(false);
    toast.success('Profile updated successfully!');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEditAvatar(dataUrl);
      toast.success('Avatar image loaded!');
    };
    reader.readAsDataURL(file);
  };

  const closedTrades = useMemo(() => trades.filter((t) => t.status === 'closed'), [trades]);
  const stats = useMemo(() => calculatePerformanceStats(closedTrades, 100000), [closedTrades]);
  const topSymbols = useMemo(() => getSymbolPerformance(closedTrades).slice(0, 5), [closedTrades]);
  const equityData = useMemo(() => getEquityCurve(closedTrades, 100000), [closedTrades]);

  const achievements = useMemo(() => [
    { title: 'First Trade Logged', desc: 'Started your trading journey.', unlocked: trades.length > 0 },
    { title: 'Profitable Portfolio', desc: 'Maintained a positive net P&L.', unlocked: stats.total_pnl > 0 },
    { title: 'High Win Rate (>55%)', desc: 'Demonstrated consistent edge.', unlocked: stats.win_rate >= 55 },
    { title: '10+ Trades Logged', desc: 'Building consistent journaling habits.', unlocked: trades.length >= 10 },
    { title: 'Funded Account Active', desc: 'Configured active trading accounts.', unlocked: accounts.length > 0 },
    { title: 'Risk Master', desc: 'Kept max drawdown below 5%.', unlocked: stats.max_drawdown < 5 && closedTrades.length >= 5 },
  ], [trades, stats, accounts, closedTrades]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Profile Header */}
      <Card className="bg-card shadow-sm border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary/30">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {profile.name.slice(0, 2).toUpperCase() || 'TV'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <UserCheck className="w-3 h-3 mr-1" /> Verified Trader
                </Badge>
                {profile.experience_years && (
                  <Badge variant="outline">{profile.experience_years} Experience</Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm">
                <span>{profile.email || 'trader@tradevault.com'}</span>
                {profile.phone && (
                  <>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span>{profile.phone}</span>
                  </>
                )}
              </p>
              {profile.bio && (
                <p className="text-sm text-foreground/85 max-w-2xl pt-1">
                  {profile.bio}
                </p>
              )}
            </div>
            <Button onClick={openEditModal} className="gap-2 shrink-0">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trades.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.win_rate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&amp;L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stats.total_pnl >= 0 ? "text-green-500" : "text-red-500")}>
              {stats.total_pnl >= 0 ? '+' : ''}{formatCurrency(stats.total_pnl)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Equity Growth Curve</CardTitle>
            <CardDescription>Visual representation of your portfolio equity across closed trades.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquityProfile" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: any) => [formatCurrency(value as number), 'Equity']}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEquityProfile)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Symbols */}
        <Card>
          <CardHeader>
            <CardTitle>Top Symbols</CardTitle>
            <CardDescription>Breakdown by volume and net return</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {topSymbols.length === 0 ? (
              <p className="p-6 text-sm text-center text-muted-foreground">Log trades to see your symbol performance breakdown.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">P&amp;L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSymbols.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell className="text-right">{item.win_rate.toFixed(0)}%</TableCell>
                      <TableCell className={cn("text-right font-medium", item.total_pnl >= 0 ? "text-green-500" : "text-red-500")}>
                        {item.total_pnl >= 0 ? '+' : ''}{formatCurrency(item.total_pnl)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Discipline &amp; Growth Badges</CardTitle>
          <CardDescription>Milestones achieved through disciplined execution and journaling.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((acc, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-4 rounded-lg border flex gap-4 items-start transition-colors",
                  acc.unlocked ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 opacity-60 grayscale"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full",
                  acc.unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {acc.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-medium text-sm flex items-center gap-1.5">
                    {acc.title}
                    {acc.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{acc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Trader Profile</DialogTitle>
            <DialogDescription>Update your public trader information, avatar, and background.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            <div className="flex items-center gap-4 pb-2 border-b">
              <Avatar className="w-16 h-16 border-2 border-primary/30">
                <AvatarImage src={editAvatar} />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {editName.slice(0, 2).toUpperCase() || 'TV'}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload Picture
                </Button>
                <p className="text-[11px] text-muted-foreground mt-1">PNG, JPG or WebP</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Alex Trader"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-style">Trading Style / Strategy</Label>
                <Input
                  id="edit-style"
                  value={editStyle}
                  onChange={(e) => setEditStyle(e.target.value)}
                  placeholder="e.g. Price Action &amp; Breakouts"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-exp">Experience</Label>
                <Input
                  id="edit-exp"
                  value={editExp}
                  onChange={(e) => setEditExp(e.target.value)}
                  placeholder="e.g. 3 Years"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-bio">Trader Bio / Notes</Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Share your trading philosophy, rules, and objectives..."
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
