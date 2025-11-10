import { NextRequest, NextResponse } from 'next/server'

const taskStore = new Map()

export async function POST(request: NextRequest) {
  try {
    const { task_id } = await request.json()

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id is required' },
        { status: 400 }
      )
    }

    // For now, return a mock status
    // In a real backend, this would query the actual task status
    const task = taskStore.get(task_id) || {
      task_id,
      status: 'completed',
      error_message: null
    }

    return NextResponse.json({
      task_id,
      status: task.status || 'completed',
      error_message: task.error_message || null
    })
  } catch (error) {
    console.error('Error checking status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
