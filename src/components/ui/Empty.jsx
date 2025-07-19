import React from "react"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item", 
  icon = "Moon",
  actionText,
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-full p-6 mb-6">
        <ApperIcon name={icon} className="w-16 h-16 text-primary-500" />
      </div>
      
      <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 text-center max-w-md mb-6">
        {description}
      </p>
      
      {actionText && onAction && (
        <Button 
          onClick={onAction}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default Empty