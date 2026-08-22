import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const account_id = searchParams.get('account_id')
  const symbol = searchParams.get('symbol')
  const strategy = searchParams.get('strategy')
  const direction = searchParams.get('direction')
  const status = searchParams.get('status')
  const date_from = searchParams.get('date_from')
  const date_to = searchParams.get('date_to')
  const page = parseInt(searchParams.get('page') ?? '1')
  const per_page = parseInt(searchParams.get('per_page') ?? '20')
  const sort_by = searchParams.get('sort_by') ?? 'entry_date'
  const sort_order = searchParams.get('sort_order') ?? 'desc'

  let query = supabase
    .from('trades')
    .select('*, account:accounts(id, name, currency)', { count: 'exact' })
    .eq('user_id', user.id)

  if (account_id) query = query.eq('account_id', account_id)
  if (symbol) query = query.ilike('symbol', `%${symbol}%`)
  if (strategy) query = query.ilike('strategy', `%${strategy}%`)
  if (direction) query = query.eq('direction', direction)
  if (status) query = query.eq('status', status)
  if (date_from) query = query.gte('entry_date', date_from)
  if (date_to) query = query.lte('entry_date', date_to + 'T23:59:59')

  query = query.order(sort_by, { ascending: sort_order === 'asc' })
  query = query.range((page - 1) * per_page, page * per_page - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ trades: data, total: count, page, per_page })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { error, data } = await supabase
    .from('trades')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
