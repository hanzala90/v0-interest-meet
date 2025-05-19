import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">About InterestMeet</h1>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              At InterestMeet, we believe that shared interests are the foundation of meaningful connections. Our mission is to bring people together based on their passions, hobbies, and curiosities, creating a vibrant community where everyone can find their tribe.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Founded in 2024, InterestMeet was born out of a simple observation: in a world more connected than ever, many people still struggle to find others who share their specific interests. Our founders, avid hobbyists themselves, set out to create a platform that makes it easy and enjoyable to connect with like-minded individuals, whether they're right next door or across the globe.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Passion-Driven Connections</li>
              <li>Inclusivity and Diversity</li>
              <li>Continuous Learning and Growth</li>
              <li>Community Empowerment</li>
              <li>Privacy and Trust</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

