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

// Chat related API calls
export const chatApi = {
  // Get all chats with message count
  getAllChats: () => api.get('/chats', { params: { include_message_count: true } }),

  // Create a new chat
  createChat: (title) => api.post('/chats', { title }),

  // Send message to a chat
  sendMessage: async (chatId, formData) => {
    const response = await api.post(`/chat/${chatId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response || []
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
    const response = await fetch(`/api/chats/${chatId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete chat')
    }
    return response.json()
  },
}
