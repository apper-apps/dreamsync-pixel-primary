import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { appointmentService } from "@/services/api/appointmentService"
import { userService } from "@/services/api/userService"
import { format, addDays, isSameDay, isPast, isFuture } from "date-fns"

const ClientSchedule = () => {
  const [appointments, setAppointments] = useState([])
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadAppointments = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock client ID
      const clientId = "2"

      const [clientAppointments, users] = await Promise.all([
        appointmentService.getByClient(clientId),
        userService.getAll()
      ])

      // Find the coach
      const coachUser = users.find(u => u.role === "coach")
      setCoach(coachUser)

      // Sort appointments by date
      const sortedAppointments = clientAppointments.sort((a, b) => 
        new Date(a.dateTime) - new Date(b.dateTime)
      )

      setAppointments(sortedAppointments)
    } catch (err) {
      setError("Failed to load appointments")
      console.error("Load appointments error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAppointmentIcon = (appointment) => {
    if (appointment.status === "completed") return "CheckCircle"
    if (appointment.status === "cancelled") return "XCircle"
    if (isPast(new Date(appointment.dateTime))) return "Clock"
    return "Calendar"
  }

  const upcomingAppointments = appointments.filter(apt => 
    isFuture(new Date(apt.dateTime)) && apt.status === "scheduled"
  )

  const pastAppointments = appointments.filter(apt => 
    isPast(new Date(apt.dateTime)) || apt.status === "completed"
  )

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadAppointments} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600">
            View and manage your coaching sessions.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-secondary-600">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Book Session
        </Button>
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
              <p className="text-sm text-gray-500">{coach.email}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <ApperIcon name="MessageSquare" className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button variant="secondary" size="sm">
                <ApperIcon name="Phone" className="w-4 h-4 mr-1" />
                Call
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Upcoming Sessions
          </h3>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
            View Calendar
          </Button>
        </div>

        {upcomingAppointments.length === 0 ? (
          <Empty 
            title="No upcoming appointments"
            description="Schedule your next coaching session to continue your sleep improvement journey"
            icon="Calendar"
            actionText="Book Session"
          />
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.Id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-full">
                      <ApperIcon name="Calendar" className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Coaching Session
                      </h4>
                      <p className="text-sm text-gray-600">
                        {format(new Date(appointment.dateTime), "EEEE, MMMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
                      {format(new Date(appointment.dateTime), "h:mm a")}
                    </span>
                    <span className="flex items-center">
                      <ApperIcon name="Timer" className="w-4 h-4 mr-1" />
                      {appointment.duration} minutes
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm">
                      <ApperIcon name="Video" className="w-4 h-4 mr-1" />
                      Join Session
                    </Button>
                    <Button variant="secondary" size="sm">
                      <ApperIcon name="MessageSquare" className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Past Appointments */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Session History
          </h3>
          <span className="text-sm text-gray-500">
            {pastAppointments.length} sessions completed
          </span>
        </div>

        {pastAppointments.length === 0 ? (
          <Empty 
            title="No session history"
            description="Your completed sessions will appear here"
            icon="History"
          />
        ) : (
          <div className="space-y-3">
            {pastAppointments.slice(0, 5).map(appointment => (
              <div key={appointment.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    appointment.status === "completed" 
                      ? "bg-green-100" 
                      : appointment.status === "cancelled" 
                      ? "bg-red-100" 
                      : "bg-gray-100"
                  }`}>
                    <ApperIcon 
                      name={getAppointmentIcon(appointment)} 
                      className={`w-4 h-4 ${
                        appointment.status === "completed" 
                          ? "text-green-600" 
                          : appointment.status === "cancelled" 
                          ? "text-red-600" 
                          : "text-gray-600"
                      }`} 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(appointment.dateTime), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(appointment.dateTime), "h:mm a")} • {appointment.duration} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  {appointment.status === "completed" && (
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="FileText" className="w-4 h-4 mr-1" />
                      Notes
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {pastAppointments.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="ghost" size="sm">
                  View All History
                  <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default ClientSchedule