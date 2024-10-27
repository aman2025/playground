import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Layout from "@/components/Layout"
import Image from "next/image"

export default async function Home() {
  // Fetch session data
  const session = await getServerSession()

  if (!session) {
    redirect("/signin")
  }

  return (
    // Pass session as a prop to Layout
    <Layout session={session}>
      <div className="flex flex-col items-center justify-center h-full">
        <Image src="/images/logo.png" alt="Playground Logo" width={80} height={80} />
        <h1 className="text-2xl mt-4 text-gray-400">PLAYGROUND</h1>
      </div>
    </Layout>
  )
}
