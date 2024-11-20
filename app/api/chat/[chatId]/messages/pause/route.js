import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { streamControllers } from '@/app/api/chat/streamControllers'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Attempting to pause chatId:', params.chatId)
    console.log('Current streamControllers:', streamControllers.keys())

    const controller = streamControllers.get(params.chatId)

    if (!controller) {
      console.log('No controller found for chatId:', params.chatId)
      return NextResponse.json(
        { error: 'No active stream found', code: 'NO_STREAM' },
        { status: 404 }
      )
    }

    console.log('Found controller, aborting stream for chatId:', params.chatId)
    controller.abort()
    streamControllers.delete(params.chatId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in pause route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
