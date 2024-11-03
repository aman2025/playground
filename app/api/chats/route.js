import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch chats for the authenticated user
    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    // Format chat titles based on the first message
    const formattedChats = chats.map((chat) => ({
      ...chat,
      title:
        chat.title === 'New Chat' && chat.messages[0]
          ? chat.messages[0].content.substring(0, 30) + '...'
          : chat.title,
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
