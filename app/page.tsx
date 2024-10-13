import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession()

  if (!session) {
    redirect("/signin")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold">Welcome, {session.user?.name || "User"}!</h1>
        <p className="mt-4">You are signed in as {session.user?.email}</p>
        <div className="mt-8">
          <Link href="/api/auth/signout">
            <Button>Sign Out</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
