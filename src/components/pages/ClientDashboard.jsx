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
import { goalService } from "@/services/api/goalService"
import { format, subDays } from "date-fns"

const ClientDashboard = () => {
const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentEntries: [],
    upcomingAppointments: [],
    recentSessions: [],
    activeGoals: []
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
        messages,
        clientGoals,
        goalProgress
      ] = await Promise.all([
        sleepEntryService.getByClient(clientId),
        appointmentService.getByClient(clientId),
        sessionService.getByClient(clientId),
        messageService.getAll(),
        goalService.getByClient(clientId),
        goalService.getProgressByClient(clientId)
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

      // Calculate goals stats
      const activeGoalsCount = clientGoals.filter(g => g.status === 'active').length
      const completedGoalsToday = goalProgress.filter(p => {
        const today = new Date().toDateString()
        return new Date(p.date).toDateString() === today && p.completed
      }).length

      // Get recent data
      const recentEntries = sleepEntries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
      
      const upcomingAppointments = appointments
        .filter(a => new Date(a.dateTime) > new Date() && a.status === "scheduled")
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        .slice(0, 2)
      
      const recentSessions = sessions
.slice(0, 2)

      // Get active goals with progress
      const activeGoals = clientGoals
        .filter(g => g.status === 'active')
        .slice(0, 3)
        .map(goal => {
          const recentProgress = goalProgress
            .filter(p => p.goalId === goal.Id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
          
          const currentStreak = calculateStreak(recentProgress)
          const completionRate = calculateCompletionRate(recentProgress)
          
          return {
            ...goal,
            currentStreak,
            completionRate,
            lastCompleted: recentProgress.find(p => p.completed)?.date
          }
        })

setDashboardData({
        stats: {
          avgSleepQuality,
          totalEntries,
          upcomingAppts,
          unreadMessages,
          activeGoalsCount,
          completedGoalsToday
        },
        recentEntries,
        upcomingAppointments,
        recentSessions,
        activeGoals
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

const { stats, recentEntries, upcomingAppointments, recentSessions, activeGoals } = dashboardData

  // Helper functions for goal progress
  const calculateStreak = (progress) => {
    if (!progress.length) return 0
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toDateString()
      
      const dayProgress = progress.find(p => 
        new Date(p.date).toDateString() === dateString
      )
      
      if (dayProgress && dayProgress.completed) {
        streak++
      } else if (i === 0) {
        break // No completion today breaks the streak
      } else {
        break
      }
    }
    return streak
  }

  const calculateCompletionRate = (progress) => {
    if (!progress.length) return 0
    const last7Days = progress.filter(p => {
      const date = new Date(p.date)
      const sevenDaysAgo = subDays(new Date(), 7)
      return date >= sevenDaysAgo
    })
    const completed = last7Days.filter(p => p.completed).length
    return Math.round((completed / Math.max(last7Days.length, 7)) * 100)
  }

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
          title="Active Goals"
          value={stats?.activeGoalsCount || 0}
          icon="Target"
          iconColor="text-green-600"
        />
      </div>

      {/* Goals Progress Quick View */}
      {activeGoals && activeGoals.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              Today's Goals Progress
            </h3>
            <Button variant="ghost" size="sm">
              Check-in
              <ApperIcon name="CheckCircle" className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeGoals.map((goal) => (
              <div key={goal.Id} className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{goal.title}</h4>
                    <p className="text-xs text-gray-600">{goal.category}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <ApperIcon name="Flame" className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">{goal.currentStreak}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-medium text-gray-900">{goal.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button size="sm" className="w-full">
                  <ApperIcon name="Check" className="w-3 h-3 mr-1" />
                  Mark Complete
                </Button>
              </div>
            ))}
          </div>
          
          {stats?.completedGoalsToday > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-sm text-green-800">
                  Great job! You've completed {stats.completedGoalsToday} goal{stats.completedGoalsToday > 1 ? 's' : ''} today.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

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