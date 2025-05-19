'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'

interface ChatPreview {
  userId: string
  username: string
  lastMessage: string
  unreadCount: number
}

export default function InboxPreview() {
  const [chats, setChats] = useState<ChatPreview[]>([])

  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch messages (limit to 5 for preview)
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        return
      }

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
      }

      // Create a map of user IDs to usernames
      const userMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile.username
        return acc
      }, {})

      const chatPreviews: { [key: string]: ChatPreview } = {}

      messages.forEach((message) => {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id
        if (!chatPreviews[otherUserId]) {
          chatPreviews[otherUserId] = {
            userId: otherUserId,
            username: userMap[otherUserId] || 'Unknown User',
            lastMessage: message.content,
            unreadCount: message.receiver_id === user.id && message.status !== 'seen' ? 1 : 0
          }
        } else if (message.receiver_id === user.id && message.status !== 'seen') {
          chatPreviews[otherUserId].unreadCount++
        }
      })

      setChats(Object.values(chatPreviews))
    }

    fetchChats()
  }, [])

  return (
    <Card className="w-64">
      <CardContent className="p-4">
        <ScrollArea className="h-48">
          {chats.map((chat) => (
            <Button
              key={chat.userId}
              variant="ghost"
              className="w-full justify-start mb-2"
              asChild
            >
              <Link href={`/inbox?chat=${chat.userId}`}>
                <div className="flex items-center w-full">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${chat.username}`} />
                    <AvatarFallback>{chat.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow text-left">
                    <div className="font-semibold">{chat.username}</div>
                    <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </Link>
            </Button>
          ))}
        </ScrollArea>
        <Button className="w-full mt-2" asChild>
          <Link href="/inbox">All Chats</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

