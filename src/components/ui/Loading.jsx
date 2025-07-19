import React from "react"

const Loading = ({ type = "cards" }) => {
  if (type === "table") {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === "messages") {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${
              i % 2 === 0 ? "bg-gradient-to-r from-gray-200 to-gray-300" : "bg-gradient-to-r from-primary-200 to-primary-300"
            } animate-pulse`}>
              <div className="h-4 bg-white/50 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-white/30 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
            </div>
            <div className="mt-4 h-8 bg-gradient-to-r from-primary-200 to-primary-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Loading