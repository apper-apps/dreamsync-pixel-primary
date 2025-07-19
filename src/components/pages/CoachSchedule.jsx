import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { appointmentService } from "@/services/api/appointmentService"
import { userService } from "@/services/api/userService"
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns"

const CoachSchedule = () => {
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const loadScheduleData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock coach ID
      const coachId = "1"

      const [coachAppointments, allClients] = await Promise.all([
        appointmentService.getByCoach(coachId),
        userService.getByRole("client")
      ])

      setAppointments(coachAppointments)
      setClients(allClients)
    } catch (err) {
      setError("Failed to load schedule data")
      console.error("Load schedule error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScheduleData()
  }, [])

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.dateTime), date)
    ).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
  }

  const getClientName = (clientId) => {
    const client = clients.find(c => c.Id.toString() === clientId)
    return client ? client.name : `Client ${clientId}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => addDays(prev, direction * 7))
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadScheduleData} />

  const weekDays = getWeekDays()
  const todayAppointments = getAppointmentsForDate(selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Schedule
          </h1>
          <p className="text-gray-600">
            Manage your coaching appointments and availability.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-secondary-600">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigateWeek(-1)}
          >
            <ApperIcon name="ChevronLeft" className="w-4 h-4 mr-1" />
            Previous Week
          </Button>
          
          <h3 className="text-lg font-semibold font-display text-gray-900">
            {format(startOfWeek(currentWeek), "MMM dd")} - {format(endOfWeek(currentWeek), "MMM dd, yyyy")}
          </h3>
          
          <Button 
            variant="ghost" 
            onClick={() => navigateWeek(1)}
          >
            Next Week
            <ApperIcon name="ChevronRight" className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border-b">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {weekDays.map(day => {
            const dayAppointments = getAppointmentsForDate(day)
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div 
                key={day.toISOString()}
                className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-primary-50 border-primary-300" : ""
                } ${isToday ? "bg-yellow-50" : ""}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? "text-yellow-600" : "text-gray-900"
                }`}>
                  {format(day, "dd")}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map(apt => (
                    <div 
                      key={apt.Id}
                      className="text-xs p-1 bg-primary-100 text-primary-800 rounded truncate"
                    >
                      {format(new Date(apt.dateTime), "HH:mm")} - {getClientName(apt.clientId)}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Selected Day Details */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            {format(selectedDate, "EEEE, MMMM dd, yyyy")}
          </h3>
          <Button variant="secondary" size="sm">
            <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
            Add Appointment
          </Button>
        </div>

        {todayAppointments.length === 0 ? (
          <Empty 
            title="No appointments scheduled"
            description="Your schedule is clear for this day"
            icon="Calendar"
            actionText="Schedule Appointment"
          />
        ) : (
          <div className="space-y-4">
            {todayAppointments.map(appointment => (
              <div key={appointment.Id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-3 rounded-full">
                      <ApperIcon name="Clock" className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getClientName(appointment.clientId)}
                      </h4>
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
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="MessageSquare" className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="Video" className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default CoachSchedule