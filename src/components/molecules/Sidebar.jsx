import React from "react"
import { NavLink } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const Sidebar = ({ isOpen, onClose, currentUser, navigationItems }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gradient-to-b from-primary-900 to-primary-800 shadow-xl">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-lg mr-3">
                    <ApperIcon name="Moon" className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold font-display text-white">DreamSync</h1>
                </div>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-white/20 text-white shadow-sm"
                          : "text-primary-200 hover:bg-white/10 hover:text-white"
                      )
                    }
                  >
                    <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary-900 to-primary-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center">
              <div className="bg-white/10 p-2 rounded-lg mr-3">
                <ApperIcon name="Moon" className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold font-display text-white">DreamSync</h1>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-primary-200 hover:text-white hover:bg-white/10"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-primary-200 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar