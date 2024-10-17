"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      // Send a request to your API to initiate the password reset process
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage("Password reset email sent. Please check your inbox.")
        // Optionally, redirect to a confirmation page
        // router.push("/forgot-password-confirmation")
      } else {
        setMessage("An error occurred. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("An error occurred. Please try again.")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">Reset Password</Button>
        {message && <p className="text-center mt-4">{message}</p>}
      </form>
    </div>
  )
}
