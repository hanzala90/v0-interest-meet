'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  organizer_id: string
  profiles: {
    username: string
  }
}

export default function LocalEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles (username)
      `)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...newEvent,
        organizer_id: user.id
      })

    if (error) {
      console.error('Error creating event:', error)
    } else {
      fetchEvents()
      setNewEvent({ title: '', description: '', date: '', location: '' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Local Events</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Create Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{event.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span>Date: {new Date(event.date).toLocaleDateString()}</span>
              <span>Location: {event.location}</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">Organized by: {event.profiles.username}</div>
            <Button className="mt-4" variant="outline">RSVP</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

