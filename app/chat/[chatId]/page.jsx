import Layout from '@/components/Layout'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import ChatPageClient from './ChatPageClient'

export default async function ChatPage({ params }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/signin?callbackUrl=/chat/${params.chatId}`)
  }

  return (
    <Layout session={session}>
      <ChatPageClient chatId={params.chatId} />
    </Layout>
  )
}
