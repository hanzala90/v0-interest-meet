'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import Chat from './chat'
import ConnectionRequests from './connection-requests'

interface ChatPreview {
  userId: string
  username: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  profile_picture_url: string
}

interface Connection {
  userId: string
  username: string
  profile_picture_url: string
  connected_at: string
}

interface InboxProps {
  isFullPage?: boolean
}

export default function Inbox({ isFullPage = false }: InboxProps) {
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchChatsAndConnections = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      // Fetch messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        return
      }

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          user:profiles!connections_user2_id_fkey (id, username, profile_picture_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError)
        return
      }

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, profile_picture_url')

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
      }

      // Create a map of user IDs to profile information
      const userMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {})

      const chatPreviews: { [key: string]: ChatPreview } = {}

      messages.forEach((message) => {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id
        if (!chatPreviews[otherUserId]) {
          chatPreviews[otherUserId] = {
            userId: otherUserId,
            username: userMap[otherUserId]?.username || 'Unknown User',
            lastMessage: message.content,
            lastMessageTime: message.created_at,
            unreadCount: message.receiver_id === user.id && message.status !== 'seen' ? 1 : 0,
            profile_picture_url: userMap[otherUserId]?.profile_picture_url || ''
          }
        } else if (message.receiver_id === user.id && message.status !== 'seen') {
          chatPreviews[otherUserId].unreadCount++
        }
      })

      setChats(Object.values(chatPreviews))

      const formattedConnections = connectionsData.map(conn => ({
        userId: conn.user.id,
        username: conn.user.username,
        profile_picture_url: conn.user.profile_picture_url,
        connected_at: conn.created_at
      }))

      setConnections(formattedConnections)
    }

    fetchChatsAndConnections()

    const channel = supabase
      .channel('inbox_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchChatsAndConnections()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections'
        },
        () => {
          fetchChatsAndConnections()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return (
    <div className={`flex flex-col ${isFullPage ? 'h-[calc(100vh-100px)]' : 'h-[600px]'} border rounded-lg overflow-hidden`}>
      <div className={isFullPage ? 'h-1/2 border-b' : 'h-full'}>
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className={isFullPage ? 'h-[calc(50vh-180px)]' : 'h-[520px]'}>
              {connections.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">New Connections</h3>
                  {connections.map((connection) => (
                    <Button
                      key={connection.userId}
                      variant="ghost"
                      className="w-full justify-start mb-2"
                      onClick={() => setSelectedChat(connection.userId)}
                    >
                      <div className="flex items-center w-full">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={connection.profile_picture_url} alt={connection.username} />
                          <AvatarFallback>{connection.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow text-left">
                          <div className="font-semibold">{connection.username}</div>
                          <div className="text-sm text-gray-500">
                            Connected on {new Date(connection.connected_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
              <h3 className="font-semibold mb-2">Chats</h3>
              {chats.map((chat) => (
                <Button
                  key={chat.userId}
                  variant="ghost"
                  className="w-full justify-start mb-2"
                  onClick={() => setSelectedChat(chat.userId)}
                >
                  <div className="flex items-center w-full">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={chat.profile_picture_url} alt={chat.username} />
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
                </Button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      {isFullPage && (
        <>
          <div className="h-1/4 border-b">
            <ConnectionRequests />
          </div>
          <div className="h-1/4">
            {selectedChat && currentUserId ? (
              <Chat
                currentUserId={currentUserId}
                otherUserId={selectedChat}
                otherUserName={chats.find(chat => chat.userId === selectedChat)?.username || ''}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

