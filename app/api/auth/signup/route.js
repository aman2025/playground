import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    // Check if user already exists in main users table
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Check if user exists in temporary users table
    const existingTempUser = await prisma.tempUser.findUnique({ where: { email } })
    if (existingTempUser) {
      return NextResponse.json({ 
        error: 'Verification email already sent. Please check your inbox for the verification code.', 
        status: 'PENDING_VERIFICATION' 
      }, { status: 400 })
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Store user details and verification code in a temporary storage
    await prisma.tempUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationCode
      }
    })

    // Send verification email
    await sendVerificationEmail(email, verificationCode)

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
