import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Layout from "@/components/Layout"
import Image from "next/image"

export default async function Home() {
  const session = await getServerSession()

  if (!session) {
    redirect("/signin")
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <Image src="/logo.png" alt="Playground Logo" width={100} height={100} />
        <h1 className="text-4xl font-bold mt-4">Playground</h1>
      </div>
    </Layout>
  )
}
