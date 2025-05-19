'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Chat from './chat'

interface UserProfile {
  id: string
  username: string
  bio: string
  interests: string[]
  avatar_url?: string
}

export default function UserList() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [chatWithUser, setChatWithUser] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user?.id || null)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
        
        if (error) throw error

        setUsers(data as UserProfile[])
      } catch (err: any) {
        console.error('Error fetching users:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div>Loading users...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="grid gap-6 mt-6">
      <h2 className="text-2xl font-bold">Other Users</h2>
      {users.filter(user => user.id !== currentUser).map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle>{user.username}</CardTitle>
              </div>
              <Button onClick={() => setChatWithUser(chatWithUser === user.id ? null : user.id)}>
                {chatWithUser === user.id ? 'Close Chat' : 'Chat'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.bio}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.interests && user.interests.map((interest, index) => (
                <Badge key={index} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
            {chatWithUser === user.id && currentUser && (
              <div className="mt-4">
                <Chat currentUserId={currentUser} otherUserId={user.id} otherUserName={user.username} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

