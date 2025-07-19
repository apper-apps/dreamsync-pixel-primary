import React, { useState } from "react"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Card from "@/components/atoms/Card"
import { toast } from "react-toastify"

const RoleSelector = ({ onUserLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    timezone: "UTC"
  })

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!selectedRole) {
      toast.error("Please select a role")
      return
    }

    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    const userData = {
      ...formData,
      role: selectedRole,
      id: Date.now().toString()
    }

    onUserLogin(userData)
    toast.success(`Welcome to DreamSync, ${formData.name}!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-3 rounded-xl shadow-lg">
              <ApperIcon name="Moon" className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-700 to-secondary-700 bg-clip-text text-transparent">
            Welcome to DreamSync
          </h1>
          <p className="text-gray-600 mt-2">Your sleep coaching portal</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Role</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("coach")}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedRole === "coach"
                      ? "border-primary-500 bg-primary-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <ApperIcon name="Users" className={`w-6 h-6 mx-auto mb-2 ${
                    selectedRole === "coach" ? "text-primary-600" : "text-gray-400"
                  }`} />
                  <div className="text-sm font-medium text-gray-900">Coach</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedRole("client")}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedRole === "client"
                      ? "border-primary-500 bg-primary-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <ApperIcon name="User" className={`w-6 h-6 mx-auto mb-2 ${
                    selectedRole === "client" ? "text-primary-600" : "text-gray-400"
                  }`} />
                  <div className="text-sm font-medium text-gray-900">Client</div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
              
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
              
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg"
            >
              Continue to Dashboard
              <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default RoleSelector