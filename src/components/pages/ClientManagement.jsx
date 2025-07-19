import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { userService } from "@/services/api/userService"
import { relationService } from "@/services/api/relationService"
import { sleepEntryService } from "@/services/api/sleepEntryService"
import { format, subDays } from "date-fns"
import { toast } from "react-toastify"

const ClientManagement = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadClients = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock coach ID
      const coachId = "1"

      const [allClients, relations, sleepEntries] = await Promise.all([
        userService.getByRole("client"),
        relationService.getByCoach(coachId),
        sleepEntryService.getAll()
      ])

      // Enhance client data with relationship and sleep info
      const enhancedClients = allClients.map(client => {
        const relation = relations.find(r => r.clientId === client.Id.toString())
        const clientEntries = sleepEntries.filter(e => e.clientId === client.Id.toString())
        
        // Calculate recent activity
        const recentEntries = clientEntries.filter(entry => {
          const entryDate = new Date(entry.date)
          const sevenDaysAgo = subDays(new Date(), 7)
          return entryDate >= sevenDaysAgo
        })

        const avgQuality = recentEntries.length > 0
          ? Math.round(recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length)
          : null

        return {
          ...client,
          status: relation?.status || "inactive",
          startDate: relation?.startDate,
          totalEntries: clientEntries.length,
          recentEntries: recentEntries.length,
          avgSleepQuality: avgQuality,
          lastEntry: clientEntries.length > 0 
            ? clientEntries.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
            : null
        }
      })

      setClients(enhancedClients)
      setFilteredClients(enhancedClients)
    } catch (err) {
      setError("Failed to load clients")
      console.error("Load clients error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    let filtered = clients

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(client => client.status === statusFilter)
    }

    setFilteredClients(filtered)
  }, [clients, searchQuery, statusFilter])

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      const relation = clients.find(c => c.Id === clientId)
      if (relation?.status) {
        await relationService.update(relation.Id, { status: newStatus })
        toast.success("Client status updated successfully")
        loadClients()
      }
    } catch (err) {
      toast.error("Failed to update client status")
      console.error("Status update error:", err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "paused": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getQualityColor = (quality) => {
    if (!quality) return "text-gray-400"
    if (quality >= 8) return "text-green-600"
    if (quality >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadClients} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Client Management
          </h1>
          <p className="text-gray-600">
            Manage your sleep coaching clients and track their progress.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-secondary-600">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card>
        {filteredClients.length === 0 ? (
          <Empty 
            title="No clients found"
            description={searchQuery || statusFilter !== "all" 
              ? "Try adjusting your filters to see more clients"
              : "Start building your practice by adding your first client"
            }
            icon="Users"
            actionText="Add Client"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Sleep Quality</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Activity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Entry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.Id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-2 rounded-full">
                          <ApperIcon name="User" className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${getQualityColor(client.avgSleepQuality)}`}>
                          {client.avgSleepQuality ? `${client.avgSleepQuality}/10` : "No data"}
                        </span>
                        {client.avgSleepQuality && (
                          <ApperIcon 
                            name="Moon" 
                            className={`w-4 h-4 ${getQualityColor(client.avgSleepQuality)}`} 
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{client.recentEntries}/7 days</p>
                        <p className="text-gray-500">{client.totalEntries} total entries</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600">
                        {client.lastEntry 
                          ? format(new Date(client.lastEntry), "MMM dd")
                          : "Never"
                        }
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="MessageSquare" className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="Calendar" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ClientManagement