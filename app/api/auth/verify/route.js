import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const { verificationCode } = await req.json()

  if (!verificationCode) {
    return NextResponse.json({ error: 'Missing verification code' }, { status: 400 })
  }
  
  try {
    // Find the temporary user with this code
    const tempUser = await prisma.tempUser.findUnique({ where: { verificationCode } })

    if (!tempUser) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    // Create the actual user
    await prisma.user.create({
      data: {
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        emailVerified: new Date(),
      }
    })

    // Delete the temporary user
    await prisma.tempUser.delete({ where: { id: tempUser.id } })

    // Redirect to a success page or login page
    return NextResponse.redirect('/signin')
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
