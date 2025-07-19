import React, { useState, useEffect } from "react"
import StatCard from "@/components/molecules/StatCard"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { sleepEntryService } from "@/services/api/sleepEntryService"
import { appointmentService } from "@/services/api/appointmentService"
import { sessionService } from "@/services/api/sessionService"
import { messageService } from "@/services/api/messageService"
import { format, subDays } from "date-fns"

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentEntries: [],
    upcomingAppointments: [],
    recentSessions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboardData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock client ID - in real app this would come from auth
      const clientId = "2"

      const [
        sleepEntries,
        appointments,
        sessions,
        messages
      ] = await Promise.all([
        sleepEntryService.getByClient(clientId),
        appointmentService.getByClient(clientId),
        sessionService.getByClient(clientId),
        messageService.getAll()
      ])

      // Calculate stats
      const last7Days = sleepEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        const sevenDaysAgo = subDays(new Date(), 7)
        return entryDate >= sevenDaysAgo
      })

      const avgSleepQuality = last7Days.length > 0 
        ? Math.round(last7Days.reduce((sum, entry) => sum + entry.quality, 0) / last7Days.length)
        : 0

      const totalEntries = sleepEntries.length
      const upcomingAppts = appointments.filter(a => 
        new Date(a.dateTime) > new Date() && a.status === "scheduled"
      ).length
      const unreadMessages = messages.filter(m => 
        m.receiverId === clientId && !m.read
      ).length

      // Get recent data
      const recentEntries = sleepEntries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
      
      const upcomingAppointments = appointments
        .filter(a => new Date(a.dateTime) > new Date() && a.status === "scheduled")
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        .slice(0, 2)
      
      const recentSessions = sessions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2)

      setDashboardData({
        stats: {
          avgSleepQuality,
          totalEntries,
          upcomingAppts,
          unreadMessages
        },
        recentEntries,
        upcomingAppointments,
        recentSessions
      })
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error("Dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  const { stats, recentEntries, upcomingAppointments, recentSessions } = dashboardData

  const getQualityColor = (quality) => {
    if (quality >= 8) return "text-green-600"
    if (quality >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityText = (quality) => {
    if (quality >= 8) return "Excellent"
    if (quality >= 6) return "Good"
    if (quality >= 4) return "Fair"
    return "Poor"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          Your Sleep Journey
        </h1>
        <p className="text-gray-600">
          Track your progress and stay connected with your sleep coach.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avg Sleep Quality"
          value={`${stats?.avgSleepQuality || 0}/10`}
          icon="Moon"
          iconColor="text-primary-600"
          trend={stats?.avgSleepQuality > 6 ? 8 : -3}
          trendIcon={stats?.avgSleepQuality > 6 ? "TrendingUp" : "TrendingDown"}
        />
        <StatCard
          title="Sleep Diary Entries"
          value={stats?.totalEntries || 0}
          icon="Calendar"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Next Appointment"
          value={stats?.upcomingAppts > 0 ? "Scheduled" : "None"}
          icon="Clock"
          iconColor="text-green-600"
        />
        <StatCard
          title="New Messages"
          value={stats?.unreadMessages || 0}
          icon="MessageSquare"
          iconColor="text-accent-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sleep Entries */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              Recent Sleep Entries
            </h3>
            <Button variant="ghost" size="sm">
              View Diary
              <ApperIcon name="Moon" className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {recentEntries.length === 0 ? (
            <Empty 
              title="No sleep entries yet"
              description="Start tracking your sleep to see your progress"
              icon="Moon"
              actionText="Add Entry"
            />
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <div key={entry.Id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {format(new Date(entry.date), "MMM dd, yyyy")}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getQualityColor(entry.quality)}`}>
                        {getQualityText(entry.quality)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {entry.quality}/10
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Bedtime: {entry.bedTime}</span>
                    <span>Wake: {entry.wakeTime}</span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-2 truncate">
                      {entry.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              Upcoming Sessions
            </h3>
            <Button variant="ghost" size="sm">
              View All
              <ApperIcon name="Calendar" className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {upcomingAppointments.length === 0 ? (
            <Empty 
              title="No upcoming appointments"
              description="Schedule your next session with your coach"
              icon="Calendar"
              actionText="Book Session"
            />
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.Id} className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      Coaching Session
                    </p>
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                      {appointment.duration} min
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {format(new Date(appointment.dateTime), "EEEE, MMM dd 'at' h:mm a")}
                  </p>
                  <div className="flex items-center mt-3 space-x-2">
                    <Button size="sm" className="flex-1">
                      <ApperIcon name="Video" className="w-4 h-4 mr-1" />
                      Join Session
                    </Button>
                    <Button variant="secondary" size="sm">
                      <ApperIcon name="MessageSquare" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Recent Session Notes
          </h3>
          <Button variant="ghost" size="sm">
            View All Notes
            <ApperIcon name="FileText" className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {recentSessions.length === 0 ? (
          <Empty 
            title="No session notes yet"
            description="Your coach will share notes after your sessions"
            icon="FileText"
          />
        ) : (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.Id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Session Notes
                  </h4>
                  <span className="text-sm text-gray-500">
                    {format(new Date(session.date), "MMM dd, yyyy")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {session.notes}
                </p>
                {session.goals && session.goals.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Goals:</p>
                    <ul className="space-y-1">
                      {session.goals.map((goal, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="Target" className="w-3 h-3 mr-2 text-primary-500" />
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

export default ClientDashboard