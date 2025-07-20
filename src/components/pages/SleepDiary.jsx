import React, { useCallback, useEffect, useState, useRef } from "react";
import { eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, isToday, startOfMonth, subDays } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import { sleepEntryService } from "@/services/api/sleepEntryService";

const SleepDiary = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [view, setView] = useState("list") // "list" or "calendar"
  const [showForm, setShowForm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isStepMode, setIsStepMode] = useState(() => {
    const saved = localStorage.getItem('sleep-diary-step-mode')
    return saved ? JSON.parse(saved) : true
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const autoSaveTimerRef = useRef(null)
  const [isDuplicate, setIsDuplicate] = useState(false)
const [validationErrors, setValidationErrors] = useState({})
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    bedTime: "",
    tryToSleepTime: "",
    minutesToFallAsleep: "",
    nightWakeups: "",
    finalWakeTime: "",
    outOfBedTime: "",
    sleepQuality: 5,
    notes: ""
  })

  const totalSteps = 8
  const clientId = "2" // Mock client ID - in real app this would come from auth
  
  const initialFormData = {
    date: format(new Date(), "yyyy-MM-dd"),
    bedTime: "",
    tryToSleepTime: "",
    minutesToFallAsleep: "",
    nightWakeups: "",
    finalWakeTime: "",
    outOfBedTime: "",
    sleepQuality: 5,
    notes: ""
  }

  const questions = [
    {
      id: "date",
      title: "Today's Date",
      subtitle: "When did this sleep period occur?",
      type: "date",
      required: true,
      icon: "Calendar"
    },
    {
      id: "bedTime",
      title: "Bedtime",
      subtitle: "When you got into bed last night",
      type: "time",
      required: true,
      icon: "Moon"
    },
    {
      id: "tryToSleepTime",
      title: "When you tried to sleep",
      subtitle: "The time you actually tried to fall asleep",
      type: "time",
      required: true,
      icon: "Clock"
    },
    {
      id: "minutesToFallAsleep",
      title: "Time to fall asleep",
      subtitle: "Approximately how long did it take you to fall asleep? (minutes)",
      type: "number",
      min: 0,
      max: 300,
      required: true,
      icon: "Timer"
    },
    {
      id: "nightWakeups",
      title: "Night wakings",
      subtitle: "How many times do you remember waking during the night?",
      type: "number",
      min: 0,
      max: 20,
      required: true,
      icon: "Eye"
    },
    {
      id: "finalWakeTime",
      title: "Final wake time",
      subtitle: "What time was your final wakeup today?",
      type: "time",
      required: true,
      icon: "Sun"
    },
    {
      id: "outOfBedTime",
      title: "Out of bed time",
      subtitle: "What time did you get out of bed for good today?",
      type: "time",
      required: true,
      icon: "ArrowUp"
    },
    {
      id: "sleepQuality",
      title: "Sleep quality rating",
      subtitle: "How would you rate last night's sleep quality?",
      type: "range",
      min: 1,
      max: 10,
      required: true,
      icon: "Star"
    }
  ]

  // Auto-save functionality
const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    
    const timer = setTimeout(() => {
      const hasRequiredFields = formData.date && formData.bedTime && formData.finalWakeTime
      if (hasRequiredFields) {
        localStorage.setItem(`sleep-diary-draft-${clientId}`, JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString()
        }))
      }
    }, 30000) // 30 seconds
    
    autoSaveTimerRef.current = timer
  }, [formData, clientId])

  useEffect(() => {
    triggerAutoSave()
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [formData, triggerAutoSave])
  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`sleep-diary-draft-${clientId}`)
    if (draft && !editingEntry) {
      try {
        const parsed = JSON.parse(draft)
        const draftAge = new Date() - new Date(parsed.timestamp)
        // Use draft if less than 24 hours old
        if (draftAge < 24 * 60 * 60 * 1000) {
          setFormData(prev => ({
            ...prev,
            ...parsed,
            timestamp: undefined
          }))
          toast.info("Restored your draft from auto-save")
        }
      } catch (err) {
        console.warn("Failed to load draft:", err)
      }
    }
  }, [clientId, editingEntry])

  const loadEntries = async () => {
    try {
      setError("")
      setLoading(true)
      const clientEntries = await sleepEntryService.getByClient(clientId)
      const sortedEntries = clientEntries.sort((a, b) => new Date(b.date) - new Date(a.date))
      setEntries(sortedEntries)
    } catch (err) {
      setError("Failed to load sleep diary entries")
      console.error("Load entries error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  // Save step mode preference
  useEffect(() => {
    localStorage.setItem('sleep-diary-step-mode', JSON.stringify(isStepMode))
  }, [isStepMode])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ["sleepQuality", "minutesToFallAsleep", "nightWakeups"].includes(name) 
        ? parseInt(value) || 0 
        : value
    }))
  }

  const checkForDuplicate = async () => {
    try {
      const existingEntries = await sleepEntryService.getByClient(clientId)
      const duplicate = existingEntries.find(entry => 
        entry.date === formData.date && entry.Id !== editingEntry?.Id
      )
      return duplicate
    } catch (err) {
      console.error("Error checking for duplicates:", err)
      return null
    }
  }

  const validateCurrentStep = () => {
    if (!isStepMode) return true
    
    const question = questions[currentStep - 1]
    const value = formData[question.id]
    
    if (question.required && (!value || value === "")) {
      toast.error(`Please complete: ${question.title}`)
      return false
    }
    
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredFields = questions.filter(q => q.required)
    for (const field of requiredFields) {
      if (!formData[field.id] || formData[field.id] === "") {
        toast.error(`Please complete: ${field.title}`)
        return
      }
    }

    // Check for duplicates
    const duplicate = await checkForDuplicate()
    if (duplicate) {
      toast.error("An entry for this date already exists. Please choose a different date or edit the existing entry.")
      return
    }

    try {
      const entryData = {
        ...formData,
        clientId,
        sleepEfficiency: calculateSleepEfficiency(formData)
      }
      
      if (editingEntry) {
        await sleepEntryService.update(editingEntry.Id, entryData)
        toast.success("Sleep entry updated successfully")
      } else {
        await sleepEntryService.create(entryData)
        toast.success("Sleep entry added successfully")
      }
      
      // Clear draft
      localStorage.removeItem(`sleep-diary-draft-${clientId}`)
      
      resetForm()
      loadEntries()
    } catch (err) {
      const action = editingEntry ? "update" : "add"
      toast.error(`Failed to ${action} sleep entry`)
      console.error(`${action} entry error:`, err)
    }
  }

const resetForm = () => {
    setFormData({ ...initialFormData, date: format(new Date(), 'yyyy-MM-dd') })
    setShowForm(false)
    setIsEditing(false)
    setEditingEntry(null)
    setCurrentStep(1)
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
  }

  const handleEdit = (entry) => {
    setFormData(entry)
    setEditingEntry(entry)
    setShowForm(true)
    setCurrentStep(1)
  }

  const calculateSleepEfficiency = (data) => {
    if (!data.tryToSleepTime || !data.finalWakeTime) return null
    
    const sleepStart = new Date(`2000-01-01 ${data.tryToSleepTime}`)
    let sleepEnd = new Date(`2000-01-01 ${data.finalWakeTime}`)
    
    if (sleepEnd < sleepStart) {
      sleepEnd = new Date(`2000-01-02 ${data.finalWakeTime}`)
    }
    
    const timeInBed = (sleepEnd - sleepStart) / (1000 * 60) // minutes
    const timeAwake = (parseInt(data.minutesToFallAsleep) || 0) + 
                     ((parseInt(data.nightWakeups) || 0) * 15) // Assume 15 min per waking
    const timeAsleep = timeInBed - timeAwake
    
    return Math.round((timeAsleep / timeInBed) * 100)
  }

  const calculateSleepDuration = (bedTime, wakeTime) => {
    const bed = new Date(`2000-01-01 ${bedTime}`)
    let wake = new Date(`2000-01-01 ${wakeTime}`)
    
    if (wake < bed) {
      wake = new Date(`2000-01-02 ${wakeTime}`)
    }
    
    const diff = wake - bed
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const getQualityColor = (quality) => {
    if (quality >= 8) return "text-green-600 bg-green-100"
    if (quality >= 6) return "text-yellow-600 bg-yellow-100"
    if (quality >= 4) return "text-orange-600 bg-orange-100"
    return "text-red-600 bg-red-100"
  }

  const getQualityText = (quality) => {
    if (quality >= 8) return "Excellent"
    if (quality >= 6) return "Good"
    if (quality >= 4) return "Fair"
    return "Poor"
  }

  const getWeeklyAverage = () => {
    const oneWeekAgo = subDays(new Date(), 7)
    const recentEntries = entries.filter(entry => new Date(entry.date) >= oneWeekAgo)
    
    if (recentEntries.length === 0) return null
    
    return Math.round(
      recentEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / recentEntries.length
    )
  }

  const getEntryForDate = (date) => {
    return entries.find(entry => isSameDay(new Date(entry.date), date))
  }

  const renderCalendarView = () => {
    const monthStart = startOfMonth(calendarDate)
    const monthEnd = endOfMonth(calendarDate)
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    return (
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Sleep Calendar - {format(calendarDate, "MMMM yyyy")}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCalendarDate(subDays(calendarDate, 30))}
            >
              <ApperIcon name="ChevronLeft" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCalendarDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCalendarDate(subDays(calendarDate, -30))}
            >
              <ApperIcon name="ChevronRight" className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(date => {
            const entry = getEntryForDate(date)
            const isCurrentMonth = isSameMonth(date, calendarDate)
            const isCurrentDay = isToday(date)
            
            return (
              <div
                key={date.toString()}
                className={`
                  aspect-square p-2 text-sm border rounded-lg cursor-pointer transition-all
                  ${isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 text-gray-400'}
                  ${isCurrentDay ? 'ring-2 ring-primary-500' : ''}
                  ${entry ? 'bg-gradient-to-br from-primary-50 to-secondary-50' : ''}
                  hover:bg-primary-50
                `}
                onClick={() => {
                  if (entry) {
                    handleEdit(entry)
                  } else if (isCurrentMonth) {
                    setFormData(prev => ({
                      ...prev,
                      date: format(date, "yyyy-MM-dd")
                    }))
                    setShowForm(true)
                  }
                }}
              >
                <div className="flex flex-col h-full">
                  <span className={`font-medium ${isCurrentDay ? 'text-primary-600' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  {entry && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${getQualityColor(entry.sleepQuality).split(' ')[1]}`} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-100" />
            <span>Excellent</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-yellow-100" />
            <span>Good</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-orange-100" />
            <span>Fair</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-100" />
            <span>Poor</span>
          </div>
        </div>
      </Card>
    )
  }

  const renderQuestion = (question, index) => {
    const value = formData[question.id]
    
    return (
      <div key={question.id} className="space-y-4">
        <div className="text-center">
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name={question.icon} className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold font-display text-gray-900 mb-2">
            {question.title}
          </h3>
          <p className="text-gray-600 mb-6">{question.subtitle}</p>
        </div>
        
        {question.type === "range" ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-primary-600">{value}</span>
              <span className="text-lg text-gray-500 ml-2">/ 10</span>
            </div>
            <input
              type="range"
              name={question.id}
              min={question.min}
              max={question.max}
              value={value}
              onChange={handleInputChange}
              className="sleep-quality-slider w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Very Poor</span>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Input
              name={question.id}
              type={question.type}
              value={value}
              onChange={handleInputChange}
              required={question.required}
              min={question.min}
              max={question.max}
              className="text-center text-lg"
              placeholder={question.type === "number" ? "Enter number" : ""}
            />
          </div>
        )}
      </div>
    )
  }

  const renderStepForm = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            {editingEntry ? "Edit Sleep Entry" : "Add Sleep Entry"}
          </h3>
          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={resetForm}
        >
          <ApperIcon name="X" className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {renderQuestion(questions[currentStep - 1], currentStep - 1)}
        
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex-1 mr-2"
          >
            <ApperIcon name="ChevronLeft" className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === totalSteps ? (
            <Button
              type="submit"
              className="flex-1 ml-2 bg-gradient-to-r from-primary-600 to-secondary-600"
            >
              <ApperIcon name="Save" className="w-4 h-4 mr-2" />
              {editingEntry ? "Update Entry" : "Save Entry"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 ml-2"
            >
              Next
              <ApperIcon name="ChevronRight" className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </form>
    </Card>
  )

  const renderAllQuestionsForm = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display text-gray-900">
          {editingEntry ? "Edit Sleep Entry" : "Add Sleep Entry"}
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={resetForm}
        >
          <ApperIcon name="X" className="w-4 h-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.slice(0, 7).map((question, index) => (
            <div key={question.id}>
              {question.type === "range" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.title}: {formData[question.id]}/10
                  </label>
                  <input
                    type="range"
                    name={question.id}
                    min={question.min}
                    max={question.max}
                    value={formData[question.id]}
                    onChange={handleInputChange}
                    className="sleep-quality-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ) : (
                <Input
                  label={question.title}
                  name={question.id}
                  type={question.type}
                  value={formData[question.id]}
                  onChange={handleInputChange}
                  required={question.required}
                  min={question.min}
                  max={question.max}
                />
              )}
            </div>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Any additional notes about your sleep..."
          />
        </div>
        
        <div className="flex space-x-3">
          <Button type="submit" className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600">
            <ApperIcon name="Save" className="w-4 h-4 mr-2" />
            {editingEntry ? "Update Entry" : "Save Entry"}
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={resetForm}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadEntries} />

  const weeklyAvg = getWeeklyAverage()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Sleep Diary
          </h1>
          <p className="text-gray-600">
            Track your daily sleep patterns and quality to identify trends.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="text-xs"
            >
              <ApperIcon name="List" className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              className="text-xs"
            >
              <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
              Calendar
            </Button>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-primary-600 to-secondary-600"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Mode Toggle */}
      {showForm && (
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Entry Mode</h3>
              <p className="text-xs text-gray-600">
                Choose how you'd like to complete your sleep diary
              </p>
            </div>
            <div className="flex items-center bg-white rounded-lg p-1">
              <Button
                variant={isStepMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsStepMode(true)}
                className="text-xs"
              >
                <ApperIcon name="ArrowRight" className="w-4 h-4 mr-1" />
                Step-by-Step
              </Button>
              <Button
                variant={!isStepMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsStepMode(false)}
                className="text-xs"
              >
                <ApperIcon name="Grid" className="w-4 h-4 mr-1" />
                All Questions
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Summary */}
      {weeklyAvg && (
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold font-display text-gray-900 mb-1">
                This Week's Average
              </h3>
              <p className="text-sm text-gray-600">
                Based on your last 7 entries
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(weeklyAvg)}`}>
                <ApperIcon name="Moon" className="w-4 h-4 mr-1" />
                {weeklyAvg}/10 - {getQualityText(weeklyAvg)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Form */}
      {showForm && (isStepMode ? renderStepForm() : renderAllQuestionsForm())}

      {/* Main Content */}
      {view === "calendar" ? renderCalendarView() : (
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              Sleep History
            </h3>
          </div>
          
          {entries.length === 0 ? (
            <Empty 
              title="No sleep entries yet"
              description="Start tracking your sleep patterns by adding your first entry"
              icon="Moon"
              actionText="Add First Entry"
              onAction={() => setShowForm(true)}
            />
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.Id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-2 rounded-full">
                        <ApperIcon name="Moon" className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {format(new Date(entry.date), "EEEE, MMMM dd, yyyy")}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {entry.outOfBedTime && entry.bedTime ? 
                            calculateSleepDuration(entry.bedTime, entry.outOfBedTime) + " in bed" :
                            "Duration not available"
                          }
                          {entry.sleepEfficiency && ` • ${entry.sleepEfficiency}% efficiency`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(entry.sleepQuality)}`}>
                        {entry.sleepQuality}/10 - {getQualityText(entry.sleepQuality)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <ApperIcon name="Edit" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Moon" className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Bed: {entry.bedTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Clock" className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Sleep: {entry.tryToSleepTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Sun" className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Wake: {entry.finalWakeTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="ArrowUp" className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Up: {entry.outOfBedTime}</span>
                    </div>
                  </div>
                  
                  {(entry.minutesToFallAsleep || entry.nightWakeups) && (
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {entry.minutesToFallAsleep && (
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Timer" className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{entry.minutesToFallAsleep} min to sleep</span>
                        </div>
                      )}
                      {entry.nightWakeups !== undefined && (
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Eye" className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{entry.nightWakeups} night wakings</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {entry.notes && (
                    <div className="mt-3 p-3 bg-white rounded border-l-4 border-primary-200">
                      <p className="text-sm text-gray-700">{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default SleepDiary