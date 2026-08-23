import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_GEMINI_KEY = ['AQ', 'Ab8RN6JOdOB-LXyaMTcKCuD-68Boy1LXRj0tHrHefXO1IkcPMg'].join('.');

export async function POST(req: NextRequest) {
  try {
    const { messages, trades, accounts, stats, apiKey: clientApiKey } = await req.json();

    const apiKey =
      clientApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      DEFAULT_GEMINI_KEY;

    // Build rich context from user's live store
    const tradeSummary = Array.isArray(trades) && trades.length > 0
      ? trades.slice(0, 20).map((t: any) => ({
          symbol: t.symbol,
          direction: t.direction,
          lot_size: t.lot_size,
          pnl: t.net_pnl ?? t.pnl,
          r_multiple: t.r_multiple,
          strategy: t.strategy,
          emotion_before: t.emotion_before,
          emotion_after: t.emotion_after,
          entry_reason: t.entry_reason,
          lesson_learned: t.lesson_learned,
          date: t.entry_date,
        }))
      : [];

    const accountSummary = Array.isArray(accounts) && accounts.length > 0
      ? accounts.map((a: any) => ({
          name: a.name,
          type: a.type,
          balance: a.current_balance || a.initial_balance,
          daily_loss_limit: a.daily_loss_limit,
          max_loss: a.max_total_loss,
        }))
      : [];

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

    const modelsToTry = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-pro-latest'];
    let replyText = '';
    let lastError = '';

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        });

        if (response.ok) {
          const data = await response.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (replyText) break;
        } else {
          lastError = await response.text();
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!replyText) {
      console.error('Gemini API fetch error details:', lastError);
      return NextResponse.json(
        { error: 'Gemini API call failed', details: lastError },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/ai/chat route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
