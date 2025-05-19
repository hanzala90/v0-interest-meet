import LoginForm from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Log in to InterestMeet</h1>
      <LoginForm />
    </div>
  )
}

