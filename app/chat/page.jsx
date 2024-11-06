import Layout from '@/components/Layout'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function ChatIndexPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    // Preserve the current URL in the redirect
    redirect('/signin?callbackUrl=/chat')
  }

  return <Layout session={session} />
}
