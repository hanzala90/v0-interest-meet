import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageCircle, Map, Calendar, Search, Bell, Shield, Zap } from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      icon: Users,
      title: "Interest Matching",
      description: "Our advanced algorithm connects you with people who share your specific interests and hobbies."
    },
    {
      icon: MessageCircle,
      title: "Group Chats",
      description: "Join or create group chats based on interests to discuss and share with like-minded individuals."
    },
    {
      icon: Map,
      title: "Local Events",
      description: "Discover and attend local events related to your interests, organized by community members."
    },
    {
      icon: Calendar,
      title: "Activity Planner",
      description: "Plan and schedule activities with your new connections based on mutual interests."
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find people and events with our powerful search tool, filtering by interests, location, and more."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay updated with personalized notifications about new matches, messages, and upcoming events."
    },
    {
      icon: Shield,
      title: "Privacy Controls",
      description: "Manage your visibility and data with our comprehensive privacy settings."
    },
    {
      icon: Zap,
      title: "Interest Recommendations",
      description: "Discover new interests and hobbies based on your current preferences and community trends."
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">InterestMeet Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <feature.icon className="h-8 w-8 mb-2" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

