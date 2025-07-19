import React, { useState } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"

const ClientResources = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Mock resources data - these would be shared by the coach
  const resources = [
    {
      id: 1,
      title: "Sleep Hygiene Checklist",
      description: "A comprehensive checklist to improve your sleep environment and habits.",
      category: "guides",
      type: "PDF",
      size: "2.5 MB",
      sharedBy: "Dr. Sarah Wilson",
      dateShared: "2024-02-15",
      isBookmarked: true
    },
    {
      id: 2,
      title: "Progressive Muscle Relaxation Audio",
      description: "Guided audio session for deep relaxation before bedtime.",
      category: "audio",
      type: "MP3",
      size: "15.2 MB",
      sharedBy: "Dr. Sarah Wilson",
      dateShared: "2024-02-10",
      isBookmarked: false
    },
    {
      id: 3,
      title: "Sleep Diary Template",
      description: "Printable template to track your sleep patterns manually.",
      category: "templates",
      type: "PDF",
      size: "1.8 MB",
      sharedBy: "Dr. Sarah Wilson",
      dateShared: "2024-02-08",
      isBookmarked: true
    },
    {
      id: 4,
      title: "Bedtime Meditation - 10 Minutes",
      description: "Short guided meditation to calm your mind before sleep.",
      category: "audio",
      type: "MP3",
      size: "9.8 MB",
      sharedBy: "Dr. Sarah Wilson",
      dateShared: "2024-02-01",
      isBookmarked: false
    },
    {
      id: 5,
      title: "Understanding Sleep Cycles",
      description: "Educational guide about the different stages of sleep and their importance.",
      category: "guides",
      type: "PDF",
      size: "3.2 MB",
      sharedBy: "Dr. Sarah Wilson",
      dateShared: "2024-01-28",
      isBookmarked: false
    }
  ]

  const categories = [
    { value: "all", label: "All Resources" },
    { value: "guides", label: "Guides & Articles" },
    { value: "audio", label: "Audio Resources" },
    { value: "templates", label: "Templates & Forms" },
    { value: "videos", label: "Video Content" }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const bookmarkedResources = resources.filter(r => r.isBookmarked)

  const getResourceIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf": return "FileText"
      case "mp3": return "Music"
      case "mp4": return "Video"
      default: return "File"
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "guides": return "from-blue-100 to-blue-200 text-blue-600"
      case "audio": return "from-purple-100 to-purple-200 text-purple-600"
      case "templates": return "from-green-100 to-green-200 text-green-600"
      case "videos": return "from-red-100 to-red-200 text-red-600"
      default: return "from-gray-100 to-gray-200 text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          Resource Library
        </h1>
        <p className="text-gray-600">
          Access helpful resources shared by your sleep coach to support your journey.
        </p>
      </div>

      {/* Quick Access - Bookmarked Resources */}
      {bookmarkedResources.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-2 rounded-full">
                <ApperIcon name="Bookmark" className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Access</h3>
                <p className="text-sm text-gray-600">Your bookmarked resources</p>
              </div>
            </div>
            <span className="text-sm text-amber-600 font-medium">
              {bookmarkedResources.length} bookmarked
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookmarkedResources.slice(0, 4).map(resource => (
              <div key={resource.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-amber-200">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryColor(resource.category)}`}>
                  <ApperIcon name={getResourceIcon(resource.type)} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{resource.title}</p>
                  <p className="text-xs text-gray-500">{resource.type} • {resource.size}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <ApperIcon name="Download" className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <Card key={resource.id} className="hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${getCategoryColor(resource.category)}`}>
                <ApperIcon name={getResourceIcon(resource.type)} className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <ApperIcon 
                    name={resource.isBookmarked ? "Bookmark" : "BookmarkPlus"} 
                    className={`w-4 h-4 ${resource.isBookmarked ? "text-amber-500" : "text-gray-400"}`} 
                  />
                </Button>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {resource.type}
                </span>
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {resource.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {resource.description}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{resource.size}</span>
                <span>Shared {resource.dateShared}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-1 rounded-full">
                  <ApperIcon name="User" className="w-3 h-3 text-primary-600" />
                </div>
                <span>Shared by {resource.sharedBy}</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button size="sm" className="flex-1">
                <ApperIcon name="Download" className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="secondary" size="sm" className="flex-1">
                <ApperIcon name="Eye" className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-full mx-auto mb-4 w-24 h-24 flex items-center justify-center">
              <ApperIcon name="Search" className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="secondary" onClick={() => {setSearchQuery(""); setSelectedCategory("all")}}>
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-full">
            <ApperIcon name="HelpCircle" className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Can't find what you're looking for? Your coach can share additional resources or answer any questions you have.
            </p>
            <Button variant="secondary" size="sm">
              <ApperIcon name="MessageSquare" className="w-4 h-4 mr-1" />
              Message Your Coach
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ClientResources