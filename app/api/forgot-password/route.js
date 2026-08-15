import { connectDB } from "@/lib/mongodb";
import Library from "@/models/Library";
import { transporter } from "@/lib/mail";
import crypto from "crypto";

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const library = await Library.findOne({ email });

    if (!library) {
      return Response.json(
        {
          success: false,
          message: "No account found with this email",
        },
        { status: 404 }
      );
    }

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    library.resetPasswordToken = token;
    library.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await library.save();

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: library.email,
      subject: "Reset your Library Manager password",
      html: `
        <h2>Library Manager</h2>
        <p>Click the button below to reset your password.</p>
        <a href="${resetLink}"
           style="background:#2563eb;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;">
           Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return Response.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}