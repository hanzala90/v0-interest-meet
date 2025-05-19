'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface MatchedUser {
  id: string
  username: string
  bio: string
  interests: string[]
  avatar_url?: string
  matchScore: number
}

export default function InterestMatching() {
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatchedUsers()
  }, [])

  const fetchMatchedUsers = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch current user's interests
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('profiles')
        .select('interests')
        .eq('id', user.id)
        .single()

      if (currentUserError) throw currentUserError

      const currentUserInterests = currentUserData.interests

      // Fetch all other users
      const { data: allUsers, error: allUsersError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)

      if (allUsersError) throw allUsersError

      // Calculate match scores
      const matchedUsers = allUsers.map(otherUser => {
        const matchScore = calculateMatchScore(currentUserInterests, otherUser.interests)
        return { ...otherUser, matchScore }
      })

      // Sort by match score and take top 5
      const topMatches = matchedUsers
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)

      setMatchedUsers(topMatches)
    } catch (error) {
      console.error('Error fetching matched users:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMatchScore = (interests1: string[], interests2: string[]): number => {
    const set1 = new Set(interests1)
    const set2 = new Set(interests2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    return (intersection.size / Math.max(set1.size, set2.size)) * 100
  }

  if (loading) return <div>Loading matches...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Top Matches</h2>
      {matchedUsers.map((user) => (
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
              <Badge variant="secondary">
                {user.matchScore.toFixed(0)}% Match
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.bio}</p>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge key={index} variant="outline">
                  {interest}
                </Badge>
              ))}
            </div>
            <Button className="mt-4" variant="outline">Connect</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

