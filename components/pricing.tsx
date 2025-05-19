import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Create a profile",
        "Match with up to 10 people per month",
        "Join up to 3 group chats",
        "Attend local events"
      ]
    },
    {
      name: "Pro",
      price: "$9.99",
      description: "For active community members",
      features: [
        "All Basic features",
        "Unlimited matches",
        "Create and join unlimited group chats",
        "Create events",
        "Advanced search filters"
      ]
    },
    {
      name: "Premium",
      price: "$19.99",
      description: "For power users and event organizers",
      features: [
        "All Pro features",
        "Priority matching",
        "Featured profile placement",
        "Analytics for your events",
        "Dedicated support"
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm font-normal">/month</span></p>
              <ul className="list-disc list-inside space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Choose {plan.name}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

