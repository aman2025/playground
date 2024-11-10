import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function Home() {
  // Fetch session data
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  // Redirect authenticated users to the chat page
  redirect('/chat')

  // The code below will never be reached due to the redirect
  // return (
  //   <Layout session={session}></Layout>
  // )
}
