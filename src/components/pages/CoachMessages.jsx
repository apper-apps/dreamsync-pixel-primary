import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { messageService } from "@/services/api/messageService"
import { userService } from "@/services/api/userService"
import { format } from "date-fns"
import { toast } from "react-toastify"

const CoachMessages = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const loadMessagesData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock coach ID
      const coachId = "1"

      const [allMessages, allClients] = await Promise.all([
        messageService.getAll(),
        userService.getByRole("client")
      ])

      // Group messages by conversation
      const conversationMap = new Map()
      
      allMessages.forEach(message => {
        const otherUserId = message.senderId === coachId ? message.receiverId : message.senderId
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, [])
        }
        conversationMap.get(otherUserId).push(message)
      })

      // Create conversation list with latest message info
      const conversationList = Array.from(conversationMap.entries()).map(([clientId, msgs]) => {
        const client = allClients.find(c => c.Id.toString() === clientId)
        const sortedMsgs = msgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        const latestMessage = sortedMsgs[0]
        const unreadCount = msgs.filter(m => m.receiverId === coachId && !m.read).length

        return {
          clientId,
          client,
          latestMessage,
          unreadCount,
          messageCount: msgs.length
        }
      }).sort((a, b) => new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp))

      setConversations(conversationList)
      setClients(allClients)

      // Select first conversation if none selected
      if (conversationList.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationList[0])
      }
    } catch (err) {
      setError("Failed to load messages")
      console.error("Load messages error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadConversationMessages = async (clientId) => {
    try {
      const coachId = "1"
      const conversationMessages = await messageService.getConversation(coachId, clientId)
      setMessages(conversationMessages)

      // Mark unread messages as read
      const unreadMessages = conversationMessages.filter(m => m.receiverId === coachId && !m.read)
      for (const message of unreadMessages) {
        await messageService.markAsRead(message.Id)
      }
    } catch (err) {
      console.error("Load conversation error:", err)
    }
  }

  useEffect(() => {
    loadMessagesData()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.clientId)
    }
  }, [selectedConversation])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSendingMessage(true)
      
      const messageData = {
        senderId: "1", // Mock coach ID
        receiverId: selectedConversation.clientId,
        content: newMessage.trim()
      }

      await messageService.create(messageData)
      setNewMessage("")
      
      // Reload conversation and messages
      await Promise.all([
        loadConversationMessages(selectedConversation.clientId),
        loadMessagesData()
      ])
      
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          Messages
        </h1>
        <p className="text-gray-600">
          Communicate with your clients and provide ongoing support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-display text-gray-900">
              Conversations
            </h3>
            <Button variant="ghost" size="sm">
              <ApperIcon name="Plus" className="w-4 h-4" />
            </Button>
          </div>

          {conversations.length === 0 ? (
            <Empty 
              title="No conversations"
              description="Start messaging with your clients"
              icon="MessageSquare"
            />
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {conversations.map(conversation => (
                <div
                  key={conversation.clientId}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.clientId === conversation.clientId
                      ? "bg-primary-50 border border-primary-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-2 rounded-full">
                        <ApperIcon name="User" className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {conversation.client?.name || `Client ${conversation.clientId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(conversation.latestMessage.timestamp), "MMM dd, h:mm a")}
                        </p>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.latestMessage.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Messages Panel */}
        <Card className="lg:col-span-2">
          {!selectedConversation ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-full mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                  <ApperIcon name="MessageSquare" className="w-12 h-12 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a client to start messaging
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Conversation Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-2 rounded-full">
                    <ApperIcon name="User" className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedConversation.client?.name || `Client ${selectedConversation.clientId}`}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.client?.email}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="Phone" className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="Video" className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[400px]">
                {messages.length === 0 ? (
                  <Empty 
                    title="No messages yet"
                    description="Start the conversation with your client"
                    icon="MessageSquare"
                  />
                ) : (
                  messages.map(message => {
                    const isFromCoach = message.senderId === "1"
                    return (
                      <div key={message.Id} className={`flex ${isFromCoach ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isFromCoach
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isFromCoach ? "text-primary-100" : "text-gray-500"
                          }`}>
                            {format(new Date(message.timestamp), "h:mm a")}
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={sendingMessage}
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-4"
                  >
                    {sendingMessage ? (
                      <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                    ) : (
                      <ApperIcon name="Send" className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default CoachMessages