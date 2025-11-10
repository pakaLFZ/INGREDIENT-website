import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const taskStore = new Map()

export async function POST(request: NextRequest) {
  try {
    const { image_id, method = 'comprehensive_analysis', options = {} } = await request.json()

    if (!image_id) {
      return NextResponse.json(
        { error: 'image_id is required' },
        { status: 400 }
      )
    }

    const taskId = uuidv4()
    const task = {
      task_id: taskId,
      task_type: 'comprehensive_analysis',
      image_id,
      options,
      status: 'processing',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString()
    }

    taskStore.set(taskId, task)

    // Simulate processing - complete after 2 seconds
    setTimeout(() => {
      const stored = taskStore.get(taskId)
      if (stored) {
        stored.status = 'completed'
        stored.completed_at = new Date().toISOString()
      }
    }, 2000)

    return NextResponse.json({
      task_id: taskId,
      type: method,
      status: 'processing'
    })
  } catch (error) {
    console.error('Error starting analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export function GET() {
  return NextResponse.json({ taskStore: Array.from(taskStore.entries()) })
}
