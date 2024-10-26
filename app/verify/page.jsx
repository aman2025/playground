"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [verifySuccess, setVerifySuccess] = useState(false) // State to track verification success

  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
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
        setError("Invalid verification code. Please try again.")
      }
    } catch (error) {
      console.error(error)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      {verifySuccess ? (
        // Render success message and link to sign-in page if verification is successful
        <div className="text-center">
          <h1 className="text-2xl font-bold">Registration Successful!</h1>
          <p>Your email has been verified successfully.</p>
          <a href="/signin" className="text-blue-500 underline">Go to Sign In</a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-center">Verification Email Sent </h1>
          <p className="text-center">Please check your email and enter verification code</p>
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
      )}
    </div>
  )
}
