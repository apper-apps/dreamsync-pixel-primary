import sessionsData from "@/services/mockData/sessions.json"

let sessions = [...sessionsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const sessionService = {
  async getAll() {
    await delay(300)
    return [...sessions]
  },

  async getById(id) {
    await delay(200)
    const session = sessions.find(s => s.Id === parseInt(id))
    if (!session) throw new Error("Session not found")
    return { ...session }
  },

  async create(sessionData) {
    await delay(400)
    const newSession = {
      ...sessionData,
      Id: Math.max(...sessions.map(s => s.Id), 0) + 1,
      date: sessionData.date || new Date().toISOString()
    }
    sessions.push(newSession)
    return { ...newSession }
  },

  async update(id, sessionData) {
    await delay(350)
    const index = sessions.findIndex(s => s.Id === parseInt(id))
    if (index === -1) throw new Error("Session not found")
    
    sessions[index] = { ...sessions[index], ...sessionData }
    return { ...sessions[index] }
  },

  async delete(id) {
    await delay(250)
    const index = sessions.findIndex(s => s.Id === parseInt(id))
    if (index === -1) throw new Error("Session not found")
    
    const deletedSession = sessions.splice(index, 1)[0]
    return { ...deletedSession }
  },

  async getByCoach(coachId) {
    await delay(300)
    return sessions.filter(s => s.coachId === coachId).map(s => ({ ...s }))
  },

  async getByClient(clientId) {
    await delay(300)
    return sessions.filter(s => s.clientId === clientId).map(s => ({ ...s }))
  }
}