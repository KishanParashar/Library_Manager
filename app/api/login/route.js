import { connectDB } from "@/lib/mongodb";
import Library from "@/models/Library";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        await connectDB();

        const { email, password } = await request.json();

        if (!email || !password) {
            return Response.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            );
        }

        const library = await Library.findOne({ email });

        if (!library) {
            return Response.json(
                { success: false, message: "Library not found" },
                { status: 404 }
            );
        }

        const isMatch = await bcrypt.compare(password, library.password);

        if (!isMatch) {
            return Response.json(
                { success: false, message: "Invalid password" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                libraryId: library._id,
                email: library.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const response = Response.json({
            success: true,
            message: "Login successful",
            library: {
                id: library._id,
                name: library.name,
                totalSeats: library.totalSeats,
            },
        });

        response.headers.append(
            "Set-Cookie",
            `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        );

        return response;
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