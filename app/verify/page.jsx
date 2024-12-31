'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [verifySuccess, setVerifySuccess] = useState(false) // State to track verification success

  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode }),
      })

      if (res.ok) {
        // Verification successful, set verifySuccess to true
        setVerifySuccess(true)
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (error) {
      console.error(error)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {verifySuccess ? (
        <div className="w-full max-w-lg space-y-4 rounded-[8px] border border-gray-200 bg-white px-16 py-12 text-center">
          <h1 className="text-xl font-bold">Registration Successful!</h1>
          <p className="text-sm text-gray-500">Your email has been verified successfully.</p>
          <Button asChild className="w-full">
            <a href="/signin">Go to Sign In</a>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg space-y-4 rounded-[8px] border border-gray-200 bg-white px-16 py-12"
        >
          <h1 className="text-center text-xl font-bold">Verification Email Sent</h1>
          <p className="text-center text-sm text-gray-500">
            Please check your email and enter verification code
          </p>
          <Input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Verify
          </Button>
          {error && <p className="text-center text-red-500">{error}</p>}
        </form>
      )}
    </div>
  )
}
