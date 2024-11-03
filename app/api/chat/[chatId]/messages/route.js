import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions'

export async function POST(request, { params }) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify chat ownership
    const chat = await prisma.chat.findUnique({
      where: {
        id: params.chatId,
        userId: session.user.id,
      },
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 })
    }

    const formData = await request.formData()
    const content = formData.get('content')
    const image = formData.get('image')

    // Handle image upload if present
    let imageUrl = null
    if (image) {
      // Implement image upload logic here
      // imageUrl = await uploadImage(image);
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'user',
        chatId: params.chatId,
        imageUrl,
      },
    })

    // Get chat history for context
    const chatHistory = await prisma.message.findMany({
      where: { chatId: params.chatId },
      orderBy: { createdAt: 'asc' },
      take: 10, // Limit context to last 10 messages
    })

    // Format messages for Mistral API
    const messages = chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add current message
    messages.push({ role: 'user', content })

    // Call Mistral API with conversation history
    const mistralResponse = await fetch(MISTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-medium',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!mistralResponse.ok) {
      throw new Error(`Mistral API error: ${mistralResponse.statusText}`)
    }

    const mistralData = await mistralResponse.json()
    const assistantContent = mistralData.choices[0].message.content

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        content: assistantContent,
        role: 'assistant',
        chatId: params.chatId,
      },
    })

    // Update chat title if it's the first message
    if (chatHistory.length === 0) {
      await prisma.chat.update({
        where: { id: params.chatId },
        data: { title: content.substring(0, 30) + '...' },
      })
    }

    return NextResponse.json([userMessage, assistantMessage])
  } catch (error) {
    console.error('Error processing message:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Add GET endpoint to fetch chat messages
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify chat ownership
    const chat = await prisma.chat.findUnique({
      where: {
        id: params.chatId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json(chat.messages)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
