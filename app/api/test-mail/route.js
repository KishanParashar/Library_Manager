import { transporter } from "@/lib/mail";

export async function GET() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Library Manager Test",
      text: "Email system is working successfully!",
    });

    return Response.json({
      success: true,
      message: "Test email sent successfully",
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