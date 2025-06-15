import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year'))
    const month = parseInt(searchParams.get('month'))

    const client = await clientPromise
    const db = client.db('study_planner')
    
    // Get tasks that overlap with the specified month
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0)
    
    const tasks = await db.collection('tasks').find({
      $or: [
        {
          startDate: { $lte: endOfMonth.toISOString().split('T')[0] },
          endDate: { $gte: startOfMonth.toISOString().split('T')[0] }
        }
      ]
    }).toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('study_planner')
    
    const task = {
      ...body,
      createdAt: new Date().toISOString()
    }
    
    const result = await db.collection('tasks').insertOne(task)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json()
    const client = await clientPromise
    const db = client.db('study_planner')
    
    await db.collection('tasks').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}