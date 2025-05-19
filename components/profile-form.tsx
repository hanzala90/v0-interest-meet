'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

const AVAILABLE_INTERESTS = [
  'Music', 'Movies', 'Sports', 'Travel', 'Food', 'Art', 'Technology', 'Fashion', 
  'Gaming', 'Reading', 'Fitness', 'Programming', 'Cooking', 'Dance', 'Yoga', 
  'Hiking', 'Cycling', 'Writing', 'Gardening', 'Pets', 'Horse Riding'
]

interface ProfileFormProps {
  userId?: string
  isOwnProfile?: boolean
}

export default function ProfileForm({ userId, isOwnProfile = true }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [connectMessage, setConnectMessage] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    interests: [] as string[],
    profile_picture_url: ''
  })
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId || '')
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (profile) {
          setFormData({
            username: profile.username || '',
            bio: profile.bio || '',
            interests: Array.isArray(profile.interests) ? profile.interests : [],
            profile_picture_url: profile.profile_picture_url || ''
          })
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }

    if (userId) {
      loadProfile()
    }
  }, [userId])

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0])
    }
  }

  const uploadProfilePicture = async (userId: string) => {
    if (!profilePicture) return null

    const fileExt = profilePicture.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, profilePicture)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwnProfile) return
    setError('')
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      let profile_picture_url = formData.profile_picture_url

      if (profilePicture) {
        profile_picture_url = await uploadProfilePicture(user.id)
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: formData.username,
          bio: formData.bio,
          interests: formData.interests,
          profile_picture_url,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
      router.refresh()
      
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred while saving the profile')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          message: connectMessage
        })

      if (error) throw error

      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent successfully.",
      })
      setConnectMessage('')
      setShowConnectDialog(false)
    } catch (err: any) {
      console.error('Error sending connection request:', err)
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="profile-picture">Profile Picture</Label>
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={formData.profile_picture_url} alt="Profile picture" />
            <AvatarFallback>{formData.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <Input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          required
          placeholder="Enter your username"
          readOnly={!isOwnProfile}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell us about yourself"
          rows={4}
          readOnly={!isOwnProfile}
        />
      </div>

      <div className="space-y-2">
        <Label>Interests</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AVAILABLE_INTERESTS.map((interest) => (
            <div key={interest} className="flex items-center space-x-2">
              <Checkbox
                id={interest}
                checked={formData.interests.includes(interest)}
                onCheckedChange={() => isOwnProfile && handleInterestToggle(interest)}
                disabled={!isOwnProfile}
              />
              <Label htmlFor={interest}>{interest}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        {isOwnProfile ? (
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        ) : (
          <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
            <DialogTrigger asChild>
              <Button type="button">Connect</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect with {formData.username}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Add a message</Label>
                  <Textarea
                    id="message"
                    value={connectMessage}
                    onChange={(e) => setConnectMessage(e.target.value)}
                    placeholder="Write a brief message to introduce yourself..."
                    rows={4}
                  />
                </div>
                <Button type="submit">Send Connection Request</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </form>
  )
}

