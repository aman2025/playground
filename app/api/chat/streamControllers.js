// Convert streamControllers to use global storage
const getStreamControllers = () => {
  if (!global.streamControllers) {
    global.streamControllers = new Map()
  }
  return global.streamControllers
}

export const streamControllers = {
  set: (chatId, controller) => {
    getStreamControllers().set(chatId, controller)
  },

  get: (chatId) => getStreamControllers().get(chatId),

  delete: (chatId) => {
    const result = getStreamControllers().delete(chatId)
    return result
  },

  has: (chatId) => getStreamControllers().has(chatId),

  keys: () => Array.from(getStreamControllers().keys()),
}
