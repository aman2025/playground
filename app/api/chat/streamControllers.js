// Convert streamControllers to use global storage
const getStreamControllers = () => {
  if (!global.streamControllers) {
    global.streamControllers = new Map()
  }
  return global.streamControllers
}

export const streamControllers = {
  set: (chatId, controller) => {
    console.log('Setting controller for chatId:', chatId)
    getStreamControllers().set(chatId, controller)
    console.log('Current controllers:', Array.from(getStreamControllers().keys()))
  },

  get: (chatId) => getStreamControllers().get(chatId),

  delete: (chatId) => {
    console.log('Removing controller for chatId:', chatId)
    const result = getStreamControllers().delete(chatId)
    console.log('Current controllers after removal:', Array.from(getStreamControllers().keys()))
    return result
  },

  has: (chatId) => getStreamControllers().has(chatId),

  keys: () => Array.from(getStreamControllers().keys()),
}
