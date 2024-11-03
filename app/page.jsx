import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
export default async function Home() {
  // Fetch session data
  const session = await getServerSession(authOptions)
  console.log('session21122:', session)

  if (!session) {
    redirect('/signin')
  }

  return (
    // Pass session as a prop to Layout
    <Layout session={session}>
      <div className="flex h-full flex-col items-center justify-center">
        <Image src="/images/logo.png" alt="Playground Logo" width={80} height={80} />
        <h1 className="mt-4 text-2xl text-gray-400">111PLAYGROUND</h1>
      </div>
    </Layout>
  )
}
