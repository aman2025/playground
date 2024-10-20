import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationCode } from '@/lib/utils'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req) {
  const { name, email, password } = await req.json()

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification code
    const verificationCode = generateVerificationCode()

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationCode,
      },
    })

    // Send verification email
    await sendVerificationEmail(email, verificationCode)

    return NextResponse.json({ message: 'User created successfully', userId: user.id })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: `Failed to create user: ${error.message}` }, { status: 500 })
  }
}
