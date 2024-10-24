import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const { email, verificationCode } = await req.json()

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.verificationCode !== verificationCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Clear the verification code and mark the user as verified
    await prisma.user.update({
      where: { email },
      data: { verificationCode: null, emailVerified: new Date() },
    })

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
}
