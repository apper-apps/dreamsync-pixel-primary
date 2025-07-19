import React, { useState } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"

const CoachResources = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Mock resources data
  const resources = [
    {
      id: 1,
      title: "Sleep Hygiene Checklist",
      description: "A comprehensive checklist for clients to improve their sleep environment and habits.",
      category: "guides",
      type: "PDF",
      size: "2.5 MB",
      downloads: 45,
      dateAdded: "2024-02-15"
    },
    {
      id: 2,
      title: "Progressive Muscle Relaxation Audio",
      description: "Guided audio session for deep relaxation before bedtime.",
      category: "audio",
      type: "MP3",
      size: "15.2 MB",
      downloads: 32,
      dateAdded: "2024-02-10"
    },
    {
      id: 3,
      title: "Sleep Diary Template",
      description: "Printable template for clients to track their sleep patterns manually.",
      category: "templates",
      type: "PDF",
      size: "1.8 MB",
      downloads: 67,
      dateAdded: "2024-02-08"
    },
    {
      id: 4,
      title: "Cognitive Behavioral Therapy for Insomnia (CBT-I) Guide",
      description: "Evidence-based techniques for treating chronic insomnia.",
      category: "guides",
      type: "PDF",
      size: "5.1 MB",
      downloads: 28,
      dateAdded: "2024-02-05"
    },
    {
      id: 5,
      title: "Bedtime Meditation - 10 Minutes",
      description: "Short guided meditation to calm the mind before sleep.",
      category: "audio",
      type: "MP3",
      size: "9.8 MB",
      downloads: 41,
      dateAdded: "2024-02-01"
    },
    {
      id: 6,
      title: "Sleep Assessment Questionnaire",
      description: "Initial assessment form for new clients to evaluate sleep issues.",
      category: "templates",
      type: "PDF",
      size: "800 KB",
      downloads: 55,
      dateAdded: "2024-01-28"
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

  const getResourceIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf": return "FileText"
      case "mp3": return "Music"
      case "mp4": return "Video"
      default: return "File"
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "guides": return "BookOpen"
      case "audio": return "Headphones"
      case "templates": return "FileTemplate"
      case "videos": return "PlayCircle"
      default: return "Folder"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Resource Library
          </h1>
          <p className="text-gray-600">
            Manage and share helpful resources with your clients.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-secondary-600">
          <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </div>

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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Resources</p>
              <p className="text-2xl font-bold text-blue-900">{resources.length}</p>
            </div>
            <ApperIcon name="Library" className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Downloads</p>
              <p className="text-2xl font-bold text-green-900">
                {resources.reduce((sum, r) => sum + r.downloads, 0)}
              </p>
            </div>
            <ApperIcon name="Download" className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Audio Files</p>
              <p className="text-2xl font-bold text-purple-900">
                {resources.filter(r => r.type === "MP3").length}
              </p>
            </div>
            <ApperIcon name="Headphones" className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Templates</p>
              <p className="text-2xl font-bold text-amber-900">
                {resources.filter(r => r.category === "templates").length}
              </p>
            </div>
            <ApperIcon name="FileTemplate" className="w-8 h-8 text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <Card key={resource.id} className="hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${
                resource.category === "guides" ? "from-blue-100 to-blue-200" :
                resource.category === "audio" ? "from-purple-100 to-purple-200" :
                resource.category === "templates" ? "from-green-100 to-green-200" :
                "from-gray-100 to-gray-200"
              }`}>
                <ApperIcon 
                  name={getResourceIcon(resource.type)} 
                  className={`w-6 h-6 ${
                    resource.category === "guides" ? "text-blue-600" :
                    resource.category === "audio" ? "text-purple-600" :
                    resource.category === "templates" ? "text-green-600" :
                    "text-gray-600"
                  }`} 
                />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                resource.category === "guides" ? "bg-blue-100 text-blue-800" :
                resource.category === "audio" ? "bg-purple-100 text-purple-800" :
                resource.category === "templates" ? "bg-green-100 text-green-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {resource.type}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {resource.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {resource.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{resource.size}</span>
              <span className="flex items-center">
                <ApperIcon name="Download" className="w-3 h-3 mr-1" />
                {resource.downloads}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" className="flex-1">
                <ApperIcon name="Eye" className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button size="sm" className="flex-1">
                <ApperIcon name="Share" className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <ApperIcon name="MoreVertical" className="w-4 h-4" />
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
    </div>
  )
}

export default CoachResources