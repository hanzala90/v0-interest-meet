'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import ProfileForm from '@/components/profile-form'
import UserList from '@/components/user-list'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User } from '@supabase/supabase-js'
import InboxPreview from '@/components/inbox-preview'
import InterestMatching from '@/components/interest-matching'
import GroupChats from '@/components/group-chats'
import LocalEvents from '@/components/local-events'
import ActivityPlanner from '@/components/activity-planner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Profile {
  username: string
  bio: string
  interests: string[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUserAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Fetch profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single()

        if (!error) {
          setProfile(profile)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndProfile()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">
        Welcome to Your Dashboard, {profile?.username || user.email}!
      </h1>
      
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Your Profile</h2>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </div>

              {isEditing ? (
                <ProfileForm onComplete={() => setIsEditing(false)} />
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle>{profile?.username || 'Set up your profile'}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile?.bio || 'No bio provided'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile?.interests?.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Your Inbox Preview</h2>
              <InboxPreview />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <InterestMatching />
        </TabsContent>

        <TabsContent value="chats">
          <GroupChats />
        </TabsContent>

        <TabsContent value="events">
          <LocalEvents />
        </TabsContent>

        <TabsContent value="activities">
          <ActivityPlanner />
        </TabsContent>
      </Tabs>

      <div className="mt-8 space-x-4">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  )
}

