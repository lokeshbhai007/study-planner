import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year'))
    const month = parseInt(searchParams.get('month'))

    const client = await clientPromise
    const db = client.db('study_planner')
    
    const monthMeta = await db.collection('month_meta').findOne({
      year,
      month
    })

    return NextResponse.json(monthMeta || { goals: [] })
  } catch (error) {
    console.error('Error fetching month meta:', error)
    return NextResponse.json({ error: 'Failed to fetch month meta' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { year, month, goals } = body
    
    const client = await clientPromise
    const db = client.db('study_planner')
    
    const monthMeta = {
      year,
      month,
      goals: goals || [],
      updatedAt: new Date().toISOString()
    }
    
    await db.collection('month_meta').replaceOne(
      { year, month },
      monthMeta,
      { upsert: true }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving month meta:', error)
    return NextResponse.json({ error: 'Failed to save month meta' }, { status: 500 })
  }
}