'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'

interface Profile {
  username: string
  bio: string
  interests: string[]
  created_at: string
}

export default function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No user found')

      const { data: profile, error } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      setProfile(profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (!profile) {
    return <div>No profile found.</div>
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Username</h3>
            <p className="mt-1 text-lg">{profile.username}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Bio</h3>
            <p className="mt-1">{profile.bio || 'No bio provided'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Interests</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {profile.interests?.map((interest, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
            <p className="mt-1">
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

