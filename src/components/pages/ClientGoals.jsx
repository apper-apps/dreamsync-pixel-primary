import React, { useEffect, useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { sessionService } from "@/services/api/sessionService";
import { sleepEntryService } from "@/services/api/sleepEntryService";
import { format, subDays, subWeeks, addDays } from "date-fns";

const ClientGoals = () => {
  const [goals, setGoals] = useState([])
  const [sleepData, setSleepData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState("")

  // Mock personal goals - in real app these would be stored separately
  const [personalGoals, setPersonalGoals] = useState([
    {
      id: 1,
      title: "Sleep 8 hours per night",
      target: 8,
      current: 7.2,
      unit: "hours",
      type: "duration",
      status: "in-progress",
      deadline: "2024-03-01"
    },
    {
      id: 2,
      title: "Improve sleep quality to 8/10",
      target: 8,
      current: 7,
      unit: "rating",
      type: "quality",
      status: "in-progress",
      deadline: "2024-03-15"
    },
    {
      id: 3,
      title: "Fall asleep within 15 minutes",
      target: 15,
      current: 25,
      unit: "minutes",
      type: "onset",
      status: "in-progress",
      deadline: "2024-03-10"
    }
  ])

  const loadGoalsData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock client ID
      const clientId = "2"

      const [sessions, sleepEntries] = await Promise.all([
        sessionService.getByClient(clientId),
        sleepEntryService.getByClient(clientId)
      ])

      // Extract goals from session notes
      const allGoals = sessions.reduce((acc, session) => {
        if (session.goals && session.goals.length > 0) {
          const sessionGoals = session.goals.map(goal => ({
            id: `${session.Id}-${goal}`,
            title: goal,
            sessionId: session.Id,
            sessionDate: session.date,
            source: "coach",
            status: "active"
          }))
          acc.push(...sessionGoals)
        }
        return acc
      }, [])

      setGoals(allGoals)
      setSleepData(sleepEntries)
    } catch (err) {
      setError("Failed to load goals")
      console.error("Load goals error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoalsData()
  }, [])

  const calculateProgress = (goal) => {
    if (goal.type === "quality") {
      // Calculate average sleep quality from recent entries
      const recentEntries = sleepData.filter(entry => {
        const entryDate = new Date(entry.date)
        const oneWeekAgo = subWeeks(new Date(), 1)
        return entryDate >= oneWeekAgo
      })
      
      if (recentEntries.length > 0) {
        const avgQuality = recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length
        return Math.min((avgQuality / goal.target) * 100, 100)
      }
    }
    
    if (goal.current && goal.target) {
      return Math.min((goal.current / goal.target) * 100, 100)
    }
    
    return 0
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return "text-green-600 bg-green-100"
    if (progress >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return "CheckCircle"
      case "in-progress": return "Clock"
      case "paused": return "Pause"
      default: return "Target"
    }
  }

  const handleAddPersonalGoal = () => {
    if (!newGoal.trim()) return

    const goal = {
      id: Date.now(),
      title: newGoal.trim(),
      target: 100,
      current: 0,
      unit: "percent",
      type: "custom",
      status: "in-progress",
      deadline: format(addDays(new Date(), 30), "yyyy-MM-dd")
    }

    setPersonalGoals(prev => [...prev, goal])
    setNewGoal("")
    setShowAddGoal(false)
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadGoalsData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Goals & Progress
          </h1>
          <p className="text-gray-600">
            Track your sleep improvement goals and celebrate your achievements.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddGoal(true)}
          className="bg-gradient-to-r from-primary-600 to-secondary-600"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Personal Goal
        </Button>
      </div>

      {/* Personal Goals */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Personal Sleep Goals
          </h3>
          <span className="text-sm text-gray-500">
            {personalGoals.filter(g => g.status !== "completed").length} active goals
          </span>
        </div>

        {personalGoals.length === 0 ? (
          <Empty 
            title="No personal goals set"
            description="Set personal sleep goals to track your progress"
            icon="Target"
            actionText="Add First Goal"
            onAction={() => setShowAddGoal(true)}
          />
        ) : (
          <div className="space-y-4">
            {personalGoals.map(goal => {
              const progress = calculateProgress(goal)
              return (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getProgressColor(progress)}`}>
                        <ApperIcon name={getStatusIcon(goal.status)} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <p className="text-sm text-gray-500">
                          Target: {goal.target} {goal.unit} • Due: {format(new Date(goal.deadline), "MMM dd")}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress >= 80 ? "bg-green-500" : progress >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(progress)}% complete
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Add Goal Form */}
      {showAddGoal && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              Add Personal Goal
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAddGoal(false)}>
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              label="Goal Description"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g., Sleep 8 hours per night consistently"
            />
            
            <div className="flex space-x-3">
              <Button onClick={handleAddPersonalGoal} className="flex-1">
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
              <Button variant="secondary" onClick={() => setShowAddGoal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Coach Goals */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Coach Recommendations
          </h3>
          <span className="text-sm text-gray-500">
            From your coaching sessions
          </span>
        </div>

        {goals.length === 0 ? (
          <Empty 
            title="No coach goals yet"
            description="Your coach will set goals during your sessions"
            icon="UserCheck"
          />
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-full">
                  <ApperIcon name="Target" className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{goal.title}</p>
                  <p className="text-sm text-gray-500">
                    Set in session on {format(new Date(goal.sessionDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {goal.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="CheckCircle" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Goals Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {personalGoals.filter(g => g.status === "completed").length}
              </p>
            </div>
            <ApperIcon name="CheckCircle" className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Goals</p>
              <p className="text-2xl font-bold text-blue-900">
                {personalGoals.filter(g => g.status === "in-progress").length}
              </p>
            </div>
            <ApperIcon name="Target" className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Coach Goals</p>
              <p className="text-2xl font-bold text-purple-900">{goals.length}</p>
            </div>
            <ApperIcon name="UserCheck" className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ClientGoals