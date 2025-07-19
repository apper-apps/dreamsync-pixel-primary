import React from "react"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const Header = ({ onMenuClick, currentUser, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden mr-2"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold font-display text-gray-900">
              Welcome back, {currentUser?.name}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-2 rounded-full">
              <ApperIcon name="User" className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-500 hover:text-gray-700"
          >
            <ApperIcon name="LogOut" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header