import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { sessionService } from "@/services/api/sessionService"
import { userService } from "@/services/api/userService"
import { format } from "date-fns"
import { toast } from "react-toastify"

const CoachSessionNotes = () => {
  const [sessions, setSessions] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [formData, setFormData] = useState({
    clientId: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: "",
    goals: ""
  })

  const loadSessionsData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock coach ID
      const coachId = "1"

      const [coachSessions, allClients] = await Promise.all([
        sessionService.getByCoach(coachId),
        userService.getByRole("client")
      ])

      // Sort sessions by date (newest first)
      const sortedSessions = coachSessions.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      setSessions(sortedSessions)
      setClients(allClients)
    } catch (err) {
      setError("Failed to load session notes")
      console.error("Load sessions error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessionsData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.clientId || !formData.notes) {
      toast.error("Please fill in client and notes")
      return
    }

    try {
      const sessionData = {
        ...formData,
        coachId: "1", // Mock coach ID
        goals: formData.goals ? formData.goals.split("\n").filter(g => g.trim()) : []
      }

      if (editingSession) {
        await sessionService.update(editingSession.Id, sessionData)
        toast.success("Session notes updated successfully")
      } else {
        await sessionService.create(sessionData)
        toast.success("Session notes added successfully")
      }
      
      setFormData({
        clientId: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        notes: "",
        goals: ""
      })
      setShowForm(false)
      setEditingSession(null)
      loadSessionsData()
    } catch (err) {
      toast.error(editingSession ? "Failed to update session notes" : "Failed to add session notes")
      console.error("Save session error:", err)
    }
  }

  const handleEdit = (session) => {
    setEditingSession(session)
    setFormData({
      clientId: session.clientId,
      date: format(new Date(session.date), "yyyy-MM-dd'T'HH:mm"),
      notes: session.notes,
      goals: session.goals ? session.goals.join("\n") : ""
    })
    setShowForm(true)
  }

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session note?")) return

    try {
      await sessionService.delete(sessionId)
      toast.success("Session notes deleted successfully")
      loadSessionsData()
    } catch (err) {
      toast.error("Failed to delete session notes")
      console.error("Delete session error:", err)
    }
  }

  const getClientName = (clientId) => {
    const client = clients.find(c => c.Id.toString() === clientId)
    return client ? client.name : `Client ${clientId}`
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingSession(null)
    setFormData({
      clientId: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      notes: "",
      goals: ""
    })
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadSessionsData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Session Notes
          </h1>
          <p className="text-gray-600">
            Document your coaching sessions and track client progress.
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-primary-600 to-secondary-600"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Session Notes
        </Button>
      </div>

      {/* Add/Edit Session Form */}
      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              {editingSession ? "Edit Session Notes" : "Add Session Notes"}
            </h3>
            <Button variant="ghost" size="sm" onClick={cancelForm}>
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.Id} value={client.Id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Session Date & Time"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Document the session content, client progress, observations, and recommendations..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goals & Action Items (Optional)
              </label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter each goal or action item on a new line..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter each goal on a separate line
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button type="submit" className="flex-1">
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                {editingSession ? "Update Notes" : "Save Notes"}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Sessions List */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Recent Sessions
          </h3>
        </div>
        
        {sessions.length === 0 ? (
          <Empty 
            title="No session notes yet"
            description="Start documenting your coaching sessions"
            icon="FileText"
            actionText="Add First Session"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.Id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-2 rounded-full">
                      <ApperIcon name="FileText" className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Session with {getClientName(session.clientId)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {format(new Date(session.date), "EEEE, MMMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(session)}
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(session.Id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Session Notes:</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {session.notes}
                  </p>
                </div>
                
                {session.goals && session.goals.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Goals & Action Items:</h5>
                    <ul className="space-y-1">
                      {session.goals.map((goal, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <ApperIcon name="Target" className="w-3 h-3 mr-2 mt-0.5 text-primary-500 flex-shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default CoachSessionNotes