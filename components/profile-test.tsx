'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'

export default function ProfileTest() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testProfileCreation = async () => {
    try {
      setLoading(true)
      setResult('Testing...')

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setResult('No user found')
        return
      }

      // Try to insert a test profile
      const { data, error } = await supabase
        .from('profile')
        .upsert({
          user_id: user.id,  // Changed from 'id' to 'user_id'
          username: 'test_user',
          bio: 'This is a test bio',
          interests: '["testing"]'
        })

      if (error) {
        setResult(`Error: ${error.message}`)
        console.error('Test failed:', error)
      } else {
        setResult('Success! Profile created/updated')
        console.log('Test succeeded:', data)
      }
    } catch (error) {
      setResult(`Error: ${error.message}`)
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Button 
        onClick={testProfileCreation}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Profile Creation'}
      </Button>
      <pre className="p-4 bg-gray-100 rounded-lg">
        {result}
      </pre>
    </div>
  )
}

