import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { sleepEntryService } from "@/services/api/sleepEntryService"
import { format, subDays, startOfWeek, endOfWeek } from "date-fns"
import { toast } from "react-toastify"

const SleepDiary = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    bedTime: "",
    wakeTime: "",
    quality: 5,
    notes: ""
  })

  const loadEntries = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock client ID - in real app this would come from auth
      const clientId = "2"
      const clientEntries = await sleepEntryService.getByClient(clientId)
      
      // Sort by date descending
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "quality" ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.bedTime || !formData.wakeTime) {
      toast.error("Please fill in bedtime and wake time")
      return
    }

    try {
      const newEntry = {
        ...formData,
        clientId: "2" // Mock client ID
      }
      
      await sleepEntryService.create(newEntry)
      toast.success("Sleep entry added successfully")
      
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        bedTime: "",
        wakeTime: "",
        quality: 5,
        notes: ""
      })
      setShowForm(false)
      loadEntries()
    } catch (err) {
      toast.error("Failed to add sleep entry")
      console.error("Create entry error:", err)
    }
  }

  const calculateSleepDuration = (bedTime, wakeTime) => {
    const bed = new Date(`2000-01-01 ${bedTime}`)
    let wake = new Date(`2000-01-01 ${wakeTime}`)
    
    // If wake time is earlier than bed time, assume next day
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
      recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length
    )
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadEntries} />

  const weeklyAvg = getWeeklyAverage()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Sleep Diary
          </h1>
          <p className="text-gray-600">
            Track your daily sleep patterns and quality to identify trends.
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-primary-600 to-secondary-600"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

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

      {/* Add Entry Form */}
      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              Add Sleep Entry
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowForm(false)}
            >
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Bedtime"
                name="bedTime"
                type="time"
                value={formData.bedTime}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Wake Time"
                name="wakeTime"
                type="time"
                value={formData.wakeTime}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Quality: {formData.quality}/10
              </label>
              <input
                type="range"
                name="quality"
                min="1"
                max="10"
                value={formData.quality}
                onChange={handleInputChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
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
                placeholder="How did you sleep? Any factors that affected your rest?"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button type="submit" className="flex-1">
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Entries List */}
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
                        {calculateSleepDuration(entry.bedTime, entry.wakeTime)} sleep
                      </p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(entry.quality)}`}>
                    {entry.quality}/10 - {getQualityText(entry.quality)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Moon" className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Bedtime: {entry.bedTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Sun" className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Wake: {entry.wakeTime}</span>
                  </div>
                </div>
                
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
    </div>
  )
}

export default SleepDiary