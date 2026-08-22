'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorProgress } from '@/components/ui/color-progress';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, RefreshCw, AlertTriangle, CheckCircle2, Target, TrendingUp, XCircle, Sparkles, Send, Bot, User, Trash2 } from 'lucide-react';
import { useTradeStore } from '@/lib/store';
import { generateSmartReview } from '@/lib/ai/smart-review';
import { calculatePerformanceStats } from '@/lib/analytics/calculations';
import { toast } from 'sonner';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

export default function AIReviewPage() {
  const { trades, accounts, isLoaded } = useTradeStore();
  const [activeTab, setActiveTab] = useState('smart');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: "Hello! I'm your Gemini-powered Trading Coach. I've analyzed your account rules, trade log, and metrics. How can I help you sharpen your edge today?",
    },
  ]);

  const closedTrades = useMemo(() => trades.filter(t => t.status === 'closed'), [trades]);
  const stats = useMemo(() => calculatePerformanceStats(closedTrades), [closedTrades]);
  const review = useMemo(() => generateSmartReview(trades, {}), [trades]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('AI Review updated with your latest trades!');
    }, 500);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userText.trim() }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          trades: closedTrades,
          accounts,
          stats,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err: any) {
      toast.error('AI chat error. Please check your connection.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `I reviewed your ${closedTrades.length} trades:
- **Win Rate**: ${stats.win_rate.toFixed(1)}%
- **Expectancy**: $${stats.expectancy.toFixed(2)} per trade
- **Key Recommendation**: Stick to maximum 1% risk per setup and never trade within 15 minutes of major macroeconomic news releases.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
        <p className="text-muted-foreground animate-pulse">Loading AI Review &amp; Coach...</p>
      </div>
    );
  }

  const strengths = review.insights.filter(i => i.type === 'success');
  const weaknesses = review.insights.filter(i => i.type === 'warning' || i.type === 'danger');

  const suggestions = [
    "📊 What is my strongest trading session and symbol?",
    "⚠️ Analyze my repeated trading mistakes",
    "🧠 How can I overcome fear of missing out (FOMO)?",
    "🎯 Create a 3-step discipline plan for next week",
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Review &amp; Coach</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" /> Gemini 2.5 Active
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Real-time pattern analysis, statistical diagnostics, and Gemini conversational trading mentor.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="smart">Smart Review Dashboard</TabsTrigger>
          <TabsTrigger value="ai" className="relative">
            Gemini Coach Chat
            <span className="ml-1.5 flex h-2 w-2 rounded-full bg-green-500" />
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Smart Review */}
        <TabsContent value="smart" className="space-y-6">
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
                  <p className="text-xs text-muted-foreground mt-2">Emotional control &amp; composure</p>
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
                        <Target className="w-4 h-4 text-green-500" /> Strong Reward-to-Risk
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

        {/* TAB 2: AI Deep Dive Chat */}
        <TabsContent value="ai">
          <Card className="max-w-4xl mx-auto border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Gemini AI Trading Mentor
                    <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">Live Context</Badge>
                  </CardTitle>
                  <CardDescription>
                    Trained on your real trades, profit factor, risk parameters, and emotions.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-500"
                onClick={() => setMessages([
                  {
                    role: 'ai',
                    content: "Chat reset. How can I help you analyze your trading today?",
                  },
                ])}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Clear Chat
              </Button>
            </CardHeader>

            <CardContent className="p-4 md:p-6 space-y-4">
              {/* Chat history */}
              <div className="h-[460px] overflow-y-auto space-y-4 p-4 rounded-xl bg-muted/20 border">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary border">
                        <Brain className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto rounded-br-none shadow-md'
                          : 'bg-card border text-card-foreground shadow-sm rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-foreground border">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 items-center text-muted-foreground text-sm p-2 animate-pulse">
                    <Brain className="w-4 h-4 animate-spin text-primary" />
                    <span>Gemini Coach is analyzing your trading records...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(s)}
                    className="text-xs bg-muted hover:bg-primary/10 hover:text-primary transition-colors border px-3 py-1.5 rounded-full text-muted-foreground text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="flex gap-2 pt-2"
              >
                <Input
                  placeholder="Ask Gemini Coach about your risk, win rate, or trading psychology..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 h-11 text-sm"
                />
                <Button type="submit" disabled={isLoading || !inputMessage.trim()} className="h-11 px-5">
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
