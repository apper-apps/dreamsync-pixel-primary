import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { goalService } from "@/services/api/goalService"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { cn } from "@/utils/cn"

const CoachGoalsManagement = () => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [activeTab, setActiveTab] = useState("active") // active, archived, assignments
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coachExplanation: "",
    category: "Sleep Hygiene",
    goalType: "template",
    targetDate: "",
    dependencies: [],
    active: true,
    celebrationMilestones: [
      { type: "first_completion", message: "🎉 Great job completing this goal for the first time!" },
      { type: "week_streak", message: "🔥 Amazing! You've maintained this goal for a full week!" },
      { type: "month_streak", message: "⭐ Incredible dedication! One month of consistency!" }
    ]
  })

  const categories = [
    "Sleep Hygiene",
    "Bedtime Routine", 
    "Environment",
    "Mindset",
    "Custom"
  ]

  const loadGoals = async () => {
    try {
      setError("")
      setLoading(true)
      const data = await goalService.getAll()
      setGoals(data)
    } catch (err) {
      setError("Failed to load goals")
      console.error("Goals loading error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingGoal) {
        const updated = await goalService.update(editingGoal.Id, formData)
        setGoals(prev => prev.map(g => g.Id === editingGoal.Id ? updated : g))
        toast.success("Goal updated successfully")
        setEditingGoal(null)
      } else {
        const newGoal = await goalService.create(formData)
        setGoals(prev => [newGoal, ...prev])
        toast.success("Goal created successfully")
      }
      
      setShowCreateForm(false)
      resetForm()
    } catch (err) {
      toast.error(err.message || "Failed to save goal")
    }
  }

  const handleEdit = (goal) => {
    setFormData({
      title: goal.title,
      description: goal.description,
      coachExplanation: goal.coachExplanation,
      category: goal.category,
      goalType: goal.goalType,
      targetDate: goal.targetDate || "",
      dependencies: goal.dependencies || [],
      active: goal.active,
      celebrationMilestones: goal.celebrationMilestones || []
    })
    setEditingGoal(goal)
    setShowCreateForm(true)
  }

  const handleDelete = async (goalId) => {
    if (!confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      return
    }

    try {
      await goalService.delete(goalId)
      setGoals(prev => prev.filter(g => g.Id !== goalId))
      toast.success("Goal deleted successfully")
    } catch (err) {
      toast.error(err.message || "Failed to delete goal")
    }
  }

  const handleToggleActive = async (goalId, currentStatus) => {
    try {
      const updated = await goalService.update(goalId, { active: !currentStatus })
      setGoals(prev => prev.map(g => g.Id === goalId ? updated : g))
      toast.success(updated.active ? "Goal activated" : "Goal deactivated")
    } catch (err) {
      toast.error("Failed to update goal status")
    }
  }

  const handleDuplicate = async (goal) => {
    try {
      const duplicateData = {
        ...goal,
        title: `${goal.title} (Copy)`,
        Id: undefined
      }
      const newGoal = await goalService.create(duplicateData)
      setGoals(prev => [newGoal, ...prev])
      toast.success("Goal duplicated successfully")
    } catch (err) {
      toast.error("Failed to duplicate goal")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      coachExplanation: "",
      category: "Sleep Hygiene",
      goalType: "template",
      targetDate: "",
      dependencies: [],
      active: true,
      celebrationMilestones: [
        { type: "first_completion", message: "🎉 Great job completing this goal for the first time!" },
        { type: "week_streak", message: "🔥 Amazing! You've maintained this goal for a full week!" },
        { type: "month_streak", message: "⭐ Incredible dedication! One month of consistency!" }
      ]
    })
  }

  const filteredGoals = goals.filter(goal => {
    const matchesTab = activeTab === "active" ? goal.active : !goal.active
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || goal.category === selectedCategory
    
    return matchesTab && matchesSearch && matchesCategory
  })

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadGoals} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Goals Management
          </h1>
          <p className="text-gray-600">
            Create and manage sleep coaching goals for your clients.
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm()
            setEditingGoal(null)
            setShowCreateForm(true)
          }}
          className="mt-4 sm:mt-0"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.filter(g => g.active).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ApperIcon name="Target" className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Created</p>
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ApperIcon name="BookOpen" className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ApperIcon name="Tag" className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold font-display text-gray-900">
                  {editingGoal ? "Edit Goal" : "Create New Goal"}
                </h2>
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingGoal(null)
                    resetForm()
                  }}
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Goal Title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="e.g., Maintain consistent bedtime"
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe what the client needs to do..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coach Explanation 
                    <span className="text-gray-500">(Why is this important?)</span>
                  </label>
                  <textarea
                    value={formData.coachExplanation}
                    onChange={(e) => setFormData(prev => ({ ...prev, coachExplanation: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Explain to the client why this goal is important for their sleep health..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This explanation will be shown to clients with an info icon they can click to expand.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Goal Type</label>
                    <select
                      value={formData.goalType}
                      onChange={(e) => setFormData(prev => ({ ...prev, goalType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="template">Template Goal</option>
                      <option value="custom">Custom Goal</option>
                    </select>
                  </div>

                  <Input
                    label="Target Date (Optional)"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Active (available for client assignment)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingGoal(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters and Tabs */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === "active" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("active")}
            >
              Active Goals ({goals.filter(g => g.active).length})
            </Button>
            <Button
              variant={activeTab === "archived" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("archived")}
            >
              Archived ({goals.filter(g => !g.active).length})
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Input
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:w-64"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Goals List */}
      <Card>
        {filteredGoals.length === 0 ? (
          <Empty
            title={activeTab === "active" ? "No active goals" : "No archived goals"}
            description={
              activeTab === "active" 
                ? "Create your first goal to start helping clients achieve better sleep"
                : "Goals you deactivate will appear here"
            }
            icon="Target"
            actionText="Create Goal"
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredGoals.map((goal) => (
              <div key={goal.Id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                        {goal.category}
                      </span>
                      {!goal.active && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Archived
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{goal.description}</p>
                    
                    {goal.coachExplanation && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-2">
                          <ApperIcon name="Info" className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Coach Explanation:</p>
                            <p className="text-sm text-blue-800">{goal.coachExplanation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {goal.goalType}</span>
                      {goal.targetDate && (
                        <span>Target: {format(new Date(goal.targetDate), "MMM dd, yyyy")}</span>
                      )}
                      <span>Created: {format(new Date(goal.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(goal.Id, goal.active)}
                    >
                      <ApperIcon 
                        name={goal.active ? "EyeOff" : "Eye"} 
                        className="w-4 h-4" 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(goal)}
                    >
                      <ApperIcon name="Copy" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal.Id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
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

export default CoachGoalsManagement