import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { messageService } from "@/services/api/messageService"
import { userService } from "@/services/api/userService"
import { format } from "date-fns"
import { toast } from "react-toastify"

const ClientMessages = () => {
  const [messages, setMessages] = useState([])
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const loadMessagesData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock client ID
      const clientId = "2"

      const [users] = await Promise.all([
        userService.getAll()
      ])

      // Find the coach
      const coachUser = users.find(u => u.role === "coach")
      setCoach(coachUser)

      if (coachUser) {
        // Load conversation with coach
        const conversationMessages = await messageService.getConversation(clientId, coachUser.Id.toString())
        setMessages(conversationMessages)

        // Mark unread messages as read
        const unreadMessages = conversationMessages.filter(m => m.receiverId === clientId && !m.read)
        for (const message of unreadMessages) {
          await messageService.markAsRead(message.Id)
        }
      }
    } catch (err) {
      setError("Failed to load messages")
      console.error("Load messages error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessagesData()
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !coach) return

    try {
      setSendingMessage(true)
      
      const messageData = {
        senderId: "2", // Mock client ID
        receiverId: coach.Id.toString(),
        content: newMessage.trim()
      }

      await messageService.create(messageData)
      setNewMessage("")
      
      // Reload messages
      const conversationMessages = await messageService.getConversation("2", coach.Id.toString())
      setMessages(conversationMessages)
      
      toast.success("Message sent successfully")
    } catch (err) {
      toast.error("Failed to send message")
      console.error("Send message error:", err)
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) return <Loading type="messages" />
  if (error) return <Error message={error} onRetry={loadMessagesData} />

  if (!coach) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Messages
          </h1>
          <p className="text-gray-600">
            Stay connected with your sleep coach.
          </p>
        </div>
        
        <Card>
          <Empty 
            title="No coach assigned"
            description="You'll be able to message your coach once one is assigned to you"
            icon="MessageSquare"
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          Messages
        </h1>
        <p className="text-gray-600">
          Stay connected with your sleep coach for ongoing support.
        </p>
      </div>

      {/* Coach Info */}
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-3 rounded-full">
            <ApperIcon name="UserCheck" className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Your Sleep Coach</h3>
            <p className="text-gray-600">{coach.name}</p>
            <p className="text-sm text-gray-500">{coach.email}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              <ApperIcon name="Phone" className="w-4 h-4 mr-1" />
              Call
            </Button>
            <Button variant="secondary" size="sm">
              <ApperIcon name="Video" className="w-4 h-4 mr-1" />
              Video Call
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <Card className="h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold font-display text-gray-900">
            Conversation with {coach.name}
          </h3>
          <Button variant="ghost" size="sm">
            <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <Empty 
              title="No messages yet"
              description="Start a conversation with your coach"
              icon="MessageSquare"
            />
          ) : (
            messages.map(message => {
              const isFromClient = message.senderId === "2"
              return (
                <div key={message.Id} className={`flex ${isFromClient ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isFromClient
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      isFromClient ? "text-primary-100" : "text-gray-500"
                    }`}>
                      {format(new Date(message.timestamp), "MMM dd, h:mm a")}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={sendingMessage}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sendingMessage}
              className="px-6"
            >
              {sendingMessage ? (
                <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
              ) : (
                <ApperIcon name="Send" className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-3">
              <Button type="button" variant="ghost" size="sm">
                <ApperIcon name="Paperclip" className="w-4 h-4 mr-1" />
                Attach
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <ApperIcon name="Smile" className="w-4 h-4 mr-1" />
                Emoji
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Press Enter to send
            </p>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ClientMessages