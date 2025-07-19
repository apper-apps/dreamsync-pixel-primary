import appointmentsData from "@/services/mockData/appointments.json"

let appointments = [...appointmentsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const appointmentService = {
  async getAll() {
    await delay(300)
    return [...appointments]
  },

  async getById(id) {
    await delay(200)
    const appointment = appointments.find(a => a.Id === parseInt(id))
    if (!appointment) throw new Error("Appointment not found")
    return { ...appointment }
  },

  async create(appointmentData) {
    await delay(400)
    const newAppointment = {
      ...appointmentData,
      Id: Math.max(...appointments.map(a => a.Id), 0) + 1,
      status: "scheduled"
    }
    appointments.push(newAppointment)
    return { ...newAppointment }
  },

  async update(id, appointmentData) {
    await delay(350)
    const index = appointments.findIndex(a => a.Id === parseInt(id))
    if (index === -1) throw new Error("Appointment not found")
    
    appointments[index] = { ...appointments[index], ...appointmentData }
    return { ...appointments[index] }
  },

  async delete(id) {
    await delay(250)
    const index = appointments.findIndex(a => a.Id === parseInt(id))
    if (index === -1) throw new Error("Appointment not found")
    
    const deletedAppointment = appointments.splice(index, 1)[0]
    return { ...deletedAppointment }
  },

  async getByCoach(coachId) {
    await delay(300)
    return appointments.filter(a => a.coachId === coachId).map(a => ({ ...a }))
  },

  async getByClient(clientId) {
    await delay(300)
    return appointments.filter(a => a.clientId === clientId).map(a => ({ ...a }))
  },

  async getUpcoming(userId, role) {
    await delay(300)
    const now = new Date().toISOString()
    const field = role === "coach" ? "coachId" : "clientId"
    
    return appointments.filter(a => 
      a[field] === userId && 
      a.dateTime > now && 
      a.status === "scheduled"
    ).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .map(a => ({ ...a }))
  }
}