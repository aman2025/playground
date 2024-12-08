// 所有chat相关的api，都放在这里
import axios from 'axios'

// Create axios instance with default config
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Global response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Chat related API calls, for react-query
export const chatApi = {
  // Get all chats with message count
  getAllChats: () => api.get('/chat', { params: { include_message_count: true } }),

  // Create a new chat
  createChat: (title) => api.post('/chat', { title }),

  // Send message to a chat, Modify sendMessage to return the raw response without reading it, don't use axios.post
  async sendMessage(chatId, formData) {
    const response = await fetch(`/api/chat/${chatId}/messages`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response // Return the raw response instead of calling .json()
  },

  // Get messages for a chat
  getMessages: async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`)
      return response || [] // Ensure we always return an array
    } catch (error) {
      console.error('Error fetching messages:', error)
      return [] // Return empty array on error
    }
  },

  deleteChat: async (chatId) => {
    const response = await fetch(`/api/chat/${chatId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete chat')
    }
    return response.json()
  },

  // Add pause message method
  pauseMessage: async (chatId) => {
    const response = await fetch(`/api/chat/${chatId}/messages/pause`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to pause message stream')
    }
    return response.json()
  },
}
