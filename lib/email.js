import nodemailer from 'nodemailer'

export async function sendVerificationEmail(email, code) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify?code=${code}`
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email',
      text: `Your verification code is: ${code}. Or use this link: ${verificationLink}`,
      html: `<p>Your verification code is: <strong>${code}</strong></p><p>Or click this link: <a href="${verificationLink}">${verificationLink}</a></p>`,
    }

    await transporter.sendMail(mailOptions)
    console.log('Verification email sent successfully')
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw error; // Re-throw the error to be caught in the signup route
  }
}
