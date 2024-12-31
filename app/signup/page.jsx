'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // First, initiate the signup process
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/verify')
        // Instead of redirecting, we'll show a message to check email
      } else {
        setError(data.error || 'Sign-up failed. Please try again.')
      }
    } catch (error) {
      console.error(error)
      setError(`An unexpected error occurred: ${error.message}`)
    }
  }

  // Render signup form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="min-h-[600px] w-full max-w-md space-y-4 rounded-[15px] border border-gray-200 bg-white p-16"
      >
        <div className="flex flex-col items-center justify-center pb-8 pt-5">
          <img src="/images/logo.png" alt="Logo" className="h-20 w-20" />
          <h5 className="pt-3 text-center">Sign Up</h5>
        </div>
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
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
        {error && <p className="text-center text-red-500">{error}</p>}
        <div className="text-center">
          <span className="text-sm text-gray-500">Already have an account? </span>
          <Link href="/signin" className="text-sm text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  )
}
