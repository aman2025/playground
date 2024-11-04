import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
export default async function Home() {
  // Fetch session data
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  return (
    // Pass session as a prop to Layout
    <Layout session={session}></Layout>
  )
}
