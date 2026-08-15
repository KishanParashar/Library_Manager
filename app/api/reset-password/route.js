import { connectDB } from "@/lib/mongodb";
import Library from "@/models/Library";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json(
        {
          success: false,
          message: "Token and password are required",
        },
        { status: 400 }
      );
    }

    const library = await Library.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!library) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired reset link",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    library.password = hashedPassword;
    library.resetPasswordToken = undefined;
    library.resetPasswordExpires = undefined;

    await library.save();

    return Response.json({
      success: true,
      message: "Password reset successfully",
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