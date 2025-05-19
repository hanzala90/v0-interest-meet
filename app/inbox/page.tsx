import Inbox from '@/components/inbox'

export default function InboxPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Inbox</h1>
      <Inbox isFullPage={true} />
    </div>
  )
}

