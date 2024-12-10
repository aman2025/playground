import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { streamControllers } from '@/app/api/chat/streamControllers'
import fs from 'fs'
import path from 'path'

// Define the upload directory
const uploadDir = path.join(process.cwd(), 'public', 'upload')

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export async function POST(request, { params }) {
  // Clear any existing controller for this chatId
  if (streamControllers.has(params.chatId)) {
    const existingController = streamControllers.get(params.chatId)
    existingController.abort()
    streamControllers.delete(params.chatId)
  }

  const controller = new AbortController()

  streamControllers.set(params.chatId, controller)

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

    // Extract actual user message if it contains context
    const userMessage = content.includes('Previous context:')
      ? content.split('User: ').pop()
      : content

    // Handle image upload if present
    let imageUrl = null
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer())
      const imageName = `${Date.now()}-${image.name}`
      const imagePath = path.join(uploadDir, imageName)

      // Save the image to the upload directory
      fs.writeFileSync(imagePath, buffer)

      // Set the image URL
      imageUrl = `/upload/${imageName}`
    }

    // Save user message with actual input only
    const savedUserMessage = await prisma.message.create({
      data: {
        content: userMessage,
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
    const mistralResponse = await fetch(process.env.MISTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: process.env.AGENT_ID,
        messages,
        max_tokens: 1000,
        stream: true,
      }),
      signal: controller.signal,
    })

    if (!mistralResponse.ok) {
      throw new Error(`Mistral API error: ${mistralResponse.statusText}`)
    }

    // Create a streaming response
    return new Response(
      new ReadableStream({
        async start(streamController) {
          const reader = mistralResponse.body.getReader()
          const decoder = new TextDecoder()
          let accumulatedContent = ''
          let isStreamClosed = false

          const cleanup = async () => {
            try {
              if (!isStreamClosed) {
                isStreamClosed = true
                streamController.close()
              }
              streamControllers.delete(params.chatId)
            } catch (error) {
              console.error('Cleanup error:', error)
            }
          }

          try {
            // Add abort handler
            controller.signal.addEventListener('abort', async () => {
              try {
                // Save the partial message
                if (accumulatedContent.trim()) {
                  await prisma.message.create({
                    data: {
                      content: accumulatedContent + ' [paused]',
                      role: 'assistant',
                      chatId: params.chatId,
                    },
                  })
                }
              } catch (error) {
                console.error('Error saving partial message:', error)
              }

              try {
                await reader.cancel()
                await cleanup()
              } catch (error) {
                if (error.name !== 'AbortError') {
                  console.error('Error during abort cleanup:', error)
                }
              }
            })

            while (true) {
              if (controller.signal.aborted) {
                break
              }

              try {
                const { done, value } = await reader.read()
                if (done) {
                  if (!controller.signal.aborted && accumulatedContent.trim()) {
                    await prisma.message.create({
                      data: {
                        content: accumulatedContent,
                        role: 'assistant',
                        chatId: params.chatId,
                      },
                    })
                  }
                  await cleanup()
                  break
                }

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n').filter((line) => line.trim())

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const jsonString = line.slice(6)
                    if (jsonString === '[DONE]') continue

                    try {
                      const jsonData = JSON.parse(jsonString)
                      const content = jsonData.choices[0]?.delta?.content || ''
                      if (content) {
                        accumulatedContent += content
                        const sseMessage = `data: ${JSON.stringify({ content })}\n\n`
                        streamController.enqueue(new TextEncoder().encode(sseMessage))
                      }
                    } catch (e) {
                      console.error('Error parsing JSON:', e)
                    }
                  }
                }
              } catch (error) {
                if (error.name === 'AbortError') {
                  break
                }
                throw error
              }
            }
          } catch (error) {
            if (error.name !== 'AbortError') {
              streamController.error(error)
            }
          } finally {
            await cleanup()
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    )

    // Update chat title if it's the first message
    if (chatHistory.length === 0) {
      await prisma.chat.update({
        where: { id: params.chatId },
        data: { title: content.substring(0, 30) + '...' },
      })
    }

    return NextResponse.json([assistantMessage])
  } catch (error) {
    console.error('Error in messages route:', error)
    streamControllers.delete(params.chatId)
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
