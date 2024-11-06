import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
export async function GET(request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const includeMessageCount = searchParams.get('include_message_count') === 'true'

    // Base query
    const queryOptions = {
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        ...(includeMessageCount && {
          _count: {
            select: { messages: true },
          },
        }),
      },
    }

    const chats = await prisma.chat.findMany(queryOptions)

    // Format chat titles and include message count if requested
    const formattedChats = chats.map((chat) => ({
      ...chat,
      title:
        chat.title === 'New Chat' && chat.messages[0]
          ? chat.messages[0].content.substring(0, 30) + '...'
          : chat.title,
      messageCount: includeMessageCount ? chat._count.messages : undefined,
    }))

    return NextResponse.json(formattedChats)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create new chat for the authenticated user
    const chat = await prisma.chat.create({
      data: {
        title: 'New Chat',
        userId: session.user.id,
      },
    })
    return NextResponse.json(chat)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
