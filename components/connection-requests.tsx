'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ConnectionRequest {
  id: string
  sender_id: string
  message: string
  created_at: string
  sender: {
    username: string
    profile_picture_url: string
  }
}

export default function ConnectionRequests() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])

  useEffect(() => {
    fetchConnectionRequests()
  }, [])

  const fetchConnectionRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('connection_requests')
      .select(`
        id,
        sender_id,
        message,
        created_at,
        sender:profiles!connection_requests_sender_id_fkey (username, profile_picture_url)
      `)
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching connection requests:', error)
    } else {
      setRequests(data)
    }
  }

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', requestId)

    if (error) {
      console.error(`Error ${action}ing connection request:`, error)
    } else {
      fetchConnectionRequests()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p>No pending connection requests.</p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src={request.sender.profile_picture_url} alt={request.sender.username} />
                  <AvatarFallback>{request.sender.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{request.sender.username}</p>
                  <p className="text-sm text-gray-500">{request.message}</p>
                </div>
              </div>
              <div>
                <Button onClick={() => handleRequest(request.id, 'accept')} className="mr-2">Accept</Button>
                <Button onClick={() => handleRequest(request.id, 'reject')} variant="outline">Reject</Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

