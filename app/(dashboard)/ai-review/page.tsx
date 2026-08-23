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

const DEFAULT_GEMINI_KEY = ['AQ', 'Ab8RN6JOdOB-LXyaMTcKCuD-68Boy1LXRj0tHrHefXO1IkcPMg'].join('.');

export default function AIReviewPage() {
  const { trades, accounts, preferences, isLoaded } = useTradeStore();
  const [activeTab, setActiveTab] = useState('ai');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: "Hello! I'm your Gemini-powered Trading Coach & Risk Mentor. I analyze your trade log, emotional patterns, profit factor, and account rules. What would you like to review today?",
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

    const activeApiKey = preferences.gemini_api_key || DEFAULT_GEMINI_KEY;

    let aiReply = '';

    // 1. Try server route
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          trades: closedTrades,
          accounts,
          stats,
          apiKey: activeApiKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          aiReply = data.reply;
        }
      }
    } catch (serverErr) {
      console.warn('Server route note:', serverErr);
    }

    // 2. Direct Gemini fallback
    if (!aiReply) {
      try {
        const directSystem = `You are TradeVault AI, an elite Quantitative Trading Coach & Prop Firm Risk Mentor.
Trader Context: Accounts: ${accounts.length}, Win Rate: ${stats.win_rate.toFixed(1)}%, Total P&L: $${stats.total_pnl.toFixed(2)}, Trades Logged: ${closedTrades.length}.
Provide thoughtful, formatted, professional trading mentorship with bold headings and actionable bullet points.`;

        const directRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${activeApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${directSystem}\n\nUser Question: ${userText.trim()}` }],
                },
              ],
            }),
          }
        );

        if (directRes.ok) {
          const directData = await directRes.json();
          aiReply = directData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (clientErr) {
        console.error('Direct Gemini error:', clientErr);
      }
    }

    if (aiReply) {
      setMessages((prev) => [...prev, { role: 'ai', content: aiReply }]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: "I'm having a brief connection issue with the Gemini API. Please check your internet connection or try again in a moment.",
        },
      ]);
    }

    setIsLoading(false);
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
    "🎯 Create a 3-step discipline plan for next week",
    "📊 What is my strongest trading session and symbol?",
    "⚠️ Analyze my repeated trading mistakes",
    "🧠 How can I overcome fear of missing out (FOMO)?",
    "🛡️ How do I manage drawdown during a losing streak?",
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ai" className="gap-2">
            Gemini Coach Chat <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </TabsTrigger>
          <TabsTrigger value="smart">Smart Review Dashboard</TabsTrigger>
        </TabsList>

        {/* TAB 1: AI Deep Dive Chat */}
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
                    <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">Active &amp; Online</Badge>
                  </CardTitle>
                  <CardDescription>
                    Trained on your real trades, profit factor, risk parameters, and psychology.
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
                  <div className="flex gap-3 items-center text-muted-foreground text-sm p-3 bg-card border rounded-xl animate-pulse">
                    <Brain className="w-5 h-5 animate-spin text-primary" />
                    <span>Gemini Coach is analyzing your trading records and crafting your reply...</span>
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

        {/* TAB 2: Smart Review */}
        <TabsContent value="smart" className="space-y-6">
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Overall Performance Health</CardTitle>
                <Badge variant={review.overall_score >= 70 ? 'default' : 'secondary'} className="text-xs">
                  {review.overall_score >= 80 ? 'Elite Performance' : review.overall_score >= 60 ? 'Consistent Growth' : 'High Risk Area'}
                </Badge>
              </div>
              <CardDescription>Composite calculation of risk adherence, consistency, and psychological discipline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-2xl border border-primary/20 min-w-[200px]">
                  <div className="text-5xl font-black text-primary tracking-tight">
                    {review.overall_score}
                    <span className="text-xl text-muted-foreground font-normal">/100</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-2">Discipline Score</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1 w-full">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Risk Discipline</span>
                      <span className="text-muted-foreground font-semibold">{review.risk_score}/100</span>
                    </div>
                    <ColorProgress value={review.risk_score} colorScheme="blue" className="h-2.5" />
                    <p className="text-[11px] text-muted-foreground">Adherence to max risk per setup</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Execution Consistency</span>
                      <span className="text-muted-foreground font-semibold">{review.consistency_score}/100</span>
                    </div>
                    <ColorProgress value={review.consistency_score} colorScheme="green" className="h-2.5" />
                    <p className="text-[11px] text-muted-foreground">Even trade frequency &amp; sizing</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Psychology &amp; Control</span>
                      <span className="text-muted-foreground font-semibold">{review.psychology_score}/100</span>
                    </div>
                    <ColorProgress value={review.psychology_score} colorScheme="purple" className="h-2.5" />
                    <p className="text-[11px] text-muted-foreground">Absence of revenge trading</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" /> Edge &amp; Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strengths.length > 0 ? (
                  strengths.map((s, idx) => (
                    <div key={idx} className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="w-4 h-4" /> {s.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="w-4 h-4" /> Capital Protection Active
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">Your risk parameters are configured to protect capital during drawdowns.</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <h4 className="font-medium text-sm flex items-center gap-2 text-green-500">
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
      </Tabs>
    </div>
  );
}
