'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, MessageCircle, Map, Calendar } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function InterestMeetLanding() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .insert([{ email }])

      if (error) throw error

      setSubmitMessage('Thank you for subscribing!')
      setEmail('')
    } catch (error) {
      console.error('Error storing email:', error)
      setSubmitMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <Users className="h-6 w-6" />
          <span className="ml-2 text-2xl font-bold">InterestMeet</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/contact">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Meet People Who Share Your Passions
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Discover and connect with like-minded individuals in your area. Join InterestMeet today and start
                  building meaningful relationships based on shared interests.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input 
                    className="max-w-lg flex-1" 
                    placeholder="Enter your email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Get Started'}
                  </Button>
                </form>
                {submitMessage && (
                  <p className="text-sm mt-2 text-green-600">{submitMessage}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign up to get notified when we launch. No spam, we promise!
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Key Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-start justify-center">
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <Users className="h-8 w-8 mb-2" />
                <h3 className="text-xl font-bold">Interest Matching</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Our advanced algorithm connects you with people who share your specific interests and hobbies.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <MessageCircle className="h-8 w-8 mb-2" />
                <h3 className="text-xl font-bold">Group Chats</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Join or create group chats based on interests to discuss and share with like-minded individuals.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <Map className="h-8 w-8 mb-2" />
                <h3 className="text-xl font-bold">Local Events</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Discover and attend local events related to your interests, organized by community members.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <Calendar className="h-8 w-8 mb-2" />
                <h3 className="text-xl font-bold">Activity Planner</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Plan and schedule activities with your new connections based on mutual interests.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Meet Your Tribe?</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join InterestMeet today and start connecting with people who share your passions. It's time to turn
                  your interests into lasting friendships.
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/signup">
                  <Button className="w-full sm:w-auto" size="lg">
                    Sign Up Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="w-full sm:w-auto" size="lg" variant="outline">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 InterestMeet. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  )
}

