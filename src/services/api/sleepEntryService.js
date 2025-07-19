import sleepEntriesData from "@/services/mockData/sleepEntries.json"

let sleepEntries = [...sleepEntriesData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const sleepEntryService = {
  async getAll() {
    await delay(300)
    return [...sleepEntries]
  },

  async getById(id) {
    await delay(200)
    const entry = sleepEntries.find(e => e.Id === parseInt(id))
    if (!entry) throw new Error("Sleep entry not found")
    return { ...entry }
  },

  async create(entryData) {
    await delay(400)
    const newEntry = {
      ...entryData,
      Id: Math.max(...sleepEntries.map(e => e.Id), 0) + 1
    }
    sleepEntries.push(newEntry)
    return { ...newEntry }
  },

  async update(id, entryData) {
    await delay(350)
    const index = sleepEntries.findIndex(e => e.Id === parseInt(id))
    if (index === -1) throw new Error("Sleep entry not found")
    
    sleepEntries[index] = { ...sleepEntries[index], ...entryData }
    return { ...sleepEntries[index] }
  },

  async delete(id) {
    await delay(250)
    const index = sleepEntries.findIndex(e => e.Id === parseInt(id))
    if (index === -1) throw new Error("Sleep entry not found")
    
    const deletedEntry = sleepEntries.splice(index, 1)[0]
    return { ...deletedEntry }
  },

  async getByClient(clientId) {
    await delay(300)
    return sleepEntries.filter(e => e.clientId === clientId).map(e => ({ ...e }))
  },

  async getByDateRange(clientId, startDate, endDate) {
    await delay(300)
    return sleepEntries.filter(e => 
      e.clientId === clientId && 
      e.date >= startDate && 
      e.date <= endDate
    ).map(e => ({ ...e }))
  }
}