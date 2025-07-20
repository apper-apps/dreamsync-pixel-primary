import React, { useState } from "react"
import Sidebar from "@/components/molecules/Sidebar"
import Header from "@/components/molecules/Header"

const Layout = ({ children, currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getNavigationItems = () => {
    if (currentUser?.role === "coach") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: "BarChart3" },
        { href: "/clients", label: "Client Management", icon: "Users" },
        { href: "/schedule", label: "Schedule", icon: "Calendar" },
{ href: "/messages", label: "Messages", icon: "MessageSquare" },
        { href: "/notes", label: "Session Notes", icon: "FileText" },
        { href: "/questions", label: "Questions", icon: "HelpCircle" },
        { href: "/resources", label: "Resources", icon: "Library" },
      ]
    } else {
      return [
        { href: "/dashboard", label: "Dashboard", icon: "Home" },
        { href: "/diary", label: "Sleep Diary", icon: "Moon" },
        { href: "/schedule", label: "Appointments", icon: "Calendar" },
        { href: "/messages", label: "Messages", icon: "MessageSquare" },
        { href: "/notes", label: "Session Notes", icon: "FileText" },
        { href: "/resources", label: "Resources", icon: "Library" },
        { href: "/goals", label: "Goals", icon: "Target" },
      ]
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        navigationItems={getNavigationItems()}
      />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout