import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image_id, method = 'comprehensive_analysis', options = {} } = await request.json()

    if (!image_id) {
      return NextResponse.json(
        { error: 'image_id is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      type: method,
      status: 'success',
      image_id,
      options
    })
  } catch (error) {
    console.error('Error starting analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
