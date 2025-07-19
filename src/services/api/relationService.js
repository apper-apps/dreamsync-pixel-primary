import relationsData from "@/services/mockData/clientCoachRelations.json"

let relations = [...relationsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const relationService = {
  async getAll() {
    await delay(300)
    return [...relations]
  },

  async getById(id) {
    await delay(200)
    const relation = relations.find(r => r.Id === parseInt(id))
    if (!relation) throw new Error("Relation not found")
    return { ...relation }
  },

  async create(relationData) {
    await delay(400)
    const newRelation = {
      ...relationData,
      Id: Math.max(...relations.map(r => r.Id), 0) + 1,
      startDate: new Date().toISOString()
    }
    relations.push(newRelation)
    return { ...newRelation }
  },

  async update(id, relationData) {
    await delay(350)
    const index = relations.findIndex(r => r.Id === parseInt(id))
    if (index === -1) throw new Error("Relation not found")
    
    relations[index] = { ...relations[index], ...relationData }
    return { ...relations[index] }
  },

  async delete(id) {
    await delay(250)
    const index = relations.findIndex(r => r.Id === parseInt(id))
    if (index === -1) throw new Error("Relation not found")
    
    const deletedRelation = relations.splice(index, 1)[0]
    return { ...deletedRelation }
  },

  async getByCoach(coachId) {
    await delay(300)
    return relations.filter(r => r.coachId === coachId).map(r => ({ ...r }))
  },

  async getByClient(clientId) {
    await delay(300)
    return relations.filter(r => r.clientId === clientId).map(r => ({ ...r }))
  }
}