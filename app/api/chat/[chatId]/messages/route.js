import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { streamControllers } from '@/app/api/chat/streamControllers'
import fs from 'fs'
import path from 'path'
import { Buffer } from 'buffer'

// Define the upload directory
const uploadDir = path.join(process.cwd(), 'public', 'upload')

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Helper function to convert image to base64
const imageToBase64 = async (buffer) => {
  return Buffer.from(buffer).toString('base64')
}

// Helper function to get image MIME type
const getImageMimeType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  }
  return mimeTypes[ext] || 'image/jpeg'
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

    // Format messages array for Mistral API
    let messages = []

    // Add text content
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    })

    // Handle image if present
    let imageUrl = null
    if (image) {
      // Convert image to base64
      const imageBuffer = Buffer.from(await image.arrayBuffer())
      const base64Image = await imageToBase64(imageBuffer)
      const mimeType = getImageMimeType(image.name)

      // Save original image to upload directory
      const imageName = `${Date.now()}-${image.name}`
      const imagePath = path.join(uploadDir, imageName)
      fs.writeFileSync(imagePath, imageBuffer)
      imageUrl = `/upload/${imageName}`

      // Add image content to messages
      messages[0].content.push({
        type: 'image_url',
        image_url: `data:${mimeType};base64,${base64Image}`,
      })
    }

    // Save user message to database
    const savedUserMessage = await prisma.message.create({
      data: {
        content: userMessage,
        role: 'user',
        chatId: params.chatId,
        imageUrl, // Store the public URL of the saved image
      },
    })

    // Call Mistral API with the messages including image
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
          const decoder = new TextDecoder('utf-8')
          let accumulatedContent = ''
          let isStreamClosed = false
          let buffer = '' // Buffer for incomplete chunks

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

                const chunk = decoder.decode(value, { stream: true })
                buffer += chunk

                // Process complete lines
                const lines = buffer.split('\n')
                buffer = lines.pop() || '' // Keep the last incomplete line in buffer

                for (const line of lines) {
                  const trimmedLine = line.trim()
                  if (trimmedLine.startsWith('data: ')) {
                    const jsonString = trimmedLine.slice(6).trim()
                    if (jsonString === '[DONE]' || !jsonString) continue

                    try {
                      const jsonData = JSON.parse(jsonString)
                      const content = jsonData.choices?.[0]?.delta?.content || ''
                      if (content) {
                        accumulatedContent += content
                        const sseMessage = `data: ${JSON.stringify({ content })}\n\n`
                        streamController.enqueue(new TextEncoder().encode(sseMessage))
                      }
                    } catch (e) {
                      // Skip malformed JSON chunks - they're likely incomplete
                      console.warn('Skipping malformed JSON chunk:', jsonString.substring(0, 100))
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
