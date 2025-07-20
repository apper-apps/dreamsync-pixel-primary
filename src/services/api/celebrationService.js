import mockCelebrations from "@/services/mockData/celebrations.json"

class CelebrationService {
  constructor() {
    this.celebrations = [...mockCelebrations]
    this.nextId = Math.max(...this.celebrations.map(c => c.Id)) + 1
  }

  delay = () => new Promise(resolve => setTimeout(resolve, 200))

  async getAll() {
    await this.delay()
    return [...this.celebrations]
  }

  async getByClient(clientId) {
    await this.delay()
    return this.celebrations.filter(c => c.clientId === clientId)
  }

  async create(celebrationData) {
    await this.delay()

    const newCelebration = {
      Id: this.nextId++,
      clientId: celebrationData.clientId,
      goalId: celebrationData.goalId,
      milestoneType: celebrationData.milestoneType,
      message: celebrationData.message,
      achievedAt: new Date().toISOString(),
      displayType: celebrationData.displayType || 'toast',
      viewed: false
    }

    this.celebrations.push(newCelebration)
    return { ...newCelebration }
  }

  async markAsViewed(id) {
    await this.delay()
    
    const index = this.celebrations.findIndex(c => c.Id === parseInt(id))
    if (index !== -1) {
      this.celebrations[index].viewed = true
      return { ...this.celebrations[index] }
    }
    
    throw new Error(`Celebration with Id ${id} not found`)
  }

  async checkForNewAchievements(clientId, goalId, progressData) {
    await this.delay()
    
    const achievements = []
    
    // Import goalService to access progress data
    const { goalService } = await import('./goalService.js')
    
    // Get goal progress history
    const progressHistory = await goalService.getProgressByClientAndGoal(clientId, goalId)
    const completedDays = progressHistory.filter(p => p.completed).length
    
    // Check for first completion
    if (completedDays === 1 && progressData.completed) {
      achievements.push({
        clientId,
        goalId,
        milestoneType: 'first_completion',
        message: '🎉 Congratulations! You completed this goal for the first time!',
        displayType: 'toast'
      })
    }
    
    // Check for streak milestones
    const streak = this.calculateCurrentStreak(progressHistory)
    
    if (streak === 3) {
      achievements.push({
        clientId,
        goalId,
        milestoneType: '3_day_streak',
        message: '🔥 Amazing! 3 days in a row - you\'re building a great habit!',
        displayType: 'modal'
      })
    } else if (streak === 7) {
      achievements.push({
        clientId,
        goalId,
        milestoneType: 'week_streak',
        message: '⭐ Incredible! A full week of consistency - you\'re a sleep champion!',
        displayType: 'modal'
      })
    } else if (streak === 30) {
      achievements.push({
        clientId,
        goalId,
        milestoneType: 'month_streak',
        message: '🏆 Outstanding! 30 days of dedication - this is now a strong habit!',
        displayType: 'celebration'
      })
    }
    
    // Check for completion percentage milestones
    const totalDays = progressHistory.length
    const completionRate = (completedDays / totalDays) * 100
    
    if (totalDays >= 14 && completionRate >= 80 && !this.hasAchievement(clientId, goalId, 'high_consistency')) {
      achievements.push({
        clientId,
        goalId,
        milestoneType: 'high_consistency',
        message: '💎 Exceptional consistency! You\'ve maintained 80%+ completion rate!',
        displayType: 'toast'
      })
    }
    
    // Create achievement records
    const createdAchievements = []
    for (const achievement of achievements) {
      try {
        const created = await this.create(achievement)
        createdAchievements.push(created)
      } catch (error) {
        console.error('Failed to create achievement:', error)
      }
    }
    
    return createdAchievements
  }

  calculateCurrentStreak(progressHistory) {
    if (!progressHistory.length) return 0
    
    // Sort by date descending
    const sorted = progressHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    
    let streak = 0
    let currentDate = new Date()
    
    for (let i = 0; i < sorted.length; i++) {
      const progressDate = new Date(sorted[i].date)
      const daysDiff = Math.floor((currentDate - progressDate) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === i && sorted[i].completed) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  hasAchievement(clientId, goalId, milestoneType) {
    return this.celebrations.some(c => 
      c.clientId === clientId && 
      c.goalId === goalId && 
      c.milestoneType === milestoneType
    )
  }

  async getUnviewedByClient(clientId) {
    await this.delay()
    return this.celebrations.filter(c => c.clientId === clientId && !c.viewed)
  }

  async bulkMarkAsViewed(ids) {
    await this.delay()
    
    const updated = []
    for (const id of ids) {
      const index = this.celebrations.findIndex(c => c.Id === parseInt(id))
      if (index !== -1) {
        this.celebrations[index].viewed = true
        updated.push({ ...this.celebrations[index] })
      }
    }
    
    return updated
  }

  // Get achievement statistics
  async getAchievementStats(clientId) {
    await this.delay()
    
    const clientAchievements = this.celebrations.filter(c => c.clientId === clientId)
    
    const stats = {
      totalAchievements: clientAchievements.length,
      firstCompletions: clientAchievements.filter(c => c.milestoneType === 'first_completion').length,
      streakAchievements: clientAchievements.filter(c => c.milestoneType.includes('streak')).length,
      consistencyAchievements: clientAchievements.filter(c => c.milestoneType === 'high_consistency').length,
      recentAchievements: clientAchievements
        .filter(c => {
          const achievedDate = new Date(c.achievedAt)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return achievedDate >= weekAgo
        })
        .length
    }
    
    return stats
  }
}

export const celebrationService = new CelebrationService()