import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year'))
    const month = parseInt(searchParams.get('month'))
    const day = parseInt(searchParams.get('day'))

    const client = await clientPromise
    const db = client.db('study_planner')
    
    const dayMeta = await db.collection('day_meta').findOne({
      year,
      month,
      day
    })

    return NextResponse.json(dayMeta || { todo: [], notes: '' })
  } catch (error) {
    console.error('Error fetching day meta:', error)
    return NextResponse.json({ error: 'Failed to fetch day meta' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { year, month, day, todo, notes } = body
    
    const client = await clientPromise
    const db = client.db('study_planner')
    
    const dayMeta = {
      year,
      month,
      day,
      todo: todo || [],
      notes: notes || '',
      updatedAt: new Date().toISOString()
    }
    
    await db.collection('day_meta').replaceOne(
      { year, month, day },
      dayMeta,
      { upsert: true }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving day meta:', error)
    return NextResponse.json({ error: 'Failed to save day meta' }, { status: 500 })
  }
}