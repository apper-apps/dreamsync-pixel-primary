import messagesData from "@/services/mockData/messages.json"

let messages = [...messagesData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const messageService = {
  async getAll() {
    await delay(300)
    return [...messages]
  },

  async getById(id) {
    await delay(200)
    const message = messages.find(m => m.Id === parseInt(id))
    if (!message) throw new Error("Message not found")
    return { ...message }
  },

  async create(messageData) {
    await delay(400)
    const newMessage = {
      ...messageData,
      Id: Math.max(...messages.map(m => m.Id), 0) + 1,
      timestamp: new Date().toISOString(),
      read: false
    }
    messages.push(newMessage)
    return { ...newMessage }
  },

  async update(id, messageData) {
    await delay(350)
    const index = messages.findIndex(m => m.Id === parseInt(id))
    if (index === -1) throw new Error("Message not found")
    
    messages[index] = { ...messages[index], ...messageData }
    return { ...messages[index] }
  },

  async delete(id) {
    await delay(250)
    const index = messages.findIndex(m => m.Id === parseInt(id))
    if (index === -1) throw new Error("Message not found")
    
    const deletedMessage = messages.splice(index, 1)[0]
    return { ...deletedMessage }
  },

  async getConversation(userId1, userId2) {
    await delay(300)
    return messages.filter(m => 
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(m => ({ ...m }))
  },

  async markAsRead(id) {
    await delay(200)
    const index = messages.findIndex(m => m.Id === parseInt(id))
    if (index === -1) throw new Error("Message not found")
    
    messages[index].read = true
    return { ...messages[index] }
  }
}