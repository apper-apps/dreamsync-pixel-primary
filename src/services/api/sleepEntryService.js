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
    
    // Check for duplicate entry by clientId and date
    const existingEntry = sleepEntries.find(e => 
      e.clientId === entryData.clientId && e.date === entryData.date
    )
    
    if (existingEntry) {
      throw new Error("An entry for this date already exists")
    }
    
    // Calculate sleep efficiency if not provided
    let sleepEfficiency = entryData.sleepEfficiency
    if (!sleepEfficiency && entryData.tryToSleepTime && entryData.finalWakeTime) {
      const sleepStart = new Date(`2000-01-01 ${entryData.tryToSleepTime}`)
      let sleepEnd = new Date(`2000-01-01 ${entryData.finalWakeTime}`)
      
      if (sleepEnd < sleepStart) {
        sleepEnd = new Date(`2000-01-02 ${entryData.finalWakeTime}`)
      }
      
      const timeInBed = (sleepEnd - sleepStart) / (1000 * 60) // minutes
      const timeAwake = (parseInt(entryData.minutesToFallAsleep) || 0) + 
                       ((parseInt(entryData.nightWakeups) || 0) * 15) // Assume 15 min per waking
      const timeAsleep = timeInBed - timeAwake
      
      sleepEfficiency = Math.round((timeAsleep / timeInBed) * 100)
    }
    
    const newEntry = {
      ...entryData,
      Id: Math.max(...sleepEntries.map(e => e.Id), 0) + 1,
      sleepEfficiency,
      createdAt: new Date().toISOString()
    }
    
    sleepEntries.push(newEntry)
    return { ...newEntry }
  },

async update(id, entryData) {
    await delay(350)
    const index = sleepEntries.findIndex(e => e.Id === parseInt(id))
    if (index === -1) throw new Error("Sleep entry not found")
    
    // Check for duplicate entry by clientId and date (excluding current entry)
    const existingEntry = sleepEntries.find(e => 
      e.clientId === entryData.clientId && 
      e.date === entryData.date && 
      e.Id !== parseInt(id)
    )
    
    if (existingEntry) {
      throw new Error("An entry for this date already exists")
    }
    
    // Calculate sleep efficiency if not provided
    let sleepEfficiency = entryData.sleepEfficiency
    if (!sleepEfficiency && entryData.tryToSleepTime && entryData.finalWakeTime) {
      const sleepStart = new Date(`2000-01-01 ${entryData.tryToSleepTime}`)
      let sleepEnd = new Date(`2000-01-01 ${entryData.finalWakeTime}`)
      
      if (sleepEnd < sleepStart) {
        sleepEnd = new Date(`2000-01-02 ${entryData.finalWakeTime}`)
      }
      
      const timeInBed = (sleepEnd - sleepStart) / (1000 * 60) // minutes
      const timeAwake = (parseInt(entryData.minutesToFallAsleep) || 0) + 
                       ((parseInt(entryData.nightWakeups) || 0) * 15) // Assume 15 min per waking
      const timeAsleep = timeInBed - timeAwake
      
      sleepEfficiency = Math.round((timeAsleep / timeInBed) * 100)
    }
    
    sleepEntries[index] = { 
      ...sleepEntries[index], 
      ...entryData,
      sleepEfficiency,
      updatedAt: new Date().toISOString()
    }
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
    return sleepEntries
      .filter(e => e.clientId === clientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(e => ({ ...e }))
  },

  async getByDateRange(clientId, startDate, endDate) {
    await delay(300)
    return sleepEntries.filter(e => 
      e.clientId === clientId && 
      e.date >= startDate && 
      e.date <= endDate
    ).map(e => ({ ...e }))
  },

  async validateEntry(entryData) {
    await delay(100)
    const errors = []
    
    // Required field validation
    const requiredFields = ['date', 'bedTime', 'tryToSleepTime', 'finalWakeTime', 'outOfBedTime']
    requiredFields.forEach(field => {
      if (!entryData[field]) {
        errors.push(`${field} is required`)
      }
    })
    
    // Time validation
    if (entryData.bedTime && entryData.tryToSleepTime) {
      const bedTime = new Date(`2000-01-01 ${entryData.bedTime}`)
      const tryToSleepTime = new Date(`2000-01-01 ${entryData.tryToSleepTime}`)
      
      if (tryToSleepTime < bedTime) {
        // Assume next day for try to sleep time
        const adjustedTryToSleepTime = new Date(`2000-01-02 ${entryData.tryToSleepTime}`)
        if (adjustedTryToSleepTime - bedTime > 12 * 60 * 60 * 1000) { // More than 12 hours
          errors.push("Time to try sleeping should be within a reasonable time after bedtime")
        }
      }
    }
    
    // Numeric validation
    if (entryData.minutesToFallAsleep && (entryData.minutesToFallAsleep < 0 || entryData.minutesToFallAsleep > 300)) {
      errors.push("Minutes to fall asleep should be between 0 and 300")
    }
    
    if (entryData.nightWakeups && (entryData.nightWakeups < 0 || entryData.nightWakeups > 20)) {
      errors.push("Night wakeups should be between 0 and 20")
    }
    
    if (entryData.sleepQuality && (entryData.sleepQuality < 1 || entryData.sleepQuality > 10)) {
      errors.push("Sleep quality should be between 1 and 10")
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}