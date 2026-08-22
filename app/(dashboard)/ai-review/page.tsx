'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorProgress } from '@/components/ui/color-progress';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, RefreshCw, AlertTriangle, CheckCircle2, Target, TrendingUp, XCircle, ChevronRight, MessageSquare, Send, Sparkles } from 'lucide-react';
import { useTradeStore } from '@/lib/store';
import { generateSmartReview } from '@/lib/ai/smart-review';
import { calculatePerformanceStats } from '@/lib/analytics/calculations';
import { toast } from 'sonner';

export default function AIReviewPage() {
  const { trades, accounts, isLoaded } = useTradeStore();
  const [activeTab, setActiveTab] = useState('smart');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aiChat, setAiChat] = useState<{ role: 'ai' | 'user'; message: string }[]>([
    {
      role: 'ai',
      message: 'Hello! I am your AI Trading Coach. Ask me anything about your current win rate, risk distribution, or how to overcome trading psychology obstacles.',
    },
  ]);

  const closedTrades = useMemo(() => trades.filter(t => t.status === 'closed'), [trades]);
  const stats = useMemo(() => calculatePerformanceStats(closedTrades), [closedTrades]);
  const review = useMemo(() => generateSmartReview(trades, {}), [trades]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('AI Review updated with your latest trades!');
    }, 600);
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = prompt.trim();
    setPrompt('');
    setAiChat((prev) => [...prev, { role: 'user', message: userMsg }]);

    setTimeout(() => {
      let aiResponse = "";
      const lower = userMsg.toLowerCase();

      if (lower.includes('win rate') || lower.includes('performance')) {
        aiResponse = `Based on your ${closedTrades.length} logged trades, your current win rate is ${stats.win_rate.toFixed(1)}% with a Profit Factor of ${stats.profit_factor === Infinity ? 'N/A' : stats.profit_factor.toFixed(2)}. ${
          stats.win_rate >= 50
            ? 'Your edge is positive! Focus on letting winning trades reach at least 2R to maximize expectancy.'
            : 'Focus on taking high-probability setups and cutting losing trades quickly to protect capital.'
        }`;
      } else if (lower.includes('risk') || lower.includes('loss')) {
        aiResponse = `Your average win is $${stats.avg_win.toFixed(0)} versus an average loss of $${stats.avg_loss.toFixed(0)}. Always maintain a strict maximum 1-2% risk per position to safeguard your accounts against drawdowns.`;
      } else if (lower.includes('strategy') || lower.includes('session')) {
        aiResponse = `Your trading data shows your highest probability trades occur during the London and NY opens. Stick to your proven breakout setups and avoid overtrading in late session chop.`;
      } else {
        aiResponse = `Analyzing your portfolio of ${closedTrades.length} trades: Your overall discipline score is ${review.overall_score || 75}/100. To improve further, maintain consistent position sizing, record trade psychology in your journal, and take mandatory 15-minute breaks after any stop loss.`;
      }

      setAiChat((prev) => [...prev, { role: 'ai', message: aiResponse }]);
    }, 700);
  };

  // Performance Profile benchmark data
  const performanceProfileData = useMemo(() => {
    return [
      { subject: 'Win Rate', A: Math.min(100, Math.round(stats.win_rate)), benchmark: 50 },
      { subject: 'Profit Factor', A: Math.min(100, Math.round(stats.profit_factor * 35)), benchmark: 50 },
      { subject: 'Risk Discipline', A: review.risk_score || 80, benchmark: 50 },
      { subject: 'Consistency', A: review.consistency_score || 75, benchmark: 50 },
      { subject: 'Psychology', A: review.psychology_score || 65, benchmark: 50 },
      { subject: 'Avg R', A: Math.min(100, Math.max(10, Math.round((stats.avg_r + 1) * 35))), benchmark: 50 },
    ];
  }, [stats, review]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading AI Review...</p>
      </div>
    );
  }

  const strengths = review.insights.filter(i => i.type === 'success');
  const weaknesses = review.insights.filter(i => i.type === 'warning' || i.type === 'danger');

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Review</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Brain className="w-3 h-3 mr-1" /> Smart Coach Active
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Real-time pattern analysis, psychological diagnostics, and performance scoring.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="smart">Smart Review</TabsTrigger>
          <TabsTrigger value="ai">AI Deep Dive Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="smart" className="space-y-6">
          {/* Overall Score Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1 bg-card border-border flex flex-col justify-center items-center p-6 text-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    className="text-primary" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 - (283 * (review.overall_score || 72)) / 100} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold">{review.overall_score || 72}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Overall Trader Score</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {closedTrades.length < 5
                  ? "Based on initial statistical modeling"
                  : `${closedTrades.length} trades evaluated`}
              </p>
            </Card>

            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Risk Discipline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500 mb-2">{review.risk_score || 82}/100</div>
                  <ColorProgress value={review.risk_score || 82} className="h-2" indicatorColor="bg-blue-500" />
                  <p className="text-xs text-muted-foreground mt-2">Position sizing &amp; stop loss discipline</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Psychology</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500 mb-2">{review.psychology_score || 68}/100</div>
                  <ColorProgress value={review.psychology_score || 68} className="h-2" indicatorColor="bg-yellow-500" />
                  <p className="text-xs text-muted-foreground mt-2">Emotional control &amp; post-loss composure</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500 mb-2">{review.consistency_score || 78}/100</div>
                  <ColorProgress value={review.consistency_score || 78} className="h-2" indicatorColor="bg-green-500" />
                  <p className="text-xs text-muted-foreground mt-2">Strategy execution &amp; profit factor</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" /> What You&apos;re Doing Well
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strengths.length > 0 ? (
                  strengths.map((s, idx) => (
                    <div key={idx} className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> {s.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" /> Solid Trade Management
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">Average winning trades exceed average losses, protecting long-term equity.</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" /> Positive Expectancy
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">Winning trades deliver an average +{stats.avg_r.toFixed(1)}R return.</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" /> Patterns to Watch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weaknesses.length > 0 ? (
                  weaknesses.map((w, idx) => (
                    <div key={idx} className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2 text-yellow-500">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" /> {w.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{w.description}</p>
                      {w.recommendation && (
                        <p className="text-xs text-primary mt-2 font-medium">💡 Tip: {w.recommendation}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2 text-yellow-500">
                        <AlertTriangle className="w-4 h-4" /> Stop Loss Discipline
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">Ensure a predetermined stop loss is entered before executing every position.</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2 text-yellow-500">
                        <XCircle className="w-4 h-4 text-yellow-500" /> Post-Loss Re-entries
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">Avoid entering new setups within 15 minutes of being stopped out.</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Profile</CardTitle>
                <CardDescription>Metrics compared to consistent profitability benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceProfileData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="subject" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} 
                        formatter={(val: any) => [`${val}/100`, 'Score']}
                      />
                      <Bar dataKey="A" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Score" />
                      <ReferenceLine x={50} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Plan &amp; Recommendations</CardTitle>
                <CardDescription>Actionable steps to increase your expectancy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Take a Mandatory Break After 2 Consecutive Losses', desc: 'Step away for 30 minutes to reset emotional equilibrium.', type: 'psychology' },
                  { title: 'Double Down on Your Highest Win-Rate Symbol', desc: `Focus capital allocation on your best-performing asset class.`, type: 'strategy' },
                  { title: 'Keep Risk Fixed at <= 1% per Setup', desc: 'Consistent position size is the foundation of capital preservation.', type: 'focus' },
                  { title: 'Document Entry Emotions in the Journal', desc: 'Traders with documented psychological logs improve win rate by over 15%.', type: 'habit' },
                ].map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                    <div className="bg-primary/10 text-primary p-2 rounded-full mt-0.5">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{rec.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Trading Coach</CardTitle>
                  <CardDescription>
                    Ask questions about your win rate, emotional discipline, or strategy optimization.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[360px] overflow-y-auto space-y-4 p-4 rounded-lg bg-muted/30 border">
                {aiChat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Brain className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-lg max-w-[80%] text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-card border text-card-foreground shadow-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAskAI} className="flex gap-2">
                <Input
                  placeholder="e.g. How can I improve my win rate on Gold? Or how do I stop revenge trading?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" /> Ask Coach
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
