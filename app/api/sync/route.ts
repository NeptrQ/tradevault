import { createClient as createServerSupabase } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lpnlchgtbtvzvbtpualw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwbmxjaGd0YnR2enZidHB1YWx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQyMDc5MCwiZXhwIjoyMTAyOTk2NzkwfQ.gfCGstyoeedqJAuR1r7JiHaaW71YLObeM44B2taR9Nc';

const adminDb = createServerSupabase(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const userIdHeader = req.headers.get('x-user-id');

    let targetUserId = userIdHeader;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await adminDb.auth.getUser(token);
      if (user) targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [accRes, tradesRes, goalsRes, journalRes] = await Promise.all([
      adminDb.from('accounts').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }),
      adminDb.from('trades').select('*').eq('user_id', targetUserId).order('entry_date', { ascending: false }),
      adminDb.from('goals').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }),
      adminDb.from('journal_entries').select('*').eq('user_id', targetUserId).order('entry_date', { ascending: false }),
    ]);

    return NextResponse.json({
      accounts: accRes.data || [],
      trades: tradesRes.data || [],
      goals: goalsRes.data || [],
      journalEntries: journalRes.data || [],
    });
  } catch (error: any) {
    console.error('Error in /api/sync GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const userIdHeader = req.headers.get('x-user-id');

    let targetUserId = userIdHeader;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await adminDb.auth.getUser(token);
      if (user) targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, payload } = await req.json();

    if (action === 'save_account') {
      const acc = { ...payload, user_id: targetUserId };
      const res = await adminDb.from('accounts').upsert(acc).select();
      return NextResponse.json({ success: true, data: res.data });
    }

    if (action === 'delete_account') {
      await adminDb.from('trades').delete().eq('account_id', payload.id);
      await adminDb.from('goals').delete().eq('account_id', payload.id);
      const res = await adminDb.from('accounts').delete().eq('id', payload.id);
      return NextResponse.json({ success: true, data: res.data });
    }

    if (action === 'save_trade') {
      const trade = { ...payload, user_id: targetUserId };
      const res = await adminDb.from('trades').upsert(trade).select();
      return NextResponse.json({ success: true, data: res.data });
    }

    if (action === 'delete_trade') {
      const res = await adminDb.from('trades').delete().eq('id', payload.id);
      return NextResponse.json({ success: true, data: res.data });
    }

    if (action === 'save_goal') {
      const goal = { ...payload, user_id: targetUserId };
      const res = await adminDb.from('goals').upsert(goal).select();
      return NextResponse.json({ success: true, data: res.data });
    }

    if (action === 'delete_goal') {
      const res = await adminDb.from('goals').delete().eq('id', payload.id);
      return NextResponse.json({ success: true, data: res.data });
    }

    if (action === 'save_journal') {
      const entry = { ...payload, user_id: targetUserId };
      const res = await adminDb.from('journal_entries').upsert(entry).select();
      return NextResponse.json({ success: true, data: res.data });
    }

    if (action === 'delete_journal') {
      const res = await adminDb.from('journal_entries').delete().eq('id', payload.id);
      return NextResponse.json({ success: true, data: res.data });
    }

    if (action === 'wipe_all') {
      await adminDb.from('trades').delete().eq('user_id', targetUserId);
      await adminDb.from('accounts').delete().eq('user_id', targetUserId);
      await adminDb.from('goals').delete().eq('user_id', targetUserId);
      await adminDb.from('journal_entries').delete().eq('user_id', targetUserId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/sync POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
