'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users } from 'lucide-react'

interface GroupChat {
  id: string
  name: string
  last_message: string
  last_message_at: string
  created_at: string
  member_count: number
  is_member: boolean
}

interface GroupMessage {
  id: string
  group_id: string
  user_id: string
  content: string
  created_at: string
  status: 'sent' | 'delivered' | 'seen'
  user: {
    username: string
  }
}

interface GroupMember {
  user_id: string
  profiles: {
    username: string
  }
}

export default function GroupChats() {
  const [groupChats, setGroupChats] = useState<GroupChat[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [showMembers, setShowMembers] = useState(false)

  useEffect(() => {
    const fetchGroupChatsAndUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user.id)
        await fetchGroupChats(user.id)
        const unsubscribe = subscribeToGroupChats(user.id)
        return () => unsubscribe()
      }
    }

    fetchGroupChatsAndUser()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup)
      fetchGroupMembers(selectedGroup)
      subscribeToMessages(selectedGroup)
    }
  }, [selectedGroup])

  const fetchGroupChats = async (userId: string) => {
    const { data, error } = await supabase
      .from('group_chats')
      .select(`
        *,
        member_count:group_members(count),
        is_member:group_members!inner(user_id),
        last_message:group_messages(content, created_at)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching group chats:', error)
    } else {
      setGroupChats(data.map(chat => ({
        ...chat,
        member_count: chat.member_count[0].count,
        is_member: chat.is_member.some(member => member.user_id === userId),
        last_message: chat.last_message[0]?.content || 'No messages yet',
        last_message_at: chat.last_message[0]?.created_at
      })))
    }
  }

  const fetchGroupMembers = async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        user_id,
        profiles (username)
      `)
      .eq('group_id', groupId)

    if (error) {
      console.error('Error fetching group members:', error)
    } else {
      setGroupMembers(data)
    }
  }

  const fetchMessages = async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        id,
        group_id,
        user_id,
        content,
        created_at,
        status,
        user:profiles!group_messages_user_id_fkey (username)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
    }
  }

  const joinGroup = async (groupId: string) => {
    if (!currentUser) return

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: currentUser
      })

    if (error) {
      console.error('Error joining group:', error)
    } else {
      await fetchGroupChats(currentUser)
    }
  }

  const subscribeToMessages = (groupId: string) => {
    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          const { data, error } = await supabase
            .from('group_messages')
            .select(`
              id,
              group_id,
              user_id,
              content,
              created_at,
              status,
              user:profiles!group_messages_user_id_fkey (username)
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            setMessages(prev => [...prev, data])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedGroup || !currentUser) return

    const { error } = await supabase
      .from('group_messages')
      .insert({
        group_id: selectedGroup,
        user_id: currentUser,
        content: newMessage
      })

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
    }
  }

  const createNewGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || !currentUser) return

    const { error } = await supabase
      .from('group_chats')
      .insert({
        name: newGroupName,
        created_by: currentUser
      })

    if (error) {
      console.error('Error creating new group:', error)
    } else {
      setNewGroupName('')
      if (currentUser) {
        await fetchGroupChats(currentUser)
      }
    }
  }

  const subscribeToGroupChats = (userId: string) => {
    const channel = supabase
      .channel('group_chats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_chats'
        },
        () => {
          fetchGroupChats(userId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      <div className="w-1/3 border-r">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Group Chats</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">New Group</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={createNewGroup} className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                  <Button type="submit">Create Group</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px]">
              {groupChats.map((chat) => (
                <div key={chat.id} className="mb-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => chat.is_member ? setSelectedGroup(chat.id) : null}
                  >
                    <div className="flex items-center w-full">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{chat.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow text-left">
                        <div className="font-semibold">{chat.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {chat.last_message} • {new Date(chat.last_message_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {chat.member_count} members
                      </Badge>
                    </div>
                  </Button>
                  {!chat.is_member && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-1"
                      onClick={() => joinGroup(chat.id)}
                    >
                      Join Group
                    </Button>
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <div className="w-2/3">
        {selectedGroup ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{groupChats.find(c => c.id === selectedGroup)?.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMembers(!showMembers)}
              >
                <Users className="h-4 w-4 mr-2" />
                Members
              </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden relative">
              {showMembers ? (
                <div className="absolute inset-0 bg-background z-10 p-4">
                  <h3 className="font-semibold mb-4">Group Members</h3>
                  <ScrollArea className="h-full">
                    {groupMembers.map((member) => (
                      <div key={member.user_id} className="flex items-center mb-2">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>
                            {member.profiles.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.profiles.username}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100%-80px)]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.user_id === currentUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`flex items-start max-w-[70%] ${
                        message.user_id === currentUser ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <Avatar className="h-8 w-8 mx-2">
                          <AvatarFallback>{message.user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-gray-500">
                            {message.user.username}
                          </div>
                          <div className={`mt-1 rounded-lg px-3 py-2 ${
                            message.user_id === currentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow"
                />
                <Button type="submit">Send</Button>
              </form>
            </div>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a group chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

