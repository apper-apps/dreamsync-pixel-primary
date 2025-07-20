import React, { useState, useEffect } from "react"
import StatCard from "@/components/molecules/StatCard"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { userService } from "@/services/api/userService"
import { appointmentService } from "@/services/api/appointmentService"
import { sessionService } from "@/services/api/sessionService"
import { messageService } from "@/services/api/messageService"
import { relationService } from "@/services/api/relationService"
import { goalService } from "@/services/api/goalService"
import { format } from "date-fns"

const CoachDashboard = () => {
const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentClients: [],
    upcomingAppointments: [],
    recentMessages: [],
    recentGoals: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboardData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock coach ID - in real app this would come from auth
      const coachId = "1"

const [
        clients,
        appointments, 
        sessions,
        messages,
        relations,
        allGoals,
        goalAssignments
      ] = await Promise.all([
        userService.getByRole("client"),
        appointmentService.getByCoach(coachId),
        sessionService.getByCoach(coachId),
        messageService.getAll(),
        relationService.getByCoach(coachId),
        goalService.getAll(),
        goalService.getAssignments()
      ])

// Calculate stats
      const activeClients = relations.filter(r => r.status === "active").length
      const upcomingAppts = appointments.filter(a => 
        new Date(a.dateTime) > new Date() && a.status === "scheduled"
      ).length
      const completedSessions = sessions.length
      const unreadMessages = messages.filter(m => 
        m.receiverId === coachId && !m.read
      ).length
      const activeGoals = allGoals.filter(g => g.active).length
      const assignedGoals = goalAssignments.length

// Get recent data
      const recentClients = clients.slice(0, 3)
      const upcomingAppointments = appointments
        .filter(a => new Date(a.dateTime) > new Date() && a.status === "scheduled")
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        .slice(0, 3)
      
      const recentMessages = messages
        .filter(m => m.receiverId === coachId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3)

      const recentGoals = allGoals
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)

setDashboardData({
        stats: {
          activeClients,
          upcomingAppts,
          completedSessions,
          unreadMessages,
          activeGoals,
          assignedGoals
        },
        recentClients,
        upcomingAppointments,
        recentMessages,
        recentGoals
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

const { stats, recentClients, upcomingAppointments, recentMessages, recentGoals } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          Coach Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your coaching practice.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Clients"
          value={stats?.activeClients || 0}
          icon="Users"
          iconColor="text-primary-600"
          trend={5}
          trendIcon="TrendingUp"
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats?.upcomingAppts || 0}
          icon="Calendar"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Sessions This Month"
          value={stats?.completedSessions || 0}
          icon="FileText"
          iconColor="text-green-600"
          trend={12}
          trendIcon="TrendingUp"
        />
        <StatCard
          title="Unread Messages"
          value={stats?.unreadMessages || 0}
          icon="MessageSquare"
          iconColor="text-accent-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              Recent Clients
            </h3>
            <Button variant="ghost" size="sm">
              View All
              <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {recentClients.length === 0 ? (
            <Empty 
              title="No clients yet"
              description="Start building your practice by adding your first client"
              icon="Users"
              actionText="Add Client"
            />
          ) : (
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-2 rounded-full">
                      <ApperIcon name="User" className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              Upcoming Appointments
            </h3>
            <Button variant="ghost" size="sm">
              View Schedule
              <ApperIcon name="Calendar" className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {upcomingAppointments.length === 0 ? (
            <Empty 
              title="No upcoming appointments"
              description="Your schedule is clear for now"
              icon="Calendar"
            />
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Client ID: {appointment.clientId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(appointment.dateTime), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.duration} min
                    </p>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Recent Messages
          </h3>
          <Button variant="ghost" size="sm">
            View All Messages
            <ApperIcon name="MessageSquare" className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {recentMessages.length === 0 ? (
          <Empty 
            title="No recent messages"
            description="Stay connected with your clients through messaging"
            icon="MessageSquare"
          />
        ) : (
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.Id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="bg-gradient-to-br from-accent-100 to-accent-200 p-2 rounded-full flex-shrink-0">
                  <ApperIcon name="User" className="w-4 h-4 text-accent-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      Client ID: {message.senderId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), "MMM dd, h:mm a")}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {message.content}
                  </p>
                </div>
                {!message.read && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
)}
      </Card>

      {/* Goals Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Goals Management
          </h3>
          <Button variant="ghost" size="sm">
            Manage Goals
            <ApperIcon name="Target" className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Active Goals</p>
                <p className="text-2xl font-bold text-green-900">{stats?.activeGoals || 0}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <ApperIcon name="Target" className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Client Assignments</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.assignedGoals || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <ApperIcon name="Users" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {recentGoals && recentGoals.length === 0 ? (
          <Empty 
            title="No goals created yet"
            description="Start building your goals library to help clients achieve better sleep"
            icon="Target"
            actionText="Create First Goal"
          />
        ) : (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Goals</h4>
            {recentGoals?.map((goal) => (
              <div key={goal.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <ApperIcon name="Target" className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{goal.title}</p>
                    <p className="text-sm text-gray-500">{goal.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    goal.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {goal.active ? 'Active' : 'Inactive'}
                  </span>
                  <Button variant="ghost" size="sm" className="p-1">
                    <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default CoachDashboard