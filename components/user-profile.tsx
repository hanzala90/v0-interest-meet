'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  bio: string
  avatar_url: string
  interests: string
}

const AVAILABLE_INTERESTS = [
  'Music', 'Movies', 'Sports', 'Travel', 'Food', 'Art', 'Technology', 'Fashion', 'Gaming', 'Reading',
  'Fitness', 'Programming', 'Cooking', 'Dance', 'Yoga', 'Hiking', 'Cycling', 'Writing', 'Gardening', 'Pets'
]

export default function UserProfile({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [newInterest, setNewInterest] = useState('')

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      let { data, error, status } = await supabase
        .from('profiles')
        .select(`id, username, bio, avatar_url, interests`)
        .eq('id', userId)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setProfile({
          ...data,
          interests: data.interests ? JSON.parse(data.interests) : []
        })
      } else {
        // If no profile exists, initialize with empty values
        setProfile({
          id: userId,
          username: '',
          bio: '',
          avatar_url: '',
          interests: '[]'
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)

      const updates = {
        id: userId,
        username: profile?.username || '',
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || '',
        interests: JSON.stringify(profile?.interests || []),
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
      alert('Profile updated!')
      getProfile() // Refresh the profile data
    } catch (error) {
      alert('Error updating the data!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInterestAdd = () => {
    if (newInterest && profile) {
      const currentInterests = Array.isArray(profile.interests) ? profile.interests : JSON.parse(profile.interests || '[]')
      if (!currentInterests.includes(newInterest)) {
        setProfile({
          ...profile,
          interests: JSON.stringify([...currentInterests, newInterest])
        })
        setNewInterest('')
      }
    }
  }

  const handleInterestRemove = (interest: string) => {
    if (profile) {
      const currentInterests = Array.isArray(profile.interests) ? profile.interests : JSON.parse(profile.interests || '[]')
      setProfile({
        ...profile,
        interests: JSON.stringify(currentInterests.filter((i: string) => i !== interest))
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{profile?.username ? 'Edit Profile' : 'Create Profile'}</CardTitle>
        <CardDescription>{profile?.username ? 'Update your profile information and interests' : 'Set up your profile to get started'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault()
          updateProfile()
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={profile?.username || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile?.bio || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              type="text"
              value={profile?.avatar_url || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, avatar_url: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(Array.isArray(profile?.interests) ? profile?.interests : JSON.parse(profile?.interests || '[]')).map((interest: string) => (
                <Badge key={interest} variant="secondary" className="text-sm">
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleInterestRemove(interest)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                list="available-interests"
              />
              <Button type="button" onClick={handleInterestAdd}>Add</Button>
            </div>
            <datalist id="available-interests">
              {AVAILABLE_INTERESTS.map((interest) => (
                <option key={interest} value={interest} />
              ))}
            </datalist>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading ...' : (profile?.username ? 'Update Profile' : 'Create Profile')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

