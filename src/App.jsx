import React, { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/organisms/Layout"
import RoleSelector from "@/components/organisms/RoleSelector"

// Coach Pages
import CoachDashboard from "@/components/pages/CoachDashboard"
import ClientManagement from "@/components/pages/ClientManagement"
import CoachSchedule from "@/components/pages/CoachSchedule"
import CoachMessages from "@/components/pages/CoachMessages"
import CoachSessionNotes from "@/components/pages/CoachSessionNotes"
import CoachResources from "@/components/pages/CoachResources"

// Client Pages
import ClientDashboard from "@/components/pages/ClientDashboard"
import SleepDiary from "@/components/pages/SleepDiary"
import ClientSchedule from "@/components/pages/ClientSchedule"
import ClientMessages from "@/components/pages/ClientMessages"
import ClientSessionNotes from "@/components/pages/ClientSessionNotes"
import ClientResources from "@/components/pages/ClientResources"
import ClientGoals from "@/components/pages/ClientGoals"

function App() {
  const [currentUser, setCurrentUser] = useState(null)

  const handleUserLogin = (userData) => {
    setCurrentUser(userData)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  if (!currentUser) {
    return (
      <>
        <RoleSelector onUserLogin={handleUserLogin} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </>
    )
  }

  return (
    <Router>
      <Layout currentUser={currentUser} onLogout={handleLogout}>
        <Routes>
          {currentUser.role === "coach" ? (
            <>
              <Route path="/" element={<CoachDashboard />} />
              <Route path="/dashboard" element={<CoachDashboard />} />
              <Route path="/clients" element={<ClientManagement />} />
              <Route path="/schedule" element={<CoachSchedule />} />
              <Route path="/messages" element={<CoachMessages />} />
              <Route path="/notes" element={<CoachSessionNotes />} />
              <Route path="/resources" element={<CoachResources />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<ClientDashboard />} />
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/diary" element={<SleepDiary />} />
              <Route path="/schedule" element={<ClientSchedule />} />
              <Route path="/messages" element={<ClientMessages />} />
              <Route path="/notes" element={<ClientSessionNotes />} />
              <Route path="/resources" element={<ClientResources />} />
              <Route path="/goals" element={<ClientGoals />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </Router>
  )
}

export default App