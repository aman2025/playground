"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      // First, initiate the signup process
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setVerificationSent(true)
        // Instead of redirecting, we'll show a message to check email
      } else {
        setError(data.error || "Sign-up failed. Please try again.")
      }
    } catch (error) {
      console.error(error)
      setError(`An unexpected error occurred: ${error.message}`)
    }
  }

  // Render verification sent message
  if (verificationSent) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Verification Email Sent</h2>
          <p>Please check your email and click the verification link to complete your signup.</p>
        </div>
      </div>
    )
  }

  // Render signup form
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">Sign Up</Button>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="text-center">
          <Link href="/signin" className="text-sm text-blue-600 hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </form>
    </div>
  )
}
