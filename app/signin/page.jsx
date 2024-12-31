'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('') // State to hold error message
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/chat'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('') // Reset error message on new submit attempt
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })
      if (res?.ok) {
        router.push(callbackUrl)
      } else {
        setError('Sign-in failed. Please check your credentials.') // Set error message on failure
      }
    } catch (error) {
      console.error(error)
      setError('An unexpected error occurred. Please try again.') // Set error message on exception
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="min-h-[600px] w-full max-w-md space-y-4 rounded-[15px] border border-gray-200 bg-white p-16"
      >
        <div className="flex flex-col items-center justify-center pb-8 pt-5">
          <img src="/images/logo.png" alt="Logo" className="h-20 w-20" />
          <h5 className="pt-3 text-center">Sign In</h5>
        </div>
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
          Sign In
        </Button>
        {error && <p className="text-center text-red-500">{error}</p>} {/* Display error message */}
        <div className="space-y-3 text-center">
          <div>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div>
            <span className="text-sm text-gray-500">Don't have an account? </span>
            <Link href="/signup" className="text-sm text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
