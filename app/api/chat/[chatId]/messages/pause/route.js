import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { streamControllers } from '@/app/api/chat/streamControllers'

export async function POST(request, { params }) {
  console.log('Current active streams:', Array.from(streamControllers.keys()))

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const controller = streamControllers.get(params.chatId)
    console.log('Found controller for chatId:', params.chatId, !!controller)

    if (controller) {
      controller.abort()
      streamControllers.delete(params.chatId)
      console.log('Controller aborted for chatId:', params.chatId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in pause route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
