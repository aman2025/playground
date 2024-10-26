"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("") // State to hold error message
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("") // Reset error message on new submit attempt
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (res?.ok) {
        router.push("/")
      } else {
        setError("Sign-in failed. Please check your credentials.") // Set error message on failure
      }
    } catch (error) {
      console.error(error)
      setError("An unexpected error occurred. Please try again.") // Set error message on exception
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
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
        <Button type="submit" className="w-full">Sign In</Button>
        {error && <p className="text-red-500 text-center">{error}</p>} {/* Display error message */}
        <div className="text-center space-y-2">
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
