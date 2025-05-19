'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from 'lucide-react'

interface Activity {
  id: string
  title: string
  description: string
  date: string
  location: string
  organizer_id: string
  organizer_name: string
  participants: string[]
}

export default function ActivityPlanner() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  })
  const [friends, setFriends] = useState<{ id: string; username: string }[]>([])
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])

  useEffect(() => {
    fetchActivities()
    fetchFriends()
  }, [])

  const fetchActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('activities')
      .select('*, profiles(username)')
      .or(`organizer_id.eq.${user.id},participants.cs.{${user.id}}`)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching activities:', error)
    } else {
      setActivities(data.map(activity => ({
        ...activity,
        organizer_name: activity.profiles.username
      })))
    }
  }

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // This is a simplified friend fetching. In a real app, you'd have a friends table.
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .neq('id', user.id)

    if (error) {
      console.error('Error fetching friends:', error)
    } else {
      setFriends(data)
    }
  }

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...newActivity,
        organizer_id: user.id,
        participants: selectedFriends
      })

    if (error) {
      console.error('Error creating activity:', error)
    } else {
      fetchActivities()
      setNewActivity({ title: '', description: '', date: '', location: '' })
      setSelectedFriends([])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Planner</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Plan Activity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Plan a New Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="friends">Invite Friends</Label>
                <Select
                  onValueChange={(value) => setSelectedFriends(prev => [...prev, value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select friends" />
                  </SelectTrigger>
                  <SelectContent>
                    {friends.map((friend) => (
                      <SelectItem key={friend.id} value={friend.id}>{friend.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFriends.map((friendId) => (
                    <Badge
                      key={friendId}
                      variant="secondary"
                      onClick={() => setSelectedFriends(prev => prev.filter(id => id !== friendId))}
                    >
                      {friends.find(f => f.id === friendId)?.username}
                      <X className="h-4 w-4 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
              <Button type="submit">Create Activity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardHeader>
            <CardTitle>{activity.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{activity.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span>Date: {new Date(activity.date).toLocaleDateString()}</span>
              <span>Location: {activity.location}</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">Organized by: {activity.organizer_name}</div>
            <div className="mt-2">
              <span className="text-sm font-semibold">Participants:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {activity.participants.map((participantId) => (
                  <Badge key={participantId} variant="outline">
                    {friends.find(f => f.id === participantId)?.username || 'Unknown'}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

