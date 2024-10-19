import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you're using Prisma for database operations
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { token, password } = await req.json();

  // Find user with the given reset token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user's password and clear reset token fields
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
}
