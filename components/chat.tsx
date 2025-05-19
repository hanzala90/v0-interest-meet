'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, CheckCheck } from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  status: 'sent' | 'delivered' | 'seen'
}

interface ChatProps {
  currentUserId: string
  otherUserId: string
  otherUserName: string
}

export default function Chat({ currentUserId, otherUserId, otherUserName }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  // Mark messages as seen when they're received
  const markMessagesAsSeen = useCallback(async () => {
    const { error } = await supabase
      .from('messages')
      .update({ 
        status: 'seen'
      })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', otherUserId)
      .in('status', ['sent', 'delivered'])

    if (error) {
      console.error('Error marking messages as seen:', error)
    }
  }, [currentUserId, otherUserId])

  // Mark messages as delivered when they're loaded
  const markMessagesAsDelivered = useCallback(async () => {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'delivered' })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', otherUserId)
      .eq('status', 'sent')

    if (error) {
      console.error('Error marking messages as delivered:', error)
    }
  }, [currentUserId, otherUserId])

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        setMessages(data || [])
        // Mark messages as delivered when loaded
        await markMessagesAsDelivered()
        // Mark messages as seen when loaded
        await markMessagesAsSeen()
        scrollToBottom()
      }
    }

    fetchMessages()

    // Subscribe to changes
    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUserId},receiver_id=eq.${otherUserId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message
            setMessages(prev => [...prev, newMessage])
            scrollToBottom()
          } else if (payload.eventType === 'UPDATE') {
            // Update message status in the UI
            const updatedMessage = payload.new as Message
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ))
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentUserId, otherUserId, markMessagesAsDelivered, markMessagesAsSeen])

  const MessageStatus = ({ message }: { message: Message }) => {
    if (message.sender_id !== currentUserId) return null
    
    return (
      <span className="ml-2 inline-flex items-center">
        {message.status === 'seen' ? (
          <div className="flex">
            <CheckCheck className="h-3 w-3 text-blue-500" />
          </div>
        ) : message.status === 'delivered' ? (
          <div className="flex">
            <Check className="h-3 w-3 text-gray-500" />
            <Check className="h-3 w-3 text-gray-500 -ml-1" />
          </div>
        ) : (
          <div className="flex">
            <Check className="h-3 w-3 text-gray-300" />
          </div>
        )}
      </span>
    )
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: newMessage,
        status: 'sent'
      })
      .select()

    if (error) {
      console.error('Error sending message:', error)
    } else if (data) {
      setMessages(prev => [...prev, data[0]])
      setNewMessage('')
      scrollToBottom()
    }
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Chat with {otherUserName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[calc(100vh-200px)]" ref={scrollAreaRef}>
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    message.sender_id === currentUserId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <MessageStatus message={message} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t">
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  )
}

