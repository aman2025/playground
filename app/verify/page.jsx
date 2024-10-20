"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL parameters
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verificationCode }),
      })

      if (res.ok) {
        // Verification successful, redirect to home page or dashboard
        router.push('/')
      } else {
        setError("Invalid verification code. Please try again.")
      }
    } catch (error) {
      console.error(error)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Verify Your Email</h1>
        <p className="text-center">Please enter the verification code sent to {email}</p>
        <Input
          type="text"
          placeholder="Verification Code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">Verify</Button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  )
}
