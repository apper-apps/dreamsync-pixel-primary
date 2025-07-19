import React from "react"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"

const StatCard = ({ 
  title, 
  value, 
  icon, 
  iconColor = "text-primary-600", 
  trend,
  trendIcon,
  className = "" 
}) => {
  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold font-display bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              {trendIcon && (
                <ApperIcon 
                  name={trendIcon} 
                  className={`w-4 h-4 mr-1 ${trend > 0 ? "text-green-500" : "text-red-500"}`} 
                />
              )}
              <span className={`text-sm font-medium ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50`}>
          <ApperIcon name={icon} className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  )
}

export default StatCard