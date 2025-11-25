import { useState, useEffect } from "react"
import { Send, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"

const conversations = [
  {
    id: "red-gabriel-tagura",
    patientName: "Red Gabriel Tagura",
    avatar: "/placeholder-user.jpg",
    initials: "RG",
    lastMessage: "Thank you for the appointment reminder",
    timestamp: "2 min ago",
    unread: false,
  },
  {
    id: "francis-ronan",
    patientName: "Francis Ronan Alfaro",
    avatar: "/placeholder-user.jpg",
    initials: "FR",
    lastMessage: "Can I reschedule my appointment?",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: "tyrone-winter",
    patientName: "Tyrone Winter Tolentino",
    avatar: "/placeholder-user.jpg",
    initials: "TW",
    lastMessage: "I received the treatment plan",
    timestamp: "3 hours ago",
    unread: false,
  },
]

const messagesData = {
  "red-gabriel-tagura": [
    {
      id: 1,
      sender: "staff",
      text: "Hello Red! Your appointment is scheduled for tomorrow at 10 AM.",
      timestamp: "10:30 AM",
    },
    { id: 2, sender: "patient", text: "Thank you for the reminder!", timestamp: "10:35 AM" },
    { id: 3, sender: "staff", text: "Please arrive 10 minutes early.", timestamp: "10:35 AM" },
    { id: 4, sender: "patient", text: "Will do! See you tomorrow.", timestamp: "10:40 AM" },
  ],
  "francis-ronan": [
    { id: 1, sender: "patient", text: "Hi, can I reschedule my appointment?", timestamp: "2:15 PM" },
    { id: 2, sender: "staff", text: "Of course! What date works best for you?", timestamp: "2:20 PM" },
  ],
  "tyrone-winter": [
    { id: 1, sender: "staff", text: "Here's your treatment plan.", timestamp: "9:00 AM" },
    { id: 2, sender: "patient", text: "Thanks! I reviewed it.", timestamp: "9:30 AM" },
  ],
}

export function Messages() {
  const [activeConversationId, setActiveConversationId] = useState("red-gabriel-tagura")
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const patientId = urlParams.get("patient")
    if (patientId && messagesData[patientId]) {
      setActiveConversationId(patientId)
    }
  }, [])

  const filteredConversations = conversations.filter((conv) =>
    conv.patientName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeConversation = conversations.find((c) => c.id === activeConversationId)
  const conversationMessages = messagesData[activeConversationId] || []

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText("")
      // Message would be saved to state/database here
    }
  }

  return (
    <>
    <div className="min-h-screen bg-[#f9f9f9]">
      <Header />
      <div className="flex h-[calc(100vh-140px)] gap-4 p-6 bg-slate-50 -mt-4">
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-4">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveConversationId(conversation.id)}
                className={`w-full p-3 rounded-lg transition-colors text-left ${
                  activeConversationId === conversation.id ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-gray-900 truncate">{conversation.patientName}</p>
                      {conversation.unread && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{conversation.timestamp}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      {activeConversation && (
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm">
          {/* Chat Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={activeConversation.avatar} />
                <AvatarFallback>{activeConversation.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{activeConversation.patientName}</h3>
                <p className="text-xs text-muted-foreground">Patient</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {conversationMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "staff" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === "staff"
                        ? "bg-[#66BAFF]  text-white rounded-br-none"
                        : "bg-slate-100 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "staff" ? "text-blue-100" : "text-muted-foreground"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </>
  )
}
