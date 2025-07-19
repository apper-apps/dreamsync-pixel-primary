import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { sessionService } from "@/services/api/sessionService"
import { userService } from "@/services/api/userService"
import { format } from "date-fns"

const ClientSessionNotes = () => {
  const [sessions, setSessions] = useState([])
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedSession, setExpandedSession] = useState(null)

  const loadSessionsData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock client ID
      const clientId = "2"

      const [clientSessions, users] = await Promise.all([
        sessionService.getByClient(clientId),
        userService.getAll()
      ])

      // Find the coach
      const coachUser = users.find(u => u.role === "coach")
      setCoach(coachUser)

      // Sort sessions by date (newest first)
      const sortedSessions = clientSessions.sort((a, b) => new Date(b.date) - new Date(a.date))
      setSessions(sortedSessions)
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

  const toggleExpanded = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId)
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadSessionsData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          Session Notes
        </h1>
        <p className="text-gray-600">
          Review notes and goals from your coaching sessions.
        </p>
      </div>

      {/* Coach Info */}
      {coach && (
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-3 rounded-full">
              <ApperIcon name="UserCheck" className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Your Sleep Coach</h3>
              <p className="text-gray-600">{coach.name}</p>
              <p className="text-sm text-gray-500">Tracking your sleep improvement journey</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {sessions.length} Sessions Completed
              </p>
              <p className="text-xs text-gray-500">
                Since {sessions.length > 0 ? format(new Date(sessions[sessions.length - 1].date), "MMM yyyy") : "—"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Session Notes List */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Your Session History
          </h3>
          <p className="text-sm text-gray-600">
            Notes and action items from your coaching sessions
          </p>
        </div>
        
        {sessions.length === 0 ? (
          <Empty 
            title="No session notes yet"
            description="Your coaching session notes will appear here after your first session"
            icon="FileText"
          />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.Id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => toggleExpanded(session.Id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-2 rounded-full">
                        <ApperIcon name="FileText" className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Session Notes
                        </h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(session.date), "EEEE, MMMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {session.goals && session.goals.length > 0 && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                          {session.goals.length} goals
                        </span>
                      )}
                      <ApperIcon 
                        name={expandedSession === session.Id ? "ChevronUp" : "ChevronDown"} 
                        className="w-5 h-5 text-gray-400" 
                      />
                    </div>
                  </div>
                </div>
                
                {expandedSession === session.Id && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="space-y-4">
                      {/* Session Notes */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <ApperIcon name="FileText" className="w-4 h-4 mr-1" />
                          Session Summary
                        </h5>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {session.notes}
                          </p>
                        </div>
                      </div>
                      
                      {/* Goals & Action Items */}
                      {session.goals && session.goals.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <ApperIcon name="Target" className="w-4 h-4 mr-1" />
                            Goals & Action Items
                          </h5>
                          <div className="space-y-2">
                            {session.goals.map((goal, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                                <div className="bg-green-200 p-1 rounded-full mt-0.5">
                                  <ApperIcon name="Target" className="w-3 h-3 text-green-600" />
                                </div>
                                <p className="text-sm text-gray-700 flex-1">
                                  {goal}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Session recorded by {coach?.name || "Your coach"}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <ApperIcon name="MessageSquare" className="w-4 h-4 mr-1" />
                            Discuss
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ApperIcon name="Download" className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Progress Summary */}
      {sessions.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-full">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Your Progress</h3>
                <p className="text-sm text-gray-600">
                  You've completed {sessions.length} coaching sessions
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Total Goals: {sessions.reduce((sum, s) => sum + (s.goals?.length || 0), 0)}
              </p>
              <p className="text-xs text-gray-600">
                Keep up the great work!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ClientSessionNotes