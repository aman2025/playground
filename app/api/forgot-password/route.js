import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

export async function POST(req) {
  const { email } = await req.json()

  // TODO: Validate the email and check if it exists in your database
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Create a reset token
  const resetToken = crypto.randomBytes(20).toString('hex')
  const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour from now

  // Save the reset token and its expiration time in the database
  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpires },
  })

  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    // Configure your email service here
    host: "smtp.qq.com",
    port: 465,
    secure: true, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  // Email content
  const mailOptions = {
    from: '42589963@qq.com',
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click this link to reset your password: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
    html: `<p>You requested a password reset. Click this link to reset your password:</p><p><a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}">Reset Password</a></p>`,
  }

  try {
    // Send the email
    await transporter.sendMail(mailOptions)
    return NextResponse.json({ message: "Password reset email sent" }, { status: 200 })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
  }
}
