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

    // Retrieve the AbortController for the given chatId from the streamControllers map
    const controller = streamControllers.get(params.chatId)

    // If a controller is found, abort the stream and remove the controller from the map
    if (controller) {
      controller.abort()
      streamControllers.delete(params.chatId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in pause route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
