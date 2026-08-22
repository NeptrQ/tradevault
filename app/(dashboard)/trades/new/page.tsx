'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, Save, UploadCloud, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useTradeStore } from '@/lib/store';

const tradeSchema = z.object({
  account: z.string().min(1, 'Account is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  direction: z.enum(['Long', 'Short']),
  entryDate: z.string().min(1, 'Entry date is required'),
  entryTime: z.string().min(1, 'Entry time is required'),
  exitDate: z.string().optional(),
  exitTime: z.string().optional(),
  entryPrice: z.coerce.number().min(0.00001, 'Invalid price'),
  exitPrice: z.coerce.number().optional(),
  lotSize: z.coerce.number().min(0.01, 'Invalid lot size'),
  strategy: z.string().min(1, 'Strategy is required'),
  
  stopLoss: z.coerce.number().optional(),
  takeProfit: z.coerce.number().optional(),
  riskAmount: z.coerce.number().optional(),
  
  commission: z.coerce.number().default(0),
  swap: z.coerce.number().default(0),
  
  emotionBefore: z.string().optional(),
  emotionDuring: z.string().optional(),
  emotionAfter: z.string().optional(),
  confidence: z.number().min(1).max(10).default(5),
  
  entryReason: z.string().optional(),
  exitReason: z.string().optional(),
  wentWell: z.string().optional(),
  wentWrong: z.string().optional(),
  lesson: z.string().optional(),
  tags: z.string().optional(),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

const EMOTIONS = ['Calm', 'Confident', 'Anxious', 'Fearful', 'Greedy', 'Frustrated', 'Euphoric', 'Focused', 'Impulsive'];

export default function AddTradePage() {
  const router = useRouter();
  const { accounts, addTrade } = useTradeStore();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      direction: 'Long',
      confidence: 5,
      commission: 0,
      swap: 0,
      entryDate: new Date().toISOString().split('T')[0],
      entryTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
    }
  });

  const { watch, setValue } = form;
  const values = watch();

  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    riskPercentage: 0,
    plannedRR: 0,
    pnl: 0,
    netPnl: 0,
    rMultiple: 0,
  });

  useEffect(() => {
    // Dummy calculations for demo purposes
    let riskPercentage = 0;
    let plannedRR = 0;
    let pnl = 0;
    let netPnl = 0;
    let rMultiple = 0;

    const accountBalance = 100000; // Mock balance

    if (values.riskAmount) {
      riskPercentage = (values.riskAmount / accountBalance) * 100;
    }

    if (values.entryPrice && values.stopLoss && values.takeProfit) {
      const risk = Math.abs(values.entryPrice - values.stopLoss);
      const reward = Math.abs(values.takeProfit - values.entryPrice);
      if (risk > 0) plannedRR = reward / risk;
    }

    if (values.entryPrice && values.exitPrice && values.lotSize) {
      // Simplified PnL calc
      const diff = values.direction === 'Long' 
        ? values.exitPrice - values.entryPrice 
        : values.entryPrice - values.exitPrice;
      
      // Rough multiplier for demo
      pnl = diff * values.lotSize * 100000;
      netPnl = pnl - (values.commission || 0) + (values.swap || 0);

      if (values.riskAmount && values.riskAmount > 0) {
        rMultiple = pnl / values.riskAmount;
      }
    }

    setCalculatedValues({
      riskPercentage,
      plannedRR,
      pnl,
      netPnl,
      rMultiple
    });
  }, [values]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = (data: TradeFormValues) => {
    const matchedAccount = accounts.find(a => a.name === data.account || a.id === data.account) || accounts[0];
    
    addTrade({
      account_id: matchedAccount?.id,
      symbol: data.symbol.toUpperCase(),
      direction: data.direction.toLowerCase() as 'long' | 'short',
      entry_date: `${data.entryDate}T${data.entryTime}:00Z`,
      exit_date: data.exitDate ? `${data.exitDate}T${data.exitTime || '00:00'}:00Z` : undefined,
      entry_price: data.entryPrice,
      exit_price: data.exitPrice,
      lot_size: data.lotSize,
      strategy: data.strategy,
      stop_loss: data.stopLoss,
      take_profit: data.takeProfit,
      risk_amount: data.riskAmount,
      commission: data.commission,
      swap: data.swap,
      pnl: calculatedValues.pnl,
      net_pnl: calculatedValues.netPnl,
      r_multiple: calculatedValues.rMultiple,
      status: data.exitPrice ? 'closed' : 'open',
      confidence: data.confidence,
      emotion_before: data.emotionBefore?.toLowerCase() as any,
      emotion_during: data.emotionDuring?.toLowerCase() as any,
      emotion_after: data.emotionAfter?.toLowerCase() as any,
      entry_reason: data.entryReason,
      exit_reason: data.exitReason,
      what_went_well: data.wentWell,
      what_went_wrong: data.wentWrong,
      lesson_learned: data.lesson,
      tags: tags,
    });

    toast.success(`Trade for ${data.symbol.toUpperCase()} saved!`);
    router.push('/trades');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Trade</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Trade Info */}
          <Card>
            <CardHeader>
              <CardTitle>Trade Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account</Label>
                  <Select onValueChange={(val) => setValue('account', val as string)}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.account && <p className="text-sm text-red-500">{form.formState.errors.account.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Symbol</Label>
                  <Input placeholder="e.g. EURUSD" {...form.register('symbol')} />
                  {form.formState.errors.symbol && <p className="text-sm text-red-500">{form.formState.errors.symbol.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Direction</Label>
                <RadioGroup 
                  defaultValue="Long" 
                  onValueChange={(val) => setValue('direction', val as 'Long' | 'Short')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Long" id="long" />
                    <Label htmlFor="long" className="text-blue-500 font-medium">Long</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Short" id="short" />
                    <Label htmlFor="short" className="text-orange-500 font-medium">Short</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entry Date</Label>
                  <Input type="date" {...form.register('entryDate')} />
                </div>
                <div className="space-y-2">
                  <Label>Entry Time</Label>
                  <Input type="time" {...form.register('entryTime')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exit Date (Optional)</Label>
                  <Input type="date" {...form.register('exitDate')} />
                </div>
                <div className="space-y-2">
                  <Label>Exit Time (Optional)</Label>
                  <Input type="time" {...form.register('exitTime')} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Entry Price</Label>
                  <Input type="number" step="0.00001" {...form.register('entryPrice')} />
                </div>
                <div className="space-y-2">
                  <Label>Exit Price</Label>
                  <Input type="number" step="0.00001" {...form.register('exitPrice')} />
                </div>
                <div className="space-y-2">
                  <Label>Lot Size</Label>
                  <Input type="number" step="0.01" {...form.register('lotSize')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Strategy</Label>
                <Input placeholder="e.g. Breakout" {...form.register('strategy')} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Card 2: Risk Management */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Stop Loss</Label>
                    <Input type="number" step="0.00001" {...form.register('stopLoss')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Take Profit</Label>
                    <Input type="number" step="0.00001" {...form.register('takeProfit')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Risk ($)</Label>
                    <Input type="number" step="0.01" {...form.register('riskAmount')} />
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-md grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Risk %</div>
                    <div className="text-xl font-bold">{calculatedValues.riskPercentage.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Planned R:R</div>
                    <div className="text-xl font-bold">1:{calculatedValues.plannedRR.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Result */}
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Commission ($)</Label>
                    <Input type="number" step="0.01" {...form.register('commission')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Swap ($)</Label>
                    <Input type="number" step="0.01" {...form.register('swap')} />
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-md grid grid-cols-3 gap-4 border",
                  calculatedValues.netPnl > 0 ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" : 
                  calculatedValues.netPnl < 0 ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" : "bg-muted/50"
                )}>
                  <div>
                    <div className="text-sm opacity-80">Gross P&L</div>
                    <div className="text-lg font-bold">${calculatedValues.pnl.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Net P&L</div>
                    <div className="text-xl font-bold">${calculatedValues.netPnl.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">R Multiple</div>
                    <div className="text-lg font-bold">{calculatedValues.rMultiple > 0 ? '+' : ''}{calculatedValues.rMultiple.toFixed(2)}R</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 4: Psychology */}
          <Card>
            <CardHeader>
              <CardTitle>Psychology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Before Trade</Label>
                  <Select onValueChange={(val) => setValue('emotionBefore', val as string)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {EMOTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>During Trade</Label>
                  <Select onValueChange={(val) => setValue('emotionDuring', val as string)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {EMOTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>After Trade</Label>
                  <Select onValueChange={(val) => setValue('emotionAfter', val as string)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {EMOTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Confidence Level</Label>
                  <span className="font-bold">{values.confidence}/10</span>
                </div>
                <Slider 
                  min={1} 
                  max={10} 
                  step={1} 
                  defaultValue={[5]} 
                  onValueChange={(vals) => setValue('confidence', vals[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Low</span>
                  <span>Neutral</span>
                  <span>Very High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Review Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Review Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Why did I enter?</Label>
                  <Textarea className="h-20" placeholder="Confluence, setups..." {...form.register('entryReason')} />
                </div>
                <div className="space-y-2">
                  <Label>Why did I exit?</Label>
                  <Textarea className="h-20" placeholder="Hit TP, trailing stop..." {...form.register('exitReason')} />
                </div>
                <div className="space-y-2">
                  <Label>What went well?</Label>
                  <Textarea className="h-20" placeholder="Good execution..." {...form.register('wentWell')} />
                </div>
                <div className="space-y-2">
                  <Label>What went wrong?</Label>
                  <Textarea className="h-20" placeholder="Hesitated..." {...form.register('wentWrong')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lesson Learned</Label>
                <Textarea className="h-20" placeholder="Key takeaway..." {...form.register('lesson')} />
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <Input 
                  placeholder="Type tag and press Enter" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 6: Screenshots */}
        <Card>
          <CardHeader>
            <CardTitle>Screenshots</CardTitle>
            <CardDescription>Upload before and after charts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                <UploadCloud className="w-10 h-10 mb-2" />
                <p className="font-medium text-foreground">Before Trade</p>
                <p className="text-sm">Click or drag & drop</p>
              </div>
              <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                <UploadCloud className="w-10 h-10 mb-2" />
                <p className="font-medium text-foreground">After Trade</p>
                <p className="text-sm">Click or drag & drop</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex justify-end gap-4 md:px-8 lg:px-12 z-10">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button variant="secondary" type="button">Save as Draft</Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" /> Save Trade
          </Button>
        </div>
      </form>
    </div>
  );
}
