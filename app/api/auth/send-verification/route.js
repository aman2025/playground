import { NextResponse } from 'next/server'
import { generateVerificationCode } from '@/lib/utils'
import { sendVerificationEmail } from '@/lib/email'
import prisma from '@/lib/prisma'

// Ensure this function is only used in server-side code
export async function POST(req) {
  const { email } = await req.json()

  try {
    const verificationCode = generateVerificationCode()
    
    // Store the verification code in the database
    await prisma.user.update({
      where: { email },
      data: { verificationCode },
    })

    // Send the verification code via email
    await sendVerificationEmail(email, verificationCode)

    return NextResponse.json({ message: 'Verification code sent successfully' })
  } catch (error) {
    console.error('Error sending verification code:', error)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}
