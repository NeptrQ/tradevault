'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorProgress } from '@/components/ui/color-progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, RefreshCw, AlertTriangle, CheckCircle2, Target, TrendingUp, XCircle, ChevronRight, Lock } from 'lucide-react';

const radarData = [
  { subject: 'Win Rate', A: 58, fullMark: 100, benchmark: 50 },
  { subject: 'Profit Factor', A: 70, fullMark: 100, benchmark: 50 },
  { subject: 'Risk Discipline', A: 82, fullMark: 100, benchmark: 50 },
  { subject: 'Consistency', A: 78, fullMark: 100, benchmark: 50 },
  { subject: 'Psychology', A: 61, fullMark: 100, benchmark: 50 },
  { subject: 'Avg R', A: 65, fullMark: 100, benchmark: 50 },
];

export default function AIReviewPage() {
  const [activeTab, setActiveTab] = useState('smart');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Review</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Brain className="w-3 h-3 mr-1" /> Smart Review
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Last analyzed: Today at 09:42 AM
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Analysis
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="smart">Smart Review</TabsTrigger>
          <TabsTrigger value="ai">AI Deep Dive</TabsTrigger>
        </TabsList>

        <TabsContent value="smart" className="space-y-6">
          {/* Overall Score Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1 bg-card border-border flex flex-col justify-center items-center p-6">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" strokeDasharray="283" strokeDashoffset="74" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold">74</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <h3 className="font-semibold text-lg text-center">Overall Score</h3>
              <p className="text-sm text-muted-foreground text-center">Solid performance with room for improvement</p>
            </Card>

            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Risk Discipline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500 mb-2">82/100</div>
                  <ColorProgress value={82} className="h-2" indicatorColor="bg-blue-500" />
                  <p className="text-xs text-muted-foreground mt-2">Excellent consistency</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Psychology</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500 mb-2">61/100</div>
                  <ColorProgress value={61} className="h-2" indicatorColor="bg-yellow-500" />
                  <p className="text-xs text-muted-foreground mt-2">Needs attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500 mb-2">78/100</div>
                  <ColorProgress value={78} className="h-2" indicatorColor="bg-green-500" />
                  <p className="text-xs text-muted-foreground mt-2">Above average</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" /> What You're Doing Well
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background rounded-lg p-3 border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" /> Strong Risk Discipline
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Stayed within 1% limit on 89% of trades</p>
                </div>
                <div className="bg-background rounded-lg p-3 border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" /> Profitable Strategy
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Breakout strategy shows 2.3 profit factor with 15+ trades</p>
                </div>
                <div className="bg-background rounded-lg p-3 border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Consistent in London Session
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">68% win rate, your best session</p>
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" /> Problems Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background rounded-lg p-3 border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="w-4 h-4" /> Possible Revenge Trading
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Detected in 4 of your last 15 losing trades. Risk increased &gt;30% within 30 min of a loss.</p>
                </div>
                <div className="bg-background rounded-lg p-3 border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2 text-red-500">
                    <XCircle className="w-4 h-4" /> Overtrading on Fridays
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Average 6.2 trades on Fridays vs 3.1 other days, with lower win rate.</p>
                </div>
                <div className="bg-background rounded-lg p-3 border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2 text-red-500">
                    <TrendingUp className="w-4 h-4 rotate-180" /> Negative Expectancy on Reversal Strategy
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Only 38% win rate with average -0.4R</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Profile</CardTitle>
                <CardDescription>How you stack up against benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={radarData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#888" />
                      <YAxis dataKey="subject" type="category" stroke="#888" width={100} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                      <Bar dataKey="A" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Score" />
                      <ReferenceLine x={50} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Plan</CardTitle>
                <CardDescription>Recommended steps to improve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Take a Break After 2 Consecutive Losses', desc: 'Implement a mandatory 1-hour screen break.', type: 'psychology' },
                  { title: 'Stop Trading Reversal Strategy for 30 Days', desc: 'Focus on your profitable setups instead.', type: 'strategy' },
                  { title: 'Focus on London Session Breakouts', desc: 'Your edge is strongest here. Increase volume here.', type: 'focus' },
                  { title: 'Journal After Every Trade', desc: 'Your journaled trades have 12% higher win rate.', type: 'habit' },
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
          <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Unlock AI Deep Dive</CardTitle>
              <CardDescription className="text-base mt-2">
                Smart Review works without an API key, providing pattern recognition and statistical analysis. 
                To enable conversational AI and deeper, personalized analysis, configure your OpenAI API key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                <Lock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  Your API key is stored securely encrypted on our servers and is never exposed to the browser.
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="api-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <Input id="api-key" type="password" placeholder="sk-..." className="flex-1" />
                  <Button>Save Key</Button>
                </div>
              </div>
              <Link href="/settings">
                <Button variant="link" className="w-full text-muted-foreground mt-4">
                  Go to Settings <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
