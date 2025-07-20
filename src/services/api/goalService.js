import mockGoals from "@/services/mockData/goals.json"
import mockGoalAssignments from "@/services/mockData/goalAssignments.json"
import mockGoalProgress from "@/services/mockData/goalProgress.json"

class GoalService {
  constructor() {
    this.goals = [...mockGoals]
    this.goalAssignments = [...mockGoalAssignments]
    this.goalProgress = [...mockGoalProgress]
    this.nextId = Math.max(...this.goals.map(g => g.Id)) + 1
    this.nextAssignmentId = Math.max(...this.goalAssignments.map(a => a.Id)) + 1
    this.nextProgressId = Math.max(...this.goalProgress.map(p => p.Id)) + 1
  }

  // Simulate network delay
  delay = () => new Promise(resolve => setTimeout(resolve, 300))

  async getAll() {
    await this.delay()
    return [...this.goals]
  }

  async getById(id) {
    await this.delay()
    const goal = this.goals.find(g => g.Id === parseInt(id))
    if (!goal) {
      throw new Error(`Goal with Id ${id} not found`)
    }
    return { ...goal }
  }

  async create(goalData) {
    await this.delay()
    
    // Validate required fields
    if (!goalData.title || !goalData.description || !goalData.category) {
      throw new Error('Title, description, and category are required')
    }

    // Auto-generate Id and set defaults
    const newGoal = {
      Id: this.nextId++,
      title: goalData.title,
      description: goalData.description,
      coachExplanation: goalData.coachExplanation || "",
      category: goalData.category,
      goalType: goalData.goalType || "template",
      targetDate: goalData.targetDate || null,
      dependencies: goalData.dependencies || [],
      active: goalData.active !== undefined ? goalData.active : true,
      celebrationMilestones: goalData.celebrationMilestones || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.goals.push(newGoal)
    return { ...newGoal }
  }

  async update(id, updateData) {
    await this.delay()
    
    const index = this.goals.findIndex(g => g.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Goal with Id ${id} not found`)
    }

    // Prevent updating Id field
    const { Id, createdAt, ...allowedUpdates } = updateData
    
    this.goals[index] = {
      ...this.goals[index],
      ...allowedUpdates,
      updatedAt: new Date().toISOString()
    }

    return { ...this.goals[index] }
  }

  async delete(id) {
    await this.delay()
    
    const index = this.goals.findIndex(g => g.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Goal with Id ${id} not found`)
    }

    // Check if goal has active assignments
    const hasAssignments = this.goalAssignments.some(a => a.goalId === parseInt(id))
    if (hasAssignments) {
      throw new Error('Cannot delete goal that is assigned to clients. Deactivate it instead.')
    }

    this.goals.splice(index, 1)
    return true
  }

  // Goal Assignment Methods
  async assignToClient(clientId, goalId) {
    await this.delay()

    const goal = this.goals.find(g => g.Id === parseInt(goalId))
    if (!goal) {
      throw new Error(`Goal with Id ${goalId} not found`)
    }

    // Check if already assigned
    const existingAssignment = this.goalAssignments.find(
      a => a.clientId === clientId && a.goalId === parseInt(goalId)
    )
    
    if (existingAssignment) {
      throw new Error('Goal is already assigned to this client')
    }

    const assignment = {
      Id: this.nextAssignmentId++,
      clientId: clientId,
      goalId: parseInt(goalId),
      assignedDate: new Date().toISOString(),
      status: 'active',
      startDate: new Date().toISOString(),
      completedDate: null
    }

    this.goalAssignments.push(assignment)
    return { ...assignment }
  }

  async getByClient(clientId) {
    await this.delay()
    
    const clientAssignments = this.goalAssignments.filter(a => a.clientId === clientId)
    const clientGoals = clientAssignments.map(assignment => {
      const goal = this.goals.find(g => g.Id === assignment.goalId)
      return {
        ...goal,
        assignmentId: assignment.Id,
        assignedDate: assignment.assignedDate,
        status: assignment.status,
        startDate: assignment.startDate,
        completedDate: assignment.completedDate
      }
    }).filter(Boolean)

    return clientGoals
  }

  async getAssignments() {
    await this.delay()
    return [...this.goalAssignments]
  }

  // Progress Tracking Methods
  async recordProgress(clientId, goalId, progressData) {
    await this.delay()

    const today = new Date().toDateString()
    
    // Check if progress already recorded for today
    const existingProgress = this.goalProgress.find(
      p => p.clientId === clientId && 
           p.goalId === parseInt(goalId) && 
           new Date(p.date).toDateString() === today
    )

    if (existingProgress) {
      // Update existing progress
      const index = this.goalProgress.indexOf(existingProgress)
      this.goalProgress[index] = {
        ...existingProgress,
        ...progressData,
        updatedAt: new Date().toISOString()
      }
      return { ...this.goalProgress[index] }
    }

    // Create new progress entry
    const progress = {
      Id: this.nextProgressId++,
      clientId: clientId,
      goalId: parseInt(goalId),
      date: new Date().toISOString(),
      completed: progressData.completed || false,
      rating: progressData.rating || null,
      notes: progressData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.goalProgress.push(progress)
    return { ...progress }
  }

  async getProgressByClient(clientId) {
    await this.delay()
    return this.goalProgress.filter(p => p.clientId === clientId)
  }

  async getProgressByGoal(goalId) {
    await this.delay()
    return this.goalProgress.filter(p => p.goalId === parseInt(goalId))
  }

  async getProgressByClientAndGoal(clientId, goalId) {
    await this.delay()
    return this.goalProgress.filter(
      p => p.clientId === clientId && p.goalId === parseInt(goalId)
    )
  }

  // Bulk check-in for multiple goals
  async bulkCheckIn(clientId, goalUpdates) {
    await this.delay()

    const results = []
    
    for (const update of goalUpdates) {
      try {
        const progress = await this.recordProgress(clientId, update.goalId, {
          completed: update.completed,
          rating: update.rating,
          notes: update.notes
        })
        results.push({ success: true, goalId: update.goalId, progress })
      } catch (error) {
        results.push({ success: false, goalId: update.goalId, error: error.message })
      }
    }

    return results
  }

  // Helper methods for statistics
  async getGoalStats(goalId) {
    await this.delay()
    
    const progress = this.goalProgress.filter(p => p.goalId === parseInt(goalId))
    const completions = progress.filter(p => p.completed)
    
    return {
      totalAssignments: this.goalAssignments.filter(a => a.goalId === parseInt(goalId)).length,
      totalCompletions: completions.length,
      completionRate: progress.length > 0 ? (completions.length / progress.length) * 100 : 0,
      averageRating: progress.length > 0 
        ? progress.reduce((sum, p) => sum + (p.rating || 0), 0) / progress.length 
        : 0
    }
  }

  async getClientGoalStats(clientId) {
    await this.delay()
    
    const clientProgress = this.goalProgress.filter(p => p.clientId === clientId)
    const completions = clientProgress.filter(p => p.completed)
    
    // Calculate current streaks
    const goalStreaks = {}
    const clientAssignments = this.goalAssignments.filter(a => a.clientId === clientId)
    
    clientAssignments.forEach(assignment => {
      const goalProgress = clientProgress
        .filter(p => p.goalId === assignment.goalId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      
      let currentStreak = 0
      for (let i = 0; i < goalProgress.length; i++) {
        if (goalProgress[i].completed) {
          currentStreak++
        } else {
          break
        }
      }
      
      goalStreaks[assignment.goalId] = currentStreak
    })
    
    return {
      totalGoals: clientAssignments.length,
      totalCompletions: completions.length,
      completionRate: clientProgress.length > 0 
        ? (completions.length / clientProgress.length) * 100 
        : 0,
      currentStreaks: goalStreaks,
      longestStreak: Math.max(...Object.values(goalStreaks), 0)
    }
  }

  // Dependency checking
  async checkDependencies(clientId, goalId) {
    await this.delay()
    
    const goal = this.goals.find(g => g.Id === parseInt(goalId))
    if (!goal || !goal.dependencies || goal.dependencies.length === 0) {
      return { unlocked: true, blockedBy: [] }
    }

    const blockedBy = []
    
    for (const depId of goal.dependencies) {
      const depAssignment = this.goalAssignments.find(
        a => a.clientId === clientId && a.goalId === depId
      )
      
      if (!depAssignment || depAssignment.status !== 'completed') {
        const depGoal = this.goals.find(g => g.Id === depId)
        blockedBy.push({
          Id: depId,
          title: depGoal?.title || `Goal ${depId}`,
          completed: false
        })
      }
    }

    return {
      unlocked: blockedBy.length === 0,
      blockedBy
    }
  }

  // Categories and filtering
  async getActiveGoals() {
    await this.delay()
    return this.goals.filter(g => g.active)
  }

  async getGoalsByCategory(category) {
    await this.delay()
    return this.goals.filter(g => g.category === category)
  }
}

export const goalService = new GoalService()