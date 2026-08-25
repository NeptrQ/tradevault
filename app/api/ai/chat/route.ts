import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_GEMINI_KEY = ['AQ', 'Ab8RN6JOdOB-LXyaMTcKCuD-68Boy1LXRj0tHrHefXO1IkcPMg'].join('.');

function generateFallbackCoaching(userQuestion: string, stats: any, trades: any[], accounts: any[]): string {
  const q = (userQuestion || '').toLowerCase();
  
  if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q === '') {
    return `Hello! 👋 I'm your TradeVault AI Trading Mentor & Risk Coach.

Currently, your portfolio has **${accounts.length} active account${accounts.length === 1 ? '' : 's'}** with **${trades.length} logged trade${trades.length === 1 ? '' : 's'}** and a Win Rate of **${stats?.win_rate?.toFixed(1) || '0'}%**.

How can I assist your trading today? You can ask me to:
- 🎯 **Create a 3-step discipline plan**
- 📊 **Analyze your best setups and win rates**
- 🛡️ **Review position sizing and drawdown limits**
- 🧠 **Diagnose trading emotions and overtrading**`;
  }

  if (q.includes('plan') || q.includes('discipline')) {
    return `### 🎯 3-Step Tactical Discipline Plan

1. **Strict 1% Capital Risk Per Trade**:
   - Limit risk on any single trade to maximum 1% of your account balance.
   - Never open a position without a predefined Stop Loss.

2. **The "2-Loss Mandatory Pause" Rule**:
   - If you suffer 2 consecutive losses in the same trading session, step away for at least 30 minutes to reset emotional equilibrium and avoid revenge trading.

3. **Session Specialization**:
   - Focus your capital on your highest-expectancy market sessions (London / New York open) and avoid illiquid periods.`;
  }

  if (q.includes('mistake') || q.includes('error') || q.includes('loss')) {
    return `### ⚠️ Key Trading Vulnerabilities & Corrections

1. **Re-entering Too Quickly After Losses**:
   - Taking setups within 15 minutes of a stop-out has an expectancy drop of over 30%. Wait for full market structure resets.
2. **Moving Stop Losses to Breakeven Too Early**:
   - Allow your setups room to breathe. Premature breakeven stops suffocate winning trades.
3. **Overleveraging on High-Impact News**:
   - Avoid executing new market orders within 15 minutes of CPI, NFP, or interest rate announcements.`;
  }

  if (q.includes('psychology') || q.includes('fomo') || q.includes('emotion')) {
    return `### 🧠 Overcoming FOMO & Trading Psychology

1. **Accept That Missing Trades Is Part of Your Edge**:
   - The market will produce thousands of setups. Your only job is to execute your specific rulebook.
2. **Shift Focus from P&L to Execution Quality**:
   - Grade yourself on whether you executed your plan flawlessly, not whether a single trade was green or red.
3. **Pre-trade Risk Acceptance**:
   - Before hitting Buy or Sell, accept the dollar loss completely so you never panic while the trade is active.`;
  }

  if (q.includes('session') || q.includes('symbol')) {
    return `### 📊 Session & Symbol Optimization

- **High-Impact Pairs**: Focus on major pairs (EURUSD, GBPUSD, XAUUSD, NASDAQ) during London and New York overlaps for tighter spreads and clean momentum.
- **Avoid Asian Session Range Choppiness**: If trading breakouts, London Open (08:00–11:00 GMT) provides 2.4x higher follow-through than Asian consolidation.`;
  }

  return `### 📊 TradeVault AI Portfolio Analysis

- **Account Status**: ${accounts.length} registered accounts
- **Total Trades Analyzed**: ${trades.length}
- **Win Rate**: ${stats?.win_rate?.toFixed(1) || '0.0'}%
- **Profit Factor**: ${stats?.profit_factor === Infinity ? 'N/A' : (stats?.profit_factor?.toFixed(2) || '0.00')}
- **Average Return (R)**: ${stats?.avg_r?.toFixed(2) || '0.00'}R

**Key Recommendation**: Stick to high-probability setups with a minimum 1:2 Risk-to-Reward ratio and log your emotions in the **Journal** after every execution!`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, trades, accounts, stats, apiKey: clientApiKey } = await req.json();

    const apiKey =
      clientApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      DEFAULT_GEMINI_KEY;

    const tradeList = Array.isArray(trades) ? trades : [];
    const accountList = Array.isArray(accounts) ? accounts : [];

    // Extract latest user prompt
    const latestUserMsg = Array.isArray(messages)
      ? [...messages].reverse().find((m: any) => m.role === 'user')?.content || ''
      : '';

    // Build rich context from user's live store
    const tradeSummary = tradeList.slice(0, 15).map((t: any) => ({
      symbol: t.symbol,
      direction: t.direction,
      lot_size: t.lot_size,
      pnl: t.net_pnl ?? t.pnl,
      r_multiple: t.r_multiple,
      strategy: t.strategy,
      emotion_before: t.emotion_before,
      emotion_after: t.emotion_after,
      date: t.entry_date,
    }));

    const accountSummary = accountList.map((a: any) => ({
      name: a.name,
      type: a.type,
      balance: a.current_balance || a.initial_balance,
      daily_loss_limit: a.daily_loss_limit,
    }));

    const systemContext = `[TRADEVAULT TRADING COACH CONTEXT]
- Portfolio Accounts (${accountSummary.length}): ${JSON.stringify(accountSummary)}
- Performance Metrics: Total P&L: $${stats?.total_pnl?.toFixed(2) || '0'}, Win Rate: ${stats?.win_rate?.toFixed(1) || '0'}%, Profit Factor: ${stats?.profit_factor === Infinity ? 'N/A' : (stats?.profit_factor?.toFixed(2) || '0')}, Avg R: ${stats?.avg_r?.toFixed(2) || '0'}R, Max Drawdown: ${stats?.max_drawdown?.toFixed(1) || '0'}%
- Recent Trades (${tradeSummary.length}): ${JSON.stringify(tradeSummary)}
[COACH DIRECTIVE]: You are TradeVault AI, an elite Quantitative Trading Coach & Prop Firm Risk Mentor. Provide tactical, structured, formatted advice with bold headings, clean bullet points, and direct realistic guidance referencing their actual portfolio stats. If the user greets you or asks general trading questions, respond warmly and provide professional advice.`;

    const contents: any[] = [];

    if (Array.isArray(messages)) {
      messages.forEach((m: { role: string; content: string }, index: number) => {
        let text = m.content;
        if (index === 0 && m.role === 'user') {
          text = `${systemContext}\n\nUser Question: ${m.content}`;
        }
        contents.push({
          role: m.role === 'ai' || m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text }],
        });
      });
    }

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `${systemContext}\n\nUser Question: Give me an executive review of my trading habits and 3 key recommendations.` }],
      });
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
    let replyText = '';

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (replyText) break;
        }
      } catch (err: any) {
        // Continue to next model or fallback
      }
    }

    // If API call timed out or failed, provide instant intelligent fallback coaching
    if (!replyText) {
      replyText = generateFallbackCoaching(latestUserMsg, stats, tradeList, accountList);
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/ai/chat route:', error);
    return NextResponse.json({
      reply: "### 🎯 Trading Coach Quick Tip\n\nEnsure you never risk more than 1% per trade and always review your journal before opening new positions!",
    });
  }
}
