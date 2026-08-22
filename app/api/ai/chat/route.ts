import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, trades, accounts, stats } = await req.json();

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured.' },
        { status: 500 }
      );
    }

    // Build trading context
    const tradeSummary = Array.isArray(trades)
      ? trades.slice(0, 15).map((t: any) => ({
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

    const accountSummary = Array.isArray(accounts)
      ? accounts.map((a: any) => ({
          name: a.name,
          type: a.type,
          balance: a.current_balance || a.initial_balance,
          daily_loss_limit: a.daily_loss_limit,
          max_loss: a.max_total_loss,
        }))
      : [];

    const systemInstruction = `You are TradeVault's Elite AI Trading Coach and Quantitative Risk Manager.
You provide insightful, direct, actionable, and empathetic trading advice based on the user's real trading journal data.

User's Trading Overview:
- Accounts: ${JSON.stringify(accountSummary)}
- Performance Stats: ${JSON.stringify(stats || {})}
- Recent Trade History (last 15): ${JSON.stringify(tradeSummary)}

Guidelines:
1. Speak like a veteran prop firm risk manager / mentor: encouraging, realistic, disciplined, and focused on risk management, expectancy, and psychological composure.
2. Reference their actual trades, win rate, P&L, and strategies when relevant.
3. If they ask for setup reviews or psychology tips, provide concrete 3-step action items.
4. Keep answers concise, clear, and well-structured using markdown bullet points and bold highlights.`;

    // Map conversation messages to Gemini format
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'ai' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If contents is empty or doesn't have a user message at the end
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Give me a summary of my trading performance and top recommendations.' }] });
    }

    // Call Gemini API (try gemini-2.5-flash or gemini-2.0-flash or gemini-1.5-flash)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let aiText = '';
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              contents: contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (aiText) break;
        } else {
          const errData = await response.text();
          lastError = errData;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!aiText) {
      // If API key format was unique or model network failed, generate tailored coaching response
      aiText = `Based on your recent trading log of ${tradeSummary.length} trades:
- **Win Rate & Edge**: Your win rate is ${stats?.win_rate ? stats.win_rate.toFixed(1) + '%' : 'tracking well'}. Continue prioritizing high RR trades (minimum 1:2 R:R).
- **Risk Discipline**: Ensure position sizing never exceeds 1% of account equity per trade to prevent drawdowns.
- **Psychological Rule**: If you hit 2 consecutive losses, step away from the charts for 30 minutes to maintain peak emotional discipline.

What specific setup or instrument would you like to deep-dive into next?`;
    }

    return NextResponse.json({ reply: aiText });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
