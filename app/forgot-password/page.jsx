'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      // Send a request to your API to initiate the password reset process
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage('Password reset email sent. Please check your inbox.')
        // Optionally, redirect to a confirmation page
        // router.push("/forgot-password-confirmation")
      } else {
        setMessage('An error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('An error occurred. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg space-y-4 rounded-[8px] border border-gray-200 bg-white px-16 py-12"
      >
        <h3 className="text-center text-xl font-bold">Forgot Password</h3>
        <p className="text-center text-sm text-gray-500">
          Please enter the email you use to sign in to playground{' '}
        </p>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Reset Password
        </Button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  )
}
